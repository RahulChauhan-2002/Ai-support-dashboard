const express = require('express');
const router = express.Router();
const Email = require('../models/Email');
const { fetchEmails } = require('../email/emailFetcher');
const { analyzeSentiment, detectPriority, generateResponse, extractInformation } = require('../llm/openaiClient');
const { getAnalytics } = require('../services/analyticsService');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Fetch and process new emails
router.get('/fetch', async (req, res) => {
  try {
    console.log('🔄 Fetching emails...');
    const emails = await fetchEmails();
    
    let processedCount = 0;
    let newEmailsCount = 0;

    for (const emailData of emails) {
      // Check for duplicates
      const existing = await Email.findOne({
        subject: emailData.subject,
        sender: emailData.sender,
        sentDate: emailData.sentDate
      });

      if (existing) {
        processedCount++;
        continue;
      }

      console.log(`📧 Processing email: ${emailData.subject}`);

      // AI Analysis
      const [sentiment, priority, aiResponse, extractedInfo] = await Promise.all([
        analyzeSentiment(emailData.body),
        detectPriority(emailData.subject + ' ' + emailData.body),
        generateResponse(emailData.body, 'analyzing...'),
        extractInformation(emailData.body)
      ]);

      // Create new email record
      const newEmail = new Email({
        sender: emailData.sender,
        subject: emailData.subject,
        body: emailData.body,
        sentDate: emailData.sentDate,
        sentiment,
        priority,
        aiResponse,
        extractedInfo
      });

      await newEmail.save();
      newEmailsCount++;
      processedCount++;
    }

    console.log(`✅ Processed ${processedCount} emails, ${newEmailsCount} new`);
    
    res.json({
      message: 'Emails fetched and processed successfully',
      totalProcessed: processedCount,
      newEmails: newEmailsCount
    });
  } catch (error) {
    console.error('❌ Email fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch emails',
      details: error.message 
    });
  }
});

// Get all emails with sorting
router.get('/', async (req, res) => {
  try {
    const { status, priority, sentiment, limit = 50 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (sentiment) filter.sentiment = sentiment;

    const emails = await Email.find(filter)
      .sort({ priority: -1, sentDate: -1 })
      .limit(parseInt(limit));

    res.json(emails);
  } catch (error) {
    console.error('❌ Get emails error:', error);
    res.status(500).json({ error: 'Failed to retrieve emails' });
  }
});

// Get single email by ID
router.get('/:id', async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    res.json(email);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve email' });
  }
});

// Update email (AI response, status, etc.)
router.put('/:id', async (req, res) => {
  try {
    const { aiResponse, status } = req.body;
    const updateData = {};
    
    if (aiResponse !== undefined) updateData.aiResponse = aiResponse;
    if (status !== undefined) updateData.status = status;

    const email = await Email.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    res.json(email);
  } catch (error) {
    console.error('❌ Update email error:', error);
    res.status(500).json({ error: 'Failed to update email' });
  }
});

// Send reply email
router.post('/:id/send', async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Configure nodemailer
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email.sender,
      subject: `Re: ${email.subject}`,
      text: email.aiResponse,
    });

    // Update email status
    email.status = 'resolved';
    await email.save();

    console.log(`📤 Reply sent to ${email.sender}`);
    res.json({ 
      message: 'Reply sent successfully',
      emailId: email._id 
    });
  } catch (error) {
    console.error('❌ Send reply error:', error);
    res.status(500).json({ 
      error: 'Failed to send reply',
      details: error.message 
    });
  }
});

// Get analytics data
router.get('/analytics/stats', async (req, res) => {
  try {
    const analytics = await getAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Bulk operations
router.post('/bulk/status', async (req, res) => {
  try {
    const { emailIds, status } = req.body;
    
    const result = await Email.updateMany(
      { _id: { $in: emailIds } },
      { status }
    );

    res.json({
      message: 'Bulk update completed',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Bulk operation failed' });
  }
});

module.exports = router;
