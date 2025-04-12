import React, { useState } from 'react';
import ConnectedAccounts from './ConnectedAccounts';
import AccountBalances from './AccountBalances';
import PlaidTransactions from './PlaidTransactions';
import Card from '../common/Card';
import Button from '../common/Button';
import { 
  HomeIcon, 
  CreditCardIcon, 
  BanknotesIcon, // Changed from CashIcon
  ShieldCheckIcon,
  BuildingOfficeIcon, // Changed from OfficeBuildingIcon
  LockClosedIcon
} from '@heroicons/react/24/outline';

const PlaidScreen = () => {
  const [activeTab, setActiveTab] = useState('accounts');
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'accounts':
        return <ConnectedAccounts />;
      case 'balances':
        return <AccountBalances />;
      case 'transactions':
        return <PlaidTransactions />;
      default:
        return <ConnectedAccounts />;
    }
  };
  
  const tabs = [
    { id: 'accounts', label: 'Connected Accounts', icon: BuildingOfficeIcon }, // Changed from OfficeBuildingIcon
    { id: 'balances', label: 'Financial Overview', icon: CreditCardIcon },
    { id: 'transactions', label: 'Transactions', icon: BanknotesIcon } // Changed from CashIcon
  ];
  
  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-900 rounded-xl text-white p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold mb-2">Linked Financial Accounts</h1>
            <p className="text-primary-100">
              Connect your bank accounts, credit cards, and investment accounts to get a complete picture of your finances
            </p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-4 flex items-center max-w-md">
            <div className="bg-primary-500 rounded-lg p-2 mr-3">
              <ShieldCheckIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">Bank-Level Security</p>
              <p className="text-xs text-primary-100">
                We use end-to-end encryption and never store your account credentials
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Security Info */}
      <Card className="mb-6 bg-gray-50 dark:bg-dark-800/50 border border-gray-200 dark:border-dark-700">
        <div className="flex items-start">
          <div className="bg-primary-100 dark:bg-primary-900/50 rounded-full p-3 mr-4">
            <LockClosedIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Your Data is Secure</h3>
            <p className="text-gray-600 dark:text-gray-300">
              FinGuard uses Plaid to securely connect to your financial institutions. We never see or store your banking credentials.
              Your data is encrypted with bank-level security and you can disconnect your accounts at any time.
            </p>
          </div>
        </div>
      </Card>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-dark-700 mb-6">
        <div className="flex flex-wrap -mb-px">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`mr-8 py-4 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default PlaidScreen;