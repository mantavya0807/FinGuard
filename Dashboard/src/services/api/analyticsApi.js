import api from './index';

// Get spending breakdown by categories
export const getSpendingByCategories = async (params = {}) => {
  try {
    const response = await api.get('http://localhost:5000/api/analytics/spending/categories', { 
      params 
    });
    return response;
  } catch (error) {
    console.error('Error fetching spending categories:', error);
    throw error;
  }
};

// Get spending trends over time
export const getSpendingTrends = async (params = {}) => {
  try {
    const response = await api.get('http://localhost:5000/api/analytics/spending/trends', { 
      params 
    });
    return response;
  } catch (error) {
    console.error('Error fetching spending trends:', error);
    throw error;
  }
};

// Get merchant analysis
export const getMerchantAnalysis = async (params = {}) => {
  try {
    const response = await api.get('http://localhost:5000/api/analytics/merchants', { 
      params 
    });
    return response;
  } catch (error) {
    console.error('Error fetching merchant analysis:', error);
    throw error;
  }
};

// Get rewards optimization
export const getRewardsOptimization = async () => {
  try {
    const response = await api.get('http://localhost:5000/api/analytics/rewards/optimization');
    return response;
  } catch (error) {
    console.error('Error fetching rewards optimization:', error);
    throw error;
  }
};

// Get budget analysis
export const getBudgetAnalysis = async () => {
  try {
    const response = await api.get('http://localhost:5000/api/analytics/budget/analysis');
    return response;
  } catch (error) {
    console.error('Error fetching budget analysis:', error);
    throw error;
  }
};

// Generate financial insights with Gemini
export const generateInsights = async (data = {}) => {
  try {
    const response = await api.post('http://localhost:5000/api/analytics/insights/generate', data);
    return response;
  } catch (error) {
    console.error('Error generating financial insights:', error);
    throw error;
  }
};

// For backward compatibility, also provide a default export with all functions
const analyticsApi = {
  getSpendingByCategories,
  getSpendingTrends,
  getMerchantAnalysis,
  getRewardsOptimization,
  getBudgetAnalysis,
  generateInsights
};

export default analyticsApi;