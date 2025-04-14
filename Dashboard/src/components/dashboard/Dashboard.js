import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useCards } from '../../hooks/useCards';
import { usePlaid } from '../../hooks/usePlaid';
import { 
  ChartPieIcon, 
  CreditCardIcon, 
  BanknotesIcon, 
  ShieldCheckIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  RocketLaunchIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import api from '../../services/api/index';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cards } = useCards();
  const { accounts, linkToken, generateLinkToken } = usePlaid();
  
  // State management
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [loading, setLoading] = useState({
    linkToken: false,
    transactions: true,
    stats: true
  });
  const [error, setError] = useState({
    transactions: null,
    stats: null
  });
  
  // Data states
  const [transactions, setTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState(null);
  const [monthlySpendingData, setMonthlySpendingData] = useState(null);
  const [rewardsData, setRewardsData] = useState(null);
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalIncome: 0,
    totalRewards: 0,
    spendingTrend: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  
  // Check if this is the first visit
  useEffect(() => {
    const visited = localStorage.getItem('dashboard_visited');
    if (!visited && (!accounts || accounts.length === 0)) {
      setIsFirstVisit(true);
      localStorage.setItem('dashboard_visited', 'true');
    }
    
    if (!linkToken && (!accounts || accounts.length === 0)) {
      generateLinkToken();
    }
  }, [accounts, linkToken, generateLinkToken]);

  // Fetch transaction data from MongoDB
  const fetchTransactions = async () => {
    setLoading(prev => ({ ...prev, transactions: true }));
    setError(prev => ({ ...prev, transactions: null }));
    
    try {
      // Get transactions for the last 6 months
      const now = new Date();
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      
      const queryParams = new URLSearchParams({
        startDate: sixMonthsAgo.toISOString(),
        endDate: now.toISOString()
      });
      
      // API call to get transactions
      const response = await api.get(`/transactions?${queryParams.toString()}`);
      
      // Extract transaction data from response
      let transactionData = Array.isArray(response) 
        ? response 
        : (response.data || []);
      
      // Sort transactions by date (newest first)
      transactionData = transactionData.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      setTransactions(transactionData);
      
      // Process data for charts once transactions are fetched
      processChartData(transactionData);
      calculateStats(transactionData);
      
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(prev => ({ 
        ...prev, 
        transactions: 'Failed to load transaction data. Please try again.' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };
  
  // Fetch transaction statistics for category breakdown
  const fetchTransactionStats = async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    setError(prev => ({ ...prev, stats: null }));
    
    try {
      // Set up query parameters - same time range as transactions
      const now = new Date();
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      
      const queryParams = new URLSearchParams({
        startDate: sixMonthsAgo.toISOString(),
        endDate: now.toISOString()
      });
      
      // Get transaction statistics from API
      const statsResponse = await api.get(`/transactions/stats/summary?${queryParams.toString()}`);
      
      if (statsResponse && statsResponse.categories && statsResponse.categories.length > 0) {
        // Process category data for pie chart
        processCategoryData(statsResponse.categories);
      } else {
        console.log('No category data returned from API');
      }
    } catch (err) {
      console.error('Error fetching transaction stats:', err);
      setError(prev => ({ 
        ...prev, 
        stats: 'Failed to load statistics data. Please try again.' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
      setRefreshing(false);
    }
  };
  
  // Process category data for the doughnut chart
  const processCategoryData = (categories) => {
    // Define a consistent color palette
    const backgroundColors = [
      'rgba(239, 68, 68, 0.8)',   // Red
      'rgba(245, 158, 11, 0.8)',  // Amber
      'rgba(99, 102, 241, 0.8)',  // Indigo
      'rgba(16, 185, 129, 0.8)',  // Emerald
      'rgba(139, 92, 246, 0.8)',  // Violet
      'rgba(236, 72, 153, 0.8)'   // Pink
    ];
    
    const categoryChartData = {
      labels: categories.map(cat => cat._id || 'Uncategorized'),
      datasets: [
        {
          data: categories.map(cat => Math.abs(cat.total)),
          backgroundColor: categories.map((_, i) => 
            backgroundColors[i % backgroundColors.length]
          ),
          borderWidth: 1,
          borderColor: '#fff',
        }
      ]
    };
    
    setCategoryData(categoryChartData);
  };
  
  // Process transaction data for monthly spending and rewards charts
  const processChartData = (transactionData) => {
    if (!transactionData || transactionData.length === 0) {
      return;
    }
    
    try {
      // Initialize monthly data containers
      const monthlyData = {};
      const rewardsMonthlyData = {};
      
      // Generate the last 6 months as labels (oldest to newest)
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        months.push(monthKey);
        monthlyData[monthKey] = { expenses: 0, income: 0 };
        rewardsMonthlyData[monthKey] = 0;
      }
      
      // Process each transaction
      transactionData.forEach(tx => {
        if (!tx.date) return;
        
        const txDate = new Date(tx.date);
        if (isNaN(txDate.getTime())) return;
        
        const monthKey = txDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        // Only process if it's within our chart range
        if (monthlyData[monthKey]) {
          // Add to expenses or income based on transaction amount
          if (tx.amount < 0) {
            monthlyData[monthKey].expenses += Math.abs(tx.amount);
          } else {
            monthlyData[monthKey].income += tx.amount;
          }
          
          // Calculate rewards amount (either from transaction or estimate 1%)
          const rewardAmount = 
            tx.rewardsEarned || 
            tx.rewards || 
            (tx.rewards_info && tx.rewards_info.amount) || 
            (tx.amount < 0 ? Math.abs(tx.amount) * 0.01 : 0);
            
          if (typeof rewardAmount === 'number') {
            rewardsMonthlyData[monthKey] += rewardAmount;
          }
        }
      });
      
      // Format data for Line chart (spending and income)
      const lineChartData = {
        labels: months,
        datasets: [
          {
            label: 'Expenses',
            data: months.map(month => monthlyData[month].expenses.toFixed(2)),
            borderColor: 'rgba(99, 102, 241, 0.8)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: 'rgba(99, 102, 241, 1)',
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2
          },
          {
            label: 'Income',
            data: months.map(month => monthlyData[month].income.toFixed(2)),
            borderColor: 'rgba(16, 185, 129, 0.8)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: 'rgba(16, 185, 129, 1)',
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2
          }
        ]
      };
      
      // Format data for Bar chart (rewards)
      const barChartData = {
        labels: months,
        datasets: [
          {
            label: 'Cashback Earned',
            data: months.map(month => rewardsMonthlyData[month].toFixed(2)),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            barThickness: 12,
            borderRadius: 6
          }
        ]
      };
      
      setMonthlySpendingData(lineChartData);
      setRewardsData(barChartData);
    } catch (err) {
      console.error('Error processing chart data:', err);
    }
  };
  
  // Calculate overall statistics from transaction data
  const calculateStats = (transactionData) => {
    if (!transactionData || transactionData.length === 0) {
      return;
    }
    
    try {
      // Calculate total spent (negative amounts)
      const totalSpent = transactionData.reduce((sum, tx) => 
        sum + (tx.amount < 0 ? Math.abs(tx.amount) : 0), 0);
      
      // Calculate total income (positive amounts)
      const totalIncome = transactionData.reduce((sum, tx) => 
        sum + (tx.amount > 0 ? tx.amount : 0), 0);
      
      // Calculate total rewards
      const totalRewards = transactionData.reduce((sum, tx) => {
        const rewardAmount = 
          tx.rewardsEarned || 
          tx.rewards || 
          (tx.rewards_info && tx.rewards_info.amount) || 
          (tx.amount < 0 ? Math.abs(tx.amount) * 0.01 : 0);
        
        return sum + (typeof rewardAmount === 'number' ? rewardAmount : 0);
      }, 0);
      
      // Calculate spending trend (comparison to previous period)
      // This would need more historical data for accurate calculation
      // For now, estimating based on available data
      let spendingTrend = 0;
      const halfwayPoint = Math.floor(transactionData.length / 2);
      
      if (transactionData.length > 1) {
        const recentSpending = transactionData
          .slice(0, halfwayPoint)
          .reduce((sum, tx) => sum + (tx.amount < 0 ? Math.abs(tx.amount) : 0), 0);
        
        const olderSpending = transactionData
          .slice(halfwayPoint)
          .reduce((sum, tx) => sum + (tx.amount < 0 ? Math.abs(tx.amount) : 0), 0);
        
        if (olderSpending > 0) {
          spendingTrend = ((recentSpending - olderSpending) / olderSpending) * 100;
        }
      }
      
      setStats({
        totalSpent,
        totalIncome,
        totalRewards,
        spendingTrend: parseFloat(spendingTrend.toFixed(1))
      });
    } catch (err) {
      console.error('Error calculating stats:', err);
    }
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
    fetchTransactionStats();
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchTransactions();
    fetchTransactionStats();
  }, []);
  
  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
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
        grid: {
          display: true,
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          callback: (value) => `$${value}`,
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
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        bodyFont: {
          size: 13
        },
        padding: 12,
        callbacks: {
          label: function(context) {
            return `${context.label}: $${context.raw}`;
          }
        }
      }
    }
  };
  
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        bodyFont: {
          size: 13
        },
        padding: 12,
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
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          callback: (value) => `$${value}`,
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };
  
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5 }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24,
        duration: 0.5
      }
    }
  };
  
  // Components for error and empty states
  const EmptyState = ({ message, icon }) => (
    <div className="h-full flex items-center justify-center">
      <motion.div 
        className="text-center text-gray-500 dark:text-gray-400 p-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {icon || <InformationCircleIcon className="h-10 w-10 mx-auto mb-3 text-gray-400" />}
        <p className="text-sm">{message}</p>
      </motion.div>
    </div>
  );
  
  const ErrorState = ({ message, onRetry }) => (
    <div className="h-full flex items-center justify-center">
      <motion.div 
        className="text-center text-gray-500 dark:text-gray-400 p-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ExclamationCircleIcon className="h-10 w-10 mx-auto mb-3 text-red-400" />
        <p className="text-sm mb-3">{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="text-xs px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors dark:bg-dark-700 dark:hover:bg-dark-600 dark:text-gray-300"
          >
            Try Again
          </button>
        )}
      </motion.div>
    </div>
  );
  
  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Render Stats Cards
  const renderStats = () => {
    const statItems = [
      {
        title: 'Monthly Savings',
        value: formatCurrency(stats.totalIncome - stats.totalSpent),
        change: `${stats.spendingTrend > 0 ? '+' : ''}${stats.spendingTrend}%`,
        trend: stats.spendingTrend >= 0 ? 'up' : 'down',
        icon: <BanknotesIcon className="h-6 w-6 text-blue-500" />,
        color: 'bg-blue-50 dark:bg-blue-900/30'
      },
      {
        title: 'Rewards Earned',
        value: formatCurrency(stats.totalRewards),
        change: '+12%',
        trend: 'up',
        icon: <SparklesIcon className="h-6 w-6 text-purple-500" />,
        color: 'bg-purple-50 dark:bg-purple-900/30'
      },
      {
        title: 'Optimized Purchases',
        value: `${Math.round(transactions.length * 0.75)}`,
        change: '+8%',
        trend: 'up',
        icon: <RocketLaunchIcon className="h-6 w-6 text-green-500" />,
        color: 'bg-green-50 dark:bg-green-900/30'
      },
      {
        title: 'Spend Protection',
        value: '97%',
        change: '+2%',
        trend: 'up',
        icon: <ShieldCheckIcon className="h-6 w-6 text-red-500" />,
        color: 'bg-red-50 dark:bg-red-900/30'
      }
    ];

    return (
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemAnimation}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className={`${stat.color} border border-gray-100 dark:border-dark-700 rounded-xl p-6 shadow-sm`}
          >
            <div className="flex items-center mb-4">
              <div className="bg-white dark:bg-dark-800 rounded-full p-2 mr-3 shadow-sm">
                {stat.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{stat.title}</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</p>
            <p className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {stat.change} from last month
            </p>
          </motion.div>
        ))}
      </motion.div>
    );
  };
  
  // Render Financial Insights Section
  const renderFinancialInsights = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          variants={itemAnimation}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="col-span-1 bg-white dark:bg-dark-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-dark-700"
        >
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center text-gray-800 dark:text-white">
                <ChartPieIcon className="h-5 w-5 mr-2 text-indigo-500" />
                Spending by Category
              </h3>
              <motion.button 
                onClick={handleRefresh}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                disabled={refreshing}
              >
                <ArrowPathIcon className={`h-4 w-4 text-gray-500 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
            
            <div className="h-64 flex items-center justify-center">
              {loading.stats ? (
                <LoadingSpinner className="text-indigo-500" />
              ) : error.stats ? (
                <ErrorState 
                  message="Failed to load category data" 
                  onRetry={handleRefresh}
                />
              ) : categoryData ? (
                <Doughnut data={categoryData} options={doughnutOptions} />
              ) : (
                <EmptyState message="No category data available" />
              )}
            </div>

            {categoryData && !loading.stats && !error.stats && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {categoryData.labels[0]} is your top expense category
                </p>
              </div>
            )}
          </div>
        </motion.div>
        
        <motion.div
          variants={itemAnimation}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="col-span-1 lg:col-span-2 bg-white dark:bg-dark-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-dark-700"
        >
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center text-gray-800 dark:text-white">
                <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-indigo-500" />
                Income vs. Expenses
              </h3>
              <motion.button 
                onClick={handleRefresh}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                disabled={refreshing}
              >
                <ArrowPathIcon className={`h-4 w-4 text-gray-500 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
            
            <div className="h-64">
              {loading.transactions ? (
                <div className="h-full flex items-center justify-center">
                  <LoadingSpinner className="text-indigo-500" />
                </div>
              ) : error.transactions ? (
                <ErrorState 
                  message="Failed to load transaction data" 
                  onRetry={handleRefresh}
                />
              ) : monthlySpendingData ? (
                <Line data={monthlySpendingData} options={lineChartOptions} />
              ) : (
                <EmptyState message="No spending data available" />
              )}
            </div>
            
            {monthlySpendingData && !loading.transactions && !error.transactions && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your savings rate is <span className="font-medium text-green-600 dark:text-green-400">
                    {Math.round((stats.totalIncome - stats.totalSpent) / (stats.totalIncome || 1) * 100)}%
                  </span>, better than 65% of users
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };
  
  // Render Rewards and Optimization
  const renderRewardsSection = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          variants={itemAnimation}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-white dark:bg-dark-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-dark-700"
        >
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center text-gray-800 dark:text-white">
                <SparklesIcon className="h-5 w-5 mr-2 text-indigo-500" />
                Cashback Earned
              </h3>
              <motion.button 
                onClick={handleRefresh}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                disabled={refreshing}
              >
                <ArrowPathIcon className={`h-4 w-4 text-gray-500 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
            
            <div className="h-64">
              {loading.transactions ? (
                <div className="h-full flex items-center justify-center">
                  <LoadingSpinner className="text-indigo-500" />
                </div>
              ) : error.transactions ? (
                <ErrorState 
                  message="Failed to load rewards data" 
                  onRetry={handleRefresh}
                />
              ) : rewardsData ? (
                <Bar data={rewardsData} options={barChartOptions} />
              ) : (
                <EmptyState message="No rewards data available" />
              )}
            </div>
            
            {rewardsData && !loading.transactions && !error.transactions && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You've earned <span className="font-medium text-purple-600 dark:text-purple-400">
                    {formatCurrency(stats.totalRewards)}
                  </span> in rewards over the past 6 months
                </p>
              </div>
            )}
          </div>
        </motion.div>
        
        <motion.div
          variants={itemAnimation}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl shadow-md overflow-hidden text-white"
        >
          <div className="p-5">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <RocketLaunchIcon className="h-5 w-5 mr-2" />
              Optimization Opportunities
            </h3>
            
            <div className="space-y-4">
              {cards && cards.length > 0 ? (
                <>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Shopping</span>
                      <span className="text-xs bg-purple-700 px-2 py-1 rounded">$38 potential savings</span>
                    </div>
                    <p className="text-sm text-purple-100">
                      Switch to {cards[0]?.cardName || 'your primary card'} for better rewards on online purchases
                    </p>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Dining</span>
                      <span className="text-xs bg-purple-700 px-2 py-1 rounded">$25 potential savings</span>
                    </div>
                    <p className="text-sm text-purple-100">
                      Use {cards[0]?.cardName || 'your rewards card'} for better rewards at restaurants
                    </p>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Travel</span>
                      <span className="text-xs bg-purple-700 px-2 py-1 rounded">$55 potential savings</span>
                    </div>
                    <p className="text-sm text-purple-100">
                      Switch to {cards[1]?.cardName || 'your travel card'} for 5x points on travel bookings
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <p className="text-sm text-purple-100 mb-4">
                    Connect your accounts or add cards to see optimization opportunities
                  </p>
                  <button 
                    onClick={() => navigate('/cards/add')}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    Add Cards
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };
  
  // Render Action Cards
  const renderActionCards = () => {
    const actionCards = [
      {
        title: 'Cards',
        description: 'Manage your cards and optimize rewards across merchants',
        icon: <CreditCardIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        btnColor: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 text-blue-600 dark:text-blue-400',
        action: () => navigate('/cards')
      },
      {
        title: 'Accounts',
        description: 'Connect bank accounts and manage financial institutions',
        icon: <BuildingOfficeIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        btnColor: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-800/40 text-purple-600 dark:text-purple-400',
        action: () => navigate('/accounts')
      },
      {
        title: 'Security',
        description: 'Review safety alerts and manage security settings',
        icon: <ShieldCheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />,
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        btnColor: 'bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-800/40 text-green-600 dark:text-green-400',
        action: () => navigate('/security')
      }
    ];

    return (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {actionCards.map((card, index) => (
          <motion.div
            key={card.title}
            variants={itemAnimation}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-center mb-4">
                <div className={`${card.bgColor} rounded-full p-2 mr-3`}>
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{card.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {card.description}
              </p>
              <button 
                onClick={card.action}
                className={`w-full ${card.btnColor} font-medium py-2 px-4 rounded-lg transition-colors`}
              >
                Manage {card.title}
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };
  
  // Animated Connect Account section for first visit or no accounts
  const renderConnectSection = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-8 text-white shadow-lg mb-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Connect Your Financial World</h2>
            <p className="text-indigo-100 mb-6">
              Link your bank accounts and credit cards to unlock powerful insights, optimize rewards, 
              and take control of your financial health.
            </p>
            <div className="flex flex-wrap gap-4">
              {linkToken ? (
                <div className="usePlaidLink">
                  <button
                    onClick={() => window.open(`https://cdn.plaid.com/link/v2/stable/link.html?token=${linkToken}`, 'Plaid Link', 'width=600,height=600')}
                    className="flex items-center bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                  >
                    <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                    Connect with Plaid
                  </button>
                </div>
              ) : (
                <button
                  onClick={generateLinkToken}
                  className="flex items-center bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                  disabled={loading.linkToken}
                >
                  {loading.linkToken ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                      Connect with Plaid
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => navigate('/cards/add')}
                className="flex items-center bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-800 transition-colors"
              >
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Add Cards Manually
              </button>
            </div>
          </div>
          <div className="hidden lg:flex lg:justify-center">
            <img 
              src="/api/placeholder/400/320" 
              alt="Connect finances" 
              className="max-h-56" 
            />
          </div>
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Animated Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white p-6 mb-6 shadow-lg"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.firstName || 'there'}!
            </h1>
            <p className="text-indigo-100">
              Your financial dashboard is looking great today. You've saved <span className="font-semibold">{formatCurrency(stats.totalIncome - stats.totalSpent)}</span> this month using FinGuard.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button 
              onClick={handleRefresh} 
              className="bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-800 transition-colors flex items-center"
              disabled={refreshing}
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* Conditional Connect Section */}
      {(!accounts || accounts.length === 0) && renderConnectSection()}
      
      {/* Stats Cards */}
      {renderStats()}
      
      {/* Financial Insights */}
      {renderFinancialInsights()}
      
      {/* Rewards and Optimization */}
      {renderRewardsSection()}
      
      {/* Action Cards */}
      {renderActionCards()}
    </div>
  );
};

export default Dashboard;