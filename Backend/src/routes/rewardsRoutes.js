"use strict";

const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");

// MongoDB connection details
const uri = "mongodb+srv://manas1:hardpass@cluster0.hzb6xlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "card_rewards";
const offersCollection = "offers";
const rewardsCollection = "rewards";

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

// GET all offers
router.get('/offers', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection(offersCollection);
    
    // Extract query parameters for filtering
    const { card_name, category } = req.query;
    
    // Build the query object based on filters
    const query = {};
    
    if (card_name) {
      query.card_name = card_name;
    }
    
    if (category) {
      query.category = category;
    }
    
    const offers = await collection.find(query).toArray();
    
    res.json(offers);
  } catch (error) {
    console.error('Error getting offers:', error);
    res.status(500).json({ error: 'Failed to retrieve offers' });
  }
});

// GET offer by ID
router.get('/offers/:id', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection(offersCollection);
    
    const offer = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    
    res.json(offer);
  } catch (error) {
    console.error('Error getting offer:', error);
    res.status(500).json({ error: 'Failed to retrieve offer' });
  }
});

// GET all rewards
router.get('/rewards', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection(rewardsCollection);
    
    // Extract query parameters for filtering
    const { card_name, category } = req.query;
    
    // Build the query object based on filters
    const query = {};
    
    if (card_name) {
      query.card_name = card_name;
    }
    
    if (category) {
      query.category = category;
    }
    
    const rewards = await collection.find(query).toArray();
    
    res.json(rewards);
  } catch (error) {
    console.error('Error getting rewards:', error);
    res.status(500).json({ error: 'Failed to retrieve rewards' });
  }
});

// GET reward by ID
router.get('/rewards/:id', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection(rewardsCollection);
    
    const reward = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }
    
    res.json(reward);
  } catch (error) {
    console.error('Error getting reward:', error);
    res.status(500).json({ error: 'Failed to retrieve reward' });
  }
});

// GET cards with rewards
router.get('/cards', async (req, res) => {
  try {
    const db = await getDb();
    const rewardsCol = db.collection(rewardsCollection);
    
    // Aggregate to get unique card names with their rewards
    const cards = await rewardsCol.aggregate([
      { $group: { 
          _id: "$card_name", 
          rewards: { $push: { category: "$category", reward: "$reward", limit: "$limit", full_text: "$full_text" } }
        }
      },
      { $project: { 
          _id: 0,
          name: "$_id",
          rewards: 1
        }
      }
    ]).toArray();
    
    res.json(cards);
  } catch (error) {
    console.error('Error getting cards with rewards:', error);
    res.status(500).json({ error: 'Failed to retrieve cards with rewards' });
  }
});

// GET best rewards by category
router.get('/best-rewards/:category', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection(rewardsCollection);
    
    const { category } = req.params;
    
    // Find rewards for the specified category
    const rewards = await collection.find({ category }).toArray();
    
    // Sort rewards by percentage (assuming reward is in format like "3%")
    rewards.sort((a, b) => {
      const percentA = parseFloat(a.reward.replace('%', ''));
      const percentB = parseFloat(b.reward.replace('%', ''));
      return percentB - percentA; // Sort in descending order
    });
    
    res.json(rewards);
  } catch (error) {
    console.error('Error getting best rewards:', error);
    res.status(500).json({ error: 'Failed to retrieve best rewards' });
  }
});

// POST create a new offer
router.post('/offers', async (req, res) => {
  try {
    const { card_name, category, offer, full_text, limit } = req.body;
    
    // Basic validation
    if (!card_name || !category || !offer) {
      return res.status(400).json({ error: 'Card name, category, and offer are required fields' });
    }
    
    const db = await getDb();
    const collection = db.collection(offersCollection);
    
    const result = await collection.insertOne({
      card_name,
      category,
      offer,
      full_text,
      limit
    });
    
    res.status(201).json({
      _id: result.insertedId,
      card_name,
      category,
      offer,
      full_text,
      limit
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

// POST create a new reward
router.post('/rewards', async (req, res) => {
  try {
    const { card_name, category, reward, full_text, limit } = req.body;
    
    // Basic validation
    if (!card_name || !category || !reward) {
      return res.status(400).json({ error: 'Card name, category, and reward are required fields' });
    }
    
    const db = await getDb();
    const collection = db.collection(rewardsCollection);
    
    const result = await collection.insertOne({
      card_name,
      category,
      reward,
      full_text,
      limit
    });
    
    res.status(201).json({
      _id: result.insertedId,
      card_name,
      category,
      reward,
      full_text,
      limit
    });
  } catch (error) {
    console.error('Error creating reward:', error);
    res.status(500).json({ error: 'Failed to create reward' });
  }
});

// PUT update an offer
router.put('/offers/:id', async (req, res) => {
  try {
    const { card_name, category, offer, full_text, limit } = req.body;
    
    const db = await getDb();
    const collection = db.collection(offersCollection);
    
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { card_name, category, offer, full_text, limit } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    
    res.json({
      _id: req.params.id,
      card_name,
      category,
      offer,
      full_text,
      limit
    });
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({ error: 'Failed to update offer' });
  }
});

// PUT update a reward
router.put('/rewards/:id', async (req, res) => {
  try {
    const { card_name, category, reward, full_text, limit } = req.body;
    
    const db = await getDb();
    const collection = db.collection(rewardsCollection);
    
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { card_name, category, reward, full_text, limit } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Reward not found' });
    }
    
    res.json({
      _id: req.params.id,
      card_name,
      category,
      reward,
      full_text,
      limit
    });
  } catch (error) {
    console.error('Error updating reward:', error);
    res.status(500).json({ error: 'Failed to update reward' });
  }
});

// DELETE an offer
router.delete('/offers/:id', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection(offersCollection);
    
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    
    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({ error: 'Failed to delete offer' });
  }
});

// DELETE a reward
router.delete('/rewards/:id', async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection(rewardsCollection);
    
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Reward not found' });
    }
    
    res.json({ message: 'Reward deleted successfully' });
  }
  catch (error) {
    console.error('Error deleting reward:', error);
    res.status(500).json({ error: 'Failed to delete reward' });
  }
});

module.exports = router;