import api from './index';

// Base URL and API key
const NESSIE_BASE_URL = 'http://localhost:5000/api/nessie';

/**
 * Get all accounts for a customer
 * @param {string} customerId - The customer ID (use 'current' for authenticated user)
 * @returns {Promise<Array>} The accounts
 */
export const getAccounts = async (customerId = 'current') => {
  try {
    const response = await api.get(`${NESSIE_BASE_URL}/customers/${customerId}/accounts`);
    return response;
  } catch (error) {
    console.error('Error fetching Nessie accounts:', error);
    throw error;
  }
};

/**
 * Get account details
 * @param {string} accountId - The account ID
 * @returns {Promise<Object>} The account details
 */
export const getAccountById = async (accountId) => {
  try {
    const response = await api.get(`${NESSIE_BASE_URL}/accounts/${accountId}`);
    return response;
  } catch (error) {
    console.error('Error fetching Nessie account details:', error);
    throw error;
  }
};

/**
 * Get all transactions (purchases, deposits, withdrawals) for an account
 * @param {string} accountId - The account ID
 * @returns {Promise<Array>} The combined transactions
 */
export const getAccountTransactions = async (accountId) => {
  try {
    // Make parallel requests for purchases, deposits, and withdrawals
    const [purchasesRes, depositsRes, withdrawalsRes, transfersRes] = await Promise.all([
      api.get(`${NESSIE_BASE_URL}/accounts/${accountId}/purchases`),
      api.get(`${NESSIE_BASE_URL}/accounts/${accountId}/deposits`),
      api.get(`${NESSIE_BASE_URL}/accounts/${accountId}/withdrawals`),
      api.get(`${NESSIE_BASE_URL}/accounts/${accountId}/transfers`)
    ]);

    // Format each type of transaction
    const purchases = (purchasesRes || []).map(p => ({
      ...p,
      type: 'purchase',
      amount: -Math.abs(p.amount), // Negative amount for purchases
      date: new Date(p.purchase_date || p.timestamp || Date.now())
    }));

    const deposits = (depositsRes || []).map(d => ({
      ...d,
      type: 'deposit',
      amount: Math.abs(d.amount), // Positive amount for deposits
      date: new Date(d.transaction_date || d.timestamp || Date.now())
    }));

    const withdrawals = (withdrawalsRes || []).map(w => ({
      ...w,
      type: 'withdrawal',
      amount: -Math.abs(w.amount), // Negative amount for withdrawals
      date: new Date(w.transaction_date || w.timestamp || Date.now())
    }));

    const transfers = (transfersRes || []).map(t => ({
      ...t,
      type: 'transfer',
      // If this account is the payer, amount is negative, otherwise positive
      amount: t.payer_id === accountId ? -Math.abs(t.amount) : Math.abs(t.amount),
      date: new Date(t.transaction_date || t.timestamp || Date.now())
    }));

    // Combine all transactions
    const allTransactions = [...purchases, ...deposits, ...withdrawals, ...transfers];

    // Sort by date (newest first)
    allTransactions.sort((a, b) => b.date - a.date);

    return allTransactions;
  } catch (error) {
    console.error('Error fetching Nessie transactions:', error);
    throw error;
  }
};

/**
 * Get merchant details
 * @param {string} merchantId - The merchant ID
 * @returns {Promise<Object>} The merchant details
 */
export const getMerchantById = async (merchantId) => {
  try {
    const response = await api.get(`${NESSIE_BASE_URL}/merchants/${merchantId}`);
    return response;
  } catch (error) {
    console.error('Error fetching Nessie merchant details:', error);
    throw error;
  }
};

/**
 * Create a purchase (simulating a transaction)
 * @param {string} accountId - The account ID
 * @param {Object} purchaseData - The purchase data
 * @returns {Promise<Object>} The created purchase
 */
export const createPurchase = async (accountId, purchaseData) => {
  try {
    const response = await api.post(`${NESSIE_BASE_URL}/accounts/${accountId}/purchases`, purchaseData);
    return response;
  } catch (error) {
    console.error('Error creating Nessie purchase:', error);
    throw error;
  }
};

/**
 * Create a transfer between accounts
 * @param {string} fromAccountId - The source account ID
 * @param {string} toAccountId - The destination account ID
 * @param {number} amount - The amount to transfer
 * @param {string} description - The transfer description
 * @returns {Promise<Object>} The created transfer
 */
export const createTransfer = async (fromAccountId, toAccountId, amount, description = 'Transfer') => {
  try {
    const transferData = {
      medium: 'balance',
      payee_id: toAccountId,
      amount: amount,
      description: description
    };
    
    const response = await api.post(`${NESSIE_BASE_URL}/accounts/${fromAccountId}/transfers`, transferData);
    return response;
  } catch (error) {
    console.error('Error creating Nessie transfer:', error);
    throw error;
  }
};

// Default export for convenience
export default {
  getAccounts,
  getAccountById,
  getAccountTransactions,
  getMerchantById,
  createPurchase,
  createTransfer
};