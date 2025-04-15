import api from './index';

// Get all transactions with optional filters
export const getTransactions = async (filters = {}) => {
  try {
    // Convert filters to query params
    const queryParams = new URLSearchParams();
    
    if (filters.cardId) queryParams.append('cardId', filters.cardId);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    // Make API call with query params
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/transactions?${queryString}` : '/transactions';
    
    const response = await api.get(endpoint);
    return response;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

// Get a single transaction by ID
export const getTransactionById = async (transactionId) => {
  try {
    const response = await api.get(`/transactions/${transactionId}`);
    return response;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw error;
  }
};

// Create a new transaction
export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post('/transactions', transactionData);
    return response;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

// Update an existing transaction
export const updateTransaction = async (transactionId, transactionData) => {
  try {
    const response = await api.put(`/transactions/${transactionId}`, transactionData);
    return response;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

// Delete a transaction
export const deleteTransaction = async (transactionId) => {
  try {
    const response = await api.delete(`/transactions/${transactionId}`);
    return response;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Create a batch of transactions (useful for testing or imports)
export const createBatchTransactions = async (transactions) => {
  try {
    const response = await api.post('/transactions/batch', { transactions });
    return response;
  } catch (error) {
    console.error('Error creating batch transactions:', error);
    throw error;
  }
};

// Get transaction statistics/summary
export const getTransactionStats = async (filters = {}) => {
  try {
    // Convert filters to query params
    const queryParams = new URLSearchParams();
    
    if (filters.cardId) queryParams.append('cardId', filters.cardId);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    
    // Make API call with query params
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/transactions/stats/summary?${queryString}` : '/transactions/stats/summary';
    
    const response = await api.get(endpoint);
    return response;
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    throw error;
  }
};

// For convenience, also export as a default object
const transactionsApi = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createBatchTransactions,
  getTransactionStats
};

export default transactionsApi;