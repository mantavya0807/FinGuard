const supabase = require('../supabaseClient');
const { plaidClient } = require('../config/plaidClient.js');

// Errors to handle common issues
class PlaidAPIError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = 'PlaidAPIError';
  }
}

/**
 * Create a Plaid link token for connecting bank accounts
 * @returns {Promise<Object>} The link token response
 */
const createLinkToken = async () => {
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw new PlaidAPIError(userError.message, 'auth_error');
    if (!userData.user) throw new PlaidAPIError('User not authenticated', 'auth_error');
    
    const userId = userData.user.id;
    
    // Create link token request to Plaid
    const configs = {
      user: {
        client_user_id: userId
      },
      client_name: 'FinGuard App',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en'
    };
    
    const linkTokenResponse = await plaidClient.linkTokenCreate(configs);
    return linkTokenResponse.data;
  } catch (error) {
    console.error('Error creating link token:', error);
    throw error;
  }
};

/**
 * Exchange a public token for an access token and save the item
 * @param {string} publicToken - The public token from Plaid Link
 * @param {Object} metadata - The metadata from Plaid Link
 * @returns {Promise<Object>} The exchange response
 */
const exchangePublicToken = async (publicToken, metadata) => {
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw new PlaidAPIError(userError.message, 'auth_error');
    if (!userData.user) throw new PlaidAPIError('User not authenticated', 'auth_error');
    
    const userId = userData.user.id;
    
    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken
    });
    
    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;
    
    // Get item details
    const itemResponse = await plaidClient.itemGet({
      access_token: accessToken
    });
    
    const institutionId = itemResponse.data.item.institution_id;
    
    // Get institution details if available
    let institutionName = 'Unknown Institution';
    if (institutionId) {
      try {
        const institutionResponse = await plaidClient.institutionsGetById({
          institution_id: institutionId,
          country_codes: ['US']
        });
        institutionName = institutionResponse.data.institution.name;
      } catch (instError) {
        console.warn('Could not fetch institution details:', instError);
      }
    }
    
    // Save the item to Supabase
    const { data: itemData, error: itemError } = await supabase
      .from('plaid_items')
      .insert({
        user_id: userId,
        item_id: itemId,
        access_token: accessToken,
        institution_id: institutionId || null,
        institution_name: institutionName,
        status: 'active',
      })
      .select()
      .single();
    
    if (itemError) throw new PlaidAPIError(itemError.message, 'db_error');
    
    // Get account data
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken
    });
    
    // Save accounts to Supabase
    const accountsToInsert = accountsResponse.data.accounts.map(account => ({
      user_id: userId,
      item_id: itemId,
      plaid_account_id: account.account_id,
      name: account.name,
      mask: account.mask,
      official_name: account.official_name,
      account_type: account.type,
      account_subtype: account.subtype,
      available_balance: account.balances.available,
      current_balance: account.balances.current,
      limit_amount: account.balances.limit,
      iso_currency_code: account.balances.iso_currency_code || 'USD',
    }));
    
    const { data: accountsData, error: accountsError } = await supabase
      .from('plaid_accounts')
      .insert(accountsToInsert)
      .select();
    
    if (accountsError) {
      console.error('Error saving accounts:', accountsError);
      // We'll continue anyway to return what we have
    }
    
    return {
      success: true,
      item: itemData,
      accounts: accountsData || [],
      institutionName
    };
  } catch (error) {
    console.error('Error exchanging public token:', error);
    throw error;
  }
};

/**
 * Get accounts for the current user
 * @returns {Promise<Array>} The user's accounts
 */
const getAccounts = async () => {
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw new PlaidAPIError(userError.message, 'auth_error');
    if (!userData.user) throw new PlaidAPIError('User not authenticated', 'auth_error');
    
    const userId = userData.user.id;
    
    // Get all accounts from Supabase
    const { data: accounts, error: accountsError } = await supabase
      .from('plaid_accounts')
      .select('*, plaid_items(institution_name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (accountsError) throw new PlaidAPIError(accountsError.message, 'db_error');
    
    // Format accounts for frontend
    const formattedAccounts = accounts.map(account => ({
      id: account.id,
      plaid_account_id: account.plaid_account_id,
      item_id: account.item_id,
      name: account.name,
      mask: account.mask,
      institution_name: account.plaid_items?.institution_name,
      type: account.account_type,
      subtype: account.account_subtype,
      balance: {
        available: account.available_balance,
        current: account.current_balance,
        limit: account.limit_amount
      }
    }));
    
    return formattedAccounts;
  } catch (error) {
    console.error('Error getting accounts:', error);
    throw error;
  }
};

/**
 * Get transactions for the current user
 * @param {Object} options - Options for filtering transactions
 * @returns {Promise<Array>} The user's transactions
 */
const getTransactions = async (options = {}) => {
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw new PlaidAPIError(userError.message, 'auth_error');
    if (!userData.user) throw new PlaidAPIError('User not authenticated', 'auth_error');
    
    const userId = userData.user.id;
    
    // Build the query
    let query = supabase
      .from('plaid_transactions')
      .select('*, plaid_accounts(name, account_type, account_subtype)')
      .eq('user_id', userId);
    
    // Add date filters if provided
    if (options.startDate) {
      query = query.gte('date', options.startDate);
    }
    
    if (options.endDate) {
      query = query.lte('date', options.endDate);
    }
    
    // Add account filters if provided
    if (options.accountIds && options.accountIds.length > 0) {
      query = query.in('account_id', options.accountIds);
    }
    
    // Add sorting
    query = query.order('date', { ascending: false });
    
    // Execute the query
    const { data: transactions, error: transactionsError } = await query;
    
    if (transactionsError) throw new PlaidAPIError(transactionsError.message, 'db_error');
    
    return transactions;
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
};

/**
 * Sync transactions for a specific Plaid item
 * @param {string} itemId - The Plaid item ID to sync
 * @returns {Promise<Object>} The sync results
 */
const syncTransactions = async (itemId) => {
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw new PlaidAPIError(userError.message, 'auth_error');
    if (!userData.user) throw new PlaidAPIError('User not authenticated', 'auth_error');
    
    const userId = userData.user.id;
    
    // Get the item from Supabase
    const { data: item, error: itemError } = await supabase
      .from('plaid_items')
      .select('*')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .single();
    
    if (itemError) throw new PlaidAPIError(itemError.message, 'db_error');
    if (!item) throw new PlaidAPIError('Plaid item not found', 'not_found');
    
    // Get accounts for this item
    const { data: accounts, error: accountsError } = await supabase
      .from('plaid_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('item_id', itemId);
    
    if (accountsError) throw new PlaidAPIError(accountsError.message, 'db_error');
    
    // Get transactions from Plaid
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const endDate = now.toISOString().split('T')[0];
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: item.access_token,
      start_date: startDate,
      end_date: endDate,
    });
    
    const transactions = transactionsResponse.data.transactions;
    
    // Insert transactions into Supabase
    if (transactions && transactions.length > 0) {
      // Create a map of account IDs
      const accountMap = {};
      accounts.forEach(account => {
        accountMap[account.plaid_account_id] = account.id;
      });
      
      // Format transactions for insertion
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
        iso_currency_code: transaction.iso_currency_code || 'USD',
      }));
      
      // Insert transactions in batches to avoid request size limits
      const batchSize = 100;
      const results = [];
      
      for (let i = 0; i < transactionsToInsert.length; i += batchSize) {
        const batch = transactionsToInsert.slice(i, i + batchSize);
        
        // Use upsert to handle existing transactions
        const { data: insertedBatch, error: insertError } = await supabase
          .from('plaid_transactions')
          .upsert(batch, { onConflict: 'plaid_transaction_id' })
          .select();
        
        if (insertError) {
          console.error('Error inserting transactions batch:', insertError);
        } else if (insertedBatch) {
          results.push(...insertedBatch);
        }
      }
      
      return {
        success: true,
        added: results.length,
        total: transactions.length
      };
    }
    
    return {
      success: true,
      added: 0,
      total: 0
    };
  } catch (error) {
    console.error('Error syncing transactions:', error);
    throw error;
  }
};

/**
 * Get balances for all accounts
 * @returns {Promise<Array>} The account balances
 */
const getBalances = async () => {
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw new PlaidAPIError(userError.message, 'auth_error');
    if (!userData.user) throw new PlaidAPIError('User not authenticated', 'auth_error');
    
    const userId = userData.user.id;
    
    // Get all accounts with their balances
    const { data: accounts, error: accountsError } = await supabase
      .from('plaid_accounts')
      .select('*, plaid_items(institution_name)')
      .eq('user_id', userId);
    
    if (accountsError) throw new PlaidAPIError(accountsError.message, 'db_error');
    
    // Format the balances
    const balances = accounts.map(account => ({
      id: account.id,
      account_id: account.plaid_account_id,
      name: account.name,
      mask: account.mask,
      type: account.account_type,
      subtype: account.account_subtype,
      institution_name: account.plaid_items?.institution_name,
      available: account.available_balance,
      current: account.current_balance,
      limit: account.limit_amount,
      iso_currency_code: account.iso_currency_code
    }));
    
    return balances;
  } catch (error) {
    console.error('Error getting balances:', error);
    throw error;
  }
};

/**
 * Disconnect a Plaid item
 * @param {string} itemId - The Plaid item ID to disconnect
 * @returns {Promise<Object>} The result of the operation
 */
const disconnectItem = async (itemId) => {
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw new PlaidAPIError(userError.message, 'auth_error');
    if (!userData.user) throw new PlaidAPIError('User not authenticated', 'auth_error');
    
    const userId = userData.user.id;
    
    // Get the item
    const { data: item, error: itemError } = await supabase
      .from('plaid_items')
      .select('*')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .single();
    
    if (itemError) throw new PlaidAPIError(itemError.message, 'db_error');
    if (!item) throw new PlaidAPIError('Plaid item not found', 'not_found');
    
    // Remove the item from Plaid
    try {
      await plaidClient.itemRemove({
        access_token: item.access_token
      });
    } catch (plaidError) {
      console.warn('Error removing item from Plaid:', plaidError);
      // Continue anyway - we'll delete from our database
    }
    
    // Delete the item from Supabase - cascade will delete related accounts and transactions
    const { error: deleteError } = await supabase
      .from('plaid_items')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId);
    
    if (deleteError) throw new PlaidAPIError(deleteError.message, 'db_error');
    
    return { success: true };
  } catch (error) {
    console.error('Error disconnecting item:', error);
    throw error;
  }
};

/**
 * Get a specific Plaid item
 * @param {string} itemId - The Plaid item ID
 * @returns {Promise<Object>} The Plaid item
 */
const getItem = async (itemId) => {
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw new PlaidAPIError(userError.message, 'auth_error');
    if (!userData.user) throw new PlaidAPIError('User not authenticated', 'auth_error');
    
    const userId = userData.user.id;
    
    // Get the item
    const { data: item, error: itemError } = await supabase
      .from('plaid_items')
      .select('*')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .single();
    
    if (itemError) throw new PlaidAPIError(itemError.message, 'db_error');
    if (!item) throw new PlaidAPIError('Plaid item not found', 'not_found');
    
    return item;
  } catch (error) {
    console.error('Error getting item:', error);
    throw error;
  }
};

module.exports = {
  createLinkToken,
  exchangePublicToken,
  getAccounts,
  getTransactions,
  syncTransactions,
  getBalances,
  disconnectItem,
  getItem
};