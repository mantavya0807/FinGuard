import api from './index';

const BASE_URL = 'http://localhost:5000/api/rewards';

// Get all offers
export const getOffers = async (filters = {}) => {
  try {
    const response = await api.get(`${BASE_URL}/offers`, { params: filters });
    return response;
  } catch (error) {
    console.error('Error fetching offers:', error);
    throw error;
  }
};

// Get offer by ID
export const getOfferById = async (offerId) => {
  try {
    const response = await api.get(`${BASE_URL}/offers/${offerId}`);
    return response;
  } catch (error) {
    console.error('Error fetching offer:', error);
    throw error;
  }
};

// Get all rewards
export const getRewards = async (filters = {}) => {
  try {
    const response = await api.get(`${BASE_URL}/rewards`, { params: filters });
    return response;
  } catch (error) {
    console.error('Error fetching rewards:', error);
    throw error;
  }
};

// Get reward by ID
export const getRewardById = async (rewardId) => {
  try {
    const response = await api.get(`${BASE_URL}/rewards/${rewardId}`);
    return response;
  } catch (error) {
    console.error('Error fetching reward:', error);
    throw error;
  }
};

// Get cards with rewards
export const getCardsWithRewards = async () => {
  try {
    const response = await api.get(`${BASE_URL}/cards`);
    return response;
  } catch (error) {
    console.error('Error fetching cards with rewards:', error);
    throw error;
  }
};

// Get best rewards by category
export const getBestRewardsByCategory = async (category) => {
  try {
    const response = await api.get(`${BASE_URL}/best-rewards/${category}`);
    return response;
  } catch (error) {
    console.error('Error fetching best rewards:', error);
    throw error;
  }
};

// Create a new offer
export const createOffer = async (offerData) => {
  try {
    const response = await api.post(`${BASE_URL}/offers`, offerData);
    return response;
  } catch (error) {
    console.error('Error creating offer:', error);
    throw error;
  }
};

// Update an offer
export const updateOffer = async (offerId, offerData) => {
  try {
    const response = await api.put(`${BASE_URL}/offers/${offerId}`, offerData);
    return response;
  } catch (error) {
    console.error('Error updating offer:', error);
    throw error;
  }
};

// Delete an offer
export const deleteOffer = async (offerId) => {
  try {
    const response = await api.delete(`${BASE_URL}/offers/${offerId}`);
    return response;
  } catch (error) {
    console.error('Error deleting offer:', error);
    throw error;
  }
};

// Create a new reward
export const createReward = async (rewardData) => {
  try {
    const response = await api.post(`${BASE_URL}/rewards`, rewardData);
    return response;
  } catch (error) {
    console.error('Error creating reward:', error);
    throw error;
  }
};

// Update a reward
export const updateReward = async (rewardId, rewardData) => {
  try {
    const response = await api.put(`${BASE_URL}/rewards/${rewardId}`, rewardData);
    return response;
  } catch (error) {
    console.error('Error updating reward:', error);
    throw error;
  }
};

// Delete a reward
export const deleteReward = async (rewardId) => {
  try {
    const response = await api.delete(`${BASE_URL}/rewards/${rewardId}`);
    return response;
  } catch (error) {
    console.error('Error deleting reward:', error);
    throw error;
  }
};