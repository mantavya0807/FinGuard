import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import { 
  ChartPieIcon, 
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const CategoryBreakdown = ({ data, loading, error, compact = false }) => {
  const [showDetails, setShowDetails] = useState(!compact);

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
          <p className="text-danger-600 dark:text-danger-400 mb-2">Failed to load category data</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.categories || data.categories.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center ${compact ? 'h-64' : 'h-96'} text-center`}>
        <ChartPieIcon className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No spending categories available</p>
      </div>
    );
  }

  // Category colors
  const categoryColors = {
    groceries: 'rgba(16, 185, 129, 0.8)', // green-500
    dining: 'rgba(239, 68, 68, 0.8)',     // red-500
    entertainment: 'rgba(236, 72, 153, 0.8)', // pink-500
    travel: 'rgba(59, 130, 246, 0.8)',    // blue-500
    shopping: 'rgba(139, 92, 246, 0.8)',  // purple-500
    transportation: 'rgba(245, 158, 11, 0.8)', // amber-500
    bills: 'rgba(75, 85, 99, 0.8)',       // gray-600
    healthcare: 'rgba(14, 165, 233, 0.8)', // sky-500
    other: 'rgba(156, 163, 175, 0.8)'     // gray-400
  };

  // Get default color for categories not in our mapping
  const getColorForCategory = (category) => {
    return categoryColors[category.toLowerCase()] || 'rgba(156, 163, 175, 0.8)';
  };

  // Chart data
  const chartData = {
    labels: data.categories.map(cat => cat.category),
    datasets: [
      {
        data: data.categories.map(cat => cat.totalAmount),
        backgroundColor: data.categories.map(cat => getColorForCategory(cat.category)),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        display: !compact && showDetails,
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
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: $${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${percentage}%)`;
          }
        }
      }
    }
  };

  const title = compact ? (
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Spending by Category</h3>
      <button 
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
      </button>
    </div>
  ) : (
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Spending by Category</h2>
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chart */}
          <div className={`${!compact && showDetails ? 'md:col-span-2' : 'md:col-span-3'} ${compact ? 'h-48' : 'h-64'}`}>
            <Doughnut data={chartData} options={chartOptions} />
          </div>
          
          {/* Categories List - only show in full view or if showDetails is true in compact view */}
          {(!compact || showDetails) && !compact && (
            <div className="md:col-span-1 overflow-y-auto max-h-64">
              <div className="space-y-2">
                {data.categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-dark-700">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getColorForCategory(category.category) }}></div>
                      <span className="text-gray-800 dark:text-gray-200 capitalize">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-900 dark:text-white font-medium">
                        ${category.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{category.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Insight - only show if compact and showDetails */}
        {compact && showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white capitalize">{data.categories[0]?.category || 'Unknown'}</span> is your highest spending category at 
              <span className="font-medium text-gray-900 dark:text-white"> ${data.categories[0]?.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CategoryBreakdown;