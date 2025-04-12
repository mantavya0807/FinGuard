import React, { useMemo } from 'react';
import { usePlaid } from '../../hooks/usePlaid';
import Card from '../common/Card';
import { Doughnut } from 'react-chartjs-2';
import { ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const AccountBalances = () => {
  const { accounts = [], loading = {}, error = {}, fetchAccounts, fetchBalances } = usePlaid() || {};
  
  // Initialize chart data
  const chartData = useMemo(() => {
    // Ensure accounts is an array
    const safeAccounts = Array.isArray(accounts) ? accounts : [];
    
    // Filter out accounts with negative balances for the chart
    const positiveAccounts = safeAccounts.filter(account => 
      account?.balance?.available > 0
    );
    
    return {
      labels: positiveAccounts.map(account => account.name),
      datasets: [
        {
          data: positiveAccounts.map(account => account.balance.available),
          backgroundColor: [
            '#4F46E5', // primary-600
            '#0D9488', // secondary-600
            '#16A34A', // success-600
            '#D97706', // warning-600
            '#DC2626', // danger-600
            '#8B5CF6', // violet-500
            '#EC4899', // pink-500
            '#06B6D4', // cyan-500
            '#6B7280', // gray-500
          ],
          borderWidth: 0,
          hoverOffset: 4,
        }
      ]
    };
  }, [accounts]);
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            return `${context.label}: ${formatCurrency(value)}`;
          }
        }
      }
    },
    cutout: '70%'
  };
  
  // Calculate total assets, debts, and net worth
  const financialSummary = useMemo(() => {
    let totalAssets = 0;
    let totalDebts = 0;
    
    // Ensure accounts is an array
    const safeAccounts = Array.isArray(accounts) ? accounts : [];
    
    safeAccounts.forEach(account => {
      if (account?.balance?.available > 0) {
        totalAssets += account.balance.available;
      } else if (account?.balance?.available < 0) {
        totalDebts += Math.abs(account.balance.available);
      }
    });
    
    const netWorth = totalAssets - totalDebts;
    
    return {
      totalAssets,
      totalDebts,
      netWorth
    };
  }, [accounts]);
  
  // Format currency for display
  const formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Group accounts by type
  const accountsByType = useMemo(() => {
    const types = {
      checking: { label: 'Checking', total: 0, count: 0 },
      savings: { label: 'Savings', total: 0, count: 0 },
      credit: { label: 'Credit Cards', total: 0, count: 0 },
      investment: { label: 'Investments', total: 0, count: 0 },
      other: { label: 'Other', total: 0, count: 0 }
    };
    
    // Ensure accounts is an array
    const safeAccounts = Array.isArray(accounts) ? accounts : [];
    
    safeAccounts.forEach(account => {
      if (!account?.balance) return; // Skip if balance is undefined
      
      const type = account.type || 'other';
      if (types[type]) {
        types[type].total += account.balance.available;
        types[type].count += 1;
      } else {
        types.other.total += account.balance.available;
        types.other.count += 1;
      }
    });
    
    return Object.values(types).filter(type => type.count > 0);
  }, [accounts]);
  
  // Handle refresh
  const handleRefresh = () => {
    if (typeof fetchAccounts === 'function') fetchAccounts();
    if (typeof fetchBalances === 'function') fetchBalances();
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">Financial Overview</h2>
        <button
          onClick={handleRefresh}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center"
          disabled={loading.accounts || loading.balances}
        >
          <ArrowPathIcon className={`h-5 w-5 mr-1 ${(loading.accounts || loading.balances) ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
      
      {(error.accounts || error.balances) && (
        <div className="bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400 p-4 rounded-lg mb-4 flex items-center">
          <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>{error.accounts || error.balances}</p>
        </div>
      )}
      
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800">
          <p className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Net Worth</p>
          <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
            {formatCurrency(financialSummary.netWorth)}
          </p>
        </Card>
        
        <Card className="bg-success-50 dark:bg-success-900/30 border border-success-100 dark:border-success-800">
          <p className="text-sm font-medium text-success-700 dark:text-success-300 mb-1">Total Assets</p>
          <p className="text-2xl font-bold text-success-900 dark:text-success-100">
            {formatCurrency(financialSummary.totalAssets)}
          </p>
        </Card>
        
        <Card className="bg-danger-50 dark:bg-danger-900/30 border border-danger-100 dark:border-danger-800">
          <p className="text-sm font-medium text-danger-700 dark:text-danger-300 mb-1">Total Debts</p>
          <p className="text-2xl font-bold text-danger-900 dark:text-danger-100">
            {formatCurrency(financialSummary.totalDebts)}
          </p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Allocation Chart */}
        <Card title="Asset Allocation" className="h-80">
          {accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                Connect your accounts to see your asset allocation
              </p>
            </div>
          ) : (
            <div className="relative h-64">
              <Doughnut data={chartData} options={chartOptions} />
              {financialSummary.totalAssets > 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Assets</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(financialSummary.totalAssets)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
        
        {/* Account Summary by Type */}
        <Card title="Account Summary" className="h-80">
          {accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                Connect your accounts to see your account summary
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-dark-700 h-64 overflow-auto">
              {accountsByType.map((type, index) => (
                <div key={index} className="py-4 first:pt-0">
                  <div className="flex justify-between mb-1">
                    <p className="font-medium dark:text-white">{type.label}</p>
                    <p className="font-medium dark:text-white">{type.count} {type.count === 1 ? 'account' : 'accounts'}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500 dark:text-gray-400">Total balance</p>
                    <p className={`font-medium ${type.total < 0 ? 'text-danger-600 dark:text-danger-400' : 'text-success-600 dark:text-success-400'}`}>
                      {formatCurrency(type.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AccountBalances;