import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getRewards, getOffers } from '../../services/api/rewardsApi';
import { 
  GiftIcon, 
  SparklesIcon, 
  ArrowLeftIcon, 
  ShoppingBagIcon, 
  BuildingOfficeIcon, 
  CreditCardIcon,
  TagIcon,
  GlobeAmericasIcon,
  CheckCircleIcon,
  FireIcon,
  ChartBarIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const RewardDetailsScreen = () => {
  const { cardName } = useParams();
  const navigate = useNavigate();
  const [cardData, setCardData] = useState(null);
  const [offers, setOffers] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('rewards'); // 'rewards' or 'offers'

  // Format the card name for display (convert from URL format)
  const formattedCardName = cardName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  useEffect(() => {
    const fetchCardData = async () => {
      setLoading(true);
      try {
        // Fetch rewards for this card
        const rewardsData = await getRewards({ card_name: formattedCardName });
        setRewards(rewardsData);
        
        // Fetch offers for this card
        const offersData = await getOffers({ card_name: formattedCardName });
        setOffers(offersData);
        
        // Create card data object
        setCardData({
          name: formattedCardName,
          rewards: rewardsData,
          offers: offersData
        });
      } catch (err) {
        console.error('Error fetching card data:', err);
        setError('Failed to load card information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCardData();
  }, [formattedCardName]);

  // Get category icon
  const getCategoryIcon = (category) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('grocery') || lowerCategory.includes('supermarket')) {
      return <ShoppingBagIcon className="h-5 w-5 text-green-500" />;
    } else if (lowerCategory.includes('dining') || lowerCategory.includes('restaurant')) {
      return <BuildingOfficeIcon className="h-5 w-5 text-red-500" />;
    } else if (lowerCategory.includes('travel') || lowerCategory.includes('flight')) {
      return <GlobeAmericasIcon className="h-5 w-5 text-blue-500" />;
    } else if (lowerCategory.includes('gas') || lowerCategory.includes('fuel')) {
      return <BuildingOfficeIcon className="h-5 w-5 text-orange-500" />;
    }
    return <CreditCardIcon className="h-5 w-5 text-gray-500" />;
  };

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

  if (!cardData) {
    return (
      <div className="p-6 text-center">
        <div className="bg-warning-50 text-warning-700 p-4 rounded-lg dark:bg-warning-900/30 dark:text-warning-400">
          <p>Card not found. Please check the card name and try again.</p>
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
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        Back to Rewards
      </button>
      
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-xl text-white p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">{cardData.name}</h1>
            <p className="text-primary-100">
              {rewards.length} rewards and {offers.length} special offers available
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
              <div className="font-bold text-xl">
                {rewards.length > 0 ? rewards[0].reward : '0%'}
              </div>
              <div className="text-xs">
                Best Rate
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
              <div className="font-bold text-xl">A+</div>
              <div className="text-xs">Card Rating</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-dark-800 border border-gray-100 dark:border-dark-700 p-4">
          <div className="flex items-center">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mr-3">
              <SparklesIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-xs text-gray-500 dark:text-gray-400">Best Reward</h3>
              <p className="font-medium text-gray-900 dark:text-white">
                {rewards.length > 0 ? rewards[0].category : 'None'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-dark-800 border border-gray-100 dark:border-dark-700 p-4">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mr-3">
              <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-xs text-gray-500 dark:text-gray-400">Earning Potential</h3>
              <p className="font-medium text-gray-900 dark:text-white">$320/year</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-dark-800 border border-gray-100 dark:border-dark-700 p-4">
          <div className="flex items-center">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-3">
              <BanknotesIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-xs text-gray-500 dark:text-gray-400">Annual Fee</h3>
              <p className="font-medium text-gray-900 dark:text-white">
                {cardData.name.includes('Reserve') ? '$550' : 
                 cardData.name.includes('Preferred') ? '$95' : '$0'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-dark-800 border border-gray-100 dark:border-dark-700 p-4">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mr-3">
              <TagIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-xs text-gray-500 dark:text-gray-400">Special Offers</h3>
              <p className="font-medium text-gray-900 dark:text-white">{offers.length} Available</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-dark-700">
        <nav className="flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'rewards'
                ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('rewards')}
          >
            <div className="flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2" />
              <span>Rewards</span>
            </div>
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'offers'
                ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('offers')}
          >
            <div className="flex items-center">
              <TagIcon className="h-5 w-5 mr-2" />
              <span>Special Offers</span>
            </div>
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'tips'
                ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('tips')}
          >
            <div className="flex items-center">
              <FireIcon className="h-5 w-5 mr-2" />
              <span>Optimization Tips</span>
            </div>
          </button>
        </nav>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2">
          {/* Rewards Tab Content */}
          {activeTab === 'rewards' && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-dark-800 border border-gray-100 dark:border-dark-700 mb-6">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2 text-primary-600" />
                  Reward Categories
                </h2>
              </div>
              
              <div className="p-6">
                {rewards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rewards.map((reward, index) => (
                      <div 
                        key={index}
                        className="flex flex-col bg-gray-50 p-4 rounded-lg dark:bg-dark-700 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center mb-3">
                          <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm dark:bg-dark-800">
                            {getCategoryIcon(reward.category)}
                          </div>
                          <div className="ml-3">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {reward.category}
                            </h3>
                          </div>
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex items-baseline">
                            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mr-2">
                              {reward.reward}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {reward.reward.includes('%') ? 'cash back' : 'rewards'}
                            </p>
                          </div>
                          
                          {reward.full_text && (
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                              {reward.full_text}
                            </p>
                          )}
                        </div>
                        
                        {reward.limit && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-600">
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Limit: {reward.limit}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-10">
                    <GiftIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No rewards found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      This card doesn't have any rewards information available.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Offers Tab Content */}
          {activeTab === 'offers' && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-dark-800 border border-gray-100 dark:border-dark-700 mb-6">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <TagIcon className="h-5 w-5 mr-2 text-primary-600" />
                  Special Offers
                </h2>
              </div>
              
              <div className="p-6">
                {offers.length > 0 ? (
                  <div className="space-y-6">
                    {offers.map((offer, index) => (
                      <div 
                        key={index}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 dark:border-dark-600"
                      >
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-gray-200 dark:bg-gradient-to-r dark:from-indigo-900/30 dark:to-purple-900/30 dark:border-dark-600">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {offer.offer}
                            </h3>
                            {offer.category && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                {offer.category}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <p className="text-gray-600 dark:text-gray-400">
                            {offer.full_text}
                          </p>
                          
                          <div className="mt-4 flex justify-between items-center">
                            {offer.limit && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Limit: {offer.limit}
                              </p>
                            )}
                            <button className="btn btn-primary px-4 py-2 text-sm">
                              Apply Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-10">
                    <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No offers found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      This card doesn't have any special offers available.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Tips Tab Content */}
          {activeTab === 'tips' && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-dark-800 border border-gray-100 dark:border-dark-700 mb-6">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <FireIcon className="h-5 w-5 mr-2 text-primary-600" />
                  Optimization Tips
                </h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  <div className="bg-green-50 rounded-lg p-4 dark:bg-green-900/20">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center mb-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      Best Uses
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Use this card primarily for {rewards[0]?.category.toLowerCase() || 'everyday purchases'} to maximize your rewards. With {rewards[0]?.reward || 'competitive rewards'}, this is your best option for this category.
                    </p>
                    <div className="mt-3 pt-3 border-t border-green-100 dark:border-green-800/50">
                      <div className="flex items-center">
                        <SparklesIcon className="h-4 w-4 text-green-500 mr-2" />
                        <p className="text-sm text-green-700 dark:text-green-400">
                          Potential annual earnings: $185 in {rewards[0]?.category.toLowerCase() || 'rewards'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 dark:bg-blue-900/20">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center mb-2">
                      <CheckCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                      Pairing Strategy
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Pair this card with a flat-rate cashback card for non-bonus categories. Consider the {
                        cardData.name.includes('Chase') ? 'Citi Double Cash (2% on everything)' : 
                        cardData.name.includes('Amex') ? 'Chase Freedom Unlimited (1.5% on everything)' :
                        'Chase Freedom Unlimited (1.5% on everything)'
                      } for purchases outside of this card's bonus categories.
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 dark:bg-purple-900/20">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center mb-2">
                      <CheckCircleIcon className="h-5 w-5 text-purple-500 mr-2" />
                      Redemption Strategy
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {cardData.name.toLowerCase().includes('chase') 
                        ? 'Redeem points through the Chase travel portal for 25% more value. For even better value, transfer to airline and hotel partners like United, Hyatt, or Southwest.'
                        : cardData.name.toLowerCase().includes('amex')
                          ? 'Transfer points to airline partners for maximum value. Look for transfer bonuses to partners like Delta, British Airways, or ANA for especially good deals.'
                          : 'Redeem rewards for statement credits to get the most direct value. Look for special redemption offers that may appear throughout the year.'}
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4 dark:bg-yellow-900/20">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center mb-2">
                      <CheckCircleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                      Bonus Categories
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Keep an eye out for rotating bonus categories that may offer higher rewards temporarily. {
                        cardData.name.includes('Chase') ? 'Chase often offers bonus promotions through the "Chase Offers" program.' : 
                        cardData.name.includes('Amex') ? 'Check Amex Offers regularly for additional savings and bonus point opportunities.' :
                        'Check your online account frequently for special promotions and offers.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right sidebar */}
        <div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-dark-800 border border-gray-100 dark:border-dark-700 mb-6 sticky top-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-primary-600" />
                Card Summary
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Issuer</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {cardData.name.includes('Chase') ? 'Chase' : 
                     cardData.name.includes('Amex') || cardData.name.includes('American Express') ? 'American Express' :
                     cardData.name.includes('Capital One') ? 'Capital One' : 
                     cardData.name.includes('Citi') ? 'Citi' : 'Unknown Issuer'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Annual Fee</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {cardData.name.includes('Reserve') ? '$550' : 
                     cardData.name.includes('Preferred') ? '$95' : '$0'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Best For</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {rewards.length > 0 ? rewards[0].category : 'General Spending'}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-dark-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Card Value Rating</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-dark-700">
                    <div className="bg-green-600 h-2.5 rounded-full w-4/5"></div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span>8/10 - Excellent Value</span>
                  </p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-700">
                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-4 dark:bg-gradient-to-r dark:from-indigo-900/30 dark:to-purple-900/30">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Earning Potential</h3>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">$320</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Estimated annual rewards based on average spending
                  </p>
                  <button
                    className="w-full mt-4 bg-primary-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                    onClick={() => navigate('/rewards/calculator')}
                  >
                    Personalize Calculation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RewardDetailsScreen;
