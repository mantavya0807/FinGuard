// Updated cardsApi.js with correct backend URL

import axios from 'axios';

// Base API URL - Fix to use backend port 5000 instead of 3000
const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/cards`;

/**
 * Get all cards
 * @returns {Promise<Array>} Array of card objects
 */
export const getCards = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching cards:', error);
    throw error;
  }
};

/**
 * Get a card by ID
 * @param {string} cardId - The card ID
 * @returns {Promise<Object>} Card object
 */
export const getCardById = async (cardId) => {
  try {
    const response = await axios.get(`${API_URL}/${cardId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching card ${cardId}:`, error);
    throw error;
  }
};

/**
 * Add a new card
 * @param {Object} cardData - Card data to add
 * @returns {Promise<Object>} Added card
 */
export const addCard = async (cardData) => {
  try {
    const response = await axios.post(API_URL, cardData);
    return response.data;
  } catch (error) {
    console.error('Error adding card:', error);
    throw error;
  }
};

/**
 * Update an existing card
 * @param {string} cardId - Card ID to update
 * @param {Object} cardData - Updated card data
 * @returns {Promise<Object>} Updated card
 */
export const updateCard = async (cardId, cardData) => {
  try {
    const response = await axios.put(`${API_URL}/${cardId}`, cardData);
    return response.data;
  } catch (error) {
    console.error(`Error updating card ${cardId}:`, error);
    throw error;
  }
};

/**
 * Delete a card
 * @param {string} cardId - Card ID to delete
 * @returns {Promise<Object>} Response
 */
export const deleteCard = async (cardId) => {
  try {
    const response = await axios.delete(`${API_URL}/${cardId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting card ${cardId}:`, error);
    throw error;
  }
};

/**
 * Get security alerts for all cards
 * @returns {Promise<Array>} Array of security alerts
 */
export const getCardSecurityAlerts = async () => {
  try {
    const response = await axios.get(`${API_URL}/security-alerts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching card security alerts:', error);
    throw error;
  }
};

/**
 * Get security alerts for a specific card
 * @param {string} cardId - Card ID
 * @returns {Promise<Array>} Array of security alerts for the card
 */
export const getCardSecurityAlertsById = async (cardId) => {
  try {
    const response = await axios.get(`${API_URL}/${cardId}/security-alerts`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching security alerts for card ${cardId}:`, error);
    throw error;
  }
};

// Mock data for development/testing
export const MOCK_CARDS = [
  {
    id: 'card_123456',
    cardName: 'Chase Sapphire Reserve',
    cardType: 'VISA',
    cardNumber: '•••• •••• •••• 4567',
    cardHolder: 'Alex Morgan',
    expiryDate: '05/26',
    cvv: '***',
    color: '#1E3A8A',
    rewards: {
      travelPoints: 3,
      diningPoints: 3,
      groceryPoints: 1,
      gasCashback: 1,
      generalCashback: 1,
    },
    monthlySpendingLimit: 5000,
    currentMonthSpending: 2340,
    cardAddedDate: '2023-04-12'
  },
  {
    id: 'card_234567',
    cardName: 'Capital One Savor',
    cardType: 'MASTERCARD',
    cardNumber: '•••• •••• •••• 8901',
    cardHolder: 'Alex Morgan',
    expiryDate: '11/25',
    cvv: '***',
    color: '#DC2626',
    rewards: {
      travelPoints: 1,
      diningPoints: 4,
      groceryPoints: 3,
      gasCashback: 2,
      generalCashback: 1,
    },
    monthlySpendingLimit: 3000,
    currentMonthSpending: 1250,
    cardAddedDate: '2022-11-08'
  },
  {
    id: 'card_345678',
    cardName: 'American Express Blue Cash',
    cardType: 'AMEX',
    cardNumber: '•••• •••• •••• 3456',
    cardHolder: 'Alex Morgan',
    expiryDate: '08/27',
    cvv: '****',
    color: '#065F46',
    rewards: {
      travelPoints: 2,
      diningPoints: 1,
      groceryPoints: 6,
      gasCashback: 3,
      generalCashback: 1,
    },
    monthlySpendingLimit: 4000,
    currentMonthSpending: 1890,
    cardAddedDate: '2023-09-15'
  }
];

// Default export with all functions
const cardsApi = {
  getCards,
  getCardById,
  addCard,
  updateCard,
  deleteCard,
  getCardSecurityAlerts,
  getCardSecurityAlertsById,
  MOCK_CARDS
};

export default cardsApi;