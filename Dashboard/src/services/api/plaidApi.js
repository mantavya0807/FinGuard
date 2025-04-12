import api from './index';

// Create a link token for Plaid Link
export const createLinkToken = async (userId) => {
  try {
    const response = await api.post('/plaid/create-link-token', { userId });
    return response;
  } catch (error) {
    console.error('Error creating link token:', error);
    throw error;
  }
};

// Exchange a public token for an access token
export const exchangePublicToken = async (publicToken, userId, metadata = {}) => {
  try {
    const response = await api.post('/plaid/exchange-public-token', {
      publicToken,
      userId,
      metadata
    });
    return response;
  } catch (error) {
    console.error('Error exchanging public token:', error);
    throw error;
  }
};

// Get accounts from Plaid
export const getAccounts = async (userId) => {
  try {
    const response = await api.get(`/plaid/accounts/${userId}`);
    return response;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
};

// Get transactions from Plaid
export const getTransactions = async (userId, options = {}) => {
  try {
    const response = await api.get(`/plaid/transactions/${userId}`, { params: options });
    return response;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

// Get balances from Plaid
export const getBalances = async (userId) => {
  try {
    const response = await api.get(`/plaid/balances/${userId}`);
    return response;
  } catch (error) {
    console.error('Error fetching balances:', error);
    throw error;
  }
};

// Disconnect a Plaid item
export const disconnectItem = async (itemId, userId) => {
  try {
    const response = await api.post('/plaid/disconnect-item', { itemId, userId });
    return response;
  } catch (error) {
    console.error('Error disconnecting item:', error);
    throw error;
  }
};

// For backward compatibility, also provide a default export with all functions
const plaidApi = {
  createLinkToken,
  exchangePublicToken,
  getAccounts,
  getTransactions,
  getBalances,
  disconnectItem
};

export default plaidApi;