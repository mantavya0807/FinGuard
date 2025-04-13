import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import nessieApi from '../../services/api/nessieApi';
import LoadingSpinner from '../common/LoadingSpinner';

// Hero icons
import {
  ShoppingBagIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  BuildingStorefrontIcon,
  HomeIcon,
  PlayIcon,
  ShoppingCartIcon,
  TruckIcon,
  WrenchIcon,
  PhoneIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

// Component for a single transaction
const TransactionItem = ({ transaction, index }) => {
  // Determine icon based on transaction type or category
  const getIcon = () => {
    // First check the transaction type
    switch(transaction.type) {
      case 'deposit':
        return <ArrowDownIcon className="h-5 w-5 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpIcon className="h-5 w-5 text-red-500" />;
      case 'transfer':
        return <ArrowsRightLeftIcon className="h-5 w-5 text-blue-500" />;
      case 'purchase':
        // For purchases, check the description to guess category
        const desc = transaction.description?.toLowerCase() || '';
        
        if (desc.includes('food') || desc.includes('restaurant') || desc.includes('cafe') || 
            desc.includes('starbucks') || desc.includes('dining')) {
          return <BuildingStorefrontIcon className="h-5 w-5 text-orange-500" />;
        } else if (desc.includes('amazon') || desc.includes('store') || desc.includes('shop') || 
                  desc.includes('target') || desc.includes('walmart')) {
          return <ShoppingBagIcon className="h-5 w-5 text-purple-500" />;
        } else if (desc.includes('grocer') || desc.includes('whole foods') || desc.includes('market')) {
          return <ShoppingCartIcon className="h-5 w-5 text-green-500" />;
        } else if (desc.includes('gas') || desc.includes('uber') || desc.includes('lyft') || 
                  desc.includes('transport')) {
          return <TruckIcon className="h-5 w-5 text-blue-500" />;
        } else if (desc.includes('rent') || desc.includes('mortgage') || desc.includes('house')) {
          return <HomeIcon className="h-5 w-5 text-indigo-500" />;
        } else if (desc.includes('movie') || desc.includes('netflix') || desc.includes('entertainment')) {
          return <PlayIcon className="h-5 w-5 text-pink-500" />;
        } else if (desc.includes('bill') || desc.includes('utility') || desc.includes('electric')) {
          return <WrenchIcon className="h-5 w-5 text-yellow-500" />;
        } else if (desc.includes('phone') || desc.includes('mobile') || desc.includes('wireless')) {
          return <PhoneIcon className="h-5 w-5 text-cyan-500" />;
        } else if (desc.includes('travel') || desc.includes('flight') || desc.includes('hotel')) {
          return <GlobeAltIcon className="h-5 w-5 text-emerald-500" />;
        } else {
          return <ShoppingBagIcon className="h-5 w-5 text-gray-500" />;
        }
      default:
        return <BanknotesIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format the date
  const getFormattedDate = () => {
    if (!transaction.date) {
      // Try different date fields in the transaction object
      const dateValue = transaction.purchase_date || transaction.transaction_date || transaction.timestamp;
      if (!dateValue) return 'Unknown date';
      return format(new Date(dateValue), 'MMM d, yyyy');
    }
    
    let date;
    if (typeof transaction.date === 'string') {
      date = new Date(transaction.date);
    } else {
      date = transaction.date;
    }
    
    return format(date, 'MMM d, yyyy');
  };

  // Get merchant name
  const getMerchantName = () => {
    if (transaction.merchant_name) return transaction.merchant_name;
    if (transaction.description) return transaction.description;
    
    switch(transaction.type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'transfer':
        return 'Transfer';
      case 'purchase':
        return 'Purchase';
      default:
        return 'Transaction';
    }
  };

  // Animation variants
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        delay: index * 0.1 
      }
    },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white dark:bg-dark-800 rounded-lg p-4 border border-gray-100 dark:border-dark-700 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center">
        <div className={`p-2 rounded-full ${transaction.amount < 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'} mr-3`}>
          {getIcon()}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{getMerchantName()}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{getFormattedDate()}</p>
            </div>
            
            <div className={`font-semibold ${transaction.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
            </div>
          </div>
          
          {transaction.description && (
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 truncate">
              {transaction.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Main TransactionFeed component
const TransactionFeed = ({ maxItems = 5, refreshInterval = 60000, accountId = 'current' }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get transactions from API
      const transactionsData = await nessieApi.getAccountTransactions(accountId);
      
      if (Array.isArray(transactionsData) && transactionsData.length > 0) {
        // Limit the number of transactions to display
        const limitedTransactions = transactionsData.slice(0, maxItems);
        setTransactions(limitedTransactions);
        setError(null);
      } else {
        // Use mock data if no transactions were returned
        console.log('No transactions found, using mock data');
        setTransactions([
          {
            id: 'tx_' + Math.random().toString(36).substring(2, 9),
            amount: -85.42,
            merchant_name: 'Whole Foods Market',
            date: new Date(),
            type: 'purchase',
            description: 'Weekly grocery shopping'
          },
          {
            id: 'tx_' + Math.random().toString(36).substring(2, 9),
            amount: -34.99,
            merchant_name: 'Netflix',
            date: new Date(Date.now() - 86400000),
            type: 'purchase',
            description: 'Monthly subscription'
          },
          {
            id: 'tx_' + Math.random().toString(36).substring(2, 9),
            amount: 2500.00,
            merchant_name: 'Direct Deposit - Employer',
            date: new Date(Date.now() - 172800000),
            type: 'deposit',
            description: 'Bi-weekly paycheck'
          },
          {
            id: 'tx_' + Math.random().toString(36).substring(2, 9),
            amount: -125.00,
            merchant_name: 'Utility Company',
            date: new Date(Date.now() - 259200000),
            type: 'purchase',
            description: 'Monthly electricity bill'
          },
          {
            id: 'tx_' + Math.random().toString(36).substring(2, 9),
            amount: -45.67,
            merchant_name: 'Chevron',
            date: new Date(Date.now() - 345600000),
            type: 'purchase',
            description: 'Gas for car'
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load recent transactions');
      
      // If error occurs, use mock data
      setTransactions([
        {
          id: 'tx_' + Math.random().toString(36).substring(2, 9),
          amount: -78.99,
          merchant_name: 'Amazon',
          date: new Date(),
          type: 'purchase',
          description: 'Household items'
        },
        {
          id: 'tx_' + Math.random().toString(36).substring(2, 9),
          amount: -12.50,
          merchant_name: 'Starbucks',
          date: new Date(Date.now() - 86400000),
          type: 'purchase',
          description: 'Coffee'
        },
        {
          id: 'tx_' + Math.random().toString(36).substring(2, 9),
          amount: 1500.00,
          merchant_name: 'Paycheck',
          date: new Date(Date.now() - 172800000),
          type: 'deposit',
          description: 'Weekly paycheck'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [accountId, maxItems]);
  
  // Fetch transactions on component mount and set up interval for refreshing
  useEffect(() => {
    fetchTransactions();
    
    // Set up interval for refreshing
    const interval = setInterval(fetchTransactions, refreshInterval);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [fetchTransactions, refreshInterval]);

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md overflow-hidden p-5 border border-gray-100 dark:border-dark-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
        
        <button 
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium flex items-center"
          onClick={fetchTransactions}
        >
          Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="h-8 w-8" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 dark:text-red-400 mb-3">{error}</p>
          <button 
            className="btn btn-primary px-4 py-2 text-sm"
            onClick={fetchTransactions}
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {transactions.map((transaction, index) => (
              <TransactionItem 
                key={transaction._id || transaction.id || index} 
                transaction={transaction} 
                index={index}
              />
            ))}
          </AnimatePresence>
          
          {(!transactions || transactions.length === 0) && (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              No transactions found.
            </p>
          )}
          
          {transactions && transactions.length > 0 && (
            <div className="pt-2 text-center">
              <a 
                href="/payments/history" 
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
              >
                View All Transactions
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionFeed;