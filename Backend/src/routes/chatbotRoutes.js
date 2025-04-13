"use strict";

const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// MongoDB connection details
const uri = "mongodb+srv://manas1:hardpass@cluster0.hzb6xlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "creditCardsDB";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY");

// Helper function to get the database connection
let client;
let isConnected = false;
async function getDb() {
  if (!isConnected) {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    isConnected = true;
  }
  return client.db(dbName);
}

// POST process chatbot message with RAG
router.post('/process', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get transaction data for context
    const db = await getDb();
    const transactionCollection = db.collection("transactions");
    const cardCollection = db.collection("cards");
    
    // Get recent transactions
    const recentTransactions = await transactionCollection
      .find({})
      .sort({ date: -1 })
      .limit(30)
      .toArray();
    
    // Get cards
    const cards = await cardCollection.find({}).toArray();
    
    // Prepare transaction context
    const transactionContext = recentTransactions.map(t => ({
      date: new Date(t.date).toISOString().split('T')[0],
      amount: t.amount,
      merchant: t.merchantName,
      category: t.category,
      status: t.status,
      cardId: t.cardId
    }));
    
    // Prepare card context
    const cardContext = cards.map(card => ({
      id: card._id,
      name: card.cardName,
      type: card.cardType,
      spendingLimit: card.creditLimit || card.monthlySpendingLimit,
      currentSpending: card.currentMonthSpending
    }));
    
    // Calculate spending by category
    const categorySpending = {};
    recentTransactions.forEach(t => {
      if (t.amount < 0) { // Only count outgoing transactions
        const category = t.category || 'other';
        const amount = Math.abs(t.amount);
        
        if (!categorySpending[category]) {
          categorySpending[category] = 0;
        }
        
        categorySpending[category] += amount;
      }
    });
    
    // Convert to array for easier sorting
    const categoryArray = Object.entries(categorySpending).map(([category, amount]) => ({
      category,
      amount: parseFloat(amount.toFixed(2))
    })).sort((a, b) => b.amount - a.amount);
    
    // Calculate spending by merchant
    const merchantSpending = {};
    recentTransactions.forEach(t => {
      if (t.amount < 0) { // Only count outgoing transactions
        const merchant = t.merchantName || 'Unknown';
        const amount = Math.abs(t.amount);
        
        if (!merchantSpending[merchant]) {
          merchantSpending[merchant] = { amount: 0, count: 0 };
        }
        
        merchantSpending[merchant].amount += amount;
        merchantSpending[merchant].count += 1;
      }
    });
    
    // Convert to array for easier sorting
    const merchantArray = Object.entries(merchantSpending).map(([merchant, data]) => ({
      merchant,
      amount: parseFloat(data.amount.toFixed(2)),
      count: data.count
    })).sort((a, b) => b.amount - a.amount);
    
    // Create prompt for Gemini
    const prompt = `
      You are a helpful financial assistant that specializes in analyzing financial transaction data and providing useful, relevant advice.
      
      Here is the user's recent transaction data:
      ${JSON.stringify(transactionContext, null, 2)}
      
      Here is information about the user's credit cards:
      ${JSON.stringify(cardContext, null, 2)}
      
      The user's top spending categories are:
      ${JSON.stringify(categoryArray, null, 2)}
      
      The user's top merchants are:
      ${JSON.stringify(merchantArray, null, 2)}
      
      USER QUERY: ${message}
      
      Provide a helpful, conversational response to the user's query based on the transaction data and financial information provided.
      Focus on personalized insights, actionable recommendations, and specifics from their data.
      Your response should be concise (100-150 words), easy to understand, and use formatting like bold text with ** for emphasis on key points.
      
      If the user is asking about suspicious transactions, be vigilant about identifying potential fraud patterns (like unusual merchants, suspicious website names, etc.).
      
      Keep your responses friendly, professional, and focused on the data provided.
    `;
    
    // Call Gemini API
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiReply = response.text();
      
      // Return the AI response
      res.json({
        response: aiReply,
        context: {
          transactionCount: recentTransactions.length,
          topCategories: categoryArray.slice(0, 3),
          topMerchants: merchantArray.slice(0, 3),
          cardCount: cards.length
        }
      });
    } catch (aiError) {
      console.error('Error calling Gemini API:', aiError);
      
      // Fallback to a simple response
      res.json({
        response: "I apologize, but I'm having trouble analyzing your data right now. Could you try asking a more specific question about your finances?",
        error: true
      });
    }
    
  } catch (error) {
    console.error('Error processing chatbot message:', error);
    res.status(500).json({ error: 'Failed to process message', details: error.message });
  }
});

module.exports = router;