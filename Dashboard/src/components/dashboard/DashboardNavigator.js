import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCards } from '../../hooks/useCards';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import FinancialOverview from './FinancialOverview';
import CardManagement from './CardManagement';
import TransactionHistory from './TransactionHistory';

// Import icons
import { 
  PlusIcon, 
  CreditCardIcon, 
  ShieldCheckIcon, 
  ChartBarIcon,
  BellIcon,
  ExclamationTriangleIcon, // Changed from ExclamationIcon
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const DashboardNavigator = () => {
  const { user } = useAuth();
  const { cards, loading: cardsLoading } = useCards();
  
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Quick stats for the dashboard
  const stats = {
    totalSaved: 345.67,
    securityAlerts: 2,
    optimizationOpportunities: 3
  };
  
  // Render tabs for dashboard navigation
  const renderTabs = () => {
    const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'cards', label: 'My Cards' },
      { id: 'transactions', label: 'Transactions' },
      { id: 'insights', label: 'Insights' }
    ];
    
    return (
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    );
  };
  
  // Render main content based on selected tab
  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return <FinancialOverview />;
      case 'cards':
        return <CardManagement />;
      case 'transactions':
        return <TransactionHistory />;
      case 'insights':
        return (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Insights Coming Soon</h3>
            <p className="text-gray-500">
              We're working on advanced analytics and insights for your financial data.
            </p>
          </div>
        );
      default:
        return <FinancialOverview />;
    }
  };
  
  // Render welcome section
  const renderWelcome = () => {
    return (
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl text-white p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {user?.firstName || 'User'}!</h2>
            <p className="mt-1 text-primary-100">
              You've saved <span className="font-semibold">${stats.totalSaved.toFixed(2)}</span> by using optimal cards this month.
            </p>
          </div>
          <img 
            src="/assets/images/dashboard-illustration.svg" 
            alt="Dashboard illustration" 
            className="h-24 w-auto hidden md:block"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-500 rounded-md p-2">
                <CreditCardIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white">Active Cards</p>
                <p className="text-xl font-semibold">{cards?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-2">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white">Security Alerts</p>
                <p className="text-xl font-semibold">{stats.securityAlerts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-2">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white">Optimization Tips</p>
                <p className="text-xl font-semibold">{stats.optimizationOpportunities}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render action cards
  const renderActionCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="relative">
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
              Action Needed
            </span>
          </div>
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 bg-danger-100 rounded-full p-2">
              <ExclamationTriangleIcon className="h-6 w-6 text-danger-600" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-900">Security Alert</h3>
          </div>
          <p className="text-gray-600 mb-4">
            We detected a potentially fraudulent transaction on your Chase Sapphire card.
          </p>
          <Button variant="danger" fullWidth>
            Review Now
          </Button>
        </Card>
        
        <Card className="relative">
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              Recommendation
            </span>
          </div>
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 bg-primary-100 rounded-full p-2">
              <CreditCardIcon className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-900">Card Recommendation</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Based on your spending, you could earn 2.5x more rewards with an Amex Blue Cash card.
          </p>
          <Button variant="primary" fullWidth>
            See Details
          </Button>
        </Card>
        
        <Card className="relative">
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
              Good News
            </span>
          </div>
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 bg-success-100 rounded-full p-2">
              <CheckCircleIcon className="h-6 w-6 text-success-600" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-900">Cashback Milestone</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Congrats! You've earned over $500 in cashback rewards this year using FinGuard.
          </p>
          <Button variant="success" fullWidth>
            View Rewards
          </Button>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="max-w-7xl mx-auto pb-12">
      {renderWelcome()}
      
      {/* Action Cards */}
      {renderActionCards()}
      
      {/* Dashboard Tabs & Content */}
      <Card className="overflow-hidden">
        {renderTabs()}
        {renderContent()}
      </Card>
    </div>
  );
};

export default DashboardNavigator;