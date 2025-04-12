import React, { useState } from 'react';
import { usePlaid } from '../../hooks/usePlaid';
import Card from '../common/Card';
import Button from '../common/Button';
import PlaidLink from './PlaidLink';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  BanknotesIcon,
  CreditCardIcon,
  ArrowPathIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const ConnectedAccounts = () => {
  const { 
    accounts, 
    balances, 
    loading, 
    error, 
    fetchAccounts, 
    fetchBalances, 
    handlePlaidSuccess, 
    handleDisconnectAccount 
  } = usePlaid();
  
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [linkSuccess, setLinkSuccess] = useState(false);
  
  // Group accounts by institution
  const groupedAccounts = accounts.reduce((groups, account) => {
    const key = account.institution || 'Unknown';
    if (!groups[key]) {
      groups[key] = {
        name: key,
        logo: account.institution_logo || null,
        color: account.institution_color || '#888888',
        accounts: []
      };
    }
    groups[key].accounts.push(account);
    return groups;
  }, {});
  
  // Handle successful connection
  const onPlaidSuccess = async (publicToken, metadata) => {
    const result = await handlePlaidSuccess(publicToken, metadata);
    if (result.success) {
      setLinkSuccess(true);
      setTimeout(() => setLinkSuccess(false), 3000);
    }
  };
  
  // Refresh accounts and balances
  const handleRefresh = () => {
    fetchAccounts();
    fetchBalances();
  };
  
  // Open disconnect confirmation modal
  const openDisconnectModal = (itemId, institutionName) => {
    setSelectedItem({ id: itemId, name: institutionName });
    setShowDisconnectModal(true);
  };
  
  // Handle account disconnection
  const confirmDisconnect = async () => {
    if (!selectedItem) return;
    
    const result = await handleDisconnectAccount(selectedItem.id);
    if (result.success) {
      setShowDisconnectModal(false);
      setSelectedItem(null);
    }
  };
  
  // Get an icon based on account type
  const getAccountIcon = (type) => {
    switch (type) {
      case 'checking':
      case 'savings':
        return <BanknotesIcon className="h-5 w-5 text-blue-500" />;
      case 'credit':
        return <CreditCardIcon className="h-5 w-5 text-red-500" />;
      case 'investment':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
      default:
        return <QuestionMarkCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Format currency for display
  const formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Render account status
  const renderAccountStatus = () => {
    if (loading.accounts || loading.balances) {
      return (
        <div className="flex items-center text-primary-600 dark:text-primary-400">
          <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
          <span>Syncing accounts...</span>
        </div>
      );
    }
    
    if (error.accounts || error.balances) {
      return (
        <div className="flex items-center text-danger-600 dark:text-danger-400">
          <ExclamationCircleIcon className="h-5 w-5 mr-2" />
          <span>{error.accounts || error.balances}</span>
        </div>
      );
    }
    
    if (linkSuccess) {
      return (
        <div className="flex items-center text-success-600 dark:text-success-400">
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          <span>Account connected successfully!</span>
        </div>
      );
    }
    
    return null;
  };
  
  // Render institution card with its accounts
  const renderInstitutionCard = (institution, key) => {
    return (
      <Card key={key} className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {institution.logo ? (
              <img 
                src={`/assets/images/${institution.logo}`} 
                alt={institution.name}
                className="h-10 w-10 object-contain mr-3"
              />
            ) : (
              <div 
                className="h-10 w-10 rounded-full flex items-center justify-center mr-3" 
                style={{ backgroundColor: institution.color }}
              >
                <span className="text-white font-bold">
                  {institution.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold dark:text-white">{institution.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {institution.accounts.length} {institution.accounts.length === 1 ? 'account' : 'accounts'}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => openDisconnectModal(institution.accounts[0].item_id, institution.name)}
          >
            Disconnect
          </Button>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-dark-700">
          {institution.accounts.map(account => (
            <div key={account.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="mr-3">
                    {getAccountIcon(account.type)}
                  </div>
                  <div>
                    <p className="font-medium dark:text-white">{account.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {account.mask ? `••••${account.mask}` : 'No account number available'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${account.balance.available < 0 ? 'text-danger-600 dark:text-danger-400' : 'dark:text-white'}`}>
                    {formatCurrency(account.balance.available)}
                  </p>
                  {account.balance.limit && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Limit: {formatCurrency(account.balance.limit)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold dark:text-white">Connected Accounts</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your financial institution connections
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            loading={loading.accounts || loading.balances}
            icon={<ArrowPathIcon className="h-5 w-5" />}
          >
            Refresh
          </Button>
          <PlaidLink
            onSuccess={onPlaidSuccess}
            buttonText="Connect Account"
          />
        </div>
      </div>
      
      {renderAccountStatus()}
      
      {accounts.length === 0 && !loading.accounts ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-full mb-4">
            <BanknotesIcon className="h-10 w-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No accounts connected</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-lg">
            Connect your financial accounts to get a complete view of your finances. 
            FinGuard uses bank-level security to keep your data safe.
          </p>
          <PlaidLink
            onSuccess={onPlaidSuccess}
            buttonText="Connect Your First Account"
            size="lg"
          />
        </Card>
      ) : (
        <div>
          {Object.values(groupedAccounts).map((institution, index) => 
            renderInstitutionCard(institution, index)
          )}
        </div>
      )}
      
      {/* Disconnect Account Modal */}
      <Transition appear show={showDisconnectModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowDisconnectModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-dark-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex justify-between items-center"
                  >
                    Disconnect Account
                    <button 
                      onClick={() => setShowDisconnectModal(false)}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to disconnect your {selectedItem?.name} account? 
                      This will remove all account information and transaction history associated with this connection.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowDisconnectModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={confirmDisconnect}
                    >
                      Disconnect
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default ConnectedAccounts;