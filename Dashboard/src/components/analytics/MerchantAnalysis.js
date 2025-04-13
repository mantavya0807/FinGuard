import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';
import { 
  ShoppingBagIcon, 
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const MerchantAnalysis = ({ data, loading, error, compact = false }) => {
  const [showDetails, setShowDetails] = useState(!compact);
  const [merchantLimit, setMerchantLimit] = useState(compact ? 5 : 10);
  
  if (loading) {
    return (
      <div className={`flex items-center justify-center ${compact ? 'h-64' : 'h-96'}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${compact ? 'h-64' : 'h-96'} text-center`}>
        <div>
          <p className="text-danger-600 dark:text-danger-400 mb-2">Failed to load merchant analysis</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.merchants || data.merchants.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center ${compact ? 'h-64' : 'h-96'} text-center`}>
        <ShoppingBagIcon className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No merchant data available</p>
      </div>
    );
  }
  
  // Limit merchants for display
  const topMerchants = data.merchants.slice(0, merchantLimit);
  
  // Format dates
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  // Chart data for bar chart
  const barChartData = {
    labels: topMerchants.map(m => m.merchantName),
    datasets: [
      {
        label: 'Amount Spent ($)',
        data: topMerchants.map(m => m.totalSpent),
        backgroundColor: 'rgba(99, 102, 241, 0.8)', // indigo-500
        borderRadius: 6,
        barThickness: compact ? 12 : 24
      }
    ]
  };

  // Chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        bodyFont: {
          size: 13
        },
        padding: 12,
        callbacks: {
          label: function(context) {
            return `Amount: $${context.raw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          },
          afterLabel: function(context) {
            const merchant = topMerchants[context.dataIndex];
            return `Transactions: ${merchant.transactionCount}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          callback: (value) => `$${value.toLocaleString('en-US')}`,
        },
        beginAtZero: true
      }
    }
  };

  const title = compact ? (
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Merchants</h3>
      <button 
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
      </button>
    </div>
  ) : (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Merchant Analysis</h2>
      <div className="flex mt-2 md:mt-0">
        <select 
          className="input-field text-sm py-1"
          value={merchantLimit}
          onChange={(e) => setMerchantLimit(parseInt(e.target.value))}
        >
          <option value="5">Top 5 Merchants</option>
          <option value="10">Top 10 Merchants</option>
          <option value="15">Top 15 Merchants</option>
        </select>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={compact ? 'bg-white dark:bg-dark-800 rounded-xl shadow-md overflow-hidden h-full' : ''}
    >
      <div className={compact ? 'p-4' : ''}>
        {title}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className={`${compact ? 'h-48' : 'h-80'} ${compact && !showDetails ? 'lg:col-span-2' : ''}`}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
          
          {/* Merchant Details */}
          {(!compact || showDetails) && (
            <div className={`${compact ? 'max-h-48' : 'max-h-80'} overflow-y-auto`}>
              <div className="space-y-4">
                {topMerchants.map((merchant, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{merchant.merchantName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {merchant.transactionCount} transaction{merchant.transactionCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">
                          ${merchant.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Last: {formatDate(merchant.lastTransaction)}
                        </p>
                      </div>
                    </div>
                    {/* Categories */}
                    {merchant.categories && merchant.categories.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {merchant.categories.map((category, catIndex) => (
                          <span 
                            key={catIndex} 
                            className="px-2 py-0.5 bg-gray-200 text-gray-800 text-xs rounded-full dark:bg-dark-600 dark:text-gray-300"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Additional insight for compact mode */}
        {compact && showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your top merchant <span className="font-medium text-gray-900 dark:text-white">{topMerchants[0]?.merchantName}</span> accounts for 
              <span className="font-medium text-gray-900 dark:text-white"> ${topMerchants[0]?.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> in spending
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MerchantAnalysis;