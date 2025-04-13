/**
 * Script to populate MongoDB with mock transaction data
 * Run with: node populateTransactions.js
 */

const { MongoClient } = require("mongodb");

// MongoDB connection details
const uri = "mongodb+srv://manas1:hardpass@cluster0.hzb6xlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "creditCardsDB";
const collectionName = "transactions";

// Card IDs to reference (these should match the IDs in your 'cards' collection)
const cardIds = [
  'card_123456', // Chase Sapphire Reserve
  'card_234567', // Capital One Savor
  'card_345678'  // American Express Blue Cash
];

// Categories for transactions
const categories = [
  'shopping', 'dining', 'travel', 'groceries', 
  'gas', 'entertainment', 'utilities', 'healthcare'
];

// Merchant names by category
const merchantsByCategory = {
  shopping: ['Amazon', 'Walmart', 'Target', 'Best Buy', 'eBay', 'Etsy'],
  dining: ['Starbucks', 'Chipotle', 'Cheesecake Factory', 'Olive Garden', 'Panera Bread'],
  travel: ['Uber', 'Lyft', 'Airbnb', 'Expedia', 'Delta Airlines', 'Marriott'],
  groceries: ['Whole Foods', 'Kroger', 'Safeway', 'Trader Joe\'s', 'Aldi'],
  gas: ['Shell', 'BP', 'Exxon', 'Chevron', 'Speedway'],
  entertainment: ['Netflix', 'Spotify', 'Disney+', 'AMC Theaters', 'Game Stop'],
  utilities: ['AT&T', 'Verizon', 'Comcast', 'PG&E', 'Water Company'],
  healthcare: ['CVS Pharmacy', 'Walgreens', 'Urgent Care', 'BCBS Premium']
};

// Transaction types
const transactionTypes = ['purchase', 'payment', 'refund', 'recurring'];

// Create a specific transaction for April 13th, 2025
function createApril13Transaction() {
  // Select random values for the transaction
  const cardId = cardIds[Math.floor(Math.random() * cardIds.length)];
  const category = 'dining'; // You can change this to any category you prefer
  const merchantName = merchantsByCategory[category][
    Math.floor(Math.random() * merchantsByCategory[category].length)
  ];
  
  return {
    cardId,
    type: 'purchase',
    amount: -78.42, // A specific amount for the April 13th transaction
    date: new Date('April 14, 2025'),
    merchantName,
    category,
    description: `Dinner at ${merchantName} on April 13th`,
    status: 'completed',
    createdAt: new Date(),
    // Add a flag to easily identify this specific transaction
    isSpecialEntry: true
  };
}

// Generate a random date within the last 90 days
function getRandomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 90); // Random day within last 90 days
  const randomDate = new Date(now);
  randomDate.setDate(randomDate.getDate() - daysAgo);
  return randomDate;
}

// Generate a random amount (negative for purchases, positive for payments)
function getRandomAmount(type) {
  if (type === 'payment' || type === 'refund') {
    return parseFloat((Math.random() * 500 + 50).toFixed(2)); // $50 to $550 positive
  } else {
    return parseFloat((-1 * (Math.random() * 200 + 5)).toFixed(2)); // $5 to $205 negative
  }
}

// Generate random transaction data
function generateMockTransactions(count) {
  const transactions = [];
  
  // Add the specific April 13th transaction
  transactions.push(createApril13Transaction());
  
  // Add the random transactions
  for (let i = 0; i < count; i++) {
    // Random selections
    const cardId = cardIds[Math.floor(Math.random() * cardIds.length)];
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const merchantName = merchantsByCategory[category][
      Math.floor(Math.random() * merchantsByCategory[category].length)
    ];
    
    // Generate transaction
    const transaction = {
      cardId,
      type,
      amount: getRandomAmount(type),
      date: getRandomDate(),
      merchantName,
      category,
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} at ${merchantName}`,
      status: 'completed',
      createdAt: new Date()
    };
    
    transactions.push(transaction);
  }
  
  return transactions;
}

// Main function to connect to MongoDB and insert transactions
async function populateTransactions() {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Generate mock transactions including our April 13th entry
    const mockTransactions = generateMockTransactions(5); // 5 random transactions + 1 specific one
    
    // Insert transactions
    const result = await collection.insertMany(mockTransactions);
    
    console.log(`Successfully inserted ${result.insertedCount} transactions`);
    
    // Print our specific April 13th transaction
    console.log('April 13th transaction:');
    console.log(mockTransactions[0]);
    
    // Print samples of other inserted transactions
    console.log('Sample of other transactions:');
    mockTransactions.slice(1, 3).forEach(tx => console.log(tx));
    
  } catch (error) {
    console.error('Error populating transactions:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
populateTransactions().catch(console.error);