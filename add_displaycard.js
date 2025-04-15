"use strict";

const { MongoClient } = require("mongodb");

// Replace <username>, <password>, and <your-cluster-url> with your MongoDB Atlas details.
const uri = "mongodb+srv://manas1:hardpass@cluster0.hzb6xlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Specify your database and collection names.
const dbName = "creditCardsDB";
const collectionName = "cards";

// Create a MongoClient instance.
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We'll create a helper function so that we only connect once.
let isConnected = false;
async function getDb() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
  return client.db(dbName);
}

/**
 * Adds a credit card to the MongoDB Atlas database.
 *
 * @param {string} cardNumber - The full credit card number.
 * @param {string} cardName - The name/brand of the card.
 * @param {string} cardHolder - The name of the card holder.
 * @param {string} expiryDate - The card's expiry date (e.g., "12/24").
 * @param {string} cardType - The type of the card (e.g., "Visa", "Mastercard").
 * @param {string} pin - The 4-digit PIN (or any additional PIN field you require).
 * @returns {Promise} - Resolves with the inserted document ID.
 */
async function AddCard(cardNumber, cardName, cardHolder, expiryDate, cardType, pin) {
  try {
    const db = await getDb();
    const collection = db.collection(collectionName);

    // Build the credit card document. In production, consider encrypting sensitive information.
    const newCard = {
      cardNumber,   // Sensitive: store full card numbers securely!
      cardName,
      cardHolder,
      expiryDate,
      cardType,
      pin,          // Sensitive: consider hashing/encrypting!
      createdAt: new Date(),
      // You can include additional fields such as "updatedAt" if needed.
    };

    const result = await collection.insertOne(newCard);
    console.log(`Card added with _id: ${result.insertedId}`);
    return result.insertedId;
  } catch (error) {
    console.error("Error in AddCard:", error);
    throw error;
  }
}

/**
 * Retrieves all credit cards from the database in a public/simplified format.
 *
 * @returns {Promise<Array>} - An array of objects containing:
 *   - last4: last 4 digits of the card number,
 *   - cardName: card's name,
 *   - cardHolder: card holder's name,
 *   - expiryDate: expiry date,
 *   - cardType: type of the card.
 */
async function GetAllCards() {
  try {
    const db = await getDb();
    const collection = db.collection(collectionName);

    const cards = await collection.find({}).toArray();

    // Map each card to a simplified public view.
    const simplifiedCards = cards.map((card) => ({
      last4: card.cardNumber ? card.cardNumber.slice(-4) : null,
      cardName: card.cardName,
      cardHolder: card.cardHolder,
      expiryDate: card.expiryDate,
      cardType: card.cardType,
    }));

    return simplifiedCards;
  } catch (error) {
    console.error("Error in GetAllCards:", error);
    throw error;
  }
}

// Export the functions if you intend to use them as a module.
module.exports = { AddCard, GetAllCards };

async function testFunctions() {
    try {
      // --- Test adding a card ---
      console.log("Adding a card...");
      // Replace the parameters below with test data.
      await AddCard("4111111111111231", "AMEX Blue Cash Everyday Card", "J Doe", "1/2026", "Visa", "1234");
  
      // --- Test getting all cards ---
      console.log("Retrieving all cards...");
      const cards = await GetAllCards();
      console.log("Cards:", cards);
    } catch (error) {
      console.error(error);
    } finally {
      // When you are done, close the MongoDB connection.
      await client.close();
      console.log("Connection closed.");
    }
  }
  
  // Run the test.
  testFunctions();