const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const Email = require('../models/Email');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await emailService.getEmailStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get time-series data for charts
router.get('/timeseries', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const timeSeries = await Email.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);
    
    res.json(timeSeries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get response time analytics
router.get('/response-times', async (req, res) => {
  try {
    const responseTimes = await Email.aggregate([
      { $match: { status: 'responded' } },
      {
        $project: {
          responseTime: {
            $subtract: ['$respondedAt', '$createdAt']
          },
          priority: 1
        }
      },
      {
        $group: {
          _id: '$priority',
          avgResponseTime: { $avg: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' }
        }
      }
    ]);
    
    res.json(responseTimes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
