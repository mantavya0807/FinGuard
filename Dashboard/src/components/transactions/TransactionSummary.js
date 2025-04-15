import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ArrowsRightLeftIcon,
  CurrencyDollarIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import nessieApi from '../../services/api/nessieApi';
import LoadingSpinner from '../common/LoadingSpinner';

// Function to group transactions by category and calculate totals
const groupTransactionsByCategory = (transactions) => {
  const categorySums = {};
  let totalSpent = 0;
  let totalReceived = 0;
  
  transactions.forEach(transaction => {
    const amount = Math.abs(transaction.amount);
    const category = transaction.category || 'Other';
    
    // Add to category sums
    if (!categorySums[category]) {
      categorySums[category] = 0;
    }
    
    if (transaction.amount < 0) {
      categorySums[category] += amount;
      totalSpent += amount;
    } else {
      totalReceived += amount;
    }
  });
  
  // Convert to array for easier rendering
  const categoryData = Object.entries(categorySums)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
  
  return {
    categories: categoryData,
    totalSpent,
    totalReceived,
    netFlow: totalReceived - totalSpent
  };
};

// Component for showing transaction amount trends
const TransactionSummary = ({ accountId = null, timeframe = '30d' }) => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Function to fetch transactions and calculate summary
  const fetchTransactionSummary = useCallback(async () => {
    try {
      if (!accountId) {
        // Mock data if no account ID is provided
        const mockTransactions = [
          {
            id: 'tx_1',
            amount: -120.50,
            category: 'Groceries',
            date: new Date(Date.now() - 3 * 86400000)
          },
          {
            id: 'tx_2',
            amount: -55.99,
            category: 'Dining',
            date: new Date(Date.now() - 7 * 86400000)
          },
          {
            id: 'tx_3',
            amount: -89.99,
            category: 'Utilities',
            date: new Date(Date.now() - 10 * 86400000)
          },
          {
            id: 'tx_4',
            amount: -35.50,
            category: 'Entertainment',
            date: new Date(Date.now() - 15 * 86400000)
          },
          {
            id: 'tx_5',
            amount: -65.75,
            category: 'Shopping',
            date: new Date(Date.now() - 20 * 86400000)
          },
          {
            id: 'tx_6',
            amount: 2500.00,
            category: 'Income',
            date: new Date(Date.now() - 5 * 86400000)
          }
        ];
        
        const summary = groupTransactionsByCategory(mockTransactions);
        setSummaryData(summary);
        setLoading(false);
        return;
      }

      // If accountId is provided, fetch real transactions from Nessie API
      const transactionsData = await nessieApi.getAccountTransactions(accountId);
      
      // Implement timeframe filtering
      const now = new Date();
      let cutoffDate;
      
      switch(timeframe) {
        case '7d':
          cutoffDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case '30d':
          cutoffDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case '90d':
          cutoffDate = new Date(now.setDate(now.getDate() - 90));
          break;
        case 'ytd':
          cutoffDate = new Date(now.getFullYear(), 0, 1); // Jan 1 of current year
          break;
        default:
          cutoffDate = new Date(now.setDate(now.getDate() - 30)); // Default to 30 days
      }
      
      // Filter transactions by date
      const filteredTransactions = transactionsData.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= cutoffDate;
      });
      
      const summary = groupTransactionsByCategory(filteredTransactions);
      setSummaryData(summary);
      setError(null);
    } catch (err) {
      console.error('Error fetching transaction summary:', err);
      setError('Failed to load transaction summary');
      
      // Set mock data on error
      setSummaryData({
        categories: [
          { category: 'Groceries', amount: 150.75 },
          { category: 'Dining', amount: 95.43 },
          { category: 'Entertainment', amount: 79.99 },
          { category: 'Transport', amount: 55.25 },
          { category: 'Shopping', amount: 45.10 }
        ],
        totalSpent: 426.52,
        totalReceived: 1500.00,
        netFlow: 1073.48
      });
    } finally {
      setLoading(false);
    }
  }, [accountId, timeframe]);
  
  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchTransactionSummary();
  }, [fetchTransactionSummary]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };
  
  // Format currency amounts
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Get time period label
  const getTimeframeName = () => {
    switch(timeframe) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case 'ytd': return 'Year to Date';
      default: return 'Last 30 Days';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md p-6 flex justify-center items-center h-48 border border-gray-100 dark:border-dark-700">
        <LoadingSpinner size="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md p-6 flex flex-col justify-center items-center h-48 border border-gray-100 dark:border-dark-700">
        <p className="text-red-500 dark:text-red-400 mb-3">{error}</p>
        <button 
          className="btn btn-primary px-4 py-2 text-sm"
          onClick={fetchTransactionSummary}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white dark:bg-dark-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-700"
    >
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Transaction Summary
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {getTimeframeName()}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div 
          variants={itemVariants}
          className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 flex items-center"
        >
          <div className="rounded-full bg-red-100 dark:bg-red-800 p-2 mr-3">
            <ArrowUpIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Total Spent</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(summaryData.totalSpent)}
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 flex items-center"
        >
          <div className="rounded-full bg-green-100 dark:bg-green-800 p-2 mr-3">
            <ArrowDownIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Total Received</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(summaryData.totalReceived)}
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className={`${
            summaryData.netFlow >= 0 
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : 'bg-yellow-50 dark:bg-yellow-900/20'
          } rounded-lg p-4 flex items-center`}
        >
          <div className={`rounded-full ${
            summaryData.netFlow >= 0 
              ? 'bg-blue-100 dark:bg-blue-800'
              : 'bg-yellow-100 dark:bg-yellow-800'
          } p-2 mr-3`}>
            <ArrowsRightLeftIcon className={`h-5 w-5 ${
              summaryData.netFlow >= 0 
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-yellow-600 dark:text-yellow-400'
            }`} />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Net Flow</p>
            <p className={`text-xl font-bold ${
              summaryData.netFlow >= 0 
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {formatCurrency(summaryData.netFlow)}
            </p>
          </div>
        </motion.div>
      </div>
      
      <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">
        Top Spending Categories
      </h3>
      
      <div className="space-y-3">
        {summaryData.categories.slice(0, 5).map((category, index) => (
          <motion.div 
            key={category.category}
            variants={itemVariants}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className={`h-8 w-8 rounded-md flex items-center justify-center ${
                index === 0 ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                index === 1 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                index === 2 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                index === 3 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              }`}>
                {index === 0 ? '#1' : 
                 index === 1 ? '#2' :
                 index === 2 ? '#3' :
                 index === 3 ? '#4' : '#5'}
              </div>
              <span className="ml-3 font-medium text-gray-700 dark:text-gray-300">
                {category.category}
              </span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(category.amount)}
            </span>
          </motion.div>
        ))}
        
        {summaryData.categories.length === 0 && (
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">
            No spending data available for this time period.
          </p>
        )}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-dark-700 text-center">
        <a 
          href="/payments/history" 
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
        >
          View Detailed Analytics
        </a>
      </div>
    </motion.div>
  );
};

export default TransactionSummary;