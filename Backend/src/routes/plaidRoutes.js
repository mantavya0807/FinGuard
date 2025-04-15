const express = require('express');
const router = express.Router();
// Import both the client instance AND your helper function
const { plaidClient, createLinkToken } = require('../config/plaidClient.js');

// Create a link token for initializing Plaid Link
router.post('/create-link-token', async (req, res) => {
  try {
    // Get userId from request body (ensure your frontend sends it)
    // Provide a default only for testing if necessary
    const userId = req.body.userId || 'test-user-' + Date.now();

    // Call your helper function directly, passing the userId
    const linkTokenData = await createLinkToken(userId);

    // Send the response data back (linkTokenData already contains .data from the helper)
    res.json(linkTokenData);
  } catch (error) {
    console.error('Error creating link token:', error);
    // Check if it's a Plaid API error with a specific code
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({
      error: error.message || 'Failed to create link token',
      details: error.response?.data // Include Plaid error details if available
    });
  }
});

// Exchange a public token for an access token
router.post('/exchange-public-token', async (req, res) => { // Renamed route for clarity
  try {
    const { publicToken, userId, metadata } = req.body; // Expect userId from frontend

    if (!publicToken || !userId) {
      return res.status(400).json({ error: 'Missing publicToken or userId' });
    }

    // Use the actual Plaid SDK method here
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // TODO: Securely store the accessToken and itemId associated with the userId
    // For example, save to your Supabase database here

    console.log(`Exchanged token for user ${userId}, item ${itemId}`);

    // Respond to the client (don't send the access token back unless necessary)
    res.json({
      item_id: itemId,
      message: 'Account linked successfully'
    });
  } catch (error) {
    console.error('Error exchanging token:', error);
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({
      error: error.message || 'Failed to exchange token',
      details: error.response?.data
    });
  }
});

// Get accounts
router.get('/accounts', async (req, res) => {
  try {
    const accounts = await plaidApi.getAccounts();
    res.json(accounts);
  } catch (error) {
    console.error('Error getting accounts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get transactions
router.get('/transactions', async (req, res) => {
  try {
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      accountIds: req.query.accountIds ? req.query.accountIds.split(',') : undefined
    };
    const transactions = await plaidApi.getTransactions(options);
    res.json(transactions);
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync transactions
router.post('/sync-transactions/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const result = await plaidApi.syncTransactions(itemId);
    res.json(result);
  } catch (error) {
    console.error('Error syncing transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get balances
router.get('/balances', async (req, res) => {
  try {
    const balances = await plaidApi.getBalances();
    res.json(balances);
  } catch (error) {
    console.error('Error getting balances:', error);
    res.status(500).json({ error: error.message });
  }
});

// Disconnect item
router.delete('/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const result = await plaidApi.disconnectItem(itemId);
    res.json(result);
  } catch (error) {
    console.error('Error disconnecting item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Plaid webhook handler
router.post('/webhook', async (req, res) => {
  try {
    console.log('Received webhook:', req.body);
    // Here you would handle different webhook types
    // For example, updating transactions when new ones are available
    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;