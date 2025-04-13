"use strict";

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv'); // Keep dotenv for environment variables
const plaidRoutes = require('./routes/plaidRoutes');
const cardRoutes = require('./routes/cardRoutes'); // Import card routes
const transactionRoutes = require('./routes/transactionRoutes'); // Import transaction routes
const cardSecurityRoutes = require('./routes/cardSecurityRoutes'); // Import card security routes
const transactionSecurityRoutes = require('./routes/transactionSecurityRoutes'); // Import transaction security routes
const transactionApprovalRoutes = require('./routes/transactionApprovalRoutes'); // Import transaction approval routes
const analyticsRoutes = require('./routes/analyticsRoutes'); // Import analytics routes
const chatbotRoutes = require('./routes/chatbotRoutes'); // Import chatbot routes
const rewardsRoutes = require('./routes/rewardsRoutes'); // Import rewards routes

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000' // Keep specific origin if needed
}));
app.use(express.json());

// Routes
app.use('/api/plaid', plaidRoutes); // Keep Plaid routes
app.use('/api/cards', cardRoutes); // Card routes
app.use('/api/transactions', transactionRoutes); // Transaction routes
app.use('/api/card-security', cardSecurityRoutes); // Card security routes
app.use('/api/transaction-security', transactionSecurityRoutes); // Transaction security routes
app.use('/api/analytics', analyticsRoutes); // Analytics routes
app.use('/api/rewards', rewardsRoutes); // Add Rewards routes
app.use('/api/chatbot', chatbotRoutes); // Add Chatbot routes
// Combined security routes under a single endpoint
app.use('/api/security', cardSecurityRoutes); // Card security routes
app.use('/api/security', transactionSecurityRoutes); // Transaction security routes
app.use('/api/security', transactionApprovalRoutes); // Transaction approval routes

// Test route
app.get('/', (req, res) => {
  res.send('FinGuard API is running');
});

// Error handling middleware (Keep existing one or adapt)
app.use((err, req, res, next) => {
  console.error('Error:', err.stack || err.message || err); // Log the full error
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Something went wrong on the server'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Consider more graceful shutdown in production
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Consider more graceful shutdown in production
  process.exit(1);
});


module.exports = app;