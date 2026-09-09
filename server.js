const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/s-express', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✓ MongoDB connected'))
.catch(err => console.error('✗ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/menus', require('./routes/menus'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/payments', require('./routes/payments'));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'S-Express API is running',
    paymentMethod: process.env.PAYMENT_METHOD || 'mock',
    features: {
      mockPayments: true,
      cashOnDelivery: true,
      noApiKeysRequired: true
    }
  });
});

// Payment Info Endpoint
app.get('/api/payment-info', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'S-Express works without API keys!',
    paymentMethods: [
      {
        method: 'mock',
        description: 'Simulates payment processing',
        requiresApiKey: false
      },
      {
        method: 'cod',
        description: 'Cash on Delivery',
        requiresApiKey: false
      }
    ],
    configuration: {
      PAYMENT_METHOD: process.env.PAYMENT_METHOD || 'mock',
      noStripeKeyNeeded: true
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join delivery tracking room
  socket.on('join-delivery', (orderId) => {
    socket.join(`delivery-${orderId}`);
    console.log(`Client joined delivery tracking: ${orderId}`);
  });

  // Leave delivery tracking room
  socket.on('leave-delivery', (orderId) => {
    socket.leave(`delivery-${orderId}`);
  });

  // Payment update listener
  socket.on('payment-update', (data) => {
    console.log('Payment update:', data);
    io.emit('payment-status', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Start Server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 S-Express server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`💳 Payment Method: ${process.env.PAYMENT_METHOD || 'mock'}`);
  console.log(`✅ No API keys required!`);
});

module.exports = { app, io };
