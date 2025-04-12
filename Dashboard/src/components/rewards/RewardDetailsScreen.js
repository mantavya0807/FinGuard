import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  GiftIcon, 
  CalendarIcon, 
  CreditCardIcon, 
  CheckCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const RewardDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Mock data for the reward
  const mockReward = {
    id: 'reward_1',
    title: '5% Cashback on Dining',
    description: 'Earn 5% cashback at restaurants, cafes, and food delivery services.',
    longDescription: 'Take advantage of this enhanced reward offer to earn 5% back on all dining purchases, including restaurants, cafes, fast food, and food delivery services like DoorDash, UberEats, and GrubHub.',
    value: '$25',
    expires: 'December 31, 2025',
    category: 'cashback',
    status: 'active',
    terms: [
      'Valid for purchases made between January 1, 2025 and December 31, 2025',
      'Maximum cashback amount: $25',
      'Applies to all dining purchases on your Capital One Savor card',
      'Cashback will be credited to your account within 2 billing cycles',
      'Not valid for recurring subscription services'
    ],
    redeem: {
      type: 'automatic',
      instructions: 'This cashback reward is automatically applied to qualifying purchases. No action is required to redeem.'
    },
    card: {
      id: 'card_234567',
      name: 'Capital One Savor',
      lastFour: '8901',
      type: 'MASTERCARD',
      color: '#7F1D1D',
      rewards: {
        travelPoints: 1,
        diningPoints: 4,
        groceryPoints: 3,
        gasCashback: 2,
        generalCashback: 1,
      }
    },
    relatedRewards: [
      {
        id: 'reward_6',
        title: '3% Cashback on Groceries',
        description: 'Earn 3% back on grocery store purchases',
        value: '$15',
        category: 'cashback'
      },
      {
        id: 'reward_7',
        title: '2% Cashback on Gas',
        description: 'Earn 2% back at gas stations',
        value: '$10',
        category: 'cashback'
      }
    ]
  };

  // Fetch reward data
  useEffect(() => {
    const fetchReward = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        // For this demo, we'll use mock data
        setTimeout(() => {
          setReward(mockReward);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Failed to load reward details');
        setLoading(false);
      }
    };
    
    fetchReward();
  }, [id]);
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Show error state
  if (error || !reward) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg inline-block mb-4">
          {error || 'Reward not found'}
        </div>
        <button 
          onClick={() => navigate('/rewards')}
          className="btn btn-primary"
        >
          Go back to Rewards
        </button>
      </div>
    );
  }
  
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
      className="max-w-5xl mx-auto pb-12"
    >
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/rewards')}
          className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          <span>Back to Rewards</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reward Details</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-dark-800 border border-gray-100 dark:border-dark-700 mb-6">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                {getCategoryIcon(reward.category)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{reward.title}</h2>
                <p className="text-primary-100 mt-1">{reward.description}</p>
              </div>
            </div>
            <div className="text-3xl font-bold">{reward.value}</div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-dark-700">
            <div className="flex items-center">
              <div 
                className="w-12 h-12 rounded-full mr-4 flex items-center justify-center"
                style={{ backgroundColor: reward.card.color || '#4F46E5' }}
              >
                <CreditCardIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{reward.card.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {reward.card.type} •••• {reward.card.lastFour}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Expires: {reward.expires}
              </span>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3 dark:text-white">About this Reward</h3>
            <p className="text-gray-600 dark:text-gray-400">{reward.longDescription}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3 dark:text-white">How to Redeem</h3>
            <div className="bg-gray-50 p-4 rounded-lg dark:bg-dark-700">
              <div className="flex items-start">
                <div className="bg-white p-2 rounded-full mr-3 dark:bg-dark-600">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {reward.redeem.type === 'automatic' ? 'Automatic Redemption' : 'Manual Redemption'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 dark:text-gray-400">{reward.redeem.instructions}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3 dark:text-white">Terms & Conditions</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-400">
              {reward.terms.map((term, index) => (
                <li key={index}>{term}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {reward.relatedRewards && reward.relatedRewards.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
          <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">Related Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reward.relatedRewards.map(relatedReward => (
              <motion.div 
                key={relatedReward.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-dark-700 dark:border-dark-600"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start">
                  <div className="bg-white p-2 rounded-lg shadow-sm dark:bg-dark-800">
                    {getCategoryIcon(relatedReward.category)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">{relatedReward.title}</h4>
                      <span className="font-bold text-primary-600 dark:text-primary-400">{relatedReward.value}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{relatedReward.description}</p>
                    <Link 
                      to={`/rewards/${relatedReward.id}`}
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center mt-2 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      View reward
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RewardDetailsScreen;