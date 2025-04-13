import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCardsWithRewards, getBestRewardsByCategory, getOffers } from '../../services/api/rewardsApi';
import { 
  GiftIcon, 
  SparklesIcon, 
  ShoppingBagIcon, 
  BuildingOfficeIcon, 
  GlobeAmericasIcon, 
  CreditCardIcon,
  TagIcon,
  FireIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const RewardsScreen = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [offers, setOffers] = useState([]);
  const [bestRewards, setBestRewards] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Groceries');
  const [activeTab, setActiveTab] = useState('rewards'); // 'rewards' or 'offers'

  // Common reward categories
  const categories = [
    { id: 'groceries', name: 'Groceries', icon: <ShoppingBagIcon className="h-5 w-5" /> },
    { id: 'dining', name: 'Dining', icon: <BuildingOfficeIcon className="h-5 w-5" /> },
    { id: 'travel', name: 'Travel', icon: <GlobeAmericasIcon className="h-5 w-5" /> },
    { id: 'gas', name: 'Gas', icon: <BuildingOfficeIcon className="h-5 w-5" /> },
    { id: 'other', name: 'Other purchases', icon: <CreditCardIcon className="h-5 w-5" /> }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch cards with rewards
        const cardsData = await getCardsWithRewards();
        setCards(cardsData);
        
        // Fetch all offers
        const offersData = await getOffers();
        setOffers(offersData);
        
        // Fetch best rewards for active category
        const bestRewardsData = await getBestRewardsByCategory(activeCategory);
        setBestRewards(prevState => ({
          ...prevState,
          [activeCategory]: bestRewardsData
        }));
      } catch (err) {
        console.error('Error fetching rewards data:', err);
        setError('Failed to load rewards data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeCategory]);

  const handleCategoryChange = async (category) => {
    setActiveCategory(category);
    
    // Check if we already have best rewards for this category
    if (!bestRewards[category]) {
      try {
        const bestRewardsData = await getBestRewardsByCategory(category);
        setBestRewards(prevState => ({
          ...prevState,
          [category]: bestRewardsData
        }));
      } catch (err) {
        console.error(`Error fetching best rewards for ${category}:`, err);
      }
    }
  };

  const handleCardClick = (cardName) => {
    navigate(`/rewards/${cardName.replace(/\s+/g, '-').toLowerCase()}`);
  };

  // Function to get color based on reward percentage
  const getRewardColor = (rewardStr) => {
    const percent = parseFloat(rewardStr.replace('%', ''));
    if (percent >= 5) return 'text-success-600 dark:text-success-400';
    if (percent >= 3) return 'text-primary-600 dark:text-primary-400';
    return 'text-gray-700 dark:text-gray-300';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto p-4"
    >
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">Credit Card Rewards & Offers</h1>
        <p className="text-purple-100">
          Maximize your benefits with our reward optimization tools
        </p>
        
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center">
              <SparklesIcon className="h-8 w-8 text-yellow-300 mr-3" />
              <div>
                <p className="text-sm text-indigo-100">Total Rewards Earned</p>
                <p className="text-xl font-bold text-white">$432.50</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center">
              <BanknotesIcon className="h-8 w-8 text-green-300 mr-3" />
              <div>
                <p className="text-sm text-indigo-100">Active Cards</p>
                <p className="text-xl font-bold text-white">{cards.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-8 w-8 text-pink-300 mr-3" />
              <div>
                <p className="text-sm text-indigo-100">Available Offers</p>
                <p className="text-xl font-bold text-white">{offers.length}</p>
              </div>
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
              activeTab === 'optimizer'
                ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('optimizer')}
          >
            <div className="flex items-center">
              <FireIcon className="h-5 w-5 mr-2" />
              <span>Reward Optimizer</span>
            </div>
          </button>
        </nav>
      </div>
      
      {/* Rewards Tab Content */}
      {activeTab === 'rewards' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-dark-800 border border-gray-100 dark:border-dark-700 mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2 text-primary-600" />
              Your Reward Cards
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-dark-700">
            {cards.length > 0 ? (
              cards.map((card, index) => (
                <motion.div 
                  key={index}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-dark-700 cursor-pointer"
                  onClick={() => handleCardClick(card.name)}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{card.name}</h3>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {card.rewards.map((reward, idx) => (
                          <p key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                            <span className="h-2 w-2 rounded-full bg-primary-500 mr-2 flex-shrink-0"></span>
                            <span className="capitalize mr-1">{reward.category}:</span>
                            <span className={`font-medium ${getRewardColor(reward.reward)}`}>
                              {reward.reward} {reward.limit && `(up to ${reward.limit})`}
                            </span>
                          </p>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <button className="btn btn-outline px-4 py-2 text-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-10 text-center">
                <GiftIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No reward cards</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by adding your credit cards to see their rewards.
                </p>
                <div className="mt-6">
                  <button
                    className="btn btn-primary px-4 py-2"
                    onClick={() => navigate('/cards/add')}
                  >
                    Add a Card
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Offers Tab Content */}
      {activeTab === 'offers' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-medium text-gray-900 mb-6 dark:text-white">Special Card Offers</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 dark:bg-dark-800 dark:border-dark-700">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">Chase Sapphire Reserve</h3>
                      <p className="mt-1 text-blue-100">Premium travel rewards card</p>
                    </div>
                    <span className="bg-yellow-300 text-blue-800 text-xs font-bold px-2 py-1 rounded">FEATURED</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">60,000 Points</p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    After spending $4,000 in the first 3 months
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-1" />
                    <span>No foreign transaction fees</span>
                  </div>
                  <button className="btn btn-primary w-full">Learn More</button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 dark:bg-dark-800 dark:border-dark-700">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">AMEX Blue Cash Preferred</h3>
                      <p className="mt-1 text-green-100">6% cash back on groceries</p>
                    </div>
                    <span className="bg-white text-green-800 text-xs font-bold px-2 py-1 rounded">POPULAR</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">$350 Cashback</p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    After spending $3,000 in the first 6 months
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-1" />
                    <span>No annual fee first year</span>
                  </div>
                  <button className="btn btn-primary w-full">Learn More</button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 dark:bg-dark-800 dark:border-dark-700">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">Capital One Venture X</h3>
                      <p className="mt-1 text-purple-100">Premium travel rewards card</p>
                    </div>
                    <span className="bg-white text-purple-800 text-xs font-bold px-2 py-1 rounded">NEW</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">75,000 Miles</p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    After spending $4,000 in the first 3 months
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-1" />
                    <span>10x miles on hotels and rental cars</span>
                  </div>
                  <button className="btn btn-primary w-full">Learn More</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-dark-800 border border-gray-100 dark:border-dark-700 mb-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <TagIcon className="h-5 w-5 mr-2 text-primary-600" />
                All Offers
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-dark-700">
              {offers.length > 0 ? (
                offers.map((offer, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-dark-700">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{offer.card_name}</h3>
                        <p className="text-primary-600 dark:text-primary-400 font-medium">{offer.offer}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{offer.full_text}</p>
                        {offer.category && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              {offer.category}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center">
                        <button className="btn btn-outline px-4 py-2 text-sm">
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center">
                  <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No offers available</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Check back later for new special offers.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Optimizer Tab Content */}
      {activeTab === 'optimizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden dark:bg-dark-800 border border-gray-100 dark:border-dark-700 mb-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <FireIcon className="h-5 w-5 mr-2 text-primary-600" />
                Reward Optimization Dashboard
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-800 dark:text-white mb-3">Select spending category:</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                        activeCategory === category.name
                          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-dark-700 dark:text-gray-300 dark:hover:bg-dark-600'
                      }`}
                      onClick={() => handleCategoryChange(category.name)}
                    >
                      <span className="mr-1.5">{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-800 dark:text-white mb-3">
                  Best cards for {activeCategory}:
                </h3>
                
                {bestRewards[activeCategory] && bestRewards[activeCategory].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bestRewards[activeCategory].slice(0, 4).map((reward, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-lg border ${
                          index === 0 
                            ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-900/50' 
                            : index === 1
                              ? 'border-gray-300 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800'
                              : 'border-gray-200 dark:border-dark-600'
                        }`}
                      >
                        <div className="flex items-start">
                          {index === 0 ? (
                            <div className="bg-yellow-200 p-2 rounded-full text-yellow-700 dark:bg-yellow-700 dark:text-yellow-200 mr-3">
                              <div className="relative">
                                <SparklesIcon className="h-5 w-5" />
                                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">1</span>
                              </div>
                            </div>
                          ) : index === 1 ? (
                            <div className="bg-gray-200 p-2 rounded-full text-gray-700 dark:bg-gray-700 dark:text-gray-200 mr-3">
                              <div className="relative">
                                <SparklesIcon className="h-5 w-5" />
                                <span className="absolute -top-1 -right-1 bg-gray-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">2</span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-9 mr-3"></div> // Spacer for alignment
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {reward.card_name}
                            </h4>
                            <p className={`text-lg font-bold ${index === 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-700 dark:text-gray-300'}`}>
                              {reward.reward}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {reward.full_text || `on ${reward.category}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-lg dark:bg-dark-700">
                    <p className="text-gray-500 dark:text-gray-400">
                      No rewards data available for this category.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-dark-800 border border-gray-100 dark:border-dark-700 mb-6">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2 text-primary-600" />
                  Your Personal Stats
                </h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Most used card</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {cards.length > 0 ? cards[0].name : 'No cards yet'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Top spending category</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">Groceries</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Potential monthly rewards</p>
                    <p className="text-lg font-medium text-green-600 dark:text-green-400">$42.75</p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-dark-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Optimization score</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-dark-700">
                      <div className="bg-green-600 h-2.5 rounded-full w-3/4"></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                      <span>75% - Good</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md overflow-hidden text-white">
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  Did You Know?
                </h2>
                
                <p className="mb-4 text-indigo-100">
                  Using the right card for each purchase could earn you up to 5x more rewards.
                </p>
                
                <button
                  className="bg-white text-indigo-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-50"
                  onClick={() => navigate('/rewards/history')}
                >
                  View Rewards History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RewardsScreen;