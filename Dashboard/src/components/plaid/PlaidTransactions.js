import React, { useState, useEffect, useMemo } from 'react';
import { usePlaid } from '../../hooks/usePlaid';
import Card from '../common/Card';
import Button from '../common/Button';
import InputField from '../common/InputField';
import { format, subDays, parseISO } from 'date-fns';
import { 
  MagnifyingGlassIcon,  // Changed from SearchIcon
  FunnelIcon,           // Changed from FilterIcon
  ArrowPathIcon, 
  BanknotesIcon,        // Changed from CashIcon
  ShoppingBagIcon,
  HomeIcon,
  BoltIcon,             // Changed from LightningBoltIcon
  GlobeAltIcon,         // Changed from GlobeIcon
  UserGroupIcon,
  TruckIcon,
  HeartIcon,
  XMarkIcon,            // Changed from XIcon
  ExclamationCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const PlaidTransactions = () => {
  const { accounts, transactions, loading, error, fetchTransactions } = usePlaid();
  
  const [filters, setFilters] = useState({
    search: '',
    dateRange: '30',
    category: '',
    accountIds: []
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch transactions when filters change
  useEffect(() => {
    const startDate = filters.dateRange !== 'all' 
      ? format(subDays(new Date(), parseInt(filters.dateRange)), 'yyyy-MM-dd')
      : undefined;
    
    fetchTransactions({
      startDate,
      accountIds: filters.accountIds.length > 0 ? filters.accountIds : undefined
    });
  }, [filters.dateRange, filters.accountIds, fetchTransactions]);
  
  // Filter transactions based on search and category
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    
    return transactions.filter(transaction => {
      // Search filter
      const searchMatch = !filters.search || 
        transaction.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (transaction.merchant_name && transaction.merchant_name.toLowerCase().includes(filters.search.toLowerCase()));
      
      // Category filter
      const categoryMatch = !filters.category || 
        (transaction.category && transaction.category.some(cat => 
          cat.toLowerCase().includes(filters.category.toLowerCase())
        ));
      
      return searchMatch && categoryMatch;
    });
  }, [transactions, filters.search, filters.category]);
  
  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((groups, transaction) => {
      const date = transaction.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {});
  }, [filteredTransactions]);
  
  // Get category icon
  const getCategoryIcon = (categories) => {
    if (!categories || categories.length === 0) {
      return <BanknotesIcon className="h-5 w-5 text-gray-500" />;
    }
    
    const category = categories[0].toLowerCase();
    
    if (category.includes('shopping') || category.includes('merchandise')) {
      return <ShoppingBagIcon className="h-5 w-5 text-purple-500" />;
    } else if (category.includes('food') || category.includes('restaurant') || category.includes('dining')) {
      return <UserGroupIcon className="h-5 w-5 text-red-500" />;
    } else if (category.includes('travel') || category.includes('hotel') || category.includes('airline')) {
      return <GlobeAltIcon className="h-5 w-5 text-blue-500" />;
    } else if (category.includes('transport') || category.includes('uber') || category.includes('taxi')) {
      return <TruckIcon className="h-5 w-5 text-yellow-500" />;
    } else if (category.includes('home') || category.includes('rent') || category.includes('mortgage')) {
      return <HomeIcon className="h-5 w-5 text-green-500" />;
    } else if (category.includes('utilities') || category.includes('electric') || category.includes('gas')) {
      return <BoltIcon className="h-5 w-5 text-orange-500" />;
    } else if (category.includes('health') || category.includes('medical') || category.includes('doctor')) {
      return <HeartIcon className="h-5 w-5 text-pink-500" />;
    } else {
      return <BanknotesIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'EEEE, MMMM do, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle account filter toggle
  const handleAccountToggle = (accountId) => {
    setFilters(prev => {
      const accountIds = [...prev.accountIds];
      
      if (accountIds.includes(accountId)) {
        return {
          ...prev,
          accountIds: accountIds.filter(id => id !== accountId)
        };
      } else {
        return {
          ...prev,
          accountIds: [...accountIds, accountId]
        };
      }
    });
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      dateRange: '30',
      category: '',
      accountIds: []
    });
  };
  
  // Refresh transactions
  const handleRefresh = () => {
    const startDate = filters.dateRange !== 'all' 
      ? format(subDays(new Date(), parseInt(filters.dateRange)), 'yyyy-MM-dd')
      : undefined;
    
    fetchTransactions({
      startDate,
      accountIds: filters.accountIds.length > 0 ? filters.accountIds : undefined
    });
  };
  
  // Render transactions grouped by date
  const renderTransactions = () => {
    if (loading.transactions) {
      return (
        <div className="flex justify-center items-center py-12">
          <ArrowPathIcon className="h-8 w-8 text-primary-500 animate-spin" />
        </div>
      );
    }
    
    if (error.transactions) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-danger-500 mb-4" />
          <p className="text-danger-600 font-medium mb-2">Error loading transactions</p>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error.transactions}</p>
          <Button variant="primary" onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      );
    }
    
    if (filteredTransactions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BanknotesIcon className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">No transactions found</p>
          <p className="text-gray-500 dark:text-gray-400">
            {transactions.length === 0 
              ? "Connect your financial accounts to see your transactions"
              : "Try adjusting your filters to see more transactions"}
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {Object.keys(groupedTransactions).sort().reverse().map(date => (
          <div key={date}>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{formatDate(date)}</h3>
            <div className="space-y-2">
              {groupedTransactions[date].map(transaction => {
                // Find the account for this transaction
                const account = accounts.find(acc => acc.id === transaction.account_id);
                
                return (
                  <div key={transaction.id} className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-4 flex items-center">
                    <div className="bg-gray-100 dark:bg-dark-700 rounded-lg p-3 mr-4">
                      {getCategoryIcon(transaction.category)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <p className="font-medium dark:text-white truncate">
                          {transaction.name}
                        </p>
                        <p className={`font-medium ${
                          transaction.amount < 0 
                            ? 'text-danger-600 dark:text-danger-400' 
                            : 'text-success-600 dark:text-success-400'
                        }`}>
                          {transaction.amount < 0 ? '- ' : '+ '}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </p>
                      </div>
                      
                      <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {account && (
                          <span className="mr-2 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded text-xs">
                            {account.name}
                          </span>
                        )}
                        {transaction.category && transaction.category[0] && (
                          <span>
                            {transaction.category[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">Transactions</h2>
        <Button
          variant="outline"
          onClick={handleRefresh}
          loading={loading.transactions}
          icon={<ArrowPathIcon className="h-5 w-5" />}
        >
          Refresh
        </Button>
      </div>
      
      <Card className="mb-6">
        <div className="mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <InputField
                id="search"
                type="text"
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                icon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
                className="mb-0"
              />
            </div>
            
            <div className="flex space-x-2">
              <select
                className="input-field pr-8"
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="all">All time</option>
              </select>
              
              <Button
                variant={showFilters ? 'primary' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                icon={<FunnelIcon className="h-5 w-5" />}
              >
                Filter
              </Button>
            </div>
          </div>
        </div>
        
        {showFilters && (
          <div className="border-t border-gray-200 dark:border-dark-700 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Category</label>
                <select
                  className="input-field"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="Food and Drink">Food and Drink</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Travel">Travel</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Home">Home</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Health">Health</option>
                </select>
              </div>
              
              <div>
                <label className="label">Accounts</label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-dark-600 rounded-lg divide-y divide-gray-200 dark:divide-dark-700">
                  {accounts.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
                      No accounts connected
                    </div>
                  ) : (
                    accounts.map(account => (
                      <div key={account.id} className="p-3 flex items-center">
                        <input
                          type="checkbox"
                          id={`account-${account.id}`}
                          checked={filters.accountIds.includes(account.id)}
                          onChange={() => handleAccountToggle(account.id)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-dark-600"
                        />
                        <label 
                          htmlFor={`account-${account.id}`}
                          className="ml-3 text-sm text-gray-700 dark:text-gray-300"
                        >
                          {account.name}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      {/* Transaction list */}
      {renderTransactions()}
    </div>
  );
};

export default PlaidTransactions;