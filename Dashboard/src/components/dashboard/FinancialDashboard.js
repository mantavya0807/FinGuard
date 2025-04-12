import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  LineElement, 
  BarElement, 
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { 
  ArrowSmallUpIcon,
  ArrowSmallDownIcon,
  BanknotesIcon,
  ShoppingBagIcon,
  HomeIcon,
  TruckIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BoltIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  LineElement, 
  BarElement, 
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

const FinancialDashboard = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  
  // Spending trend data
  const spendingData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Expenses',
        data: [1800, 2200, 1950, 2400, 2100, 2300],
        borderColor: 'rgba(99, 102, 241, 1)', // primary-600
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(99, 102, 241, 1)',
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Income',
        data: [3200, 3200, 3400, 3400, 3600, 3600],
        borderColor: 'rgba(16, 185, 129, 1)', // success-600
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(16, 185, 129, 1)',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };
  
  // Category spending data
  const categoryData = {
    labels: [
      'Grocery',
      'Dining',
      'Shopping',
      'Travel',
      'Housing',
      'Transport',
      'Entertainment',
      'Utilities'
    ],
    datasets: [
      {
        data: [420, 350, 290, 180, 950, 240, 160, 210],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)', // Grocery - green
          'rgba(239, 68, 68, 0.8)',  // Dining - red
          'rgba(245, 158, 11, 0.8)', // Shopping - amber
          'rgba(99, 102, 241, 0.8)', // Travel - indigo
          'rgba(59, 130, 246, 0.8)', // Housing - blue
          'rgba(139, 92, 246, 0.8)', // Transport - purple
          'rgba(236, 72, 153, 0.8)', // Entertainment - pink
          'rgba(107, 114, 128, 0.8)' // Utilities - gray
        ],
        borderWidth: 1,
        borderColor: '#ffffff'
      }
    ]
  };
  
  // Rewards earned data
  const rewardsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Cashback',
        data: [25, 32, 28, 36, 40, 45],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 6
      },
      {
        label: 'Points',
        data: [18, 24, 22, 28, 30, 35],
        backgroundColor: 'rgba(139, 92, 246, 0.8)', 
        borderRadius: 6
      }
    ]
  };
  
  // Financial stats
  const stats = [
    {
      name: 'Monthly Income',
      value: '$3,600.00',
      change: '+5.25%',
      trend: 'up'
    },
    {
      name: 'Monthly Expenses',
      value: '$2,300.00',
      change: '+2.4%',
      trend: 'up'
    },
    {
      name: 'Savings Rate',
      value: '36.1%',
      change: '+1.5%',
      trend: 'up'
    },
    {
      name: 'Total Rewards',
      value: '$45.75',
      change: '+12.3%',
      trend: 'up'
    }
  ];
  
  // Budget progress
  const budgets = [
    {
      category: 'Dining',
      icon: <BanknotesIcon className="h-5 w-5 text-red-500" />,
      spent: 350,
      limit: 400,
      percentage: 87.5
    },
    {
      category: 'Groceries',
      icon: <ShoppingBagIcon className="h-5 w-5 text-green-500" />,
      spent: 420,
      limit: 500,
      percentage: 84
    },
    {
      category: 'Housing',
      icon: <HomeIcon className="h-5 w-5 text-blue-500" />,
      spent: 950,
      limit: 1000,
      percentage: 95
    },
    {
      category: 'Transport',
      icon: <TruckIcon className="h-5 w-5 text-purple-500" />,
      spent: 240,
      limit: 300,
      percentage: 80
    },
    {
      category: 'Entertainment',
      icon: <UserGroupIcon className="h-5 w-5 text-pink-500" />,
      spent: 160,
      limit: 200,
      percentage: 80
    },
    {
      category: 'Education',
      icon: <AcademicCapIcon className="h-5 w-5 text-yellow-500" />,
      spent: 75,
      limit: 100,
      percentage: 75
    },
    {
      category: 'Utilities',
      icon: <BoltIcon className="h-5 w-5 text-gray-500" />,
      spent: 210,
      limit: 250,
      percentage: 84
    },
    {
      category: 'Travel',
      icon: <GlobeAltIcon className="h-5 w-5 text-indigo-500" />,
      spent: 180,
      limit: 300,
      percentage: 60
    }
  ];
  
  // Chart options
  const spendingOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: {
          family: "'Inter', sans-serif",
          size: 13
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.raw.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(243, 244, 246, 0.6)', // gray-100
          drawBorder: false
        },
        ticks: {
          callback: (value) => `$${value}`,
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    elements: {
      line: {
        borderWidth: 2
      }
    }
  };
  
  const categoryOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          boxWidth: 15,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: {
          family: "'Inter', sans-serif",
          size: 13
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${context.label}: $${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%'
  };
  
  const rewardsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: {
          family: "'Inter', sans-serif",
          size: 13
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(243, 244, 246, 0.6)', // gray-100
          drawBorder: false
        },
        ticks: {
          callback: (value) => `$${value}`,
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        }
      }
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren", 
        staggerChildren: 0.1,
        duration: 0.3
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };
  
  // Render time range selector
  const renderTimeRangeSelector = () => {
    const ranges = [
      { id: 'week', label: 'This Week' },
      { id: 'month', label: 'This Month' },
      { id: 'quarter', label: 'Quarter' },
      { id: 'year', label: 'Year' },
      { id: 'all', label: 'All Time' }
    ];
    
    return (
      <div className="flex flex-wrap space-x-2 mb-6">
        {ranges.map(range => (
          <motion.button
            key={range.id}
            onClick={() => setTimeRange(range.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
              timeRange === range.id 
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-700 dark:text-gray-300 dark:hover:bg-dark-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {range.label}
          </motion.button>
        ))}
      </div>
    );
  };
  
  // Render stats cards
  const renderStats = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-md dark:bg-dark-800 animate-pulse">
              <div className="h-4 w-24 bg-gray-300 dark:bg-dark-600 rounded mb-3"></div>
              <div className="h-8 w-32 bg-gray-300 dark:bg-dark-600 rounded mb-2"></div>
              <div className="h-4 w-40 bg-gray-300 dark:bg-dark-600 rounded"></div>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {stats.map((stat, index) => (
          <motion.div 
            key={index} 
            className="bg-white rounded-xl p-6 shadow-md dark:bg-dark-800 hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-dark-700"
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1 dark:text-white">{stat.value}</p>
            <p className="flex items-center mt-2 text-sm">
              {stat.trend === 'up' ? (
                <ArrowSmallUpIcon className="h-4 w-4 text-success-500 mr-1" />
              ) : (
                <ArrowSmallDownIcon className="h-4 w-4 text-danger-500 mr-1" />
              )}
              <span className={`${
                stat.trend === 'up' ? 'text-success-600' : 'text-danger-600'
              }`}>
                {stat.change} from last {timeRange}
              </span>
            </p>
          </motion.div>
        ))}
      </motion.div>
    );
  };
  
  // Render charts
  const renderCharts = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-md h-80 animate-pulse dark:bg-dark-800">
              <div className="h-4 w-40 bg-gray-300 rounded mb-6 dark:bg-dark-600"></div>
              <div className="flex items-center justify-center h-64 bg-gray-200 rounded dark:bg-dark-700">
                <SparklesIcon className="h-12 w-12 text-gray-400 dark:text-dark-500" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
      >
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-md dark:bg-dark-800 border border-gray-100 dark:border-dark-700"
          variants={itemVariants}
        >
          <h3 className="font-medium text-gray-900 mb-4 text-lg dark:text-white">Income vs Expenses</h3>
          <div className="h-64">
            <Line data={spendingData} options={spendingOptions} />
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-md dark:bg-dark-800 border border-gray-100 dark:border-dark-700"
          variants={itemVariants}
        >
          <h3 className="font-medium text-gray-900 mb-4 text-lg dark:text-white">Spending by Category</h3>
          <div className="flex justify-center h-64">
            <Doughnut data={categoryData} options={categoryOptions} />
          </div>
        </motion.div>
      </motion.div>
    );
  };
  
  // Render rewards chart
  const renderRewardsChart = () => {
    if (isLoading) {
      return (
        <div className="bg-white rounded-xl p-6 shadow-md h-80 mb-6 animate-pulse dark:bg-dark-800">
          <div className="h-4 w-40 bg-gray-300 rounded mb-6 dark:bg-dark-600"></div>
          <div className="flex items-center justify-center h-64 bg-gray-200 rounded dark:bg-dark-700">
            <SparklesIcon className="h-12 w-12 text-gray-400 dark:text-dark-500" />
          </div>
        </div>
      );
    }
    
    return (
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-xl p-6 shadow-md mb-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700"
      >
        <h3 className="font-medium text-gray-900 mb-4 text-lg dark:text-white">Rewards Earned</h3>
        <div className="h-64">
          <Bar data={rewardsData} options={rewardsOptions} />
        </div>
      </motion.div>
    );
  };
  
  // Render budget progress
  const renderBudgetProgress = () => {
    if (isLoading) {
      return (
        <div className="bg-white rounded-xl p-6 shadow-md mb-6 animate-pulse dark:bg-dark-800">
          <div className="h-4 w-40 bg-gray-300 rounded mb-6 dark:bg-dark-600"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center p-3 border border-gray-100 rounded-lg dark:border-dark-700">
                <div className="h-10 w-10 bg-gray-300 rounded-lg mr-4 dark:bg-dark-600"></div>
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-300 rounded mb-3 dark:bg-dark-600"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-dark-700"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-xl p-6 shadow-md mb-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700"
      >
        <h3 className="font-medium text-gray-900 mb-4 text-lg dark:text-white">Budget Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget, index) => (
            <motion.div 
              key={index} 
              className="flex items-center p-3 border border-gray-100 rounded-lg dark:border-dark-700"
              whileHover={{ y: -2 }}
            >
              <div className="mr-4 bg-gray-100 p-2 rounded-lg dark:bg-dark-700">
                {budget.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{budget.category}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ${budget.spent} / ${budget.limit}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-dark-700">
                  <motion.div 
                    className={`h-2.5 rounded-full ${
                      budget.percentage >= 90 ? 'bg-danger-500' :
                      budget.percentage >= 75 ? 'bg-warning-500' :
                      'bg-success-500'
                    }`}
                    style={{ width: `${budget.percentage}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${budget.percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  ></motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="p-6">
      {renderTimeRangeSelector()}
      {renderStats()}
      {renderCharts()}
      {renderRewardsChart()}
      {renderBudgetProgress()}
    </div>
  );
};

export default FinancialDashboard;