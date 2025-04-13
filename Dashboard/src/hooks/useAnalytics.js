import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';
import * as analyticsApi from '../services/api/analyticsApi';

export const useAnalytics = () => {
  const { user } = useAuth();
  
  // State for different analytics data
  const [categorySpending, setCategorySpending] = useState(null);
  const [spendingTrends, setSpendingTrends] = useState(null);
  const [merchantAnalysis, setMerchantAnalysis] = useState(null);
  const [rewardsOptimization, setRewardsOptimization] = useState(null);
  const [budgetAnalysis, setBudgetAnalysis] = useState(null);
  const [insights, setInsights] = useState(null);
  
  // Loading and error states
  const [loading, setLoading] = useState({
    categories: false,
    trends: false,
    merchants: false,
    rewards: false,
    budget: false,
    insights: false
  });
  
  const [error, setError] = useState({
    categories: null,
    trends: null,
    merchants: null,
    rewards: null,
    budget: null,
    insights: null
  });

  // Add retry tracking
  const [retryCount, setRetryCount] = useState({
    categories: 0,
    trends: 0,
    merchants: 0,
    rewards: 0,
    budget: 0,
    insights: 0
  });
  const MAX_RETRIES = 2; // Limit number of retries
  
  // Fetch spending by categories
  const fetchCategorySpending = useCallback(async (params = {}) => {
    if (!user) return;
    
    setLoading(prev => ({ ...prev, categories: true }));
    setError(prev => ({ ...prev, categories: null }));
    
    try {
      const response = await analyticsApi.getSpendingByCategories(params);
      setCategorySpending(response);
      return response;
    } catch (err) {
      console.error('Error fetching category spending:', err);
      setError(prev => ({ 
        ...prev, 
        categories: err.message || 'Failed to fetch category spending'
      }));
      toast.error('Failed to load spending categories');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  }, [user]);
  
  // Fetch spending trends
  const fetchSpendingTrends = useCallback(async (params = {}) => {
    if (!user) return;
    
    setLoading(prev => ({ ...prev, trends: true }));
    setError(prev => ({ ...prev, trends: null }));
    
    try {
      const response = await analyticsApi.getSpendingTrends(params);
      setSpendingTrends(response);
      return response;
    } catch (err) {
      console.error('Error fetching spending trends:', err);
      setError(prev => ({ 
        ...prev, 
        trends: err.message || 'Failed to fetch spending trends'
      }));
      toast.error('Failed to load spending trends');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, trends: false }));
    }
  }, [user]);
  
  // Fetch merchant analysis
  const fetchMerchantAnalysis = useCallback(async (params = {}) => {
    if (!user) return;
    
    setLoading(prev => ({ ...prev, merchants: true }));
    setError(prev => ({ ...prev, merchants: null }));
    
    try {
      const response = await analyticsApi.getMerchantAnalysis(params);
      setMerchantAnalysis(response);
      return response;
    } catch (err) {
      console.error('Error fetching merchant analysis:', err);
      setError(prev => ({ 
        ...prev, 
        merchants: err.message || 'Failed to fetch merchant analysis'
      }));
      toast.error('Failed to load merchant analysis');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, merchants: false }));
    }
  }, [user]);
  
  // Fetch rewards optimization
  const fetchRewardsOptimization = useCallback(async () => {
    if (!user) return;
    
    setLoading(prev => ({ ...prev, rewards: true }));
    setError(prev => ({ ...prev, rewards: null }));
    
    try {
      const response = await analyticsApi.getRewardsOptimization();
      setRewardsOptimization(response);
      return response;
    } catch (err) {
      console.error('Error fetching rewards optimization:', err);
      setError(prev => ({ 
        ...prev, 
        rewards: err.message || 'Failed to fetch rewards optimization'
      }));
      toast.error('Failed to load rewards optimization');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, rewards: false }));
    }
  }, [user]);
  
  // Fetch budget analysis
  const fetchBudgetAnalysis = useCallback(async () => {
    if (!user) return;
    
    setLoading(prev => ({ ...prev, budget: true }));
    setError(prev => ({ ...prev, budget: null }));
    
    try {
      const response = await analyticsApi.getBudgetAnalysis();
      setBudgetAnalysis(response);
      return response;
    } catch (err) {
      console.error('Error fetching budget analysis:', err);
      setError(prev => ({ 
        ...prev, 
        budget: err.message || 'Failed to fetch budget analysis'
      }));
      toast.error('Failed to load budget analysis');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, budget: false }));
    }
  }, [user]);
  
  // Generate financial insights
  const generateFinancialInsights = useCallback(async (data = {}) => {
    if (!user) return;
    
    // Check retry count
    if (retryCount.insights >= MAX_RETRIES) {
      console.log("Max retries reached for insights generation");
      return;
    }
    
    setLoading(prev => ({ ...prev, insights: true }));
    setError(prev => ({ ...prev, insights: null }));
    
    try {
      const response = await analyticsApi.generateInsights(data);
      setInsights(response);
      // Reset retry count on success
      setRetryCount(prev => ({ ...prev, insights: 0 }));
      return response;
    } catch (err) {
      console.error('Error generating financial insights:', err);
      setError(prev => ({ 
        ...prev, 
        insights: err.message || 'Failed to generate financial insights'
      }));
      // Increment retry count
      setRetryCount(prev => ({ ...prev, insights: prev.insights + 1 }));
      toast.error('Failed to generate financial insights');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, insights: false }));
    }
  }, [user, retryCount.insights]);
  
  // Refresh all analytics data
  const refreshAllAnalytics = useCallback(async () => {
    const toastId = toast.loading('Refreshing analytics data...');
    
    try {
      await Promise.all([
        fetchCategorySpending(),
        fetchSpendingTrends(),
        fetchMerchantAnalysis(),
        fetchRewardsOptimization(),
        fetchBudgetAnalysis()
      ]);
      
      toast.success('Analytics data refreshed', { id: toastId });
    } catch (err) {
      console.error('Error refreshing analytics:', err);
      toast.error('Failed to refresh some analytics data', { id: toastId });
    }
  }, [
    fetchCategorySpending, 
    fetchSpendingTrends, 
    fetchMerchantAnalysis, 
    fetchRewardsOptimization, 
    fetchBudgetAnalysis
  ]);
  
  // Initialize data when user changes
  useEffect(() => {
    if (user) {
      // Use a flag to prevent multiple initializations
      let isMounted = true;
      
      // Add debouncing - only refresh after a delay
      const initTimer = setTimeout(() => {
        if (isMounted) refreshAllAnalytics();
      }, 500);
      
      return () => {
        isMounted = false;
        clearTimeout(initTimer);
      };
    }
  }, [user, refreshAllAnalytics]);
  
  return {
    // Data
    categorySpending,
    spendingTrends,
    merchantAnalysis,
    rewardsOptimization,
    budgetAnalysis,
    insights,
    
    // Loading states
    loading,
    
    // Error states
    error,
    
    // Functions
    fetchCategorySpending,
    fetchSpendingTrends,
    fetchMerchantAnalysis,
    fetchRewardsOptimization,
    fetchBudgetAnalysis,
    generateFinancialInsights,
    refreshAllAnalytics
  };
};