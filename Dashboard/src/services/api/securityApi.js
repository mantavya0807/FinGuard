import axios from 'axios';

// Base API URL
const API_URL = '/api/security';

/**
 * Get all suspicious transactions
 * @returns {Promise} Promise with suspicious transactions data
 */
const getSuspiciousTransactions = async () => {
  try {
    const response = await axios.get(`${API_URL}/suspicious-transactions`);
    return {
      data: normalizeTransactionIds(response.data)
    };
  } catch (error) {
    console.error('Error fetching suspicious transactions:', error);
    // Fallback to mock data for development
    return {
      data: mockPhishingTransactions
    };
  }
};

/**
 * Get security stats
 * @returns {Promise} Promise with security statistics
 */
const getSecurityStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/security-stats`);
    return response;
  } catch (error) {
    console.error('Error fetching security stats:', error);
    // Return mock stats as fallback
    return {
      data: {
        totalTransactions: 245,
        flaggedTransactions: 8,
        flaggedPercentage: 3.27,
        foreignTransactions: 4,
        highValueTransactions: 6
      }
    };
  }
};

/**
 * Approve a transaction (mark as not suspicious)
 * @param {string} transactionId - ID of the transaction to approve
 * @returns {Promise} Promise with response data
 */
const approveTransaction = async (transactionId) => {
  try {
    const response = await axios.post(`${API_URL}/transactions/${transactionId}/approve`);
    return response;
  } catch (error) {
    console.error(`Error approving transaction ${transactionId}:`, error);
    throw error;
  }
};

/**
 * Reject a transaction (mark as fraudulent and remove)
 * @param {string} transactionId - ID of the transaction to reject
 * @returns {Promise} Promise with response data
 */
const rejectTransaction = async (transactionId) => {
  try {
    const response = await axios.post(`${API_URL}/transactions/${transactionId}/reject`);
    return response;
  } catch (error) {
    console.error(`Error rejecting transaction ${transactionId}:`, error);
    throw error;
  }
};

/**
 * Run a fraud detection scan
 * @returns {Promise} Promise with scan results
 */
const runFraudScan = async () => {
  try {
    const response = await axios.post(`${API_URL}/scan-for-fraud`);
    return response;
  } catch (error) {
    console.error('Error running fraud scan:', error);
    throw error;
  }
};

/**
 * Add test phishing transactions for testing
 * @returns {Promise} Promise with added transactions
 */
const addTestPhishingTransactions = async () => {
  try {
    const response = await axios.post(`${API_URL}/add-test-phishing-transactions`);
    return response;
  } catch (error) {
    console.error('Error adding test phishing transactions:', error);
    throw error;
  }
};

/**
 * Helper function to ensure all transactions have an id property
 * Some might use _id (MongoDB) while others use id
 */
const normalizeTransactionIds = (transactions) => {
  if (!Array.isArray(transactions)) return [];
  
  return transactions.map(transaction => {
    // If transaction already has an id, return it as is
    if (transaction.id) return transaction;
    
    // If transaction has _id but no id, add id property based on _id
    if (transaction._id) {
      return {
        ...transaction,
        id: transaction._id.toString() // Convert ObjectId to string if needed
      };
    }
    
    // If transaction has neither id nor _id, generate a random id
    return {
      ...transaction,
      id: 'tx_' + Math.random().toString(36).substring(2, 10)
    };
  });
};

// Mock phishing transactions for development and testing
const mockPhishingTransactions = [
  {
    id: 'tx_001',
    merchantName: 'amazon-secure-payment.net',
    amount: -299.99,
    date: new Date(),
    description: 'Amazon Prime Renewal',
    category: 'subscription',
    type: 'online',
    status: 'flagged',
    flagReason: 'Suspicious merchant domain',
    location: {
      country: 'RU',
      city: 'Unknown'
    }
  },
  {
    id: 'tx_002',
    merchantName: 'paypal-account-verify.com',
    amount: -149.50,
    date: new Date(Date.now() - 86400000), // Yesterday
    description: 'Account Verification Fee',
    category: 'services',
    type: 'online',
    status: 'flagged',
    flagReason: 'Known phishing pattern',
    location: {
      country: 'NG',
      city: 'Lagos'
    }
  },
  {
    id: 'tx_003',
    merchantName: 'crypto-investment-guaranteed.net',
    amount: -1999.99,
    date: new Date(Date.now() - 345600000), // 4 days ago
    description: 'Investment Deposit',
    category: 'crypto',
    type: 'online',
    status: 'flagged',
    flagReason: 'High-risk amount and category',
    location: {
      country: 'UK',
      city: 'London'
    }
  }
];

export default {
  getSuspiciousTransactions,
  getSecurityStats,
  approveTransaction,
  rejectTransaction,
  runFraudScan,
  addTestPhishingTransactions,
  mockPhishingTransactions
};