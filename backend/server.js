const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const http = require('http');
const socketIo = require('socket.io');

const connectDB = require('./src/config/database');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173", 
      "http://localhost:5000"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173", 
    "http://localhost:5000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json());

// Routes
const emailRoutes = require('./src/routes/emails');
const analyticsRoutes = require('./src/routes/analytics');

app.use('/api/emails', emailRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'AI Communication Assistant Backend' });
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Async server initialization
(async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Setup cron job after DB connection
    const emailService = require('./src/services/emailService');
    cron.schedule('*/5 * * * *', async () => {
      console.log('Fetching new emails...');
      await emailService.fetchAndProcessEmails(io);
    });

    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ MongoDB Connected`);
      console.log(`✅ Socket.IO enabled with CORS`);
    });
    
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
})();

module.exports = { io };
