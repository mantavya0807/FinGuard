/**
 * Script to populate MongoDB with 6 demo cards and linked transactions
 * Run with: node populateCardsAndTransactions.js
 */

const { MongoClient, ObjectId } = require("mongodb");

// MongoDB connection details
const uri = "mongodb+srv://manas1:hardpass@cluster0.hzb6xlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "creditCardsDB";
const cardsCollection = "cards";
const transactionsCollection = "transactions";

// Card definitions for the 6 demo cards
const demoCards = [
  {
    cardNumber: "4111111111111111",
    cardName: "Travel Rewards Visa",
    cardHolder: "JOHN SMITH",
    expiryDate: "09/27",
    cardType: "VISA",
    pin: "1234",
    creditLimit: 10000,
    color: "#1E3A8A", // Blue
    currentMonthSpending: 0,
    createdAt: new Date()
  },
  {
    cardNumber: "5555555555554444",
    cardName: "Cash Rewards Mastercard",
    cardHolder: "JOHN SMITH",
    expiryDate: "11/26",
    cardType: "MASTERCARD",
    pin: "5678",
    creditLimit: 7500,
    color: "#DC2626", // Red
    currentMonthSpending: 0,
    createdAt: new Date()
  },
  {
    cardNumber: "378282246310005",
    cardName: "Premium Rewards Amex",
    cardHolder: "JOHN SMITH",
    expiryDate: "04/28",
    cardType: "AMEX",
    pin: "9012",
    creditLimit: 15000,
    color: "#047857", // Green
    currentMonthSpending: 0,
    createdAt: new Date()
  },
  {
    cardNumber: "6011111111111117",
    cardName: "Student Rewards Card",
    cardHolder: "JOHN SMITH",
    expiryDate: "07/26",
    cardType: "DISCOVER",
    pin: "3456",
    creditLimit: 3000,
    color: "#F59E0B", // Amber
    currentMonthSpending: 0,
    createdAt: new Date()
  },
  {
    cardNumber: "3056930009020004",
    cardName: "Business Diners Club",
    cardHolder: "JOHN SMITH",
    expiryDate: "03/27",
    cardType: "DINERS",
    pin: "7890",
    creditLimit: 12000,
    color: "#7C3AED", // Purple
    currentMonthSpending: 0,
    createdAt: new Date()
  },
  {
    cardNumber: "3530111333300000",
    cardName: "Rewards JCB Card",
    cardHolder: "JOHN SMITH",
    expiryDate: "01/28",
    cardType: "JCB",
    pin: "4321",
    creditLimit: 8000,
    color: "#DB2777", // Pink
    currentMonthSpending: 0,
    createdAt: new Date()
  }
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

// Transaction types with their probabilities
const transactionTypes = [
  { type: 'purchase', probability: 0.75 }, // 75% of transactions are purchases
  { type: 'payment', probability: 0.15 },  // 15% are payments
  { type: 'refund', probability: 0.05 },   // 5% are refunds
  { type: 'recurring', probability: 0.05 } // 5% are recurring payments
];

// Card type specific reward rates
const rewardRates = {
  "VISA": { // Travel Rewards Visa
    travel: 0.03,    // 3% on travel
    dining: 0.02,    // 2% on dining
    default: 0.01    // 1% on everything else
  },
  "MASTERCARD": { // Cash Rewards Mastercard
    dining: 0.03,    // 3% on dining
    groceries: 0.03, // 3% on groceries
    gas: 0.03,       // 3% on gas
    default: 0.01    // 1% on everything else
  },
  "AMEX": { // Premium Rewards Amex
    travel: 0.05,    // 5% on travel
    dining: 0.04,    // 4% on dining
    groceries: 0.04, // 4% on groceries
    default: 0.01    // 1% on everything else
  },
  "DISCOVER": { // Student Rewards Card
    entertainment: 0.05, // 5% on entertainment (rotating category)
    dining: 0.02,    // 2% on dining
    default: 0.01    // 1% on everything else
  },
  "DINERS": { // Business Diners Club
    travel: 0.03,    // 3% on travel
    dining: 0.03,    // 3% on dining
    utilities: 0.03, // 3% on utilities (for business)
    default: 0.01    // 1% on everything else
  },
  "JCB": { // Rewards JCB Card
    shopping: 0.03,  // 3% on shopping
    entertainment: 0.03, // 3% on entertainment
    default: 0.01    // 1% on everything else
  }
};

// Generate a random date within the last 90 days (3 months)
function getRandomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 90); // Random day within last 90 days
  const randomDate = new Date(now);
  randomDate.setDate(randomDate.getDate() - daysAgo);
  return randomDate;
}

// Generate a random amount based on transaction type
function getRandomAmount(type) {
  if (type === 'payment') {
    return parseFloat((Math.random() * 1000 + 100).toFixed(2)); // $100 to $1100 positive
  } else if (type === 'refund') {
    return parseFloat((Math.random() * 100 + 10).toFixed(2)); // $10 to $110 positive
  } else if (type === 'recurring') {
    return parseFloat((-1 * (Math.random() * 50 + 5)).toFixed(2)); // $5 to $55 negative
  } else {
    return parseFloat((-1 * (Math.random() * 200 + 10)).toFixed(2)); // $10 to $210 negative
  }
}

// Calculate rewards earned based on amount, category, and card type
function calculateRewards(amount, category, cardType) {
  // Only calculate rewards for purchases (negative amounts)
  if (amount >= 0) return 0;
  
  // Get the reward rate for this card type and category
  const cardRewards = rewardRates[cardType] || { default: 0.01 };
  const rewardRate = cardRewards[category] || cardRewards.default;
  
  // Calculate rewards (using absolute value of amount since it's negative)
  return parseFloat((Math.abs(amount) * rewardRate).toFixed(2));
}

// Get a random transaction type based on probabilities
function getRandomTransactionType() {
  const random = Math.random();
  let cumulativeProbability = 0;
  
  for (const type of transactionTypes) {
    cumulativeProbability += type.probability;
    if (random <= cumulativeProbability) {
      return type.type;
    }
  }
  
  return 'purchase'; // Default if something goes wrong
}

// Generate random transactions for a specific card
function generateTransactionsForCard(cardId, cardType, count) {
  const transactions = [];
  
  for (let i = 0; i < count; i++) {
    // Random selections
    const type = getRandomTransactionType();
    const category = categories[Math.floor(Math.random() * categories.length)];
    const merchantName = merchantsByCategory[category][
      Math.floor(Math.random() * merchantsByCategory[category].length)
    ];
    
    // Generate amount based on type
    const amount = getRandomAmount(type);
    
    // Generate rewards earned (only for purchases)
    const rewardsEarned = calculateRewards(amount, category, cardType);
    
    // Generate transaction date
    const date = getRandomDate();
    
    // Generate transaction
    const transaction = {
      cardId,
      type,
      amount,
      date,
      merchantName,
      category,
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} at ${merchantName}`,
      status: 'completed',
      rewardsEarned,
      createdAt: new Date()
    };
    
    transactions.push(transaction);
  }
  
  return transactions;
}

// Calculate current month spending for a card based on its transactions
function calculateCurrentMonthSpending(transactions) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Filter transactions for current month and sum up purchase amounts
  const currentMonthSpending = transactions
    .filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonth && 
             txDate.getFullYear() === currentYear &&
             tx.amount < 0; // Only count negative amounts (purchases)
    })
    .reduce((total, tx) => total + Math.abs(tx.amount), 0);
  
  return parseFloat(currentMonthSpending.toFixed(2));
}

// Main function to connect to MongoDB and insert cards and transactions
async function populateCardsAndTransactions() {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const cardsDb = db.collection(cardsCollection);
    const transactionsDb = db.collection(transactionsCollection);
    
    // Optional: Clear existing data
    // Uncomment these if you want to remove all existing cards and transactions
    await cardsDb.deleteMany({});
    await transactionsDb.deleteMany({});
    console.log('Cleared existing cards and transactions');
    
    // Insert cards and generate transactions for each
    const allTransactions = [];
    const updatedCards = [];
    
    for (const card of demoCards) {
      // Insert the card
      const result = await cardsDb.insertOne(card);
      const cardId = result.insertedId.toString();
      
      console.log(`Added card: ${card.cardName} with ID: ${cardId}`);
      
      // Generate between 20-40 transactions for each card
      const transactionCount = Math.floor(Math.random() * 21) + 20; // 20-40 transactions
      
      // Generate transactions for this card
      const cardTransactions = generateTransactionsForCard(
        cardId,
        card.cardType,
        transactionCount
      );
      
      // Calculate current month spending based on transactions
      const currentMonthSpending = calculateCurrentMonthSpending(cardTransactions);
      
      // Update the card with current month spending
      await cardsDb.updateOne(
        { _id: result.insertedId },
        { $set: { currentMonthSpending } }
      );
      
      // Add updated card to list for logging
      updatedCards.push({
        ...card,
        _id: cardId,
        currentMonthSpending
      });
      
      // Add transactions to the full list
      allTransactions.push(...cardTransactions);
      
      console.log(`Generated ${transactionCount} transactions for card ${card.cardName}`);
      console.log(`Updated current month spending to ${currentMonthSpending}`);
    }
    
    // Insert all transactions
    if (allTransactions.length > 0) {
      const transactionResult = await transactionsDb.insertMany(allTransactions);
      console.log(`Successfully inserted ${transactionResult.insertedCount} transactions`);
    }
    
    // Print summary
    console.log('\nSummary of created cards:');
    updatedCards.forEach(card => {
      console.log(`${card.cardName} (${card.cardType}): $${card.currentMonthSpending} spent this month`);
    });
    
  } catch (error) {
    console.error('Error populating data:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
populateCardsAndTransactions().catch(console.error);