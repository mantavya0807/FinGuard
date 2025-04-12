import React from 'react';
import { motion } from 'framer-motion';

const AnalyticsScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto"
    >
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl text-white p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">Financial Analytics</h1>
        <p className="text-primary-100">
          Gain deeper insights into your spending patterns and financial health
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-8 text-center dark:bg-dark-800">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center dark:bg-primary-900/30">
            <svg className="w-8 h-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-3 dark:text-white">Advanced Analytics Coming Soon</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-6 dark:text-gray-400">
          We're building powerful analytics tools to help you understand your spending patterns, optimize rewards, and improve your financial health.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border border-gray-200 rounded-lg p-4 dark:border-dark-700">
            <h3 className="font-medium text-gray-900 mb-2 dark:text-white">Spending Trends</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Visualize your spending patterns over time</p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 dark:border-dark-700">
            <h3 className="font-medium text-gray-900 mb-2 dark:text-white">Category Analysis</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">See where your money goes each month</p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 dark:border-dark-700">
            <h3 className="font-medium text-gray-900 mb-2 dark:text-white">Rewards Optimization</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Learn how to maximize credit card rewards</p>
          </div>
        </div>
        
        <button 
          className="btn btn-primary px-6 py-2"
          disabled
        >
          Coming Soon
        </button>
      </div>
    </motion.div>
  );
};

export default AnalyticsScreen;