"use strict";

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Capital One Nessie API configuration
const NESSIE_API_URL = 'http://api.nessieisreal.com';
const NESSIE_API_KEY = process.env.NESSIE_API_KEY || '474f6c35c67f9f2713e7fb3c200ad965';

// Use let instead of const for customer ID (so it can be changed)
let DEFAULT_CUSTOMER_ID = null; // Will be set dynamically
let DEFAULT_ACCOUNT_ID = null;

// Track API failures
let apiFailureCount = 0;
const MAX_FAILURES = 3;
let apiDisabled = false;

// Create Axios instance with timeout to prevent hanging requests
const nessieClient = axios.create({
  baseURL: NESSIE_API_URL,
  params: {
    key: NESSIE_API_KEY
  },
  timeout: 10000 // 10 second timeout
});

// Error handling middleware with better logging
const handleNessieError = (error, res) => {
  console.error('Nessie API error:', error.response?.data || error.message);
  
  // Track consecutive failures
  apiFailureCount++;
  if (apiFailureCount >= MAX_FAILURES && (error.response?.status === 401 || error.response?.status === 404)) {
    apiDisabled = true;
    console.error('Too many API failures. Disabling Nessie API calls.');
  }
  
  // Format the error response
  const statusCode = error.response?.status || 500;
  const errorMessage = error.response?.data?.message || 'Failed to fetch data from Nessie API';
  
  res.status(statusCode).json({
    error: errorMessage,
    details: error.response?.data || error.message,
    apiDisabled
  });
};

// Add this function to handle "current" account ID
const getCurrentAccountId = async (req) => {
  const requestedId = req.params.id;
  
  if (requestedId === 'current') {
    // If the ID is "current", return the default account ID
    if (!DEFAULT_ACCOUNT_ID) {
      try {
        // Try to initialize if we don't have a default account yet
        return await initializeNessieAccount();
      } catch (error) {
        console.error('Error creating default account:', error);
        return null;
      }
    }
    return DEFAULT_ACCOUNT_ID;
  }
  
  // Otherwise return the requested ID
  return requestedId;
};

// Update the initializeNessieAccount function:

const initializeNessieAccount = async () => {
  if (apiDisabled) {
    console.log('Nessie API disabled due to repeated failures');
    return null;
  }
  
  try {
    console.log("Creating Nessie account...");
    
    // 1. Create a new customer first
    const newCustomerData = {
      first_name: "FinGuard",
      last_name: "User",
      address: {
        street_number: "123",
        street_name: "Main St",
        city: "Boston",
        state: "MA",
        zip: "02110"
      }
    };
    
    // Create customer first with better error handling
    console.log("Creating customer...");
    const customerResponse = await nessieClient.post('/customers', newCustomerData);
    
    console.log("Customer creation response:", JSON.stringify(customerResponse.data));
    
    if (!customerResponse.data || !customerResponse.data.objectCreated || !customerResponse.data.objectCreated._id) {
      throw new Error("Invalid customer creation response format");
    }
    
    // Store the new customer ID
    DEFAULT_CUSTOMER_ID = customerResponse.data.objectCreated._id;
    console.log(`Created new customer with ID: ${DEFAULT_CUSTOMER_ID}`);
    
    // Add a small delay to ensure customer is registered in Nessie's system
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify customer was created before creating account
    try {
      console.log(`Verifying customer ${DEFAULT_CUSTOMER_ID} exists...`);
      await nessieClient.get(`/customers/${DEFAULT_CUSTOMER_ID}`);
      console.log("Customer verification successful");
    } catch (verifyError) {
      console.error("Customer verification failed:", verifyError.response?.data || verifyError.message);
      throw new Error("Customer was not properly created in Nessie API");
    }
    
    // 2. Create account for this new customer (NOT the "current" customer)
    console.log(`Creating account for customer ${DEFAULT_CUSTOMER_ID}...`);
    const newAccountData = {
      type: "Credit Card",
      nickname: "FinGuard Demo Card",
      rewards: 100,
      balance: 5000
    };
    
    const accountResponse = await nessieClient.post(`/customers/${DEFAULT_CUSTOMER_ID}/accounts`, newAccountData);
    console.log("Account creation response:", JSON.stringify(accountResponse.data));
    
    if (!accountResponse.data || !accountResponse.data.objectCreated || !accountResponse.data.objectCreated._id) {
      throw new Error("Failed to create account");
    }
    
    DEFAULT_ACCOUNT_ID = accountResponse.data.objectCreated._id;
    console.log(`Created new account with ID: ${DEFAULT_ACCOUNT_ID}`);
    
    // Reset API failure count on success
    apiFailureCount = 0;
    
    return DEFAULT_ACCOUNT_ID;
  } catch (error) {
    console.error("Error creating Nessie account:", error.response?.data || error.message);
    
    // If we've already incremented API failures above threshold, disable API
    if (apiFailureCount >= MAX_FAILURES) {
      apiDisabled = true;
      console.log("API disabled due to repeated failures");
    }
    
    return null;
  }
};

// Create sample transactions for a new account
const createSampleTransactions = async (accountId) => {
  try {
    // Sample merchant IDs (these are standard test merchant IDs)
    const merchants = [
      { id: '57cf75cea73e494d8675ec49', name: 'Apple Store' },
      { id: '57cf75cea73e494d8675ec4a', name: 'Target' },
      { id: '57cf75cea73e494d8675ec4b', name: 'Whole Foods' },
      { id: '57cf75cea73e494d8675ec4c', name: 'Starbucks' }
    ];
    
    // Create 5 purchases
    for (let i = 0; i < 5; i++) {
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const amount = Math.floor(Math.random() * 10000) / 100; // Random amount between $0-$100
      
      const purchaseData = {
        merchant_id: merchant.id,
        medium: "balance",
        purchase_date: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(), // Random date in last 30 days
        amount: amount,
        description: `Purchase at ${merchant.name}`,
        status: "completed"
      };
      
      await nessieClient.post(`/accounts/${accountId}/purchases`, purchaseData);
      console.log(`Created purchase: $${amount} at ${merchant.name}`);
    }
    
    // Create 2 deposits
    for (let i = 0; i < 2; i++) {
      const amount = Math.floor(Math.random() * 100000) / 100; // Random amount between $0-$1000
      
      const depositData = {
        medium: "balance",
        transaction_date: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
        amount: amount,
        description: "Deposit",
        status: "completed"
      };
      
      await nessieClient.post(`/accounts/${accountId}/deposits`, depositData);
      console.log(`Created deposit: $${amount}`);
    }
    
    // Create 1 withdrawal
    const withdrawalAmount = Math.floor(Math.random() * 20000) / 100; // Random amount between $0-$200
    
    const withdrawalData = {
      medium: "balance",
      transaction_date: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
      amount: withdrawalAmount,
      description: "ATM Withdrawal",
      status: "completed"
    };
    
    await nessieClient.post(`/accounts/${accountId}/withdrawals`, withdrawalData);
    console.log(`Created withdrawal: $${withdrawalAmount}`);
    
  } catch (error) {
    console.error('Error creating sample transactions:', error.response?.data || error.message);
  }
};

// Add a "mock data" route as fallback when API is disabled
router.get('/mock/transactions', (req, res) => {
  // Return consistent mock data when the API is disabled
  res.json([
    {
      _id: 'mock-tx-1',
      type: 'purchase',
      amount: -55.99,
      description: 'Amazon.com',
      date: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed'
    },
    {
      _id: 'mock-tx-2',
      type: 'purchase',
      amount: -23.50,
      description: 'Starbucks',
      date: new Date(Date.now() - 172800000).toISOString(),
      status: 'completed'
    },
    {
      _id: 'mock-tx-3', 
      type: 'deposit',
      amount: 2500.00,
      description: 'Direct Deposit - Payroll',
      date: new Date(Date.now() - 518400000).toISOString(),
      status: 'completed'
    }
  ]);
});

// Modify the GET transactions route to use mock data if API is disabled
router.get('/accounts/:id/transactions', async (req, res) => {
  // If API is disabled, return mock data
  if (apiDisabled) {
    return res.json([
      {
        _id: 'mock-tx-1',
        type: 'purchase',
        amount: -55.99,
        description: 'Amazon.com',
        date: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed'
      },
      {
        _id: 'mock-tx-2',
        type: 'purchase',
        amount: -23.50,
        description: 'Starbucks',
        date: new Date(Date.now() - 172800000).toISOString(),
        status: 'completed'
      },
      {
        _id: 'mock-tx-3', 
        type: 'deposit',
        amount: 2500.00,
        description: 'Direct Deposit - Payroll',
        date: new Date(Date.now() - 518400000).toISOString(),
        status: 'completed'
      }
    ]);
  }
  
  // Original code continues...
  try {
    const accountId = await getCurrentAccountId(req);
    
    if (!accountId) {
      return res.status(404).json({ error: 'No valid account found' });
    }
    
    // Get purchases, deposits, and withdrawals in parallel
    const [purchases, deposits, withdrawals, transfers] = await Promise.all([
      nessieClient.get(`/accounts/${accountId}/purchases`).catch(err => ({ data: [] })),
      nessieClient.get(`/accounts/${accountId}/deposits`).catch(err => ({ data: [] })),
      nessieClient.get(`/accounts/${accountId}/withdrawals`).catch(err => ({ data: [] })),
      nessieClient.get(`/accounts/${accountId}/transfers`).catch(err => ({ data: [] }))
    ]);
    
    // Format the transactions
    const allTransactions = [
      ...(purchases.data || []).map(p => ({
        ...p,
        type: 'purchase',
        amount: -Math.abs(p.amount), // Negative for purchases
        date: new Date(p.purchase_date || p.timestamp || Date.now())
      })),
      ...(deposits.data || []).map(d => ({
        ...d,
        type: 'deposit',
        amount: Math.abs(d.amount), // Positive for deposits
        date: new Date(d.transaction_date || d.timestamp || Date.now())
      })),
      ...(withdrawals.data || []).map(w => ({
        ...w,
        type: 'withdrawal',
        amount: -Math.abs(w.amount), // Negative for withdrawals
        date: new Date(w.transaction_date || w.timestamp || Date.now())
      })),
      ...(transfers.data || []).map(t => ({
        ...t,
        type: 'transfer',
        // If this account is the payer, amount is negative, otherwise positive
        amount: t.payer_id === accountId ? -Math.abs(t.amount) : Math.abs(t.amount),
        date: new Date(t.transaction_date || t.timestamp || Date.now())
      }))
    ];
    
    // Sort by date (newest first)
    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(allTransactions);
  } catch (error) {
    handleNessieError(error, res);
  }
});

// Add these individual transaction type routes
router.get('/accounts/:id/purchases', async (req, res) => {
  if (apiDisabled) {
    return res.json([
      {
        _id: 'mock-purchase-1',
        type: 'purchase',
        amount: -55.99,
        description: 'Amazon.com',
        purchase_date: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed'
      },
      {
        _id: 'mock-purchase-2',
        type: 'purchase',
        amount: -23.50,
        description: 'Starbucks',
        purchase_date: new Date(Date.now() - 172800000).toISOString(),
        status: 'completed'
      }
    ]);
  }
  
  try {
    const accountId = await getCurrentAccountId(req);
    
    if (!accountId) {
      return res.status(404).json({ error: 'No valid account found' });
    }
    
    const response = await nessieClient.get(`/accounts/${accountId}/purchases`);
    
    // Format purchases data to be consistent
    const purchases = response.data.map(p => ({
      ...p,
      type: 'purchase',
      amount: -Math.abs(p.amount), // Negative for purchases
      date: new Date(p.purchase_date || p.timestamp || Date.now())
    }));
    
    res.json(purchases);
  } catch (error) {
    handleNessieError(error, res);
  }
});

// Add routes for deposits
router.get('/accounts/:id/deposits', async (req, res) => {
  if (apiDisabled) {
    return res.json([
      {
        _id: 'mock-deposit-1',
        type: 'deposit',
        amount: 2500.00,
        description: 'Direct Deposit - Payroll',
        transaction_date: new Date(Date.now() - 518400000).toISOString(),
        status: 'completed'
      }
    ]);
  }
  
  try {
    const accountId = await getCurrentAccountId(req);
    
    if (!accountId) {
      return res.status(404).json({ error: 'No valid account found' });
    }
    
    const response = await nessieClient.get(`/accounts/${accountId}/deposits`);
    
    // Format deposits data to be consistent
    const deposits = response.data.map(d => ({
      ...d,
      type: 'deposit',
      amount: Math.abs(d.amount), // Positive for deposits
      date: new Date(d.transaction_date || d.timestamp || Date.now())
    }));
    
    res.json(deposits);
  } catch (error) {
    handleNessieError(error, res);
  }
});

// Add routes for withdrawals
router.get('/accounts/:id/withdrawals', async (req, res) => {
  if (apiDisabled) {
    return res.json([
      {
        _id: 'mock-withdrawal-1',
        type: 'withdrawal',
        amount: -80.00,
        description: 'ATM Withdrawal',
        transaction_date: new Date(Date.now() - 259200000).toISOString(),
        status: 'completed'
      }
    ]);
  }
  
  try {
    const accountId = await getCurrentAccountId(req);
    
    if (!accountId) {
      return res.status(404).json({ error: 'No valid account found' });
    }
    
    const response = await nessieClient.get(`/accounts/${accountId}/withdrawals`);
    
    // Format withdrawals data to be consistent
    const withdrawals = response.data.map(w => ({
      ...w,
      type: 'withdrawal',
      amount: -Math.abs(w.amount), // Negative for withdrawals
      date: new Date(w.transaction_date || w.timestamp || Date.now())
    }));
    
    res.json(withdrawals);
  } catch (error) {
    handleNessieError(error, res);
  }
});

// Add routes for transfers
router.get('/accounts/:id/transfers', async (req, res) => {
  if (apiDisabled) {
    return res.json([
      {
        _id: 'mock-transfer-1',
        type: 'transfer',
        amount: -150.00,
        description: 'Transfer to savings',
        transaction_date: new Date(Date.now() - 432000000).toISOString(),
        status: 'completed'
      }
    ]);
  }
  
  try {
    const accountId = await getCurrentAccountId(req);
    
    if (!accountId) {
      return res.status(404).json({ error: 'No valid account found' });
    }
    
    const response = await nessieClient.get(`/accounts/${accountId}/transfers`);
    
    // Format transfers data to be consistent
    const transfers = response.data.map(t => ({
      ...t,
      type: 'transfer',
      // If this account is the payer, amount is negative, otherwise positive
      amount: t.payer_id === accountId ? -Math.abs(t.amount) : Math.abs(t.amount),
      date: new Date(t.transaction_date || t.timestamp || Date.now())
    }));
    
    res.json(transfers);
  } catch (error) {
    handleNessieError(error, res);
  }
});

// Initialize when the server starts
initializeNessieAccount()
  .then(accountId => {
    if (accountId) {
      console.log(`Nessie API initialized with account: ${accountId}`);
    } else {
      console.error('Failed to initialize Nessie API account');
    }
  });

module.exports = router;