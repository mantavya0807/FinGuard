import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAnalytics } from '../../hooks/useAnalytics';
import LoadingSpinner from '../common/LoadingSpinner';
import SpendingTrends from './SpendingTrends';
import CategoryBreakdown from './CategoryBreakdown';
import RewardOptimization from './RewardOptimization';
import BudgetTracking from './BudgetTracking';
import FinancialInsights from './FinancialInsights';
import MerchantAnalysis from './MerchantAnalysis';
import AnalyticsChatbot from './AnalyticsChatbot';
import { 
  ArrowPathIcon, 
  ChartPieIcon, 
  CurrencyDollarIcon, 
  SparklesIcon, 
  ShoppingBagIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const AnalyticsScreen = () => {
  const {
    categorySpending,
    spendingTrends,
    merchantAnalysis,
    rewardsOptimization,
    budgetAnalysis,
    insights,
    loading,
    error,
    refreshAllAnalytics,
    generateFinancialInsights
  } = useAnalytics();

  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  // Generate insights on first load if not already there
  useEffect(() => {
    if (!insights && !loading.insights) {
      generateFinancialInsights();
    }
  }, [insights, loading.insights, generateFinancialInsights]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAllAnalytics();
    } finally {
      setRefreshing(false);
    }
  };

  const isAnyDataLoading = () => {
    return Object.values(loading).some(Boolean);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'spending':
        return <SpendingTrends data={spendingTrends} loading={loading.trends} error={error.trends} />;
      case 'categories':
        return <CategoryBreakdown data={categorySpending} loading={loading.categories} error={error.categories} />;
      case 'merchants':
        return <MerchantAnalysis data={merchantAnalysis} loading={loading.merchants} error={error.merchants} />;
      case 'rewards':
        return <RewardOptimization data={rewardsOptimization} loading={loading.rewards} error={error.rewards} />;
      case 'budget':
        return <BudgetTracking data={budgetAnalysis} loading={loading.budget} error={error.budget} />;
      case 'insights':
        return <FinancialInsights data={insights} loading={loading.insights} error={error.insights} onGenerate={generateFinancialInsights} />;
      case 'chatbot':
        return <AnalyticsChatbot />;
      default:
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
              <div className="col-span-1">
                <CategoryBreakdown data={categorySpending} loading={loading.categories} error={error.categories} compact={true} />
              </div>
              <div className="col-span-1">
                <SpendingTrends data={spendingTrends} loading={loading.trends} error={error.trends} compact={true} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
              <div className="col-span-1">
                <RewardOptimization data={rewardsOptimization} loading={loading.rewards} error={error.rewards} compact={true} />
              </div>
              <div className="col-span-1">
                <BudgetTracking data={budgetAnalysis} loading={loading.budget} error={error.budget} compact={true} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className="col-span-1">
                <MerchantAnalysis data={merchantAnalysis} loading={loading.merchants} error={error.merchants} compact={true} />
              </div>
              <div className="col-span-1">
                <FinancialInsights data={insights} loading={loading.insights} error={error.insights} onGenerate={generateFinancialInsights} compact={true} />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto relative"
    >
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl text-white p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Financial Analytics</h1>
            <p className="text-primary-100">
              Gain deeper insights into your spending patterns and financial health
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-2">
            <button
              className="bg-white text-primary-700 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors inline-flex items-center"
              onClick={handleRefresh}
              disabled={refreshing || isAnyDataLoading()}
            >
              <ArrowPathIcon className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
            
            <button
              className="bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-800 transition-colors inline-flex items-center"
              onClick={() => setShowChatbot(!showChatbot)}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
              {showChatbot ? "Hide Assistant" : "Financial Assistant"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md p-2 mb-6 overflow-x-auto">
        <div className="flex space-x-1 md:space-x-2">
          <TabButton 
            isActive={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
            icon={<ChartPieIcon className="h-5 w-5" />}
            text="Overview"
          />
          <TabButton 
            isActive={activeTab === 'spending'} 
            onClick={() => setActiveTab('spending')}
            icon={<CurrencyDollarIcon className="h-5 w-5" />}
            text="Spending Trends"
          />
          <TabButton 
            isActive={activeTab === 'categories'} 
            onClick={() => setActiveTab('categories')}
            icon={<ChartPieIcon className="h-5 w-5" />}
            text="Categories"
          />
          <TabButton 
            isActive={activeTab === 'merchants'} 
            onClick={() => setActiveTab('merchants')}
            icon={<ShoppingBagIcon className="h-5 w-5" />}
            text="Merchants"
          />
          <TabButton 
            isActive={activeTab === 'rewards'} 
            onClick={() => setActiveTab('rewards')}
            icon={<SparklesIcon className="h-5 w-5" />}
            text="Rewards"
          />
          <TabButton 
            isActive={activeTab === 'budget'} 
            onClick={() => setActiveTab('budget')}
            icon={<CurrencyDollarIcon className="h-5 w-5" />}
            text="Budget"
          />
          <TabButton 
            isActive={activeTab === 'insights'} 
            onClick={() => setActiveTab('insights')}
            icon={<LightBulbIcon className="h-5 w-5" />}
            text="AI Insights"
          />
          <TabButton 
            isActive={activeTab === 'chatbot'} 
            onClick={() => setActiveTab('chatbot')}
            icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
            text="Chat Assistant"
          />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md p-6 overflow-hidden mb-6">
        {/* Loading state */}
        {isAnyDataLoading() && Object.values(error).every(e => !e) && (
          <div className="absolute inset-0 bg-white/50 dark:bg-dark-800/50 z-10 flex items-center justify-center">
            <LoadingSpinner size="h-12 w-12" />
          </div>
        )}
        
        {/* Content */}
        <div className="relative">
          {renderTabContent()}
        </div>
      </div>
      
      {/* Chatbot overlay */}
      {showChatbot && activeTab !== 'chatbot' && (
        <div className="fixed bottom-6 right-6 w-96 h-96 bg-white dark:bg-dark-800 rounded-xl shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-dark-700">
          <div className="flex flex-col h-full">
            <div className="bg-primary-600 text-white p-3 flex justify-between items-center">
              <h3 className="font-medium flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                Financial Assistant
              </h3>
              <button 
                className="text-white hover:text-gray-200"
                onClick={() => setShowChatbot(false)}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AnalyticsChatbot isOverlay={true} />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const TabButton = ({ isActive, onClick, icon, text }) => {
  return (
    <button
      className={`flex items-center px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
        isActive
          ? 'bg-primary-100 text-primary-700 font-medium dark:bg-primary-900/30 dark:text-primary-400'
          : 'text-gray-600 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-dark-700 dark:hover:text-primary-400'
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="ml-2 text-sm">{text}</span>
    </button>
  );
};

export default AnalyticsScreen;