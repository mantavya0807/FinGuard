"use strict";

const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// MongoDB connection details (same as other routes)
const uri = "mongodb+srv://manas1:hardpass@cluster0.hzb6xlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "creditCardsDB";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY");

// Create a MongoClient instance - THIS WAS MISSING
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Helper function to get the database connection
let isConnected = false;
async function getDb() {
  if (!isConnected) {
    await client.connect(); // Now client is defined
    isConnected = true;
  }
  return client.db(dbName);
}

// GET spending trends by category
router.get('/spending/categories', async (req, res) => {
  try {
    const { startDate, endDate, cardId } = req.query;
    const db = await getDb();
    const collection = db.collection("transactions");
    
    // Build query
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
    
    // Aggregate spending by category
    const result = await collection.aggregate([
      { $match: query },
      { $group: {
          _id: "$category",
          totalAmount: { $sum: { $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]).toArray();
    
    // Format the response
    const categories = result.map(item => ({
      category: item._id,
      totalAmount: parseFloat(item.totalAmount.toFixed(2)),
      transactionCount: item.count,
      percentage: 0 // Will calculate after getting total
    }));
    
    // Calculate total spending
    const totalSpending = categories.reduce((sum, cat) => sum + cat.totalAmount, 0);
    
    // Calculate percentages
    categories.forEach(cat => {
      cat.percentage = parseFloat(((cat.totalAmount / totalSpending) * 100).toFixed(2));
    });
    
    res.json({
      categories,
      totalSpending: parseFloat(totalSpending.toFixed(2))
    });
  } catch (error) {
    console.error('Error getting spending categories:', error);
    res.status(500).json({ error: 'Failed to retrieve spending categories' });
  }
});

// GET spending trends over time
router.get('/spending/trends', async (req, res) => {
  try {
    const { period = 'monthly', months = 6, cardId } = req.query;
    const db = await getDb();
    const collection = db.collection("transactions");
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));
    
    // Build query
    const query = {
      date: { $gte: startDate, $lte: endDate }
    };
    
    if (cardId) {
      query.cardId = cardId;
    }
    
    // Define grouping based on period
    let dateFormat;
    if (period === 'weekly') {
      dateFormat = {
        $dateToString: { format: "%Y-W%U", date: "$date" }
      };
    } else if (period === 'daily') {
      dateFormat = {
        $dateToString: { format: "%Y-%m-%d", date: "$date" }
      };
    } else {
      // Default to monthly
      dateFormat = {
        $dateToString: { format: "%Y-%m", date: "$date" }
      };
    }
    
    // Aggregate spending over time
    const result = await collection.aggregate([
      { $match: query },
      { $group: {
          _id: dateFormat,
          spending: { $sum: { $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0] } },
          income: { $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] } },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    // Format the response
    const trends = result.map(item => ({
      period: item._id,
      spending: parseFloat(item.spending.toFixed(2)),
      income: parseFloat(item.income.toFixed(2)),
      transactions: item.transactions,
      netFlow: parseFloat((item.income - item.spending).toFixed(2))
    }));
    
    res.json({
      trends,
      totalSpending: parseFloat(trends.reduce((sum, t) => sum + t.spending, 0).toFixed(2)),
      totalIncome: parseFloat(trends.reduce((sum, t) => sum + t.income, 0).toFixed(2)),
      netFlow: parseFloat(trends.reduce((sum, t) => sum + t.netFlow, 0).toFixed(2))
    });
  } catch (error) {
    console.error('Error getting spending trends:', error);
    res.status(500).json({ error: 'Failed to retrieve spending trends' });
  }
});

// GET merchant analysis
router.get('/merchants', async (req, res) => {
  try {
    const { limit = 10, cardId } = req.query;
    const db = await getDb();
    const collection = db.collection("transactions");
    
    // Build query
    const query = {};
    if (cardId) {
      query.cardId = cardId;
    }
    
    // Aggregate spending by merchant
    const result = await collection.aggregate([
      { $match: query },
      { $group: {
          _id: "$merchantName",
          totalAmount: { $sum: { $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0] } },
          count: { $sum: 1 },
          categories: { $addToSet: "$category" },
          lastTransaction: { $max: "$date" }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: parseInt(limit) }
    ]).toArray();
    
    // Format the response
    const merchants = result.map(item => ({
      merchantName: item._id,
      totalSpent: parseFloat(item.totalAmount.toFixed(2)),
      transactionCount: item.count,
      categories: item.categories,
      lastTransaction: item.lastTransaction
    }));
    
    res.json({
      merchants,
      totalMerchants: merchants.length
    });
  } catch (error) {
    console.error('Error getting merchant analysis:', error);
    res.status(500).json({ error: 'Failed to retrieve merchant analysis' });
  }
});

// GET rewards optimization
router.get('/rewards/optimization', async (req, res) => {
  try {
    const db = await getDb();
    const transactionCollection = db.collection("transactions");
    const cardCollection = db.collection("cards");
    
    // Get all cards
    const cards = await cardCollection.find({}).toArray();
    
    // Get top spending categories
    const categorySpending = await transactionCollection.aggregate([
      { $match: { amount: { $lt: 0 } } },
      { $group: {
          _id: "$category",
          totalAmount: { $sum: { $abs: "$amount" } }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 5 }
    ]).toArray();
    
    // Simulate reward structures (in a real app, this would come from the database)
    const rewardStructures = {
      "VISA": {
        "Travel Rewards Visa": {
          "travel": 3,
          "dining": 2,
          "groceries": 1,
          "gas": 1,
          "other": 1
        }
      },
      "MASTERCARD": {
        "Premium Rewards Mastercard": {
          "dining": 3,
          "groceries": 3,
          "entertainment": 2,
          "other": 1
        }
      },
      "AMEX": {
        "Blue Cash": {
          "groceries": 6,
          "gas": 3,
          "travel": 2,
          "other": 1
        }
      }
    };
    
    // Calculate optimal card for each top category
    const optimizations = categorySpending.map(category => {
      const catName = category._id;
      const spending = category.totalAmount;
      
      // Find best card for this category
      let bestCard = null;
      let bestRewardRate = 0;
      let potentialRewards = 0;
      
      cards.forEach(card => {
        const cardType = card.cardType;
        const cardName = card.cardName;
        
        // Get reward rate for this category (default to "other" if category not found)
        const rewardRate = rewardStructures[cardType]?.[cardName]?.[catName] || 
                         rewardStructures[cardType]?.[cardName]?.["other"] || 1;
        
        if (rewardRate > bestRewardRate) {
          bestRewardRate = rewardRate;
          bestCard = {
            cardId: card._id,
            cardName: cardName,
            cardType: cardType
          };
          potentialRewards = (spending * (rewardRate / 100));
        }
      });
      
      return {
        category: catName,
        monthlySpending: parseFloat(spending.toFixed(2)),
        bestCard: bestCard,
        rewardRate: `${bestRewardRate}%`,
        potentialMonthlyRewards: parseFloat(potentialRewards.toFixed(2))
      };
    });
    
    res.json({
      optimizations,
      potentialAnnualRewards: parseFloat((optimizations.reduce((sum, opt) => sum + opt.potentialMonthlyRewards, 0) * 12).toFixed(2))
    });
  } catch (error) {
    console.error('Error getting rewards optimization:', error);
    res.status(500).json({ error: 'Failed to calculate rewards optimization' });
  }
});

// GET budget analysis
router.get('/budget/analysis', async (req, res) => {
  try {
    const db = await getDb();
    const transactionCollection = db.collection("transactions");
    const cardCollection = db.collection("cards");
    
    // Get all cards with their spending limits
    const cards = await cardCollection.find({}).toArray();
    
    // Calculate current month bounds
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Get monthly spending per category
    const categorySpending = await transactionCollection.aggregate([
      { 
        $match: { 
          amount: { $lt: 0 },
          date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        } 
      },
      { 
        $group: {
          _id: "$category",
          totalAmount: { $sum: { $abs: "$amount" } }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]).toArray();
    
    // Define default budget targets (in a real app, these would be user-set)
    const defaultBudgets = {
      "groceries": 500,
      "dining": 400,
      "entertainment": 200,
      "gas": 150,
      "travel": 300,
      "shopping": 300,
      "bills": 1000,
      "other": 200
    };
    
    // Create budget analysis
    const budgetAnalysis = categorySpending.map(category => {
      const catName = category._id;
      const spent = category.totalAmount;
      const budget = defaultBudgets[catName] || 200; // Default budget if not defined
      const remaining = budget - spent;
      const percentage = (spent / budget) * 100;
      
      return {
        category: catName,
        spent: parseFloat(spent.toFixed(2)),
        budget: budget,
        remaining: parseFloat(remaining.toFixed(2)),
        percentage: parseFloat(percentage.toFixed(2)),
        status: percentage > 90 ? "danger" : percentage > 75 ? "warning" : "good"
      };
    });
    
    // Get card utilization
    const cardUtilization = cards.map(card => {
      const spendingLimit = card.creditLimit || 1000; // Default if not set
      const spent = card.currentMonthSpending || 0;
      const utilization = (spent / spendingLimit) * 100;
      
      return {
        cardId: card._id,
        cardName: card.cardName,
        spendingLimit: spendingLimit,
        spent: parseFloat(spent.toFixed(2)),
        remaining: parseFloat((spendingLimit - spent).toFixed(2)),
        utilization: parseFloat(utilization.toFixed(2)),
        status: utilization > 80 ? "danger" : utilization > 50 ? "warning" : "good"
      };
    });
    
    res.json({
      budgetsByCategory: budgetAnalysis,
      cardUtilization: cardUtilization,
      totalBudget: parseFloat(Object.values(defaultBudgets).reduce((a, b) => a + b, 0).toFixed(2)),
      totalSpent: parseFloat(categorySpending.reduce((sum, cat) => sum + cat.totalAmount, 0).toFixed(2))
    });
  } catch (error) {
    console.error('Error getting budget analysis:', error);
    res.status(500).json({ error: 'Failed to retrieve budget analysis' });
  }
});

// POST to generate financial insights with Gemini API
router.post('/insights/generate', async (req, res) => {
  try {
    // Get data from request body or fetch from database
    const { transactionData, timeframe } = req.body;
    const db = await getDb();
    
    // If no transaction data provided, fetch from DB
    let transactions = transactionData;
    if (!transactions) {
      const collection = db.collection("transactions");
      // Get recent transactions
      transactions = await collection.find({})
        .sort({ date: -1 })
        .limit(100)
        .toArray();
    }
    
    // Prepare data for Gemini
    const transactionSummary = transactions.map(t => ({
      date: new Date(t.date).toISOString().split('T')[0],
      amount: t.amount,
      merchant: t.merchantName,
      category: t.category
    }));
    
    // Create prompt for Gemini
    const prompt = `
      As a financial analyst, review the following transaction data and provide 3-5 actionable insights:
      
      Transaction Summary:
      ${JSON.stringify(transactionSummary, null, 2)}
      
      Analyze spending patterns, budget concerns, and optimization opportunities.
      Focus on these areas:
      1. Unusual spending patterns or potential concerns
      2. Budget optimization suggestions
      3. Reward maximization opportunities
      4. Savings opportunities
      
      Provide specific, actionable insights with clear recommendations.
    `;
    
    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const insights = response.text();
    
    // Return the insights
    res.json({
      insights,
      generatedAt: new Date(),
      timeframe: timeframe || "last 100 transactions"
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate financial insights', details: error.message });
  }
});

module.exports = router;