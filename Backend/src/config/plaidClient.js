const axios = require('axios');
const supabase = require('../supabaseClient');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET || !process.env.PLAID_ENV) {
  console.error('Missing required Plaid environment variables');
}

// Configure the Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Create a Plaid link token
const createLinkToken = async (userId) => {
  try {
    // Create link token request to Plaid
    const configs = {
      user: {
        client_user_id: userId || 'user-id'
      },
      client_name: 'FinGuard App',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en'
    };
    
    const linkTokenResponse = await plaidClient.linkTokenCreate(configs);
    return linkTokenResponse.data;
  } catch (error) {
    console.error('Error creating link token:', error);
    throw error;
  }
};

// Only export what's needed for backend operation
module.exports = { 
  plaidClient,
  createLinkToken
};