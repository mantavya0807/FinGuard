"use strict";

const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");

// MongoDB connection details (same as other routes)
const uri = "mongodb+srv://manas1:hardpass@cluster0.hzb6xlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "creditCardsDB";
const transactionsCollection = "transactions";
const fraudDetectionCollection = "fraudDetection";

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

// GET suspicious transactions for a user
router.get('/suspicious-transactions', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection(transactionsCollection);
    
    // User ID from auth or query parameter
    const userId = req.query.userId || 'default_user';
    
    // Find transactions flagged as suspicious
    const suspiciousTransactions = await collection.find({
      userId,
      $or: [
        { status: 'flagged' },
        { status: 'suspicious' },
        { isSuspicious: true }
      ]
    }).toArray();
    
    res.json(suspiciousTransactions);
  } catch (error) {
    console.error('Error getting suspicious transactions:', error);
    res.status(500).json({ error: 'Failed to retrieve suspicious transactions' });
  }
});

// POST scan transactions for fraud
router.post('/scan-for-fraud', async (req, res) => {
  try {
    const db = await getDb();
    const transCollection = db.collection(transactionsCollection);
    const fraudRulesCollection = db.collection(fraudDetectionCollection);
    
    // User ID from auth or request body
    const userId = req.body.userId || 'default_user';
    
    // Get fraud detection rules
    const fraudRules = await fraudRulesCollection.find({}).toArray();
    
    if (!fraudRules || fraudRules.length === 0) {
      // Initialize default rules if none exist
      await initializeFraudRules(db);
      // Fetch rules again
      fraudRules = await fraudRulesCollection.find({}).toArray();
    }
    
    // Get recent transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTransactions = await transCollection.find({
      userId,
      date: { $gte: thirtyDaysAgo },
      // Exclude already flagged transactions
      status: { $nin: ['flagged', 'suspicious'] }
    }).toArray();
    
    // Apply fraud detection rules
    const flaggedTransactions = [];
    
    for (const transaction of recentTransactions) {
      let isSuspicious = false;
      let reason = '';
      
      // Check high-value transactions
      if (Math.abs(transaction.amount) > 1000) {
        isSuspicious = true;
        reason = 'High-value transaction';
      }
      
      // Check suspicious merchants
      for (const rule of fraudRules) {
        if (rule.type === 'merchant_pattern' && 
            transaction.merchantName.toLowerCase().includes(rule.pattern.toLowerCase())) {
          isSuspicious = true;
          reason = `Suspicious merchant: ${rule.description}`;
          break;
        }
      }
      
      // Check unusual location
      if (transaction.location && transaction.location.country !== 'US') {
        isSuspicious = true;
        reason = `Unusual location: ${transaction.location.country}`;
      }
      
      // Check suspicious merchant categories
      const suspiciousCategories = ['crypto', 'gambling', 'gift_card'];
      if (suspiciousCategories.includes(transaction.category)) {
        isSuspicious = true;
        reason = `Suspicious category: ${transaction.category}`;
      }
      
      // Flag transaction if any rule matched
      if (isSuspicious) {
        await transCollection.updateOne(
          { _id: transaction._id },
          { 
            $set: { 
              status: 'flagged',
              isSuspicious: true,
              flagReason: reason,
              flaggedAt: new Date()
            } 
          }
        );
        
        flaggedTransactions.push({
          transactionId: transaction._id,
          merchantName: transaction.merchantName,
          amount: transaction.amount,
          date: transaction.date,
          reason
        });
      }
    }
    
    res.json({
      scanned: recentTransactions.length,
      flagged: flaggedTransactions.length,
      flaggedTransactions
    });
  } catch (error) {
    console.error('Error scanning for fraud:', error);
    res.status(500).json({ error: 'Failed to scan for fraud' });
  }
});

// Initialize fraud detection rules
async function initializeFraudRules(db) {
  try {
    const collection = db.collection(fraudDetectionCollection);
    
    // Default fraud detection rules
    const defaultRules = [
      {
        type: 'merchant_pattern',
        pattern: 'verify-account',
        description: 'Account verification scam',
        severity: 'high',
        enabled: true
      },
      {
        type: 'merchant_pattern',
        pattern: 'amazon-secure',
        description: 'Fake Amazon site',
        severity: 'high',
        enabled: true
      },
      {
        type: 'merchant_pattern',
        pattern: 'paypal-confirm',
        description: 'Fake PayPal site',
        severity: 'high',
        enabled: true
      },
      {
        type: 'merchant_pattern',
        pattern: 'apple-id-verify',
        description: 'Fake Apple ID verification',
        severity: 'high',
        enabled: true
      },
      {
        type: 'merchant_pattern',
        pattern: 'bank-secure',
        description: 'Fake bank site',
        severity: 'high',
        enabled: true
      },
      {
        type: 'merchant_pattern',
        pattern: 'prize-winner',
        description: 'Prize scam',
        severity: 'high',
        enabled: true
      },
      {
        type: 'merchant_pattern',
        pattern: 'crypto-invest',
        description: 'Cryptocurrency scam',
        severity: 'high',
        enabled: true
      },
      {
        type: 'amount_threshold',
        threshold: 2000,
        description: 'High-value transaction',
        severity: 'medium',
        enabled: true
      },
      {
        type: 'foreign_transaction',
        countries: ['RU', 'NG', 'UA'],
        description: 'High-risk country transaction',
        severity: 'medium',
        enabled: true
      },
      {
        type: 'category',
        categories: ['gambling', 'crypto', 'gift_card_purchase'],
        description: 'High-risk category',
        severity: 'medium',
        enabled: true
      }
    ];
    
    await collection.insertMany(defaultRules);
    return true;
  } catch (error) {
    console.error('Error initializing fraud rules:', error);
    return false;
  }
}

// POST add test phishing transactions
router.post('/add-test-phishing-transactions', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection(transactionsCollection);
    
    // User ID and card ID from request
    const userId = req.body.userId || 'default_user';
    const cardId = req.body.cardId || 'default_card';
    
    // Test phishing transactions to add
    const phishingTransactions = [
      {
        userId,
        cardId,
        merchantName: 'amazon-secure-payment.net',
        amount: -299.99,
        date: new Date(),
        description: 'Amazon Prime Renewal',
        category: 'subscription',
        type: 'online',
        status: 'completed',
        location: {
          country: 'RU',
          city: 'Unknown'
        }
      },
      {
        userId,
        cardId,
        merchantName: 'paypal-account-verify.com',
        amount: -149.50,
        date: new Date(Date.now() - 86400000), // Yesterday
        description: 'Account Verification Fee',
        category: 'services',
        type: 'online',
        status: 'completed',
        location: {
          country: 'NG',
          city: 'Lagos'
        }
      },
      {
        userId,
        cardId,
        merchantName: 'verify-apple-account.org',
        amount: -199.99,
        date: new Date(Date.now() - 172800000), // 2 days ago
        description: 'Apple ID Verification',
        category: 'services',
        type: 'online',
        status: 'completed',
        location: {
          country: 'CN',
          city: 'Unknown'
        }
      },
      {
        userId,
        cardId,
        merchantName: 'lotto-prize-winner.com',
        amount: -599.99,
        date: new Date(Date.now() - 259200000), // 3 days ago
        description: 'Processing Fee',
        category: 'other',
        type: 'online',
        status: 'completed',
        location: {
          country: 'US',
          city: 'Unknown'
        }
      },
      {
        userId,
        cardId,
        merchantName: 'crypto-investment-guaranteed.net',
        amount: -1999.99,
        date: new Date(Date.now() - 345600000), // 4 days ago
        description: 'Investment Deposit',
        category: 'crypto',
        type: 'online',
        status: 'completed',
        location: {
          country: 'UK',
          city: 'London'
        }
      }
    ];
    
    // Insert the phishing transactions
    const result = await collection.insertMany(phishingTransactions);
    
    res.status(201).json({ 
      message: 'Test phishing transactions added successfully',
      count: result.insertedCount,
      transactions: phishingTransactions.map(t => ({
        merchantName: t.merchantName,
        amount: t.amount
      }))
    });
  } catch (error) {
    console.error('Error adding test phishing transactions:', error);
    res.status(500).json({ error: 'Failed to add test phishing transactions' });
  }
});

// GET transaction security stats
router.get('/security-stats', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection(transactionsCollection);
    
    // User ID from auth or query parameter
    const userId = req.query.userId || 'default_user';
    
    // Calculate stats
    const totalTransactions = await collection.countDocuments({ userId });
    const flaggedTransactions = await collection.countDocuments({ 
      userId, 
      $or: [
        { status: 'flagged' },
        { status: 'suspicious' },
        { isSuspicious: true }
      ]
    });
    
    const foreignTransactions = await collection.countDocuments({
      userId,
      'location.country': { $ne: 'US' }
    });
    
    const highValueTransactions = await collection.countDocuments({
      userId,
      amount: { $lt: -1000 } // Only consider outgoing transactions
    });
    
    // Get transactions by category for additional analysis
    const categoryCounts = await collection.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // Get top suspicious merchants
    const suspiciousMerchants = await collection.aggregate([
      { 
        $match: { 
          userId,
          $or: [
            { status: 'flagged' },
            { status: 'suspicious' },
            { isSuspicious: true }
          ]
        } 
      },
      { $group: { _id: '$merchantName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).toArray();
    
    res.json({
      totalTransactions,
      flaggedTransactions,
      flaggedPercentage: (flaggedTransactions / totalTransactions) * 100,
      foreignTransactions,
      highValueTransactions,
      categories: categoryCounts,
      topSuspiciousMerchants: suspiciousMerchants
    });
  } catch (error) {
    console.error('Error getting security stats:', error);
    res.status(500).json({ error: 'Failed to retrieve security stats' });
  }
});

// Export router
module.exports = router;