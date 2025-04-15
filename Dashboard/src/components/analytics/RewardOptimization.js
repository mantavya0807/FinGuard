import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  CreditCardIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const RewardOptimization = ({ data, loading, error, compact = false }) => {
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
          <p className="text-danger-600 dark:text-danger-400 mb-2">Failed to load rewards optimization</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.optimizations || data.optimizations.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center ${compact ? 'h-64' : 'h-96'} text-center`}>
        <SparklesIcon className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No rewards optimization available</p>
      </div>
    );
  }
  
  // Card colors by type (simplified for demo)
  const cardColors = {
    'VISA': 'bg-blue-600',
    'MASTERCARD': 'bg-red-600',
    'AMEX': 'bg-blue-800',
    'DISCOVER': 'bg-orange-600'
  };

  const title = compact ? (
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rewards Optimization</h3>
      <button 
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
      </button>
    </div>
  ) : (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Rewards Optimization</h2>
      <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center mt-2 md:mt-0">
        <SparklesIcon className="h-5 w-5 mr-2" />
        Potential Annual Rewards: ${data.potentialAnnualRewards?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
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
        
        {compact && !showDetails ? (
          // Simplified view for compact mode
          <div className="mt-2">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Top Category:</p>
                  <p className="text-lg font-bold capitalize">{data.optimizations[0]?.category || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Best Card:</p>
                  <p>{data.optimizations[0]?.bestCard?.cardName || 'N/A'}</p>
                </div>
              </div>
              <div className="mt-2 text-sm opacity-90 text-center">
                Use optimal cards to earn up to ${data.potentialAnnualRewards?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} per year
              </div>
            </div>
          </div>
        ) : (
          // Detailed view
          <div className="space-y-4">
            {data.optimizations.map((optimization, index) => (
              <motion.div 
                key={index}
                className="border border-gray-200 dark:border-dark-700 rounded-lg overflow-hidden"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex border-b border-gray-200 dark:border-dark-700">
                  {/* Category spending */}
                  <div className="p-4 flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{optimization.category}</p>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">${optimization.monthlySpending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} monthly</p>
                  </div>
                  
                  {/* Reward rate */}
                  <div className="p-4 bg-gray-50 dark:bg-dark-700 flex items-center">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Reward Rate</p>
                      <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">{optimization.rewardRate}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${optimization.potentialMonthlyRewards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} potential rewards
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Best Card */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 ${cardColors[optimization.bestCard?.cardType] || 'bg-gray-500'} text-white rounded-lg flex items-center justify-center mr-3`}>
                      <CreditCardIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Best Card</p>
                      <p className="font-medium text-gray-900 dark:text-white">{optimization.bestCard?.cardName || 'N/A'}</p>
                    </div>
                  </div>
                  {!compact && (
                    <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50">
                      Use Card
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Additional insight for compact view when details are shown */}
        {compact && showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on your spending patterns, you could earn up to <span className="font-medium text-purple-600 dark:text-purple-400">${data.potentialAnnualRewards?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span> in annual rewards
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RewardOptimization;