"use strict";

const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");

// Use the same MongoDB connection details
const uri = "mongodb+srv://manas1:hardpass@cluster0.hzb6xlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "creditCardsDB";
const transactionsCollection = "transactions";
const securityAlertsCollection = "securityAlerts";

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

// POST approve a suspicious transaction
router.post('/transactions/:transactionId/approve', async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }
    
    const db = await getDb();
    const transactionsCol = db.collection(transactionsCollection);
    const alertsCol = db.collection(securityAlertsCollection);
    
    // Find the transaction
    const transaction = await transactionsCol.findOne({ 
      _id: new ObjectId(transactionId)
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Update transaction status to approved
    await transactionsCol.updateOne(
      { _id: new ObjectId(transactionId) },
      { 
        $set: { 
          status: 'completed',
          isSuspicious: false,
          flagReason: null,
          approvedAt: new Date(),
          approvedBy: req.body.userId || 'user'
        },
        $unset: { 
          flaggedAt: ""
        }
      }
    );
    
    // Update any security alerts for this transaction
    await alertsCol.updateMany(
      { transactionId: transactionId.toString() },
      { 
        $set: { 
          status: 'resolved',
          resolution: 'approved',
          resolvedAt: new Date(),
          resolvedBy: req.body.userId || 'user'
        }
      }
    );
    
    res.json({ 
      success: true, 
      message: 'Transaction approved successfully',
      transaction: {
        id: transaction._id,
        merchantName: transaction.merchantName,
        amount: transaction.amount
      }
    });
  } catch (error) {
    console.error('Error approving transaction:', error);
    res.status(500).json({ error: 'Failed to approve transaction' });
  }
});

// POST reject a suspicious transaction (delete it)
router.post('/transactions/:transactionId/reject', async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }
    
    const db = await getDb();
    const transactionsCol = db.collection(transactionsCollection);
    const alertsCol = db.collection(securityAlertsCollection);
    
    // Find the transaction before deleting
    const transaction = await transactionsCol.findOne({ 
      _id: new ObjectId(transactionId)
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Store transaction details for security logs
    const transactionDetails = {
      id: transaction._id.toString(),
      merchantName: transaction.merchantName,
      amount: transaction.amount,
      date: transaction.date
    };
    
    // Delete the transaction
    const deleteResult = await transactionsCol.deleteOne({ 
      _id: new ObjectId(transactionId)
    });
    
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ error: 'Transaction not found or already deleted' });
    }
    
    // Update any security alerts for this transaction
    await alertsCol.updateMany(
      { transactionId: transactionId.toString() },
      { 
        $set: { 
          status: 'resolved',
          resolution: 'rejected',
          resolvedAt: new Date(),
          resolvedBy: req.body.userId || 'user',
          transactionRemoved: true
        }
      }
    );
    
    // Create a log entry for this rejection
    await db.collection('securityLogs').insertOne({
      type: 'transaction_rejected',
      userId: req.body.userId || 'user',
      transactionDetails,
      reason: req.body.reason || 'User identified as fraudulent',
      timestamp: new Date()
    });
    
    res.json({ 
      success: true, 
      message: 'Transaction rejected and removed successfully',
      transaction: transactionDetails
    });
  } catch (error) {
    console.error('Error rejecting transaction:', error);
    res.status(500).json({ error: 'Failed to reject transaction' });
  }
});

module.exports = router;