import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';
import * as plaidApi from '../services/api/plaidApi';

export const usePlaid = () => {
  const { user } = useAuth();
  const userId = user?.id;
  
  const [linkToken, setLinkToken] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState({
    linkToken: false,
    accounts: false,
    transactions: false,
    balances: false
  });
  const [error, setError] = useState({
    linkToken: null,
    accounts: null,
    transactions: null,
    balances: null
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Generate a link token for Plaid Link
  const generateLinkToken = useCallback(async () => {
    if (!userId) {
      setError(prev => ({ ...prev, linkToken: "User not authenticated" }));
      return;
    }
    
    setLoading(prev => ({ ...prev, linkToken: true }));
    setError(prev => ({ ...prev, linkToken: null }));
    
    try {
      const response = await plaidApi.createLinkToken(userId);
      
      if (!response || !response.link_token) {
        throw new Error("Failed to get link token from server");
      }
      
      setLinkToken(response.link_token);
      console.log("Link token generated successfully");
    } catch (err) {
      console.error('Error generating link token:', err);
      setError(prev => ({ 
        ...prev, 
        linkToken: err.message || "Failed to create link token" 
      }));
      toast.error("Failed to initialize bank connection");
    } finally {
      setLoading(prev => ({ ...prev, linkToken: false }));
    }
  }, [userId]);
  
  // Handle the success callback from Plaid Link
  const handlePlaidSuccess = useCallback(async (publicToken, metadata) => {
    if (!userId) {
      toast.error("User not authenticated");
      return { success: false, error: "User not authenticated" };
    }
    
    try {
      const result = await plaidApi.exchangePublicToken(publicToken, userId, metadata);
      
      if (!result || !result.accessToken) {
        throw new Error("Failed to exchange public token");
      }
      
      // Refresh accounts after linking
      await fetchAccounts();
      
      setLastUpdated(new Date());
      toast.success(`Connected ${metadata.institution.name} successfully!`);
      
      return { success: true, itemId: result.itemId };
    } catch (err) {
      console.error('Error exchanging public token:', err);
      setError(prev => ({ ...prev, accounts: err.message }));
      toast.error("Failed to connect bank account");
      return { success: false, error: err.message };
    }
  }, [userId]);
  
  // Fetch accounts from Plaid
  const fetchAccounts = useCallback(async (showToast = false) => {
    if (!userId) return;
    
    setLoading(prev => ({ ...prev, accounts: true }));
    setError(prev => ({ ...prev, accounts: null }));
    
    try {
      const response = await plaidApi.getAccounts(userId);
      
      if (!response || !response.accounts) {
        throw new Error("Failed to fetch accounts data");
      }
      
      setAccounts(response.accounts || []);
      if (showToast) toast.success("Accounts refreshed successfully");
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError(prev => ({ 
        ...prev, 
        accounts: err.message || "Failed to fetch accounts" 
      }));
      if (showToast) toast.error("Failed to refresh accounts");
    } finally {
      setLoading(prev => ({ ...prev, accounts: false }));
    }
  }, [userId]);
  
  // Fetch transactions from Plaid
  const fetchTransactions = useCallback(async (options = {}, showToast = false) => {
    if (!userId) return;
    
    setLoading(prev => ({ ...prev, transactions: true }));
    setError(prev => ({ ...prev, transactions: null }));
    
    try {
      const response = await plaidApi.getTransactions(userId, options);
      
      if (!response) {
        throw new Error("Failed to fetch transactions data");
      }
      
      setTransactions(response.transactions || []);
      if (showToast) toast.success("Transactions refreshed successfully");
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(prev => ({ 
        ...prev, 
        transactions: err.message || "Failed to fetch transactions" 
      }));
      if (showToast) toast.error("Failed to refresh transactions");
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  }, [userId]);
  
  // Fetch balances from Plaid
  const fetchBalances = useCallback(async (showToast = false) => {
    if (!userId) return;
    
    setLoading(prev => ({ ...prev, balances: true }));
    setError(prev => ({ ...prev, balances: null }));
    
    try {
      const response = await plaidApi.getBalances(userId);
      
      if (!response) {
        throw new Error("Failed to fetch balances data");
      }
      
      setBalances(response.balances || []);
      if (showToast) toast.success("Balances refreshed successfully");
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching balances:', err);
      setError(prev => ({ 
        ...prev, 
        balances: err.message || "Failed to fetch balances" 
      }));
      if (showToast) toast.error("Failed to refresh balances");
    } finally {
      setLoading(prev => ({ ...prev, balances: false }));
    }
  }, [userId]);
  
  // Refresh all financial data
  const refreshAllData = useCallback(async () => {
    if (!userId) return;
    
    toast.info("Refreshing financial data...");
    
    await Promise.all([
      fetchAccounts(),
      fetchBalances(),
      fetchTransactions()
    ]);
    
    toast.success("Financial data refreshed successfully");
  }, [userId, fetchAccounts, fetchBalances, fetchTransactions]);
  
  // Disconnect a Plaid item
  const handleDisconnectAccount = useCallback(async (itemId) => {
    if (!userId || !itemId) {
      toast.error("Missing required information");
      return { success: false, error: "Missing required information" };
    }
    
    try {
      await plaidApi.disconnectItem(itemId, userId);
      
      // Refresh accounts after disconnecting
      await fetchAccounts();
      toast.success("Account disconnected successfully");
      
      return { success: true };
    } catch (err) {
      console.error('Error disconnecting account:', err);
      toast.error("Failed to disconnect account");
      return { success: false, error: err.message };
    }
  }, [userId, fetchAccounts]);
  
  // Initialize data when userId changes
  useEffect(() => {
    if (userId) {
      fetchAccounts();
      fetchBalances();
      fetchTransactions();
    }
  }, [userId, fetchAccounts, fetchBalances, fetchTransactions]);
  
  return {
    linkToken,
    accounts,
    transactions,
    balances,
    loading,
    error,
    lastUpdated,
    generateLinkToken,
    handlePlaidSuccess,
    fetchAccounts,
    fetchTransactions,
    fetchBalances,
    refreshAllData,
    handleDisconnectAccount
  };
};