import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  ExclamationCircleIcon
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
  const { accounts, linkToken, generateLinkToken, handlePlaidSuccess } = usePlaid();
  
  const [activeSection, setActiveSection] = useState('overview');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  // Loading and error states
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
  const [transactionData, setTransactionData] = useState([]);
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
  const fetchTransactionData = async () => {
    setLoading(prev => ({ ...prev, transactions: true }));
    setError(prev => ({ ...prev, transactions: null }));
    
    try {
      // Get transactions for the last 6 months
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      
      // API call to get transactions
      const transactions = await api.get(`/transactions?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
      
      setTransactionData(transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(prev => ({ 
        ...prev, 
        transactions: 'Failed to load transaction data' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };
  
  // Fetch transaction statistics
  const fetchTransactionStats = async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    setError(prev => ({ ...prev, stats: null }));
    
    try {
      // Get transaction statistics 
      const statsResponse = await api.get('/transactions/stats/summary');
      
      if (statsResponse && statsResponse.totalStats) {
        // Set overall stats
        setStats({
          totalSpent: statsResponse.totalStats.totalSpent || 0,
          totalIncome: statsResponse.totalStats.totalIncome || 0,
          totalRewards: transactionData.reduce((acc, tx) => acc + (tx.rewardsEarned || 0), 0),
          spendingTrend: 4.3 // This would ideally be calculated
        });
        
        // Process category data for pie chart
        if (statsResponse.categories && statsResponse.categories.length > 0) {
          const categoryChartData = {
            labels: statsResponse.categories.map(cat => cat._id),
            datasets: [
              {
                data: statsResponse.categories.map(cat => Math.abs(cat.total)),
                backgroundColor: [
                  'rgba(239, 68, 68, 0.8)',
                  'rgba(245, 158, 11, 0.8)',
                  'rgba(99, 102, 241, 0.8)',
                  'rgba(16, 185, 129, 0.8)',
                  'rgba(139, 92, 246, 0.8)',
                  'rgba(236, 72, 153, 0.8)'
                ],
                borderWidth: 1,
                borderColor: '#fff',
              }
            ]
          };
          setCategoryData(categoryChartData);
        }
      }
    } catch (err) {
      console.error('Error fetching transaction stats:', err);
      setError(prev => ({ 
        ...prev, 
        stats: 'Failed to load statistics' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
      setRefreshing(false);
    }
  };
  
  // Process transaction data for charts
  const processTransactionData = () => {
    if (!transactionData || transactionData.length === 0) {
      return;
    }
    
    try {
      // Group transactions by month for the monthly spending/income chart
      const monthlyData = {};
      const rewardsMonthlyData = {};
      
      // Get the last 6 months
      const months = [];
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        months.unshift(monthKey);
        monthlyData[monthKey] = { expenses: 0, income: 0 };
        rewardsMonthlyData[monthKey] = 0;
      }
      
      // Process each transaction
      transactionData.forEach(tx => {
        const date = new Date(tx.date);
        const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        // Only process if it's within our chart range
        if (monthlyData[monthKey]) {
          if (tx.amount < 0) {
            monthlyData[monthKey].expenses += Math.abs(tx.amount);
          } else {
            monthlyData[monthKey].income += tx.amount;
          }
          
          // Add rewards
          if (tx.rewardsEarned) {
            rewardsMonthlyData[monthKey] += tx.rewardsEarned;
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
            pointHoverRadius: 6
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
            pointHoverRadius: 6
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
            borderRadius: 6,
          }
        ]
      };
      
      setMonthlySpendingData(lineChartData);
      setRewardsData(barChartData);
    } catch (err) {
      console.error('Error processing transaction data for charts:', err);
    }
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshing(true);
    fetchTransactionData();
    fetchTransactionStats();
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchTransactionData();
    fetchTransactionStats();
  }, []);
  
  // Process data for charts when transaction data changes
  useEffect(() => {
    processTransactionData();
  }, [transactionData]);
  
  // Chart options
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
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
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
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
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
  
  
  
  // Stats
  const renderStats = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-blue-50 border border-gray-100 dark:border-dark-700 dark:bg-blue-900/30 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center mb-4">
            <div className="bg-white dark:bg-dark-800 rounded-full p-2 mr-3 shadow-sm">
              <BanknotesIcon className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Monthly Savings</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ${(stats.totalIncome - stats.totalSpent).toFixed(2)}
          </p>
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            +{stats.spendingTrend}% from last month
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-purple-50 border border-gray-100 dark:border-dark-700 dark:bg-purple-900/30 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center mb-4">
            <div className="bg-white dark:bg-dark-800 rounded-full p-2 mr-3 shadow-sm">
              <SparklesIcon className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Rewards Earned</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">${stats.totalRewards.toFixed(2)}</p>
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            +12% from last month
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-green-50 border border-gray-100 dark:border-dark-700 dark:bg-green-900/30 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center mb-4">
            <div className="bg-white dark:bg-dark-800 rounded-full p-2 mr-3 shadow-sm">
              <RocketLaunchIcon className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Optimized Purchases</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {Math.round(transactionData.length * 0.75)}
          </p>
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            +8% from last month
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-red-50 border border-gray-100 dark:border-dark-700 dark:bg-red-900/30 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center mb-4">
            <div className="bg-white dark:bg-dark-800 rounded-full p-2 mr-3 shadow-sm">
              <ShieldCheckIcon className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Spend Protection</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">97%</p>
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            +2% from last month
          </p>
        </motion.div>
      </div>
    );
  };
  
  // Render Financial Insights Section
  const renderFinancialInsights = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="col-span-1 bg-white dark:bg-dark-800 rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <ChartPieIcon className="h-5 w-5 mr-2 text-indigo-500" />
                Spending by Category
              </h3>
              {loading.stats ? (
                <LoadingSpinner size="h-5 w-5" />
              ) : (
                <button 
                  onClick={handleRefresh}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700"
                >
                  <ArrowPathIcon className={`h-4 w-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
            <div className="h-64 flex items-center justify-center">
              {loading.stats ? (
                <LoadingSpinner />
              ) : error.stats ? (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <ExclamationCircleIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Failed to load category data</p>
                </div>
              ) : categoryData ? (
                <Doughnut data={categoryData} options={doughnutOptions} />
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No category data available</p>
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {categoryData?.labels?.[0] || 'Shopping'} is your top expense this month
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="col-span-1 lg:col-span-2 bg-white dark:bg-dark-800 rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-indigo-500" />
                Income vs. Expenses
              </h3>
              {loading.transactions ? (
                <LoadingSpinner size="h-5 w-5" />
              ) : (
                <button 
                  onClick={handleRefresh}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700"
                >
                  <ArrowPathIcon className={`h-4 w-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
            <div className="h-64">
              {loading.transactions ? (
                <div className="h-full flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : error.transactions ? (
                <div className="h-full flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
                  <div>
                    <ExclamationCircleIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Failed to load transaction data</p>
                  </div>
                </div>
              ) : monthlySpendingData ? (
                <Line data={monthlySpendingData} options={lineChartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No spending data available</p>
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your savings rate is {Math.round((stats.totalIncome - stats.totalSpent) / stats.totalIncome * 100)}%, better than 65% of users
              </p>
            </div>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-dark-800 rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-indigo-500" />
                Cashback Earned
              </h3>
              {loading.transactions ? (
                <LoadingSpinner size="h-5 w-5" />
              ) : (
                <button 
                  onClick={handleRefresh}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700"
                >
                  <ArrowPathIcon className={`h-4 w-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
            <div className="h-64">
              {loading.transactions ? (
                <div className="h-full flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : error.transactions ? (
                <div className="h-full flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
                  <div>
                    <ExclamationCircleIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Failed to load rewards data</p>
                  </div>
                </div>
              ) : rewardsData ? (
                <Bar data={rewardsData} options={barChartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No rewards data available</p>
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You've earned ${stats.totalRewards.toFixed(2)} in rewards this month - your best month yet!
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-md overflow-hidden text-white"
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
                      <span className="text-sm bg-purple-700 px-2 py-1 rounded">$38 potential savings</span>
                    </div>
                    <p className="text-sm text-purple-100">
                      Switch to {cards[0]?.cardName || 'your primary card'} for better rewards on Amazon purchases
                    </p>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Dining</span>
                      <span className="text-sm bg-purple-700 px-2 py-1 rounded">$25 potential savings</span>
                    </div>
                    <p className="text-sm text-purple-100">
                      Use {cards[0]?.cardName || 'your primary card'} for better rewards at restaurants
                    </p>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Travel</span>
                      <span className="text-sm bg-purple-700 px-2 py-1 rounded">$55 potential savings</span>
                    </div>
                    <p className="text-sm text-purple-100">
                      Switch to {cards[1]?.cardName || 'your travel card'} for 5x points on travel bookings
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <p className="text-sm text-purple-100">
                    Connect your accounts or add cards to see optimization opportunities
                  </p>
                  <button 
                    onClick={() => navigate('/cards/add')}
                    className="mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium"
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
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 rounded-xl shadow-md overflow-hidden">
          <div className="p-5">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 mr-3">
                <CreditCardIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cards</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Manage your cards and optimize rewards across merchants
            </p>
            <button 
              onClick={() => navigate('/cards')}
              className="w-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 text-blue-600 dark:text-blue-400 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Manage Cards
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 rounded-xl shadow-md overflow-hidden">
          <div className="p-5">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-2 mr-3">
                <BuildingOfficeIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Accounts</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Connect bank accounts and manage financial institutions
            </p>
            <button 
              onClick={() => navigate('/accounts')}
              className="w-full bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-800/40 text-purple-600 dark:text-purple-400 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Connect Accounts
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 rounded-xl shadow-md overflow-hidden">
          <div className="p-5">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2 mr-3">
                <ShieldCheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Review safety alerts and manage security settings
            </p>
            <button 
              onClick={() => navigate('/security')}
              className="w-full bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-800/40 text-green-600 dark:text-green-400 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Security Center
            </button>
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
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 shadow-lg"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.firstName || 'there'}!
            </h1>
            <p className="text-indigo-100">
              Your financial dashboard is looking great today. You've saved <span className="font-semibold">${(stats.totalIncome - stats.totalSpent).toFixed(2)}</span> this month using FinGuard.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button 
              onClick={() => setActiveSection('insights')}
              className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
            >
              View Insights
            </button>
            <button 
              onClick={() => navigate('/accounts')}
              className="bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-800 transition-colors"
            >
              Connect Accounts
            </button>
          </div>
        </div>
      </motion.div>
      

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