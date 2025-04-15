const express = require("express");
const mongodb = require("mongodb");
const cors = require("cors");
const path = require('path');
const bodyParser = require('body-parser');

// Import the generateNudge function from Nudge/js/generateNudge.js
const { generateNudge } = require('../Nudge/js/generateNudge');

const app = express();
const port = 3000; // You can change the port as needed

// Enable CORS to allow requests from your Chrome extension
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection details
const userCardsUri =
  "mongodb+srv://manas1:hardpass@cluster0.hzb6xlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const userCardsDbName = "creditCardsDB";
const userCardsCollectionName = "cards";

const rewardsUri =
  "mongodb+srv://manas1:hardpass@cluster0.hzb6xlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const rewardsDbName = "card_rewards";
const rewardsCollectionName = "rewards";

// Database information for transactions
const transactionsUri =
  "mongodb+srv://manas1:hardpass@cluster0.hzb6xlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const transactionsDbName = "creditCardsDB";
const transactionsCollectionName = "transactions";

// Helper function to connect to MongoDB
async function connectToMongoDB(uri) {
  const client = new mongodb.MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  return client;
}

// API route to find the best card for a category
app.get("/findBestCard", async (req, res) => {
  const category = req.query.category; // Category passed as query parameter
  if (!category) {
    return res.status(400).json({ message: "Category is required" });
  }

  try {
    const userCardsClient = await connectToMongoDB(userCardsUri);
    const userCardsDb = userCardsClient.db(userCardsDbName);
    const userCardsCollection = userCardsDb.collection(userCardsCollectionName);
    const userCards = await userCardsCollection.find({}).toArray();
    const userCardNames = userCards.map((card) => card.cardName);

    const rewardsClient = await connectToMongoDB(rewardsUri);
    const rewardsDb = rewardsClient.db(rewardsDbName);
    const rewardsCollection = rewardsDb.collection(rewardsCollectionName);
    const allRewards = await rewardsCollection
      .find({
        card_name: { $in: userCardNames },
      })
      .toArray();

    const categoryRewards = allRewards.filter(
      (reward) => reward.category.toLowerCase() === category.toLowerCase()
    );

    console.log("Category Rewards:", allRewards); // Debugging
    let rewardsToConsider = categoryRewards;
    if (categoryRewards.length === 0) {
      rewardsToConsider = allRewards.filter(
        (reward) => reward.category.toLowerCase() === "other purchases"
      );
    }

    if (rewardsToConsider.length === 0) {
      return res.json({ message: "No rewards found for your cards." });
    }

    let bestCard = null;
    let highestReward = 0;

    for (const reward of rewardsToConsider) {
      const rewardMatch = reward.reward.match(/(\d+(\.\d+)?)%/);
      if (rewardMatch) {
        const rewardPercentage = parseFloat(rewardMatch[1]);
        if (rewardPercentage > highestReward) {
          highestReward = rewardPercentage;
          bestCard = reward;
        }
      }
    }

    if (bestCard) {
      res.json({
        cardName: bestCard.card_name,
        category: bestCard.category,
        reward: bestCard.reward,
        message: `Use your ${bestCard.card_name} for ${highestReward}% cash back on ${bestCard.category}.`,
      });
    } else {
      res.json({ message: "Could not determine the best card." });
    }

    await userCardsClient.close();
    await rewardsClient.close();
  } catch (error) {
    console.error("Error finding best card:", error);
    res
      .status(500)
      .json({ message: "An error occurred while finding the best card." });
  }
});

// API endpoint to generate safety nudges
app.post("/generateNudge", async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }
    
    console.log(`Generating nudge for URL: ${url}`);
    const nudgeMessage = await generateNudge(url);
    
    if (nudgeMessage) {
      res.json({ nudge: nudgeMessage });
    } else {
      res.json({ nudge: null, message: "No significant risks detected" });
    }
  } catch (error) {
    console.error("Error generating nudge:", error);
    res.status(500).json({ 
      error: "Failed to generate nudge", 
      details: error.message 
    });
  }
});

// API endpoint to get card details by name
app.get("/getCardDetails", async (req, res) => {
  const cardName = req.query.cardName;
  if (!cardName) {
    return res.status(400).json({ error: "Card name is required" });
  }

  try {
    const client = await connectToMongoDB(userCardsUri);
    const db = client.db(userCardsDbName);
    const collection = db.collection(userCardsCollectionName);
    
    // Log the requested card name for debugging
    console.log("Looking for card by name:", cardName);
    
    // Try exact match first (case-insensitive)
    let card = await collection.findOne({ 
      cardName: { $regex: new RegExp(`^${cardName}$`, 'i') } 
    });
    
    // If not found, try partial match
    if (!card) {
      console.log("Exact match not found, trying partial match");
      card = await collection.findOne({ 
        cardName: { $regex: new RegExp(cardName.split(' ').join('.*'), 'i') } 
      });
    }
    
    // If still not found, try to get AMEX card if the name contains "AMEX"
    if (!card && cardName.toUpperCase().includes("AMEX")) {
      console.log("Trying to find any AMEX card");
      card = await collection.findOne({ 
        cardName: { $regex: /AMEX/i } 
      });
    }
    
    // Last resort - get any card with similar type
    if (!card) {
      const cardTypesToSearch = ["AMEX", "Visa", "Mastercard", "Discover"];
      for (const type of cardTypesToSearch) {
        if (cardName.toUpperCase().includes(type.toUpperCase())) {
          console.log(`Trying to find any ${type} card`);
          card = await collection.findOne({ 
            cardType: { $regex: new RegExp(type, 'i') } 
          });
          if (card) break;
        }
      }
    }
    
    await client.close();
    
    if (card) {
      // Return card details needed for autofill
      res.json({
        success: true,
        card: {
          cardNumber: card.cardNumber,
          cardName: card.cardName,
          cardHolder: card.cardHolder,
          expiryDate: card.expiryDate,
          cardType: card.cardType,
          cvv: card.cvv || "123", // Include a default CVV if not present in DB
        }
      });
    } else {
      res.status(404).json({ 
        success: false, 
        error: "Card not found" 
      });
    }
  } catch (error) {
    console.error("Error fetching card details:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch card details",
      details: error.message
    });
  }
});

// API endpoint to save transaction data
app.post("/saveTransaction", async (req, res) => {
  try {
    const transactionData = req.body;
    
    if (!transactionData || !transactionData.cardName) {
      return res.status(400).json({ 
        success: false, 
        error: "Transaction data is required" 
      });
    }
    
    console.log("Saving transaction:", transactionData);
    
    // Add a timestamp if not provided
    if (!transactionData.date) {
      transactionData.date = new Date().toISOString();
    }
    
    // Connect to MongoDB
    const client = await connectToMongoDB(transactionsUri);
    const db = client.db(transactionsDbName);
    const collection = db.collection(transactionsCollectionName);
    
    // Insert the transaction data
    const result = await collection.insertOne({
      ...transactionData,
      createdAt: new Date()
    });
    
    await client.close();
    
    if (result.acknowledged) {
      res.json({
        success: true,
        message: "Transaction saved successfully",
        transactionId: result.insertedId
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to save transaction" 
      });
    }
  } catch (error) {
    console.error("Error saving transaction:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to save transaction",
      details: error.message
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start the server
app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});
