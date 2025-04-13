import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, CreditCardIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useCards } from '../../hooks/useCards';
import api from '../../services/api/index';
import LoadingSpinner from '../common/LoadingSpinner';

const CardManagement = () => {
  const navigate = useNavigate();
  const { cards, loading: cardsLoading, error: cardsError, refreshCards } = useCards();
  const [cardTransactions, setCardTransactions] = useState({});
  const [transactionsLoading, setTransactionsLoading] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Fetch transactions for each card
  useEffect(() => {
    const fetchCardTransactions = async () => {
      if (!cards || cards.length === 0) return;
      
      const loadingStates = {};
      cards.forEach(card => {
        loadingStates[card.id] = true;
      });
      setTransactionsLoading(loadingStates);
      
      try {
        // For each card, fetch the most recent transactions
        const transactionPromises = cards.map(async (card) => {
          try {
            // Get transactions for the last 30 days
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            
            const transactions = await api.get(`/transactions?cardId=${card.id}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=5`);
            
            return { cardId: card.id, transactions: transactions || [] };
          } catch (err) {
            console.error(`Error fetching transactions for card ${card.id}:`, err);
            return { cardId: card.id, transactions: [] };
          } finally {
            setTransactionsLoading(prev => ({
              ...prev,
              [card.id]: false
            }));
          }
        });
        
        const results = await Promise.all(transactionPromises);
        
        // Convert to object with cardId as key
        const transactionsMap = {};
        results.forEach(result => {
          transactionsMap[result.cardId] = result.transactions;
        });
        
        setCardTransactions(transactionsMap);
      } catch (err) {
        console.error('Error fetching card transactions:', err);
      } finally {
        setRefreshing(false);
      }
    };
    
    fetchCardTransactions();
  }, [cards]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    refreshCards();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Get the card utilization percentage
  const getUtilizationPercentage = (card) => {
    if (!card.creditLimit) return 0;
    return (card.currentMonthSpending / card.creditLimit) * 100;
  };
  
  // Get color class for utilization bar
  const getUtilizationColorClass = (percentage) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  // Get total spent on a card in the last 30 days
  const getRecentSpending = (cardId) => {
    if (!cardTransactions[cardId]) return 0;
    
    return cardTransactions[cardId]
      .filter(tx => tx.amount < 0) // Only purchases
      .reduce((total, tx) => total + Math.abs(tx.amount), 0);
  };
  
  // Get total rewards earned on a card in the last 30 days
  const getRecentRewards = (cardId) => {
    if (!cardTransactions[cardId]) return 0;
    
    return cardTransactions[cardId]
      .reduce((total, tx) => total + (tx.rewardsEarned || 0), 0);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    hover: {
      y: -10,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    tap: {
      y: -5,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { type: "spring", stiffness: 500, damping: 30 }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Cards</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your credit and debit cards
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors dark:bg-dark-800 dark:hover:bg-dark-700"
            disabled={refreshing}
          >
            <ArrowPathIcon className={`h-5 w-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => navigate('/cards/add')}
            className="btn btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Add Card
          </button>
        </div>
      </div>

      {cardsLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="h-12 w-12" />
        </div>
      ) : cardsError ? (
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-6 text-center">
          <p className="text-red-500 dark:text-red-400">{cardsError}</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
            onClick={refreshCards}
          >
            Try Again
          </button>
        </div>
      ) : cards.length === 0 ? (
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <CreditCardIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No cards found</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Add your first card to start managing your finances.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/cards/add')}
              className="btn btn-primary"
            >
              Add Card
            </button>
          </div>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {cards.map(card => (
            <motion.div
              key={card.id}
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => navigate(`/cards/${card.id}`)}
              className="bg-white dark:bg-dark-800 rounded-xl shadow-md overflow-hidden cursor-pointer"
            >
              {/* Card Display */}
              <div 
                className="h-48 p-6 flex flex-col justify-between"
                style={{ 
                  backgroundColor: card.color || '#4C1D95',
                  backgroundImage: 'linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)'
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="text-white font-bold tracking-widest text-lg">
                    {card.cardType}
                  </div>
                </div>
                
                <div>
                  <div className="text-white text-xl mb-1 font-medium">{card.cardName}</div>
                  <div className="text-white/80 text-sm">•••• {card.cardNumber.slice(-4)}</div>
                </div>
              </div>
              
              {/* Card Details */}
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">Credit Utilization</h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getUtilizationPercentage(card).toFixed(1)}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mb-4">
                  <div 
                    className={`h-2 rounded-full ${getUtilizationColorClass(getUtilizationPercentage(card))}`}
                    style={{ width: `${Math.min(100, getUtilizationPercentage(card))}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span>{formatCurrency(card.currentMonthSpending)} spent</span>
                  <span>{formatCurrency(card.creditLimit)} limit</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3 dark:bg-blue-900/20">
                    <div className="text-sm text-blue-700 dark:text-blue-400 mb-1">30-Day Spending</div>
                    {transactionsLoading[card.id] ? (
                      <div className="flex justify-center p-1">
                        <LoadingSpinner size="h-4 w-4" color="text-blue-500" />
                      </div>
                    ) : (
                      <div className="text-xl font-semibold text-blue-900 dark:text-blue-300">
                        {formatCurrency(getRecentSpending(card.id))}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-3 dark:bg-purple-900/20">
                    <div className="text-sm text-purple-700 dark:text-purple-400 mb-1">Recent Rewards</div>
                    {transactionsLoading[card.id] ? (
                      <div className="flex justify-center p-1">
                        <LoadingSpinner size="h-4 w-4" color="text-purple-500" />
                      </div>
                    ) : (
                      <div className="text-xl font-semibold text-purple-900 dark:text-purple-300">
                        {formatCurrency(getRecentRewards(card.id))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Recent Transactions */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Transactions</h4>
                  {transactionsLoading[card.id] ? (
                    <div className="flex justify-center p-4">
                      <LoadingSpinner size="h-6 w-6" />
                    </div>
                  ) : cardTransactions[card.id] && cardTransactions[card.id].length > 0 ? (
                    <div className="space-y-2">
                      {cardTransactions[card.id].slice(0, 3).map((tx) => (
                        <div key={tx._id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 dark:border-dark-700">
                          <div>
                            <div className="font-medium text-gray-800 dark:text-gray-200">{tx.merchantName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{tx.category}</div>
                          </div>
                          <div className={tx.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                            {tx.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                      No recent transactions
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Add Card Button */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => navigate('/cards/add')}
            className="bg-gray-50 dark:bg-dark-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-600 flex flex-col items-center justify-center p-6 cursor-pointer h-[420px]"
          >
            <div className="rounded-full bg-gray-100 p-6 mb-4 dark:bg-dark-600">
              <PlusIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Add New Card</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs">
              Connect a new credit or debit card to manage all your finances in one place
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CardManagement;