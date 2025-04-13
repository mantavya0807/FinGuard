import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCardsWithRewards } from '../../services/api/rewardsApi';
import { ArrowLeftIcon, SparklesIcon, ArrowTrendingUpIcon, CreditCardIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const RewardsHistoryScreen = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [rewardsHistory, setRewardsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRewards, setTotalRewards] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch cards with rewards
        const cardsData = await getCardsWithRewards();
        setCards(cardsData);
        
        // For demo purposes, generate mock rewards history
        // In a real app, this would be fetched from the server
        const mockHistory = generateMockRewardsHistory(cardsData);
        setRewardsHistory(mockHistory);
        
        // Calculate total rewards
        const total = mockHistory.reduce((sum, item) => sum + item.amount, 0);
        setTotalRewards(total);
      } catch (err) {
        console.error('Error fetching rewards data:', err);
        setError('Failed to load rewards history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Generate mock rewards history for demo purposes
  const generateMockRewardsHistory = (cards) => {
    if (!cards || cards.length === 0) return [];
    
    const history = [];
    const currentDate = new Date();
    const categories = ['Groceries', 'Dining', 'Travel', 'Gas', 'Online Shopping'];
    const merchants = ['Whole Foods', 'Amazon', 'Starbucks', 'Delta Airlines', 'Shell', 'Target', 'Uber Eats'];
    
    // Generate random history items
    for (let i = 0; i < 20; i++) {
      const daysAgo = Math.floor(Math.random() * 90); // Random day within last 90 days
      const date = new Date(currentDate);
      date.setDate(date.getDate() - daysAgo);
      
      const card = cards[Math.floor(Math.random() * cards.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      
      // Generate a reasonable reward amount (0.5% to 5% of a purchase)
      const purchaseAmount = Math.floor(Math.random() * 200) + 20; // $20 to $220
      const rewardRate = (Math.random() * 4.5 + 0.5) / 100; // 0.5% to 5%
      const rewardAmount = parseFloat((purchaseAmount * rewardRate).toFixed(2));
      
      history.push({
        id: `reward-${i}`,
        date,
        cardName: card.name,
        category,
        merchant,
        purchaseAmount,
        amount: rewardAmount,
        status: Math.random() > 0.1 ? 'Earned' : 'Pending'
      });
    }
    
    // Sort by date, newest first
    return history.sort((a, b) => b.date - a.date);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Group rewards by month
  const groupedRewards = rewardsHistory.reduce((groups, reward) => {
    const month = reward.date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(reward);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="h-12 w-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-danger-50 text-danger-700 p-4 rounded-lg dark:bg-danger-900/30 dark:text-danger-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto p-4"
    >
      <button
        onClick={() => navigate('/rewards')}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        Back to Rewards
      </button>
      
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">Rewards History</h1>
        <p className="text-indigo-100">
          Track all your earned rewards across your cards
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div 
          className="bg-white rounded-xl shadow-md p-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <SparklesIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Total Rewards</h2>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalRewards)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl shadow-md p-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <CreditCardIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Active Cards</h2>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{cards.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl shadow-md p-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">This Month</h2>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(
                  rewardsHistory
                    .filter(r => r.date.getMonth() === new Date().getMonth())
                    .reduce((sum, r) => sum + r.amount, 0)
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <ArchiveBoxIcon className="h-5 w-5 mr-2 text-primary-600" />
            Rewards History
          </h2>
        </div>
        
        <div className="p-6">
          {Object.keys(groupedRewards).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedRewards).map(([month, rewards]) => (
                <div key={month}>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">{month}</h3>
                  <div className="space-y-4">
                    {rewards.map(reward => (
                      <div 
                        key={reward.id}
                        className="bg-gray-50 rounded-lg p-4 dark:bg-dark-700"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex items-center">
                              <span className="h-2.5 w-2.5 bg-green-500 rounded-full mr-2"></span>
                              <h4 className="font-medium text-gray-900 dark:text-white">{reward.merchant}</h4>
                              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                reward.status === 'Earned' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }`}>
                                {reward.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {reward.cardName} • {reward.category}
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0 flex flex-col items-end">
                            <span className="font-bold text-green-600 dark:text-green-400">
                              +{formatCurrency(reward.amount)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(reward.date)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-dark-600 text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(reward.amount)} earned on a {formatCurrency(reward.purchaseAmount)} purchase
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-10">
              <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No rewards history</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You haven't earned any rewards yet. Start using your cards to earn rewards!
              </p>
              <div className="mt-6">
                <button
                  className="btn btn-primary px-4 py-2"
                  onClick={() => navigate('/cards')}
                >
                  View My Cards
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RewardsHistoryScreen;