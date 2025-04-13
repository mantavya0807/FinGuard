"use strict";

const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");

// Use the same MongoDB connection details as in cardRoutes.js
const uri = "mongodb+srv://manas1:hardpass@cluster0.hzb6xlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "creditCardsDB";
const collectionName = "transactions";

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

// GET all transactions (with optional filters)
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection(collectionName);
    
    // Extract query parameters for filtering
    const { cardId, startDate, endDate, category, type, limit = 50 } = req.query;
    
    // Build the query object based on filters
    const query = {};
    
    if (cardId) {
      query.cardId = cardId;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }
    
    if (category) {
      query.category = category;
    }
    
    if (type) {
      query.type = type;
    }
    
    // Execute the query
    const transactions = await collection.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json(transactions);
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: 'Failed to retrieve transactions' });
  }
});

// GET transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection(collectionName);
    
    const transaction = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error getting transaction:', error);
    res.status(500).json({ error: 'Failed to retrieve transaction' });
  }
});

// POST create a new transaction
router.post('/', async (req, res) => {
  try {
    const { 
      cardId, 
      amount, 
      merchantName, 
      category, 
      description, 
      type = 'purchase',
      status = 'completed'
    } = req.body;
    
    // Basic validation
    if (!cardId || amount === undefined || !merchantName) {
      return res.status(400).json({ error: 'cardId, amount, and merchantName are required fields' });
    }
    
    const db = await getDb();
    const collection = db.collection(collectionName);
    
    // Create a new transaction document
    const newTransaction = {
      cardId,
      amount: parseFloat(amount),
      merchantName,
      category: category || 'other',
      description: description || merchantName,
      type,
      status,
      date: new Date(),
      createdAt: new Date()
    };
    
    const result = await collection.insertOne(newTransaction);
    
    // Return the created transaction
    res.status(201).json({
      _id: result.insertedId,
      ...newTransaction
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// PUT update a transaction
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection(collectionName);
    
    const { amount, merchantName, category, description, type, status } = req.body;
    
    // Build the update object with only the fields that are provided
    const updateObj = {};
    if (amount !== undefined) updateObj.amount = parseFloat(amount);
    if (merchantName) updateObj.merchantName = merchantName;
    if (category) updateObj.category = category;
    if (description) updateObj.description = description;
    if (type) updateObj.type = type;
    if (status) updateObj.status = status;
    
    // Add updatedAt timestamp
    updateObj.updatedAt = new Date();
    
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateObj }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Return the updated transaction
    const updatedTransaction = await collection.findOne({ _id: new ObjectId(req.params.id) });
    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// DELETE a transaction
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection(collectionName);
    
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// POST create a batch of transactions (for import or testing)
router.post('/batch', async (req, res) => {
  try {
    const { transactions } = req.body;
    
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: 'transactions array is required' });
    }
    
    const db = await getDb();
    const collection = db.collection(collectionName);
    
    // Prepare the transactions for insertion
    const transactionsToInsert = transactions.map(transaction => ({
      cardId: transaction.cardId,
      amount: parseFloat(transaction.amount),
      merchantName: transaction.merchantName,
      category: transaction.category || 'other',
      description: transaction.description || transaction.merchantName,
      type: transaction.type || 'purchase',
      status: transaction.status || 'completed',
      date: transaction.date ? new Date(transaction.date) : new Date(),
      createdAt: new Date()
    }));
    
    const result = await collection.insertMany(transactionsToInsert);
    
    res.status(201).json({
      message: `${result.insertedCount} transactions created successfully`,
      insertedIds: result.insertedIds
    });
  } catch (error) {
    console.error('Error creating transactions batch:', error);
    res.status(500).json({ error: 'Failed to create transactions batch' });
  }
});

// GET transaction stats (summary data)
router.get('/stats/summary', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection(collectionName);
    
    // Extract query parameters for filtering
    const { cardId, startDate, endDate } = req.query;
    
    // Build the query object based on filters
    const query = {};
    
    if (cardId) {
      query.cardId = cardId;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }
    
    // Aggregate to get spending by category
    const categoryAggregation = await collection.aggregate([
      { $match: query },
      { $group: { 
          _id: "$category", 
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]).toArray();
    
    // Aggregate to get spending by merchant
    const merchantAggregation = await collection.aggregate([
      { $match: query },
      { $group: { 
          _id: "$merchantName", 
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    // Calculate total spent and total income
    const totalStats = await collection.aggregate([
      { $match: query },
      { $group: { 
          _id: null, 
          totalSpent: { 
            $sum: { 
              $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0] 
            }
          },
          totalIncome: { 
            $sum: { 
              $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] 
            }
          },
          totalTransactions: { $sum: 1 }
        }
      }
    ]).toArray();
    
    res.json({
      categories: categoryAggregation,
      topMerchants: merchantAggregation,
      totalStats: totalStats[0] || { totalSpent: 0, totalIncome: 0, totalTransactions: 0 }
    });
  } catch (error) {
    console.error('Error getting transaction stats:', error);
    res.status(500).json({ error: 'Failed to retrieve transaction stats' });
  }
});

module.exports = router;