import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GiftIcon, StarIcon, TrophyIcon, ArrowRightIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const RewardsScreen = () => {
  const [selectedTab, setSelectedTab] = useState('available');
  
  // Sample rewards data
  const availableRewards = [
    {
      id: 'reward_1',
      title: '5% Cashback on Dining',
      description: 'Get 5% cashback at restaurants and dining establishments',
      value: '$25',
      expires: 'Dec 31, 2025',
      category: 'cashback',
      card: 'Capital One Savor',
      logo: '/images/capital-one.png'
    },
    {
      id: 'reward_2',
      title: 'Travel Credit',
      description: '$100 statement credit for hotel or airline bookings',
      value: '$100',
      expires: 'Mar 15, 2026',
      category: 'travel',
      card: 'Chase Sapphire Reserve',
      logo: '/images/chase.png'
    },
    {
      id: 'reward_3',
      title: 'Amazon Prime Membership',
      description: 'Free Amazon Prime membership for 1 year',
      value: '$139',
      expires: 'Jun 30, 2025',
      category: 'membership',
      card: 'Amazon Prime Visa',
      logo: '/images/amazon.png'
    }
  ];
  
  const usedRewards = [
    {
      id: 'reward_4',
      title: 'Annual Travel Credit',
      description: '$300 statement credit for travel purchases',
      value: '$300',
      usedDate: 'Feb 15, 2025',
      category: 'travel',
      card: 'Chase Sapphire Reserve',
      logo: '/images/chase.png'
    },
    {
      id: 'reward_5',
      title: 'Streaming Credit',
      description: '$20 monthly credit for streaming services',
      value: '$20',
      usedDate: 'Jan 5, 2025',
      category: 'entertainment',
      card: 'American Express Platinum',
      logo: '/images/amex.png'
    }
  ];
  
  // Total rewards value
  const totalAvailableValue = availableRewards.reduce((total, reward) => {
    const value = parseFloat(reward.value.replace(/[^0-9.]/g, ''));
    return total + value;
  }, 0);
  
  const totalUsedValue = usedRewards.reduce((total, reward) => {
    const value = parseFloat(reward.value.replace(/[^0-9.]/g, ''));
    return total + value;
  }, 0);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };
  
  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'cashback':
        return <CurrencyDollarIcon className="h-6 w-6 text-green-500" />;
      case 'travel':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>;
      case 'entertainment':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>;
      case 'membership':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>;
      default:
        return <GiftIcon className="h-6 w-6 text-primary-500" />;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto"
    >
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl text-white p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">Rewards Center</h1>
        <p className="text-primary-100">
          Manage your rewards and maximize the benefits from your cards
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div 
          className="bg-white rounded-xl shadow-md p-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <GiftIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Available Rewards</h2>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">${totalAvailableValue}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white rounded-xl shadow-md p-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <StarIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Points Earned</h2>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">12,450</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white rounded-xl shadow-md p-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <TrophyIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Redeemed Value</h2>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">${totalUsedValue}</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
        <div className="border-b border-gray-200 dark:border-dark-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setSelectedTab('available')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                selectedTab === 'available'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Available Rewards
            </button>
            <button
              onClick={() => setSelectedTab('used')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                selectedTab === 'used'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Redeemed Rewards
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {selectedTab === 'available' ? (
            availableRewards.length > 0 ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-4"
              >
                {availableRewards.map(reward => (
                  <motion.div 
                    key={reward.id}
                    variants={cardVariants}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-dark-700 dark:border-dark-600"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-start">
                      <div className="bg-white p-2 rounded-lg shadow-sm dark:bg-dark-800">
                        {getCategoryIcon(reward.category)}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{reward.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{reward.description}</p>
                          </div>
                          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{reward.value}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-6 w-6 bg-gray-200 rounded-full mr-2 dark:bg-dark-600">
                              {/* Card logo would go here, using placeholder */}
                              <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                {reward.card.charAt(0)}
                              </div>
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-300">{reward.card}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Expires: {reward.expires}</span>
                            <Link 
                              to={`/rewards/${reward.id}`}
                              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center text-sm font-medium"
                            >
                              Details <ArrowRightIcon className="h-4 w-4 ml-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-10">
                <GiftIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No rewards available</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You don't have any available rewards at the moment.
                </p>
              </div>
            )
          ) : (
            usedRewards.length > 0 ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-4"
              >
                {usedRewards.map(reward => (
                  <motion.div 
                    key={reward.id}
                    variants={cardVariants}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-dark-700 dark:border-dark-600"
                  >
                    <div className="flex items-start">
                      <div className="bg-white p-2 rounded-lg shadow-sm dark:bg-dark-800">
                        {getCategoryIcon(reward.category)}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{reward.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{reward.description}</p>
                          </div>
                          <span className="text-lg font-bold text-gray-600 dark:text-gray-400">{reward.value}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-6 w-6 bg-gray-200 rounded-full mr-2 dark:bg-dark-600">
                              {/* Card logo would go here, using placeholder */}
                              <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                {reward.card.charAt(0)}
                              </div>
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-300">{reward.card}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Used on: {reward.usedDate}</span>
                            <Link 
                              to={`/rewards/${reward.id}`}
                              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center text-sm font-medium"
                            >
                              Details <ArrowRightIcon className="h-4 w-4 ml-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-10">
                <GiftIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No redeemed rewards</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You haven't redeemed any rewards yet.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RewardsScreen;