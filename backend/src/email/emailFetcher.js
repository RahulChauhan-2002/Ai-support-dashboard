const Imap = require('imap');
const { simpleParser } = require('mailparser');
require('dotenv').config();

const imapConfig = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: process.env.EMAIL_HOST || 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

function openInbox(imap) {
  return new Promise((resolve, reject) => {
    imap.openBox('INBOX', true, (err, box) => {
      if (err) reject(err);
      else resolve(box);
    });
  });
}

async function fetchEmails() {
  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig);
    const relevantEmails = [];

    imap.once('ready', async () => {
      try {
        await openInbox(imap);
        
        // Search for recent emails (last 7 days)
        const searchCriteria = ['UNSEEN', ['SINCE', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)]];
        
        imap.search(searchCriteria, (err, results) => {
          if (err || !results || results.length === 0) {
            imap.end();
            resolve([]);
            return;
          }

          const f = imap.fetch(results, { bodies: '' });
          let processedCount = 0;

          f.on('message', (msg) => {
            msg.on('body', (stream) => {
              simpleParser(stream, (err, parsed) => {
                if (err) {
                  console.error('Email parsing error:', err);
                } else {
                  const subject = parsed.subject || '';
                  const filterKeywords = ['support', 'query', 'request', 'help'];
                  
                  const matchesFilter = filterKeywords.some(keyword => 
                    subject.toLowerCase().includes(keyword)
                  );

                  if (matchesFilter) {
                    relevantEmails.push({
                      sender: parsed.from?.text || 'Unknown',
                      subject: parsed.subject || 'No Subject',
                      body: parsed.text || parsed.html || 'No Content',
                      sentDate: parsed.date || new Date()
                    });
                  }
                }
                
                processedCount++;
                if (processedCount === results.length) {
                  imap.end();
                }
              });
            });
          });

          f.once('end', () => {
            resolve(relevantEmails);
          });

          f.once('error', (err) => {
            console.error('Fetch error:', err);
            reject(err);
          });
        });
      } catch (error) {
        console.error('IMAP error:', error);
        reject(error);
      }
    });

    imap.once('error', (err) => {
      console.error('IMAP connection error:', err);
      reject(err);
    });

    imap.once('end', () => {
      console.log('IMAP connection ended');
    });

    imap.connect();
  });
}

module.exports = { fetchEmails };
