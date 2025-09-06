const Imap = require('imap');
const { simpleParser } = require('mailparser');
const nodemailer = require('nodemailer');
const Email = require('../models/Email');
const aiService = require('./aiService');
const analysisService = require('./analysisService');
const emailConfig = require('../config/email');

class EmailService {
  constructor() {
    this.imap = new Imap(emailConfig.imap);
    this.transporter = nodemailer.createTransport(emailConfig.smtp);
  }

  async fetchAndProcessEmails(io) {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        this.imap.openBox('INBOX', false, async (err, box) => {
          if (err) return reject(err);

          const searchCriteria = [
            'UNSEEN',
            ['OR',
              ['SUBJECT', 'support'],
              ['OR',
                ['SUBJECT', 'query'],
                ['OR',
                  ['SUBJECT', 'request'],
                  ['SUBJECT', 'help']
                ]
              ]
            ]
          ];

          this.imap.search(searchCriteria, async (err, results) => {
            if (err) return reject(err);
            if (!results || results.length === 0) {
              this.imap.end();
              return resolve([]);
            }

            const fetch = this.imap.fetch(results, { bodies: '' });
            const emails = [];

            fetch.on('message', (msg) => {
              msg.on('body', (stream) => {
                simpleParser(stream, async (err, parsed) => {
                  if (!err) {
                    emails.push(await this.processEmail(parsed, io));
                  }
                });
              });
            });

            fetch.once('end', () => {
              this.imap.end();
              resolve(emails);
            });
          });
        });
      });

      this.imap.once('error', reject);
      this.imap.connect();
    });
  }

  async processEmail(parsedEmail, io) {
    const emailData = {
      messageId: parsedEmail.messageId,
      sender: parsedEmail.from?.text,
      subject: parsedEmail.subject,
      body: parsedEmail.text || parsedEmail.html,
      receivedDate: parsedEmail.date
    };

    // Categorize email
    emailData.category = this.categorizeEmail(emailData.subject);

    // Analyze sentiment
    emailData.sentiment = await analysisService.analyzeSentiment(emailData.body);

    // Determine priority
    emailData.priority = analysisService.determinePriority(emailData.body);

    // Extract information
    emailData.extractedInfo = analysisService.extractInfo(emailData.body);

    // Generate AI response
    const aiResponse = await aiService.generateResponse(emailData);
    emailData.aiResponse = aiResponse;

    // Save to database
    const savedEmail = await Email.findOneAndUpdate(
      { messageId: emailData.messageId },
      emailData,
      { upsert: true, new: true }
    );

    // Emit real-time update
    if (io) {
      io.emit('newEmail', savedEmail);
    }

    // Auto-respond if urgent
    if (emailData.priority === 'urgent') {
      await this.sendResponse(savedEmail);
    }

    return savedEmail;
  }

  categorizeEmail(subject) {
    const lowerSubject = subject.toLowerCase();
    if (lowerSubject.includes('support')) return 'support';
    if (lowerSubject.includes('query')) return 'query';
    if (lowerSubject.includes('request')) return 'request';
    if (lowerSubject.includes('help')) return 'help';
    return 'other';
  }

  async sendResponse(email, customResponse = null) {
    const response = customResponse || email.aiResponse;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email.sender,
      subject: `Re: ${email.subject}`,
      text: response
    };

    try {
      await this.transporter.sendMail(mailOptions);
      
      await Email.findByIdAndUpdate(email._id, {
        status: 'responded',
        respondedAt: new Date(),
        finalResponse: response,
        manuallyEdited: !!customResponse
      });

      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  async getEmailStats() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const stats = await Email.aggregate([
      {
        $facet: {
          total24h: [
            { $match: { createdAt: { $gte: twentyFourHoursAgo } } },
            { $count: 'count' }
          ],
          resolved: [
            { $match: { status: 'resolved' } },
            { $count: 'count' }
          ],
          pending: [
            { $match: { status: 'pending' } },
            { $count: 'count' }
          ],
          sentimentBreakdown: [
            { $group: { _id: '$sentiment', count: { $sum: 1 } } }
          ],
          priorityBreakdown: [
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ],
          categoryBreakdown: [
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    return {
      total24h: stats[0].total24h[0]?.count || 0,
      resolved: stats[0].resolved[0]?.count || 0,
      pending: stats[0].pending[0]?.count || 0,
      sentimentBreakdown: stats[0].sentimentBreakdown,
      priorityBreakdown: stats[0].priorityBreakdown,
      categoryBreakdown: stats[0].categoryBreakdown
    };
  }
}

module.exports = new EmailService();
