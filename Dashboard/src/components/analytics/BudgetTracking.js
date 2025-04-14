import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowSmallUpIcon, 
  ArrowSmallDownIcon, 
  PlusIcon, 
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  ChartBarIcon
} from '@heroicons/react/24/solid';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

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
      className={`rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-dark-700 ${lightBg} dark:bg-dark-800 h-full`}
      whileHover={{ y: -4, scale: 1.01 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="p-4">
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

const BudgetTracking = ({ data, loading, error, onRefresh, compact = false }) => {
  const [viewMode, setViewMode] = useState(compact ? 'grid' : 'grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [timeframe, setTimeframe] = useState('month');
  
  // Use real data if available, otherwise use sample data
  const budgets = data?.budgets || [
    { 
      id: 1,
      title: 'Groceries', 
      spent: 420, 
      budget: 500, 
      icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>,
      color: 'bg-green-500',
      category: 'essentials'
    },
    { 
      id: 2,
      title: 'Dining Out', 
      spent: 350, 
      budget: 400, 
      icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>,
      color: 'bg-red-500',
      category: 'discretionary'
    },
    { 
      id: 3,
      title: 'Entertainment', 
      spent: 160, 
      budget: 200, 
      icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>,
      color: 'bg-purple-500',
      category: 'discretionary'
    },
    { 
      id: 4,
      title: 'Housing', 
      spent: 950, 
      budget: 1000, 
      icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>,
      color: 'bg-blue-500',
      category: 'housing'
    },
    { 
      id: 5,
      title: 'Transportation', 
      spent: 320, 
      budget: 400, 
      icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>,
      color: 'bg-yellow-500',
      category: 'transportation'
    },
    { 
      id: 6,
      title: 'Healthcare', 
      spent: 180, 
      budget: 300, 
      icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>,
      color: 'bg-pink-500',
      category: 'healthcare'
    }
  ];
  
  // Calculate summary statistics
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.budget, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = Math.round((totalSpent / totalBudget) * 100);
  
  const timeframeOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];
  
  if (loading) {
    return (
      <div className={`flex items-center justify-center ${compact ? 'h-64' : 'min-h-[400px]'}`}>
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center ${compact ? 'h-64' : 'min-h-[400px]'} text-center`}>
        <div className="bg-danger-50 dark:bg-danger-900/20 p-4 rounded-lg max-w-md text-danger-600 dark:text-danger-400">
          <p className="font-medium mb-1">Error loading budget data</p>
          <p className="text-sm">{error}</p>
          {onRefresh && (
            <button 
              className="mt-3 btn-primary py-1 px-3 text-sm rounded inline-flex items-center"
              onClick={onRefresh}
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }
  
  const renderHeader = () => {
    if (compact) {
      return (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 mr-2 text-primary-600" />
            Budget Tracking
          </h3>
          <div className="flex items-center space-x-2">
            <select
              className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-dark-700 dark:border-dark-600 dark:text-white"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              {timeframeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <CurrencyDollarIcon className="h-6 w-6 mr-2 text-primary-600" />
            Budget Tracking
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage your spending by category
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <select
            className="border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-dark-700 dark:border-dark-600 dark:text-white"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            {timeframeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <div className="flex items-center">
            <button
              className="border border-gray-300 rounded-l-md p-2 text-gray-600 hover:bg-gray-100 dark:border-dark-600 dark:text-gray-300 dark:hover:bg-dark-700"
              onClick={() => setViewMode('grid')}
            >
              <svg className={`h-5 w-5 ${viewMode === 'grid' ? 'text-primary-600 dark:text-primary-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              className="border border-gray-300 border-l-0 rounded-r-md p-2 text-gray-600 hover:bg-gray-100 dark:border-dark-600 dark:text-gray-300 dark:hover:bg-dark-700"
              onClick={() => setViewMode('list')}
            >
              <svg className={`h-5 w-5 ${viewMode === 'list' ? 'text-primary-600 dark:text-primary-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          <button
            className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white rounded-md px-3 py-2 text-sm font-medium transition-colors"
            onClick={() => setShowAddModal(true)}
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Add Budget
          </button>
        </div>
      </div>
    );
  };
  
  const renderSummary = () => {
    if (compact) return null;
    
    return (
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-dark-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Budget</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">${totalBudget.toLocaleString()}</p>
        </div>
        
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-dark-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Spent</p>
          <p className="text-2xl font-semibold text-danger-600 dark:text-danger-400">${totalSpent.toLocaleString()}</p>
        </div>
        
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-dark-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Remaining</p>
          <p className="text-2xl font-semibold text-success-600 dark:text-success-400">${totalRemaining.toLocaleString()}</p>
        </div>
        
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-dark-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Overall Progress</p>
          <div className="flex items-center">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white mr-2">{overallPercentage}%</p>
            <div className="flex-grow h-2 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  overallPercentage >= 90 ? 'bg-danger-500' : 
                  overallPercentage >= 75 ? 'bg-warning-500' : 
                  'bg-success-500'
                }`}
                style={{ width: `${overallPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderCompactView = () => {
    return (
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium">
            <span className="text-gray-500 dark:text-gray-400">Total: </span>
            <span className="text-gray-900 dark:text-white">${totalBudget.toLocaleString()}</span>
            <span className="mx-2 text-gray-400">|</span>
            <span className="text-gray-500 dark:text-gray-400">Spent: </span>
            <span className={`${totalRemaining >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
              ${totalSpent.toLocaleString()} ({overallPercentage}%)
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {budgets.slice(0, 4).map(budget => (
            <BudgetCard 
              key={budget.id}
              title={budget.title}
              spent={budget.spent}
              budget={budget.budget}
              icon={budget.icon}
              color={budget.color}
            />
          ))}
        </div>
        
        {budgets.length > 4 && (
          <div className="mt-3 text-center">
            <button className="text-primary-600 dark:text-primary-400 text-sm font-medium">
              View all {budgets.length} budget categories →
            </button>
          </div>
        )}
      </div>
    );
  };
  
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map(budget => (
          <BudgetCard 
            key={budget.id}
            title={budget.title}
            spent={budget.spent}
            budget={budget.budget}
            icon={budget.icon}
            color={budget.color}
          />
        ))}
        
        {!compact && (
          <motion.div 
            className="rounded-xl border border-dashed border-gray-300 dark:border-dark-600 flex items-center justify-center cursor-pointer h-full min-h-[160px]"
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowAddModal(true)}
          >
            <div className="text-center p-6">
              <div className="mx-auto bg-gray-100 dark:bg-dark-700 rounded-full h-12 w-12 flex items-center justify-center mb-2">
                <PlusIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium">Add New Budget</p>
            </div>
          </motion.div>
        )}
      </div>
    );
  };
  
  const renderListView = () => {
    if (compact) return renderGridView();
    
    return (
      <div className="bg-white dark:bg-dark-800 rounded-lg overflow-hidden border border-gray-200 dark:border-dark-700 divide-y divide-gray-200 dark:divide-dark-700">
        <div className="px-6 py-3 bg-gray-50 dark:bg-dark-700 grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          <div className="col-span-4">Category</div>
          <div className="col-span-2 text-right">Budget</div>
          <div className="col-span-2 text-right">Spent</div>
          <div className="col-span-2 text-right">Remaining</div>
          <div className="col-span-2">Status</div>
        </div>
        
        {budgets.map(budget => {
          const percentage = Math.min(100, Math.round((budget.spent / budget.budget) * 100));
          const remaining = budget.budget - budget.spent;
          
          return (
            <div key={budget.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 dark:hover:bg-dark-750">
              <div className="col-span-4 flex items-center">
                <div className={`p-2 rounded-lg ${budget.color} mr-3 flex-shrink-0`}>
                  {budget.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{budget.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{budget.category}</p>
                </div>
              </div>
              
              <div className="col-span-2 text-right text-gray-900 dark:text-white font-medium">
                ${budget.budget.toLocaleString()}
              </div>
              
              <div className="col-span-2 text-right text-gray-900 dark:text-white font-medium">
                ${budget.spent.toLocaleString()}
              </div>
              
              <div className="col-span-2 text-right font-medium">
                <span className={remaining >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}>
                  ${Math.abs(remaining).toLocaleString()}
                  {remaining < 0 && ' over'}
                </span>
              </div>
              
              <div className="col-span-2">
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2 mr-2">
                    <div 
                      className={`h-2 rounded-full ${
                        percentage >= 90 ? 'bg-danger-500' : 
                        percentage >= 75 ? 'bg-warning-500' : 
                        'bg-success-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-shrink-0 w-12">
                    {percentage}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className={`${compact ? '' : 'p-6 max-w-7xl mx-auto'}`}>
      {renderHeader()}
      
      {renderSummary()}
      
      {compact ? (
        renderCompactView()
      ) : (
        <div>
          {viewMode === 'grid' ? renderGridView() : renderListView()}
        </div>
      )}
      
      {!compact && (
        <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-900/50">
          <div className="flex items-start">
            <ChartBarIcon className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-medium text-primary-800 dark:text-primary-300 mb-1">Budget Insight</h4>
              <p className="text-sm text-primary-700 dark:text-primary-200">
                You've spent {overallPercentage}% of your total budget for {timeframeOptions.find(o => o.value === timeframe)?.label.toLowerCase()}. 
                {overallPercentage >= 90 ? 
                  " You're very close to your limits. Consider adjusting your budget or reducing expenses." : 
                overallPercentage >= 75 ? 
                  " You're on track but watch your spending in the coming days." : 
                  " You're well within your budget limits. Great job managing your finances!"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetTracking;