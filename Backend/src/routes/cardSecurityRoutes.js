"use strict";

const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");

// MongoDB connection details (same as other routes)
const uri = "mongodb+srv://manas1:hardpass@cluster0.hzb6xlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "creditCardsDB";
const cardsCollection = "cards";
const securityAlertsCollection = "securityAlerts";
const transactionsCollection = "transactions";

// Create a MongoClient instance
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Helper function to get the database connection
let isConnected = false;
async function getDb() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
  return client.db(dbName);
}

// GET all security alerts for all cards
router.get('/security-alerts', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection(securityAlertsCollection);
    
    // User ID from auth or query parameter (could be enhanced with proper auth)
    const userId = req.query.userId || 'default_user';
    
    // Fetch all alerts
    const alerts = await collection.find({ userId }).toArray();
    
    res.json(alerts);
  } catch (error) {
    console.error('Error getting security alerts:', error);
    res.status(500).json({ error: 'Failed to retrieve security alerts' });
  }
});

// GET security alerts for a specific card
router.get('/cards/:cardId/security-alerts', async (req, res) => {
  try {
    const { cardId } = req.params;
    const db = await getDb();
    const collection = db.collection(securityAlertsCollection);
    
    // Fetch alerts for this card
    const alerts = await collection.find({ cardId }).toArray();
    
    res.json(alerts);
  } catch (error) {
    console.error('Error getting card security alerts:', error);
    res.status(500).json({ error: 'Failed to retrieve security alerts for this card' });
  }
});

// POST report suspicious transaction for a card
router.post('/transactions/report', async (req, res) => {
  try {
    const { transactionId, cardId, reason } = req.body;
    
    if (!transactionId || !cardId || !reason) {
      return res.status(400).json({ error: 'Missing required fields: transactionId, cardId, and reason are required' });
    }
    
    const db = await getDb();
    const transactionsCol = db.collection(transactionsCollection);
    const alertsCol = db.collection(securityAlertsCollection);
    
    // Verify transaction exists
    const transaction = await transactionsCol.findOne({ _id: new ObjectId(transactionId) });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Create a new security alert
    const newAlert = {
      cardId,
      transactionId,
      userId: req.body.userId || 'default_user',
      type: 'user_reported',
      reason,
      status: 'open',
      severity: 'high',
      message: `Suspicious transaction reported at ${transaction.merchantName}: ${reason}`,
      timestamp: new Date(),
      metadata: {
        transactionAmount: transaction.amount,
        merchantName: transaction.merchantName
      }
    };
    
    // Update transaction status
    await transactionsCol.updateOne(
      { _id: new ObjectId(transactionId) },
      { $set: { status: 'flagged', flaggedReason: reason } }
    );
    
    // Insert the alert
    const result = await alertsCol.insertOne(newAlert);
    
    res.status(201).json({
      alertId: result.insertedId,
      message: 'Suspicious transaction reported successfully'
    });
  } catch (error) {
    console.error('Error reporting suspicious transaction:', error);
    res.status(500).json({ error: 'Failed to report suspicious transaction' });
  }
});

// POST resolve a security alert
router.post('/security-alerts/:alertId/resolve', async (req, res) => {
  try {
    const { alertId } = req.params;
    const { resolution, notes } = req.body;
    
    if (!resolution) {
      return res.status(400).json({ error: 'Resolution is required' });
    }
    
    const db = await getDb();
    const collection = db.collection(securityAlertsCollection);
    
    // Update the alert status
    const result = await collection.updateOne(
      { _id: new ObjectId(alertId) },
      { 
        $set: { 
          status: 'resolved',
          resolution,
          notes,
          resolvedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Security alert not found' });
    }
    
    res.json({ message: 'Security alert resolved successfully' });
  } catch (error) {
    console.error('Error resolving security alert:', error);
    res.status(500).json({ error: 'Failed to resolve security alert' });
  }
});

// Scan for phishing and fraud (automated check)
router.post('/transactions/scan', async (req, res) => {
  try {
    const db = await getDb();
    const transactionsCol = db.collection(transactionsCollection);
    const alertsCol = db.collection(securityAlertsCollection);
    
    // User ID from auth or query parameter
    const userId = req.body.userId || 'default_user';
    
    // Get all transactions for scanning (could be optimized with date ranges)
    const transactions = await transactionsCol.find({ 
      userId,
      status: { $nin: ['flagged', 'declined'] } // Only check unflagged transactions
    }).toArray();
    
    // Perform phishing detection
    const phishingPatterns = [
      { pattern: /phish/i, severity: 'high', type: 'phishing' },
      { pattern: /secure.*payment/i, severity: 'medium', type: 'suspicious_name' },
      { pattern: /verify.*account/i, severity: 'high', type: 'phishing' },
      { pattern: /amazon.*secure/i, severity: 'high', type: 'fake_site' },
      { pattern: /paypal.*confirm/i, severity: 'high', type: 'phishing' },
      { pattern: /apple.*verification/i, severity: 'high', type: 'phishing' },
      { pattern: /bank.*urgent/i, severity: 'high', type: 'phishing' },
      { pattern: /account.*suspended/i, severity: 'high', type: 'phishing' },
      { pattern: /unusual.*activity/i, severity: 'medium', type: 'suspicious_name' },
      { pattern: /lottery|prize|winner/i, severity: 'high', type: 'scam' }
    ];
    
    // Unusual amount thresholds
    const unusualAmountThreshold = 1000; // Flag transactions over $1000
    
    // Array to hold alerts created during this scan
    const newAlerts = [];
    
    // Scan each transaction
    for (const transaction of transactions) {
      let flagged = false;
      let reason = '';
      let severity = 'low';
      let type = '';
      
      // Check merchant name against phishing patterns
      for (const pattern of phishingPatterns) {
        if (transaction.merchantName.match(pattern.pattern)) {
          flagged = true;
          reason = `Potential ${pattern.type} detected: ${transaction.merchantName}`;
          severity = pattern.severity;
          type = pattern.type;
          break;
        }
      }
      
      // Check for unusual amounts
      if (!flagged && Math.abs(transaction.amount) > unusualAmountThreshold) {
        flagged = true;
        reason = `Unusually large transaction amount: $${Math.abs(transaction.amount)}`;
        severity = 'medium';
        type = 'unusual_amount';
      }
      
      // Check for foreign transactions (if country data available)
      if (!flagged && transaction.location && transaction.location.country !== 'US') {
        flagged = true;
        reason = `Foreign transaction detected in ${transaction.location.country}`;
        severity = 'medium';
        type = 'foreign_transaction';
      }
      
      // If flagged, create an alert
      if (flagged) {
        // Mark transaction as flagged
        await transactionsCol.updateOne(
          { _id: transaction._id },
          { $set: { status: 'flagged', flaggedReason: reason } }
        );
        
        // Create security alert
        const newAlert = {
          cardId: transaction.cardId,
          transactionId: transaction._id.toString(),
          userId,
          type,
          reason,
          status: 'open',
          severity,
          message: reason,
          timestamp: new Date(),
          metadata: {
            transactionAmount: transaction.amount,
            merchantName: transaction.merchantName,
            transactionDate: transaction.date
          }
        };
        
        const result = await alertsCol.insertOne(newAlert);
        newAlerts.push({
          alertId: result.insertedId,
          transactionId: transaction._id,
          reason
        });
      }
    }
    
    res.json({
      scannedTransactions: transactions.length,
      flaggedTransactions: newAlerts.length,
      alerts: newAlerts
    });
  } catch (error) {
    console.error('Error scanning transactions:', error);
    res.status(500).json({ error: 'Failed to scan transactions' });
  }
});

// Initialize with some known phishing patterns
router.post('/security/initialize-phishing-database', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection('phishingPatterns');
    
    // List of known phishing patterns and suspicious merchants
    const phishingPatterns = [
      { 
        pattern: 'amazonsecure-payment.com', 
        description: 'Fake Amazon payment site',
        severity: 'high',
        category: 'e-commerce',
        reportCount: 138
      },
      { 
        pattern: 'paypal-secure-checkout.com', 
        description: 'Fake PayPal checkout site',
        severity: 'high',
        category: 'payment',
        reportCount: 215
      },
      { 
        pattern: 'appleid-verification.com', 
        description: 'Fake Apple ID verification',
        severity: 'high',
        category: 'tech',
        reportCount: 189
      },
      { 
        pattern: 'secure-bank-verification.com', 
        description: 'Fake bank verification',
        severity: 'high',
        category: 'banking',
        reportCount: 276
      },
      { 
        pattern: 'account-verify-now.com', 
        description: 'Generic account verification scam',
        severity: 'high',
        category: 'general',
        reportCount: 122
      },
      { 
        pattern: 'tax-refund-gov.com', 
        description: 'Fake tax refund site',
        severity: 'high',
        category: 'government',
        reportCount: 98
      },
      { 
        pattern: 'netflix-billing-update.com', 
        description: 'Fake Netflix billing site',
        severity: 'high',
        category: 'entertainment',
        reportCount: 167
      },
      { 
        pattern: 'cashback-rewards-special.com', 
        description: 'Fake rewards site',
        severity: 'medium',
        category: 'rewards',
        reportCount: 83
      },
      { 
        pattern: 'prize-winner-claim.com', 
        description: 'Prize scam site',
        severity: 'medium',
        category: 'lottery',
        reportCount: 204
      },
      { 
        pattern: 'crypto-investment-guaranteed.com', 
        description: 'Cryptocurrency scam',
        severity: 'high',
        category: 'investment',
        reportCount: 312
      }
    ];
    
    // Check if collection exists and has data
    const count = await collection.countDocuments();
    
    if (count > 0) {
      // Collection already exists and has data
      return res.json({ 
        message: 'Phishing database already initialized',
        count
      });
    }
    
    // Insert patterns
    const result = await collection.insertMany(phishingPatterns);
    
    res.status(201).json({
      message: 'Phishing patterns database initialized successfully',
      patternsAdded: result.insertedCount
    });
    
  } catch (error) {
    console.error('Error initializing phishing database:', error);
    res.status(500).json({ error: 'Failed to initialize phishing database' });
  }
});

// Add mock suspicious transactions for testing
router.post('/transactions/add-test-phishing', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection(transactionsCollection);
    
    // User ID from request or use default
    const userId = req.body.userId || 'default_user';
    
    // Get all user cards
    const cards = await db.collection(cardsCollection)
      .find({ userId })
      .toArray();
      
    if (!cards || cards.length === 0) {
      return res.status(404).json({ error: 'No cards found for this user' });
    }
    
    // Sample phishing transactions
    const phishingTransactions = [
      {
        cardId: cards[0]._id.toString(),
        userId,
        amount: -499.99,
        merchantName: "amazon-secure-payment.biz",
        description: "Amazon Prime Renewal",
        category: "shopping",
        type: "purchase",
        status: "completed",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        location: {
          country: "RU",
          city: "Unknown"
        }
      },
      {
        cardId: cards[0]._id.toString(),
        userId,
        amount: -299.50,
        merchantName: "netflix-account-verify.com",
        description: "Netflix Annual Subscription",
        category: "entertainment",
        type: "purchase",
        status: "completed",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        location: {
          country: "NG",
          city: "Unknown"
        }
      },
      {
        cardId: cards.length > 1 ? cards[1]._id.toString() : cards[0]._id.toString(),
        userId,
        amount: -1299.99,
        merchantName: "appleid-verification-services.net",
        description: "Apple Developer Program",
        category: "tech",
        type: "purchase",
        status: "completed",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
        location: {
          country: "CN",
          city: "Unknown"
        }
      },
      {
        cardId: cards.length > 1 ? cards[1]._id.toString() : cards[0]._id.toString(),
        userId,
        amount: -2499.99,
        merchantName: "secure-banking-login.info",
        description: "Account Protection Services",
        category: "services",
        type: "purchase",
        status: "completed",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // Yesterday
        location: {
          country: "US",
          city: "Unknown"
        }
      },
      {
        cardId: cards[0]._id.toString(),
        userId,
        amount: -3999.00,
        merchantName: "lottery-winner-claim-now.com",
        description: "Processing Fee",
        category: "other",
        type: "purchase",
        status: "completed",
        date: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        location: {
          country: "GB",
          city: "Unknown"
        }
      }
    ];
    
    // Insert the phishing transactions
    const result = await collection.insertMany(phishingTransactions);
    
    res.status(201).json({
      message: 'Test phishing transactions added successfully',
      transactionsAdded: result.insertedCount,
      transactions: phishingTransactions.map(t => ({
        merchantName: t.merchantName,
        amount: t.amount,
        date: t.date
      }))
    });
    
  } catch (error) {
    console.error('Error adding test phishing transactions:', error);
    res.status(500).json({ error: 'Failed to add test phishing transactions' });
  }
});

module.exports = router;