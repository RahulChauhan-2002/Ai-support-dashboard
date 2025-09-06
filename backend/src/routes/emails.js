const express = require('express');
const router = express.Router();
const Email = require('../models/Email');
const emailService = require('../services/emailService');

// Get all emails with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { priority, sentiment, status, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (priority) query.priority = priority;
    if (sentiment) query.sentiment = sentiment;
    if (status) query.status = status;
    
    const emails = await Email.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Email.countDocuments(query);
    
    res.json({
      emails,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single email
router.get('/:id', async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    res.json(email);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update email response
router.put('/:id/response', async (req, res) => {
  try {
    const { response } = req.body;
    const email = await Email.findByIdAndUpdate(
      req.params.id,
      { 
        aiResponse: response,
        manuallyEdited: true
      },
      { new: true }
    );
    res.json(email);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send email response
router.post('/:id/send', async (req, res) => {
  try {
    const { customResponse } = req.body;
    const email = await Email.findById(req.params.id);
    
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    const result = await emailService.sendResponse(email, customResponse);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark email as resolved
router.put('/:id/resolve', async (req, res) => {
  try {
    const email = await Email.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved' },
      { new: true }
    );
    res.json(email);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manually fetch emails
router.post('/fetch', async (req, res) => {
  try {
    const emails = await emailService.fetchAndProcessEmails();
    res.json({ message: 'Emails fetched successfully', count: emails.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;