const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://gsqvwnsqyokejcctrjwj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcXZ3bnNxeW9rZWpjY3RyandqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0ODI2NTgsImV4cCI6MjA2MDA1ODY1OH0.Fk45BZfvesDVJOvfl8c4h6E5UPd0298_oShadMEZBz4';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Save a Plaid item to Supabase
 * @param {string} userId - The user ID
 * @param {Object} data - The item data
 * @returns {Promise<Object>} The inserted item
 */
const savePlaidItem = async (userId, data) => {
  try {
    const { item_id, access_token, institution_id, institution_name } = data;
    
    const { data: insertedItem, error } = await supabase
      .from('plaid_items')
      .insert([{
        user_id: userId,
        item_id,
        access_token,
        institution_id: institution_id || null,
        institution_name: institution_name || 'Unknown Institution',
        status: 'active'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return insertedItem;
  } catch (error) {
    console.error('Error saving Plaid item:', error);
    throw error;
  }
};

/**
 * Get all Plaid items for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} The user's Plaid items
 */
const getPlaidItems = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('plaid_items')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting Plaid items:', error);
    throw error;
  }
};

/**
 * Save accounts to Supabase
 * @param {string} userId - The user ID
 * @param {Array} accounts - The accounts to save
 * @param {string} itemId - The Plaid item ID
 * @param {string} institutionId - The institution ID
 * @param {string} institutionName - The institution name
 * @returns {Promise<Array>} The inserted accounts
 */
const saveAccounts = async (userId, accounts, itemId, institutionId, institutionName) => {
  try {
    // Map accounts to the format expected by our database
    const accountsToInsert = accounts.map(account => ({
      user_id: userId,
      item_id: itemId,
      plaid_account_id: account.id,
      name: account.name,
      mask: account.mask,
      official_name: account.official_name,
      account_type: account.type,
      account_subtype: account.subtype,
      available_balance: account.balances?.available,
      current_balance: account.balances?.current,
      limit_amount: account.balances?.limit,
      iso_currency_code: account.balances?.iso_currency_code || 'USD',
    }));
    
    const { data, error } = await supabase
      .from('plaid_accounts')
      .insert(accountsToInsert)
      .select();
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error saving accounts:', error);
    throw error;
  }
};

/**
 * Get all accounts for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} The user's accounts
 */
const getAccounts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('plaid_accounts')
      .select(`
        *,
        plaid_items (
          institution_name
        )
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Format the accounts for the frontend
    const formattedAccounts = data.map(account => ({
      id: account.id,
      account_id: account.plaid_account_id,
      name: account.name,
      mask: account.mask,
      type: account.account_type,
      subtype: account.account_subtype,
      balance_available: account.available_balance,
      balance_current: account.current_balance,
      balance_limit: account.limit_amount,
      institution_id: account.institution_id,
      institution_name: account.plaid_items?.institution_name
    }));
    
    return formattedAccounts || [];
  } catch (error) {
    console.error('Error getting accounts:', error);
    throw error;
  }
};

/**
 * Save transactions to Supabase
 * @param {string} userId - The user ID
 * @param {Array} transactions - The transactions to save
 * @returns {Promise<boolean>} Success status
 */
const saveTransactions = async (userId, transactions) => {
  try {
    // First, get the account mappings (plaid account ID to our account ID)
    const { data: accounts, error: accountsError } = await supabase
      .from('plaid_accounts')
      .select('id, plaid_account_id')
      .eq('user_id', userId);
    
    if (accountsError) throw accountsError;
    
    // Create a mapping of Plaid account IDs to our account IDs
    const accountMap = {};
    accounts.forEach(account => {
      accountMap[account.plaid_account_id] = account.id;
    });
    
    // Map transactions to the format expected by our database
    const transactionsToInsert = transactions.map(transaction => ({
      user_id: userId,
      account_id: accountMap[transaction.account_id],
      plaid_transaction_id: transaction.transaction_id,
      amount: transaction.amount,
      date: transaction.date,
      name: transaction.name,
      merchant_name: transaction.merchant_name,
      pending: transaction.pending,
      payment_channel: transaction.payment_channel,
      category: transaction.category,
      category_id: transaction.category_id,
      location: transaction.location,
      payment_meta: transaction.payment_meta,
      iso_currency_code: transaction.iso_currency_code || 'USD'
    }));
    
    // Insert transactions in batches to avoid hitting limits
    const batchSize = 100;
    for (let i = 0; i < transactionsToInsert.length; i += batchSize) {
      const batch = transactionsToInsert.slice(i, i + batchSize);
      
      // Use upsert to handle conflicts with existing transactions
      const { error } = await supabase
        .from('plaid_transactions')
        .upsert(batch, { onConflict: 'plaid_transaction_id' });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving transactions:', error);
    throw error;
  }
};

/**
 * Get transactions for a user
 * @param {string} userId - The user ID
 * @param {Object} options - Filter options
 * @returns {Promise<Array>} The user's transactions
 */
const getTransactions = async (userId, options = {}) => {
  try {
    let query = supabase
      .from('plaid_transactions')
      .select(`
        *,
        plaid_accounts (
          name, account_type, account_subtype
        )
      `)
      .eq('user_id', userId);
    
    // Add filters if provided
    if (options.startDate) {
      query = query.gte('date', options.startDate);
    }
    
    if (options.endDate) {
      query = query.lte('date', options.endDate);
    }
    
    if (options.accountIds && options.accountIds.length > 0) {
      query = query.in('account_id', options.accountIds);
    }
    
    // Order by date, newest first
    query = query.order('date', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
};

/**
 * Delete a Plaid item and its associated data
 * @param {string} userId - The user ID
 * @param {string} itemId - The Plaid item ID to delete
 * @returns {Promise<boolean>} Success status
 */
const deletePlaidItem = async (userId, itemId) => {
  try {
    // Delete the item - cascading deletes should handle accounts and transactions
    const { error } = await supabase
      .from('plaid_items')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting Plaid item:', error);
    throw error;
  }
};

module.exports = {
  supabase,
  savePlaidItem,
  getPlaidItems,
  saveAccounts,
  getAccounts,
  saveTransactions,
  getTransactions,
  deletePlaidItem
};