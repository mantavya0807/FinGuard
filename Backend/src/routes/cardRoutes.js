"use strict";

const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Replace with your MongoDB Atlas details
const uri = process.env.MONGODB_URI || "mongodb+srv://manas1:hardpass@cluster0.hzb6xlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = process.env.MONGODB_DB || "creditCardsDB";
const collectionName = "cards";

// Nessie API configuration
const NESSIE_API_KEY = process.env.NESSIE_API_KEY || "your-api-key-here";
const NESSIE_API_URL = process.env.NESSIE_API_URL || "http://api.nessieisreal.com/";
const DEFAULT_CUSTOMER_ID = process.env.DEFAULT_CUSTOMER_ID || "65fb9af498ff9a8535801d52"; // Default customer ID

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
    console.log("Connected to MongoDB");
  }
  return client.db(dbName);
}

// GET all cards
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection(collectionName);
    
    const cards = await collection.find({}).toArray();
    
    // Map each card to a simplified view for the frontend
    const simplifiedCards = cards.map((card) => ({
      id: card._id.toString(),
      cardName: card.cardName,
      cardType: card.cardType,
      cardNumber: "•••• •••• •••• " + card.cardNumber.slice(-4),
      last4: card.cardNumber.slice(-4),
      cardHolder: card.cardHolder,
      expiryDate: card.expiryDate,
      color: card.color || "#1E3A8A",
      creditLimit: card.creditLimit || 5000,
      currentMonthSpending: card.currentMonthSpending || 0,
      nessieAccountId: card.nessieAccountId
    }));
    
    res.json(simplifiedCards);
  } catch (error) {
    console.error('Error getting cards:', error);
    res.status(500).json({ error: 'Failed to retrieve cards' });
  }
});

// GET card by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection(collectionName);
    
    const card = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Create a response with masked card number
    const response = {
      id: card._id.toString(),
      cardName: card.cardName,
      cardType: card.cardType,
      cardNumber: "•••• •••• •••• " + card.cardNumber.slice(-4),
      last4: card.cardNumber.slice(-4),
      cardHolder: card.cardHolder,
      expiryDate: card.expiryDate,
      color: card.color || "#1E3A8A",
      creditLimit: card.creditLimit || 5000,
      currentMonthSpending: card.currentMonthSpending || 0,
      nessieAccountId: card.nessieAccountId
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error getting card:', error);
    res.status(500).json({ error: 'Failed to retrieve card' });
  }
});

// POST create a new card
router.post('/', async (req, res) => {
  try {
    const { 
      cardNumber, 
      cardName, 
      cardHolder, 
      expiryDate, 
      cardType, 
      pin, 
      creditLimit,
      color
    } = req.body;
    
    // Basic validation
    if (!cardNumber || !cardName || !cardHolder || !expiryDate || !cardType || !pin) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }
    
    const db = await getDb();
    const collection = db.collection(collectionName);
    
    // Prepare card document for MongoDB
    const newCard = {
      cardNumber,
      cardName,
      cardHolder,
      expiryDate,
      cardType,
      pin,
      creditLimit: Number(creditLimit) || 5000,
      color: color || "#1E3A8A",
      currentMonthSpending: 0,
      createdAt: new Date()
    };
    
    // Create account in Nessie API
    let nessieAccountId = null;
    try {
      console.log('Creating Nessie account...');
      
      // Use a default customer ID or get it from authenticated user in a real app
      const customerId = req.user?.customerId || DEFAULT_CUSTOMER_ID;
      
      const nessieResponse = await axios.post(
        `${NESSIE_API_URL}/customers/${customerId}/accounts`,
        {
          type: "Credit Card",
          nickname: cardName,
          rewards: 0,
          balance: 0,
          account_number: cardNumber.slice(-8) // Using last 8 digits as account number
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          params: {
            key: NESSIE_API_KEY
          }
        }
      );
      
      if (nessieResponse.data && nessieResponse.data._id) {
        console.log('Nessie account created:', nessieResponse.data._id);
        nessieAccountId = nessieResponse.data._id;
        newCard.nessieAccountId = nessieAccountId;
        newCard.nessieCustomerId = customerId;
      }
    } catch (nessieError) {
      console.error('Error creating Nessie account:', nessieError.response?.data || nessieError.message);
      // Continue to create the card in MongoDB even if Nessie fails
    }
    
    // Insert card into MongoDB
    const result = await collection.insertOne(newCard);
    console.log('Card created in MongoDB:', result.insertedId);
    
    // Return a simplified response
    res.status(201).json({
      _id: result.insertedId,
      id: result.insertedId.toString(),
      cardName,
      cardHolder,
      cardNumber: "•••• •••• •••• " + cardNumber.slice(-4),
      last4: cardNumber.slice(-4),
      expiryDate,
      cardType,
      color: newCard.color,
      creditLimit: newCard.creditLimit,
      currentMonthSpending: 0,
      nessieAccountId
    });
    
  } catch (error) {
    console.error('Error adding card:', error);
    res.status(500).json({ error: 'Failed to add card', details: error.message });
  }
});

// PUT update a card
router.put('/:id', async (req, res) => {
  try {
    const { cardName, creditLimit, color } = req.body;
    const cardId = req.params.id;
    
    const db = await getDb();
    const collection = db.collection(collectionName);
    
    // Find the card first to check if it exists and get Nessie ID if any
    const existingCard = await collection.findOne({ _id: new ObjectId(cardId) });
    
    if (!existingCard) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Update fields
    const updateData = {};
    if (cardName) updateData.cardName = cardName;
    if (creditLimit) updateData.creditLimit = Number(creditLimit);
    if (color) updateData.color = color;
    updateData.updatedAt = new Date();
    
    // Update in MongoDB
    const result = await collection.updateOne(
      { _id: new ObjectId(cardId) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // If there's a Nessie account, update it too
    if (existingCard.nessieAccountId) {
      try {
        await axios.put(
          `${NESSIE_API_URL}/accounts/${existingCard.nessieAccountId}`,
          {
            nickname: cardName || existingCard.cardName
          },
          {
            params: {
              key: NESSIE_API_KEY
            }
          }
        );
      } catch (nessieError) {
        console.error('Error updating Nessie account:', nessieError.response?.data || nessieError.message);
        // Continue anyway if Nessie update fails
      }
    }
    
    res.json({
      message: 'Card updated successfully',
      id: cardId
    });
    
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

// DELETE a card
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection(collectionName);
    
    // First get the card to check if it has a Nessie account
    const card = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // If card has a Nessie account, try to delete it
    if (card.nessieAccountId) {
      try {
        await axios.delete(
          `${NESSIE_API_URL}/accounts/${card.nessieAccountId}`,
          {
            params: {
              key: NESSIE_API_KEY
            }
          }
        );
        console.log(`Deleted Nessie account: ${card.nessieAccountId}`);
      } catch (nessieError) {
        console.error('Error deleting Nessie account:', nessieError.response?.data || nessieError.message);
        // Continue to delete the card from MongoDB even if Nessie delete fails
      }
    }
    
    // Delete the card from MongoDB
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

// GET transactions for a card
router.get('/:id/transactions', async (req, res) => {
  try {
    const cardId = req.params.id;
    const { startDate, endDate, category } = req.query;
    
    const db = await getDb();
    const cardsCollection = db.collection(collectionName);
    
    // First verify the card exists
    const card = await cardsCollection.findOne({ _id: new ObjectId(cardId) });
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // If we have a Nessie account ID, try to fetch real transactions
    if (card.nessieAccountId) {
      try {
        const nessieResponse = await axios.get(
          `${NESSIE_API_URL}/accounts/${card.nessieAccountId}/purchases`,
          {
            params: {
              key: NESSIE_API_KEY
            }
          }
        );
        
        if (nessieResponse.data && Array.isArray(nessieResponse.data)) {
          // Transform Nessie data to our format
          const transactions = nessieResponse.data.map(transaction => ({
            id: transaction._id,
            cardId: cardId,
            merchantName: transaction.merchant_id || 'Unknown Merchant',
            merchantCategory: transaction.description || 'Other',
            amount: -Math.abs(transaction.amount), // Negative for purchases
            date: new Date(transaction.purchase_date || transaction.creation_date),
            status: transaction.status || 'completed',
            rewardsEarned: (Math.abs(transaction.amount) * 0.01).toFixed(2) // Example: 1% cashback
          }));
          
          // Apply filters
          let filteredTransactions = transactions;
          
          if (startDate) {
            const startDateObj = new Date(startDate);
            filteredTransactions = filteredTransactions.filter(tx => 
              new Date(tx.date) >= startDateObj
            );
          }
          
          if (endDate) {
            const endDateObj = new Date(endDate);
            filteredTransactions = filteredTransactions.filter(tx => 
              new Date(tx.date) <= endDateObj
            );
          }
          
          if (category) {
            filteredTransactions = filteredTransactions.filter(tx => 
              tx.merchantCategory.toLowerCase().includes(category.toLowerCase())
            );
          }
          
          return res.json(filteredTransactions);
        }
      } catch (nessieError) {
        console.error('Error fetching Nessie transactions:', nessieError.response?.data || nessieError.message);
        // Fall back to mock data if Nessie API fails
      }
    }
    
    // If we don't have Nessie data or there was an error, return mock data
    const mockTransactions = [
      {
        id: 'trx_' + Math.random().toString(36).substring(2, 10),
        cardId,
        merchantName: 'Amazon',
        merchantCategory: 'Shopping',
        amount: -67.99,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        status: 'completed',
        rewardsEarned: 0.68
      },
      {
        id: 'trx_' + Math.random().toString(36).substring(2, 10),
        cardId,
        merchantName: 'Starbucks',
        merchantCategory: 'Dining',
        amount: -5.45,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
        status: 'completed',
        rewardsEarned: 0.16
      },
      {
        id: 'trx_' + Math.random().toString(36).substring(2, 10),
        cardId,
        merchantName: 'Whole Foods',
        merchantCategory: 'Grocery',
        amount: -89.72,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
        status: 'completed',
        rewardsEarned: 1.79
      },
      {
        id: 'trx_' + Math.random().toString(36).substring(2, 10),
        cardId,
        merchantName: 'Shell Gas',
        merchantCategory: 'Gas',
        amount: -42.50,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
        status: 'completed',
        rewardsEarned: 0.85
      },
      {
        id: 'pmt_' + Math.random().toString(36).substring(2, 10),
        cardId,
        merchantName: 'Payment - Thank You',
        merchantCategory: 'Payment',
        amount: 150.00,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
        status: 'completed',
        rewardsEarned: 0
      }
    ];
    
    // Apply filters to mock data
    let filteredTransactions = [...mockTransactions];
    
    if (startDate) {
      const startDateObj = new Date(startDate);
      filteredTransactions = filteredTransactions.filter(tx => 
        new Date(tx.date) >= startDateObj
      );
    }
    
    if (endDate) {
      const endDateObj = new Date(endDate);
      filteredTransactions = filteredTransactions.filter(tx => 
        new Date(tx.date) <= endDateObj
      );
    }
    
    if (category) {
      filteredTransactions = filteredTransactions.filter(tx => 
        tx.merchantCategory.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    res.json(filteredTransactions);
    
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: 'Failed to retrieve transactions' });
  }
});

module.exports = router;  