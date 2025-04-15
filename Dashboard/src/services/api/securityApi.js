import axios from 'axios';

// Base URL for the backend API
const BASE_URL = 'http://localhost:5000/api';

// Get all suspicious transactions
export const getSuspiciousTransactions = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/security/suspicious-transactions`);
    return response;
  } catch (error) {
    console.error('Error fetching suspicious transactions:', error);
    throw error;
  }
};

// Get security statistics
export const getSecurityStats = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/security/security-stats`);
    return response;
  } catch (error) {
    console.error('Error fetching security stats:', error);
    throw error;
  }
};

// Run fraud detection scan
export const runFraudScan = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/security/scan-for-fraud`);
    return response;
  } catch (error) {
    console.error('Error running fraud scan:', error);
    throw error;
  }
};

// Add test phishing transactions
export const addTestPhishingTransactions = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/security/add-test-phishing-transactions`);
    return response;
  } catch (error) {
    console.error('Error adding test phishing transactions:', error);
    throw error;
  }
};

// Approve a transaction (mark as legitimate)
export const approveTransaction = async (transactionId) => {
  try {
    const response = await axios.post(`${BASE_URL}/security/transactions/${transactionId}/approve`);
    return response;
  } catch (error) {
    console.error('Error approving transaction:', error);
    throw error;
  }
};

// Reject a transaction (mark as phishing and remove)
export const rejectTransaction = async (transactionId) => {
  try {
    const response = await axios.post(`${BASE_URL}/security/transactions/${transactionId}/reject`);
    return response;
  } catch (error) {
    console.error('Error rejecting transaction:', error);
    throw error;
  }
};

// Export all functions
export default {
  getSuspiciousTransactions,
  getSecurityStats,
  runFraudScan,
  addTestPhishingTransactions,
  approveTransaction,
  rejectTransaction
};