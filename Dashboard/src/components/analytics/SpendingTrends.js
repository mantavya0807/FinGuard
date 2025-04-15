import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';
import { 
  CurrencyDollarIcon, 
  ArrowSmallUpIcon, 
  ArrowSmallDownIcon,
  ArrowPathIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const SpendingTrends = ({ data, loading, error, compact = false }) => {
  const [period, setPeriod] = useState('monthly');
  const [months, setMonths] = useState(6);
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
          <p className="text-danger-600 dark:text-danger-400 mb-2">Failed to load spending trends</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.trends || data.trends.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center ${compact ? 'h-64' : 'h-96'} text-center`}>
        <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No spending trends available</p>
      </div>
    );
  }

  const formatLabels = (period) => {
    return data.trends.map(item => {
      let date;
      if (period === 'weekly') {
        // Format weekly label (e.g. "2023-W12" to "Week 12")
        const parts = item.period.split('-W');
        return `Week ${parts[1]}`;
      } else if (period === 'daily') {
        // Format daily label
        date = parseISO(item.period);
        return format(date, 'MMM d');
      } else {
        // Format monthly label
        date = parseISO(`${item.period}-01`);
        return format(date, 'MMM yyyy');
      }
    });
  };

  // Chart data
  const chartData = {
    labels: formatLabels(period),
    datasets: [
      {
        label: 'Spending',
        data: data.trends.map(item => item.spending),
        borderColor: 'rgba(239, 68, 68, 0.8)',  // red-500
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(239, 68, 68, 1)',
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Income',
        data: data.trends.map(item => item.income),
        borderColor: 'rgba(16, 185, 129, 0.8)',  // green-500
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  // Chart options
  const chartOptions = {
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
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
          callback: (value) => `$${value.toLocaleString('en-US')}`,
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

  // Calculate trends
  const totalSpending = data.totalSpending || 0;
  const totalIncome = data.totalIncome || 0;
  const netFlow = data.netFlow || 0;

  const title = compact ? (
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Spending Trends</h3>
      <button 
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
      </button>
    </div>
  ) : (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Spending Trends</h2>
      
      <div className="flex space-x-2 mt-2 md:mt-0">
        {/* Period selector */}
        <select 
          className="input-field text-sm py-1"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="daily">Daily</option>
        </select>
        
        {/* Time range selector */}
        <select 
          className="input-field text-sm py-1"
          value={months}
          onChange={(e) => setMonths(parseInt(e.target.value))}
        >
          <option value="3">Last 3 months</option>
          <option value="6">Last 6 months</option>
          <option value="12">Last 12 months</option>
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
        
        {/* Summary Cards */}
        {(!compact || showDetails) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Spending Card */}
            <motion.div 
              className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-100 dark:border-red-900/30"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm text-red-800 dark:text-red-300 mb-1">Total Spending</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${totalSpending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center text-xs mt-2 text-red-600 dark:text-red-400">
                <ArrowSmallUpIcon className="h-4 w-4 mr-1" />
                <span>12.5% from last period</span>
              </div>
            </motion.div>
            
            {/* Income Card */}
            <motion.div 
              className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-900/30"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm text-green-800 dark:text-green-300 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center text-xs mt-2 text-green-600 dark:text-green-400">
                <ArrowSmallUpIcon className="h-4 w-4 mr-1" />
                <span>3.2% from last period</span>
              </div>
            </motion.div>
            
            {/* Net Flow Card */}
            <motion.div 
              className={`${
                netFlow >= 0 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30 text-blue-800 dark:text-blue-300' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 text-red-800 dark:text-red-300'
              } rounded-lg p-4 border`}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm mb-1">Net Flow</p>
              <p className={`text-2xl font-bold ${
                netFlow >= 0 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                ${netFlow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className={`flex items-center text-xs mt-2 ${
                netFlow >= 0 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {netFlow >= 0 ? (
                  <>
                    <ArrowSmallUpIcon className="h-4 w-4 mr-1" />
                    <span>Saving {((netFlow / totalIncome) * 100).toFixed(1)}% of income</span>
                  </>
                ) : (
                  <>
                    <ArrowSmallDownIcon className="h-4 w-4 mr-1" />
                    <span>Deficit of {((Math.abs(netFlow) / totalIncome) * 100).toFixed(1)}% of income</span>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Chart */}
        <div className={compact ? 'h-48' : 'h-72'}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </motion.div>
  );
};

export default SpendingTrends;