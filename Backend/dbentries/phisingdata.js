const { MongoClient, ObjectId } = require("mongodb");

// MongoDB connection details
const uri = "mongodb+srv://manas1:hardpass@cluster0.hzb6xlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "creditCardsDB";

// Common phishing patterns for testing
const PHISHING_MERCHANTS = [
  { 
    name: 'amazon-secure-payment.net',
    description: 'Amazon Prime Renewal',
    amount: -299.99,
    category: 'subscription',
    location: { country: 'RU', city: 'Unknown' }
  },
  { 
    name: 'paypal-account-verify.com',
    description: 'Account Verification Fee',
    amount: -149.50,
    category: 'services',
    location: { country: 'NG', city: 'Lagos' }
  },
  { 
    name: 'verify-apple-account.org',
    description: 'Apple ID Verification',
    amount: -199.99,
    category: 'services',
    location: { country: 'CN', city: 'Unknown' }
  },
  { 
    name: 'lotto-prize-winner.com',
    description: 'Processing Fee',
    amount: -599.99,
    category: 'other',
    location: { country: 'US', city: 'Unknown' }
  },
  { 
    name: 'crypto-investment-guaranteed.net',
    description: 'Investment Deposit',
    amount: -1999.99,
    category: 'crypto',
    location: { country: 'UK', city: 'London' }
  },
  { 
    name: 'bank-secure-login.info',
    description: 'Account Protection Services',
    amount: -249.99,
    category: 'services',
    location: { country: 'IN', city: 'Unknown' }
  },
  { 
    name: 'netflix-billing-update.net',
    description: 'Netflix Annual Subscription',
    amount: -189.99,
    category: 'entertainment',
    location: { country: 'BR', city: 'Unknown' }
  },
  { 
    name: 'tax-refund-gov.net',
    description: 'Tax Processing Fee',
    amount: -399.99,
    category: 'services',
    location: { country: 'US', city: 'Unknown' }
  },
  { 
    name: 'account-verify-now.com',
    description: 'Account Verification',
    amount: -99.99,
    category: 'services',
    location: { country: 'ZA', city: 'Unknown' }
  },
  { 
    name: 'cashback-rewards-special.com',
    description: 'Rewards Membership',
    amount: -129.99,
    category: 'membership',
    location: { country: 'US', city: 'Unknown' }
  }
];

// Generate random phishing transactions
async function generatePhishingTransactions() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    const db = client.db(dbName);
    const cardsCollection = db.collection('cards');
    const transactionsCollection = db.collection('transactions');
    
    // Get all cards
    const cards = await cardsCollection.find({}).toArray();
    
    if (!cards || cards.length === 0) {
      console.error('No cards found in the database');
      return;
    }
    
    console.log(`Found ${cards.length} cards`);
    
    // Generate 5-10 random phishing transactions
    const numTransactions = Math.floor(Math.random() * 6) + 5; // 5-10 transactions
    const phishingTransactions = [];
    
    for (let i = 0; i < numTransactions; i++) {
      // Select a random card
      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      
      // Select a random phishing merchant
      const randomMerchant = PHISHING_MERCHANTS[Math.floor(Math.random() * PHISHING_MERCHANTS.length)];
      
      // Create a transaction with a random date in the last 7 days
      const randomDaysAgo = Math.floor(Math.random() * 7);
      const transactionDate = new Date();
      transactionDate.setDate(transactionDate.getDate() - randomDaysAgo);
      
      // Create the transaction
      const transaction = {
        cardId: randomCard._id.toString(),
        userId: randomCard.userId || 'default_user',
        merchantName: randomMerchant.name,
        description: randomMerchant.description,
        amount: randomMerchant.amount,
        date: transactionDate,
        category: randomMerchant.category,
        type: 'online',
        status: 'flagged',
        isSuspicious: true,
        flagReason: 'Potential phishing attempt',
        flaggedAt: new Date(),
        location: randomMerchant.location
      };
      
      phishingTransactions.push(transaction);
    }
    
    // Insert the transactions
    const result = await transactionsCollection.insertMany(phishingTransactions);
    
    console.log(`Successfully added ${result.insertedCount} phishing transactions`);
    console.log('Transaction details:');
    
    phishingTransactions.forEach((tx, index) => {
      console.log(`${index + 1}. ${tx.merchantName} - ${tx.amount} - ${tx.date.toISOString()}`);
    });
    
  } catch (error) {
    console.error('Error generating phishing transactions:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
generatePhishingTransactions().catch(console.error);

/*
To run this script:
1. Save this file as generatePhishingData.js
2. Make sure you have MongoDB Node.js driver installed: npm install mongodb
3. Run the script: node generatePhishingData.js

This will add 5-10 phishing transactions to your database using random cards from your collection.
*/