import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ChevronDownIcon,
  CalendarIcon,
  CreditCardIcon,
  BanknotesIcon,
  ShoppingBagIcon,
  ExclamationCircleIcon,
  BuildingOfficeIcon,
  HomeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useCards } from '../../hooks/useCards';
import api from '../../services/api/index';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PaymentHistoryScreen = () => {
  const { cards } = useCards();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    timeRange: 'all',
    type: 'all',
    card: 'all',
    amount: 'all'
  });
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalIncome: 0,
    totalRewards: 0
  });
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.timeRange !== 'all') {
        const now = new Date();
        
        if (filters.timeRange === 'month') {
          const oneMonthAgo = new Date(now);
          oneMonthAgo.setMonth(now.getMonth() - 1);
          queryParams.append('startDate', oneMonthAgo.toISOString());
        } else if (filters.timeRange === '3months') {
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setMonth(now.getMonth() - 3);
          queryParams.append('startDate', threeMonthsAgo.toISOString());
        } else if (filters.timeRange === 'year') {
          const oneYearAgo = new Date(now);
          oneYearAgo.setFullYear(now.getFullYear() - 1);
          queryParams.append('startDate', oneYearAgo.toISOString());
        }
        
        queryParams.append('endDate', now.toISOString());
      }
      
      if (filters.card !== 'all') {
        queryParams.append('cardId', filters.card);
      }
      
      if (filters.type !== 'all') {
        queryParams.append('type', filters.type);
      }
      
      console.log(`Fetching transactions with query: ${queryParams.toString()}`);
      const transactionsResponse = await api.get(`/transactions?${queryParams.toString()}`);
      
      let transactionData = Array.isArray(transactionsResponse) 
        ? transactionsResponse 
        : (transactionsResponse.data || []);
      
      console.log('Received transaction data:', transactionData);
      
      const statsResponse = await api.get(`/transactions/stats/summary?${queryParams.toString()}`);
      
      if (filters.amount !== 'all') {
        transactionData = transactionData.filter(payment => {
          const amount = Math.abs(payment.amount);
          
          if (filters.amount === 'under50' && amount < 50) {
            return true;
          } else if (filters.amount === '50to100' && amount >= 50 && amount <= 100) {
            return true;
          } else if (filters.amount === '100to500' && amount > 100 && amount <= 500) {
            return true;
          } else if (filters.amount === 'over500' && amount > 500) {
            return true;
          }
          
          return false;
        });
      }
      
      if (searchTerm) {
        transactionData = transactionData.filter(payment => 
          payment.merchantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      transactionData = transactionData.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      
      console.log('Final sorted transactions:', transactionData);
      setPayments(transactionData);
      
      if (statsResponse && statsResponse.totalStats) {
        setStats({
          totalSpent: statsResponse.totalStats.totalSpent || 0,
          totalIncome: statsResponse.totalStats.totalIncome || 0,
          totalRewards: statsResponse.totalStats.totalRewards || 0
        });
      } else {
        setStats({
          totalSpent: transactionData.reduce((acc, payment) => {
            return acc + (payment.amount < 0 ? Math.abs(payment.amount) : 0);
          }, 0),
          totalIncome: transactionData.reduce((acc, payment) => {
            return acc + (payment.amount > 0 ? payment.amount : 0);
          }, 0),
          totalRewards: transactionData.reduce((acc, payment) => {
            // Look for rewards in multiple possible locations
            const rewardAmount = 
              payment.rewardsEarned || // Check standard property
              payment.rewards || // Check alternative name
              (payment.rewards_info && payment.rewards_info.amount) || // Check if nested
              (payment.amount < 0 ? Math.abs(payment.amount) * 0.01 : 0); // Fallback calculation (1% of spend)
            
            return acc + (typeof rewardAmount === 'number' ? rewardAmount : 0);
          }, 0)
        });
      }
      
      console.log('Stats calculated:', stats);
      
    } catch (err) {
      console.error('Error fetching transactions from MongoDB:', err);
      setError('Failed to load transaction data from the database. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filters, searchTerm]);

  useEffect(() => {
    fetchPayments();
    
    const refreshInterval = setInterval(() => {
      fetchPayments();
    }, 300000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };
  
  const resetFilters = () => {
    setFilters({
      timeRange: 'all',
      type: 'all',
      card: 'all',
      amount: 'all'
    });
    setSearchTerm('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'shopping':
        return <ShoppingBagIcon className="h-5 w-5 text-purple-500" />;
      case 'grocery':
      case 'groceries':
        return <ShoppingBagIcon className="h-5 w-5 text-green-500" />;
      case 'dining':
        return <BuildingOfficeIcon className="h-5 w-5 text-red-500" />;
      case 'entertainment':
        return <ShoppingBagIcon className="h-5 w-5 text-pink-500" />;
      case 'payment':
        return <BanknotesIcon className="h-5 w-5 text-blue-500" />;
      case 'gas':
        return <BuildingOfficeIcon className="h-5 w-5 text-orange-500" />;
      case 'electronics':
        return <ShoppingBagIcon className="h-5 w-5 text-indigo-500" />;
      default:
        return <CreditCardIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const groupedPayments = payments.reduce((groups, payment) => {
    const date = new Date(payment.date);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date found:', payment.date, payment);
      return groups;
    }
    
    const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!groups[month]) {
      groups[month] = [];
    }
    
    groups[month].push(payment);
    return groups;
  }, {});

  Object.keys(groupedPayments).forEach(month => {
    groupedPayments[month].sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto"
    >
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Payment History</h1>
            <p className="text-blue-100">
              Track all your card transactions and payments
            </p>
          </div>
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            disabled={refreshing}
          >
            <ArrowPathIcon className={`h-5 w-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div 
          className="bg-white rounded-xl shadow-md p-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
              <ArrowUpIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Total Spent</h2>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{formatCurrency(stats.totalSpent)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl shadow-md p-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <ArrowDownIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Total Payments</h2>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(stats.totalIncome)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl shadow-md p-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <CreditCardIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Rewards Earned</h2>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(stats.totalRewards)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search transactions..."
                className="input-field w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            
            <button
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-dark-700 dark:border-dark-600 dark:text-gray-200 dark:hover:bg-dark-600"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
              Filter
              <ChevronDownIcon className={`h-5 w-5 ml-1 text-gray-500 dark:text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 dark:bg-dark-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Range</label>
                  <select
                    name="timeRange"
                    className="input-field w-full"
                    value={filters.timeRange}
                    onChange={handleFilterChange}
                  >
                    <option value="all">All Time</option>
                    <option value="month">Last Month</option>
                    <option value="3months">Last 3 Months</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction Type</label>
                  <select
                    name="type"
                    className="input-field w-full"
                    value={filters.type}
                    onChange={handleFilterChange}
                  >
                    <option value="all">All Types</option>
                    <option value="purchase">Purchase</option>
                    <option value="payment">Payment</option>
                    <option value="refund">Refund</option>
                    <option value="recurring">Recurring</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card</label>
                  <select
                    name="card"
                    className="input-field w-full"
                    value={filters.card}
                    onChange={handleFilterChange}
                  >
                    <option value="all">All Cards</option>
                    {cards.map(card => (
                      <option key={card.id} value={card.id}>
                        {card.cardName} {card.cardNumber ? `(${card.cardNumber.slice(-4)})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                  <select
                    name="amount"
                    className="input-field w-full"
                    value={filters.amount}
                    onChange={handleFilterChange}
                  >
                    <option value="all">Any Amount</option>
                    <option value="under50">Under $50</option>
                    <option value="50to100">$50 - $100</option>
                    <option value="100to500">$100 - $500</option>
                    <option value="over500">Over $500</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium dark:text-primary-400 dark:hover:text-primary-300"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="h-12 w-12" color="text-primary-600" />
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                <ExclamationCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Error Loading Data</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={fetchPayments}
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-10">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No transactions found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {Object.entries(groupedPayments).map(([month, payments]) => (
                <motion.div key={month} variants={itemVariants}>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">{month}</h3>
                  <div className="space-y-4">
                    {payments.map(payment => (
                      <motion.div 
                        key={payment._id ? payment._id.toString() : payment.id || Math.random()}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-dark-700 dark:border-dark-600"
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-start">
                          <div className={`bg-white p-2 rounded-lg shadow-sm dark:bg-dark-800 ${
                            payment.amount > 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {payment.amount > 0 ? (
                              <ArrowDownIcon className="h-5 w-5" />
                            ) : (
                              <ArrowUpIcon className="h-5 w-5" />
                            )}
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex flex-col sm:flex-row sm:justify-between">
                              <div>
                                <div className="flex items-center">
                                  <h4 className="font-medium text-gray-900 dark:text-white">{payment.merchantName}</h4>
                                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-gray-300">
                                    {payment.type && payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {payment.description}
                                </p>
                              </div>
                              <div className="mt-2 sm:mt-0 flex flex-col items-end">
                                <span className={`font-bold ${
                                  payment.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {payment.amount > 0 ? '+' : ''}{formatCurrency(payment.amount)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(payment.date)}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center">
                                <div className="bg-gray-200 p-1 rounded-md dark:bg-dark-600 mr-2">
                                  {getCategoryIcon(payment.category)}
                                </div>
                                <span className="text-xs text-gray-600 dark:text-gray-300 capitalize">{payment.category}</span>
                              </div>
                              {payment.rewardsEarned > 0 && (
                                <span className="text-xs text-purple-600 dark:text-purple-400">
                                  +{formatCurrency(payment.rewardsEarned)} rewards
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentHistoryScreen;