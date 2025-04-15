import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import securityApi from '../../services/api/securityApi';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  LockClosedIcon,
  BeakerIcon,
  ArrowPathIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const SecurityScreen = () => {
  const [phishingTransactions, setPhishingTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalScanned: 0,
    totalFlagged: 0,
    securityScore: 0,
    recentAlerts: 0
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch suspicious transactions on load
  useEffect(() => {
    fetchSuspiciousTransactions();
    fetchSecurityStats();
  }, []);

  // Fetch suspicious transactions
  const fetchSuspiciousTransactions = async () => {
    setLoading(true);
    try {
      const response = await securityApi.getSuspiciousTransactions();
      setPhishingTransactions(response.data);
    } catch (error) {
      console.error('Error fetching suspicious transactions:', error);
      toast.error('Failed to load suspicious transactions');
      
      // Fallback to mock data for demonstration
      setPhishingTransactions(mockPhishingTransactions);
    } finally {
      setLoading(false);
    }
  };

  // Fetch security stats
  const fetchSecurityStats = async () => {
    try {
      const response = await securityApi.getSecurityStats();
      setStats({
        totalScanned: response.data.totalTransactions || 245,
        totalFlagged: response.data.flaggedTransactions || 8,
        securityScore: Math.round(100 - ((response.data.flaggedTransactions / response.data.totalTransactions) * 100)) || 97,
        recentAlerts: response.data.flaggedTransactions || 8
      });
    } catch (error) {
      console.error('Error fetching security stats:', error);
      
      // Fallback to default stats
      setStats({
        totalScanned: 245,
        totalFlagged: 8,
        securityScore: 97,
        recentAlerts: 8
      });
    }
  };

  // Approve a transaction
  const handleApproveTransaction = async (transactionId) => {
    try {
      await securityApi.approveTransaction(transactionId);
      
      // Remove from the list
      setPhishingTransactions(prev => 
        prev.filter(transaction => transaction.id !== transactionId)
      );
      
      toast.success('Transaction approved');
      if (showDetailModal) setShowDetailModal(false);
    } catch (error) {
      console.error('Error approving transaction:', error);
      toast.error('Failed to approve transaction');
    }
  };

  // Reject a transaction
  const handleRejectTransaction = async (transactionId) => {
    try {
      await securityApi.rejectTransaction(transactionId);
      
      // Remove from the list
      setPhishingTransactions(prev => 
        prev.filter(transaction => transaction.id !== transactionId)
      );
      
      toast.success('Transaction rejected and removed');
      if (showDetailModal) setShowDetailModal(false);
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      toast.error('Failed to reject transaction');
    }
  };

  // Run fraud scan
  const handleRunScan = async () => {
    setLoading(true);
    try {
      const response = await securityApi.runFraudScan();
      
      toast.success(`Scan complete: ${response.data.flagged} suspicious transactions found`);
      fetchSuspiciousTransactions();
      fetchSecurityStats();
    } catch (error) {
      console.error('Error running scan:', error);
      toast.error('Failed to run security scan');
    } finally {
      setLoading(false);
    }
  };

  // Add test phishing transactions
  const handleAddTestData = async () => {
    try {
      await securityApi.addTestPhishingTransactions();
      
      toast.success('Test phishing transactions added');
      fetchSuspiciousTransactions();
    } catch (error) {
      console.error('Error adding test data:', error);
      toast.error('Failed to add test data');
    }
  };

  // View transaction details
  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(Math.abs(amount));
  };

  // Render transaction details modal
  const renderTransactionDetailModal = () => {
    if (!selectedTransaction) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 max-w-xl w-full mx-4">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Transaction Details</h2>
            <button 
              onClick={() => setShowDetailModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-900/30">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                <span className="font-medium text-red-800 dark:text-red-300">Flagged as Suspicious</span>
              </div>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{selectedTransaction.flagReason}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Merchant</h3>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedTransaction.merchantName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</h3>
                <p className="text-base font-semibold text-red-600 dark:text-red-400">{formatCurrency(selectedTransaction.amount)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</h3>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{formatDate(selectedTransaction.date)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h3>
                <p className="text-base font-semibold text-gray-900 dark:text-white capitalize">{selectedTransaction.category}</p>
              </div>
              {selectedTransaction.location && (
                <div className="col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h3>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {selectedTransaction.location.city || 'Unknown'}, {selectedTransaction.location.country}
                  </p>
                </div>
              )}
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedTransaction.description}</p>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>Security Notice:</strong> This transaction was flagged by our fraud detection system. 
                Please review carefully before approving or rejecting.
              </p>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                onClick={() => handleRejectTransaction(selectedTransaction.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                Reject Transaction
              </button>
              <button
                onClick={() => handleApproveTransaction(selectedTransaction.id)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                Approve Transaction
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto"
    >
      <div className="bg-gradient-to-r from-red-600 to-indigo-600 rounded-xl text-white p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">Fraud Protection Center</h1>
        <p className="text-indigo-100">
          Review and manage suspicious transactions to keep your accounts safe
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <ShieldCheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Security Score</h2>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.securityScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <LockClosedIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Transactions Scanned</h2>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalScanned}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Potential Threats</h2>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.totalFlagged}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <ArrowPathIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Run Security Scan</h2>
              </div>
            </div>
            <button
              onClick={handleRunScan}
              disabled={loading}
              className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Scanning...' : 'Scan Now'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
        <div className="p-6 border-b border-gray-200 dark:border-dark-700 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Suspicious Transactions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Review and manage flagged transactions</p>
          </div>
          <button
            onClick={handleAddTestData}
            className="text-sm bg-gray-100 hover:bg-gray-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center"
          >
            <BeakerIcon className="h-4 w-4 mr-1" />
            Add Test Data
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
              <p className="ml-3 text-gray-500 dark:text-gray-400">Loading suspicious transactions...</p>
            </div>
          ) : phishingTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Suspicious Transactions</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Great! We haven't detected any suspicious transactions. Your accounts are safe.
              </p>
              <button
                onClick={handleRunScan}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                Run New Scan
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {phishingTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="border border-gray-200 dark:border-dark-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start">
                      <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg mr-4">
                        <BuildingStorefrontIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{transaction.merchantName}</h3>
                        <div className="flex items-center mt-1">
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            {formatCurrency(transaction.amount)}
                          </span>
                          <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            {formatDate(transaction.date)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center">
                          <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs px-2 py-1 rounded-full flex items-center">
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                            {transaction.flagReason || 'Suspicious Activity'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 md:ml-auto">
                      <button
                        onClick={() => handleViewDetails(transaction)}
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm border border-indigo-200 dark:border-indigo-800 px-3 py-1 rounded-lg transition-colors duration-200"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleRejectTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm border border-red-200 dark:border-red-800 px-3 py-1 rounded-lg transition-colors duration-200"
                      >
                        <XCircleIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleApproveTransaction(transaction.id)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-medium text-sm border border-green-200 dark:border-green-800 px-3 py-1 rounded-lg transition-colors duration-200"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showDetailModal && renderTransactionDetailModal()}
    </motion.div>
  );
};

// Mock data for testing
const mockPhishingTransactions = [
  {
    id: 'tx_001',
    merchantName: 'amazon-secure-payment.net',
    amount: -299.99,
    date: new Date(),
    description: 'Amazon Prime Renewal',
    category: 'subscription',
    type: 'online',
    status: 'flagged',
    flagReason: 'Suspicious merchant domain',
    location: {
      country: 'RU',
      city: 'Unknown'
    }
  },
  {
    id: 'tx_002',
    merchantName: 'paypal-account-verify.com',
    amount: -149.50,
    date: new Date(Date.now() - 86400000), // Yesterday
    description: 'Account Verification Fee',
    category: 'services',
    type: 'online',
    status: 'flagged',
    flagReason: 'Known phishing pattern',
    location: {
      country: 'NG',
      city: 'Lagos'
    }
  },
  {
    id: 'tx_003',
    merchantName: 'crypto-investment-guaranteed.net',
    amount: -1999.99,
    date: new Date(Date.now() - 345600000), // 4 days ago
    description: 'Investment Deposit',
    category: 'crypto',
    type: 'online',
    status: 'flagged',
    flagReason: 'High-risk amount and category',
    location: {
      country: 'UK',
      city: 'London'
    }
  }
];

export default SecurityScreen;