import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  CreditCardIcon, 
  LockClosedIcon, 
  ShieldCheckIcon, 
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Line, Doughnut } from 'react-chartjs-2';
import api from '../../services/api/index';
import LoadingSpinner from '../common/LoadingSpinner';
import { format } from 'date-fns';

const CardDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [card, setCard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState(null);
  const [spendingTrendData, setSpendingTrendData] = useState(null);
  const [loading, setLoading] = useState({
    card: true,
    transactions: true
  });
  const [error, setError] = useState({
    card: null,
    transactions: null
  });
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalPayments: 0,
    rewardsEarned: 0,
    transactionCount: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch card details
  useEffect(() => {
    const fetchCardDetails = async () => {
      setLoading(prev => ({ ...prev, card: true }));
      setError(prev => ({ ...prev, card: null }));
      
      try {
        const cardData = await api.get(`/cards/${id}`);
        setCard(cardData);
      } catch (err) {
        console.error('Error fetching card details:', err);
        setError(prev => ({ ...prev, card: 'Failed to load card details' }));
      } finally {
        setLoading(prev => ({ ...prev, card: false }));
      }
    };
    
    if (id) {
      fetchCardDetails();
    }
  }, [id]);
  
  // Fetch card transactions
  const fetchCardTransactions = async () => {
    setLoading(prev => ({ ...prev, transactions: true }));
    setError(prev => ({ ...prev, transactions: null }));
    
    try {
      // Past 3 months of transactions
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      
      // API call to get transactions for this card
      const transactions = await api.get(`/transactions?cardId=${id}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
      
      setTransactions(transactions || []);
      
      // Calculate statistics
      calculateStats(transactions);
      
      // Process transaction data for charts
      processTransactionData(transactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(prev => ({ 
        ...prev, 
        transactions: 'Failed to load transaction data' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
      setRefreshing(false);
    }
  };
  
  // Calculate statistics from transactions
  const calculateStats = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return;
    }
    
    const totalSpent = transactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      
    const totalPayments = transactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const rewardsEarned = transactions
      .reduce((sum, tx) => sum + (tx.rewardsEarned || 0), 0);
      
    setStats({
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      totalPayments: parseFloat(totalPayments.toFixed(2)),
      rewardsEarned: parseFloat(rewardsEarned.toFixed(2)),
      transactionCount: transactions.length
    });
  };
  
  // Process transaction data for charts
  const processTransactionData = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return;
    }
    
    // Process category data for pie chart
    const categoryMap = {};
    
    transactions
      .filter(tx => tx.amount < 0)
      .forEach(tx => {
        const category = tx.category || 'other';
        if (!categoryMap[category]) {
          categoryMap[category] = 0;
        }
        categoryMap[category] += Math.abs(tx.amount);
      });
      
    const categoryLabels = Object.keys(categoryMap);
    const categoryValues = Object.values(categoryMap).map(val => parseFloat(val.toFixed(2)));
    
    const categoryColors = [
      'rgba(239, 68, 68, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(99, 102, 241, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(34, 197, 94, 0.8)'
    ];
    
    setCategoryData({
      labels: categoryLabels,
      datasets: [
        {
          data: categoryValues,
          backgroundColor: categoryColors.slice(0, categoryLabels.length),
          borderWidth: 1,
          borderColor: '#fff',
        }
      ]
    });
    
    // Process monthly spending trend for line chart
    const monthlyData = {};
    const months = [];
    
    // Get the last 3 months
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      months.unshift(monthKey);
      monthlyData[monthKey] = { spent: 0, rewards: 0 };
    }
    
    // Fill in the data
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      if (monthlyData[monthKey]) {
        if (tx.amount < 0) {
          monthlyData[monthKey].spent += Math.abs(tx.amount);
        }
        
        if (tx.rewardsEarned) {
          monthlyData[monthKey].rewards += tx.rewardsEarned;
        }
      }
    });
    
    // Format for chart
    setSpendingTrendData({
      labels: months,
      datasets: [
        {
          label: 'Spending',
          data: months.map(month => monthlyData[month].spent.toFixed(2)),
          borderColor: 'rgba(239, 68, 68, 0.8)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'Rewards',
          data: months.map(month => monthlyData[month].rewards.toFixed(2)),
          borderColor: 'rgba(16, 185, 129, 0.8)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)', 
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    });
  };
  
  // Fetch card transactions on component mount
  useEffect(() => {
    if (id) {
      fetchCardTransactions();
    }
  }, [id]);
  
  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshing(true);
    fetchCardTransactions();
  };
  
  // Chart options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        bodyFont: {
          size: 13
        },
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw;
            const percentage = ((value / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
            return `${label}: $${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  
  const lineChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        bodyFont: {
          size: 13
        },
        bodySpacing: 6,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        position: 'left',
        grid: {
          display: true,
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          callback: (value) => `$${value}`,
        },
        title: {
          display: true,
          text: 'Spending'
        }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        grid: {
          display: false
        },
        ticks: {
          callback: (value) => `$${value}`,
        },
        title: {
          display: true,
          text: 'Rewards'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    elements: {
      line: {
        borderWidth: 2
      }
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Format date with proper error handling
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'N/A'; // Return a placeholder for null/undefined dates
    }
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid before formatting
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return format(date, 'MMM d, yyyy');
    } catch (err) {
      console.warn('Error formatting date:', err, dateString);
      return 'Invalid date';
    }
  };
  
  // Get category icon
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'shopping':
        return <div className="rounded-full bg-purple-100 p-1 dark:bg-purple-900/30">
          <CreditCardIcon className="h-4 w-4 text-purple-600" />
        </div>;
      case 'dining':
        return <div className="rounded-full bg-red-100 p-1 dark:bg-red-900/30">
          <CreditCardIcon className="h-4 w-4 text-red-600" />
        </div>;
      case 'travel':
        return <div className="rounded-full bg-blue-100 p-1 dark:bg-blue-900/30">
          <CreditCardIcon className="h-4 w-4 text-blue-600" />
        </div>;
      case 'groceries':
        return <div className="rounded-full bg-green-100 p-1 dark:bg-green-900/30">
          <CreditCardIcon className="h-4 w-4 text-green-600" />
        </div>;
      case 'entertainment':
        return <div className="rounded-full bg-pink-100 p-1 dark:bg-pink-900/30">
          <CreditCardIcon className="h-4 w-4 text-pink-600" />
        </div>;
      default:
        return <div className="rounded-full bg-gray-100 p-1 dark:bg-gray-700">
          <CreditCardIcon className="h-4 w-4 text-gray-600" />
        </div>;
    }
  };
  
  // Render the card details page
  if (loading.card) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoadingSpinner size="h-12 w-12" />
      </div>
    );
  }
  
  if (error.card) {
    return (
      <div className="text-center p-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">Error Loading Card</h2>
        <p className="text-gray-600 mb-4 dark:text-gray-400">{error.card}</p>
        <button
          onClick={() => navigate('/cards')}
          className="btn btn-primary"
        >
          Back to Cards
        </button>
      </div>
    );
  }
  
  if (!card) {
    return (
      <div className="text-center p-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">Card Not Found</h2>
        <p className="text-gray-600 mb-4 dark:text-gray-400">The requested card could not be found.</p>
        <button
          onClick={() => navigate('/cards')}
          className="btn btn-primary"
        >
          Back to Cards
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/cards')}
          className="mr-4 p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors dark:bg-dark-800 dark:hover:bg-dark-700"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{card.cardName}</h1>
      </div>
      
      {/* Card Display */}
      <div className="relative mb-6">
        <div
          className="w-full h-56 rounded-xl shadow-lg overflow-hidden"
          style={{ 
            backgroundColor: card.color || '#4C1D95',
            backgroundImage: 'linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)'
          }}
        >
          <div className="p-6 flex flex-col justify-between h-full text-white">
            {/* Card Header */}
            <div className="flex justify-between items-start">
              <div>
                {/* Display card logo based on type */}
                <div className="text-white font-bold tracking-widest text-lg">{card.cardType}</div>
              </div>
            </div>
            
            {/* Chip */}
            <div className="flex items-center mb-4">
              <div className="h-10 w-14 bg-yellow-300 rounded-md bg-opacity-80 mr-2 p-1">
                <div className="h-full w-full border-2 border-yellow-500 rounded opacity-50"></div>
              </div>
            </div>
            
            {/* Card Number */}
            <div className="mb-6">
              <div className="text-xs text-white text-opacity-80 mb-1">Card Number</div>
              <div className="font-mono text-xl tracking-wider">•••• •••• •••• {card.cardNumber.slice(-4)}</div>
            </div>
            
            {/* Card Details */}
            <div className="flex justify-between text-white">
              <div>
                <div className="text-xs text-white text-opacity-80 mb-1">Card Holder</div>
                <div className="font-medium tracking-wide">{card.cardHolder}</div>
              </div>
              <div>
                <div className="text-xs text-white text-opacity-80 mb-1">Expires</div>
                <div className="font-medium">{card.expiryDate}</div>
              </div>
            </div>
          </div>
          
          {/* Decorative card design elements */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-0 right-0 h-32 w-32 bg-white bg-opacity-5 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 h-24 w-24 bg-white bg-opacity-5 rounded-full -ml-12 -mb-12"></div>
          </div>
        </div>
      </div>
      
      {/* Card Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 dark:bg-dark-800">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-red-100 mr-3 dark:bg-red-900/30">
              <ArrowUpIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatCurrency(stats.totalSpent)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 dark:bg-dark-800">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100 mr-3 dark:bg-green-900/30">
              <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rewards Earned</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatCurrency(stats.rewardsEarned)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 dark:bg-dark-800">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 mr-3 dark:bg-blue-900/30">
              <CreditCardIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Available Credit</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(card.creditLimit - card.currentMonthSpending)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                of {formatCurrency(card.creditLimit)} total
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Credit Limit Progress */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 dark:bg-dark-800">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-900 dark:text-white">Credit Utilization</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {((card.currentMonthSpending / card.creditLimit) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div 
            className="h-2.5 rounded-full bg-blue-600" 
            style={{ width: `${Math.min(100, (card.currentMonthSpending / card.creditLimit) * 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatCurrency(card.currentMonthSpending)} spent
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatCurrency(card.creditLimit)} limit
          </span>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 dark:border-dark-700">
        <div className="flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transactions'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="mb-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Card Analytics</h2>
              <button 
                onClick={handleRefresh}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500"
                disabled={refreshing}
              >
                <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Spending by Category */}
              <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-dark-800">
                <h3 className="text-lg font-medium mb-4 flex items-center text-gray-900 dark:text-white">
                  <ChartPieIcon className="h-5 w-5 mr-2 text-primary-600" />
                  Spending by Category
                </h3>
                
                <div className="h-64">
                  {loading.transactions ? (
                    <div className="h-full flex items-center justify-center">
                      <LoadingSpinner />
                    </div>
                  ) : error.transactions ? (
                    <div className="h-full flex items-center justify-center text-center">
                      <p className="text-gray-500 dark:text-gray-400">Failed to load category data</p>
                    </div>
                  ) : categoryData ? (
                    <Doughnut data={categoryData} options={doughnutOptions} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-center">
                      <p className="text-gray-500 dark:text-gray-400">No spending data available</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Spending Trend */}
              <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-dark-800">
                <h3 className="text-lg font-medium mb-4 flex items-center text-gray-900 dark:text-white">
                  <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-primary-600" />
                  Spending & Rewards Trend
                </h3>
                
                <div className="h-64">
                  {loading.transactions ? (
                    <div className="h-full flex items-center justify-center">
                      <LoadingSpinner />
                    </div>
                  ) : error.transactions ? (
                    <div className="h-full flex items-center justify-center text-center">
                      <p className="text-gray-500 dark:text-gray-400">Failed to load trend data</p>
                    </div>
                  ) : spendingTrendData ? (
                    <Line data={spendingTrendData} options={lineChartOptions} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-center">
                      <p className="text-gray-500 dark:text-gray-400">No spending trend data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Card Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-dark-800">
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Card Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Card Name</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{card.cardName}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Card Number</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        •••• •••• •••• {card.cardNumber.slice(-4)}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Card Holder</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{card.cardHolder}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Card Type</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{card.cardType}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Expiry Date</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{card.expiryDate}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Added On</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {formatDate(card.createdAt)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
              <button 
                onClick={handleRefresh}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500"
                disabled={refreshing}
              >
                <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            {loading.transactions ? (
              <div className="flex justify-center items-center p-12">
                <LoadingSpinner />
              </div>
            ) : error.transactions ? (
              <div className="text-center p-8 bg-white rounded-lg shadow-sm dark:bg-dark-800">
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error.transactions}</p>
                <button 
                  onClick={handleRefresh}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-lg shadow-sm dark:bg-dark-800">
                <p className="text-gray-600 dark:text-gray-400">No transactions found for this card.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden dark:bg-dark-800">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
                    <thead className="bg-gray-50 dark:bg-dark-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          Merchant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          Type
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-800 dark:divide-dark-700">
                      {transactions.slice(0, 10).map(transaction => (
                        <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {transaction.merchantName}
                            </div>
                            {transaction.description && transaction.description !== transaction.merchantName && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {transaction.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getCategoryIcon(transaction.category)}
                              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 capitalize">
                                {transaction.category}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {transaction.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                            <span className={transaction.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                              {transaction.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                            </span>
                            {transaction.rewardsEarned > 0 && (
                              <div className="text-xs text-purple-600 dark:text-purple-400">
                                +{formatCurrency(transaction.rewardsEarned)} rewards
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {transactions.length > 10 && (
                  <div className="px-6 py-3 bg-gray-50 dark:bg-dark-700 text-center">
                    <button 
                      onClick={() => navigate('/payments/history')}
                      className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      View All Transactions
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Security Tab */}
        {activeTab === 'security' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Card Security</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-dark-800">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-full bg-green-100 mr-3 dark:bg-green-900/30">
                    <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Card Protection</h3>
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <div className="h-4 w-4 rounded-full bg-green-500 mr-3"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Fraud monitoring active</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-4 w-4 rounded-full bg-green-500 mr-3"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Purchase protection</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-4 w-4 rounded-full bg-green-500 mr-3"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Zero liability protection</span>
                  </li>
                </ul>
                
                <div className="mt-6">
                  <button className="btn btn-outline w-full">Manage Security Settings</button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-dark-800">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-full bg-blue-100 mr-3 dark:bg-blue-900/30">
                    <LockClosedIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Card Controls</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Lock card temporarily</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">International transactions</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Online transactions</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button className="btn btn-outline w-full">Report Lost or Stolen</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardDetailScreen;