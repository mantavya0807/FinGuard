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

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start the server
app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});
