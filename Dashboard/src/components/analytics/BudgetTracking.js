import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowSmallUpIcon, ArrowSmallDownIcon } from '@heroicons/react/24/solid';

const BudgetCard = ({ title, spent, budget, icon, color, progress }) => {
  const [hovered, setHovered] = useState(false);
  
  const percentage = Math.min(100, Math.round((spent / budget) * 100));
  
  // Determine status color
  let statusColor = 'bg-success-500';
  let textColor = 'text-success-700';
  let lightBg = 'bg-success-50';
  
  if (percentage >= 90) {
    statusColor = 'bg-danger-500';
    textColor = 'text-danger-700';
    lightBg = 'bg-danger-50';
  } else if (percentage >= 75) {
    statusColor = 'bg-warning-500';
    textColor = 'text-warning-700';
    lightBg = 'bg-warning-50';
  }
  
  // Amount left to spend
  const remaining = budget - spent;
  const isOverBudget = remaining < 0;
  
  return (
    <motion.div
      className={`rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-dark-700 ${lightBg} dark:bg-dark-800`}
      whileHover={{ y: -5, scale: 1.02 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="p-5">
        <div className="flex items-center mb-3">
          <div className={`p-2 rounded-lg ${color} mr-3`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            <div className={`text-sm ${textColor} dark:text-gray-300 font-medium`}>
              {percentage}% of budget used
            </div>
          </div>
        </div>
        
        <div className="relative pt-1 mb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs font-semibold inline-block text-gray-600 dark:text-gray-400">
              ${spent.toLocaleString()}
            </div>
            <div className="text-xs font-semibold inline-block text-gray-600 dark:text-gray-400">
              ${budget.toLocaleString()}
            </div>
          </div>
          <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200 dark:bg-dark-700">
            <motion.div
              className={`${statusColor} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
        
        <motion.div
          className="flex justify-between items-center"
          animate={{ height: hovered ? 'auto' : '24px' }}
        >
          <div className="flex items-center font-medium text-sm">
            {isOverBudget ? (
              <>
                <ArrowSmallUpIcon className="h-4 w-4 text-danger-500 mr-1" />
                <span className="text-danger-700 dark:text-danger-400">
                  ${Math.abs(remaining).toLocaleString()} over budget
                </span>
              </>
            ) : (
              <>
                <ArrowSmallDownIcon className="h-4 w-4 text-success-500 mr-1" />
                <span className="text-success-700 dark:text-success-400">
                  ${remaining.toLocaleString()} remaining
                </span>
              </>
            )}
          </div>
          
          {hovered && (
            <motion.button
              className="text-xs px-2 py-1 bg-white rounded-full shadow-sm border border-gray-200 text-primary-600 dark:bg-dark-700 dark:border-dark-600 dark:text-primary-400"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Adjust Budget
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// Usage example
export default function BudgetCardsGrid() {
  const budgets = [
    { 
      title: 'Groceries', 
      spent: 420, 
      budget: 500, 
      icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>,
      color: 'bg-green-500'
    },
    { 
      title: 'Dining Out', 
      spent: 350, 
      budget: 400, 
      icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>,
      color: 'bg-red-500'
    },
    { 
      title: 'Entertainment', 
      spent: 160, 
      budget: 200, 
      icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>,
      color: 'bg-purple-500'
    },
    { 
      title: 'Housing', 
      spent: 950, 
      budget: 1000, 
      icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>,
      color: 'bg-blue-500'
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Budget Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {budgets.map((budget, index) => (
          <BudgetCard 
            key={index}
            title={budget.title}
            spent={budget.spent}
            budget={budget.budget}
            icon={budget.icon}
            color={budget.color}
          />
        ))}
      </div>
    </div>
  );
}