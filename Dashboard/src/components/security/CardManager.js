import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCards } from '../../hooks/useCards';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  CreditCardIcon, 
  PlusIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  TrashIcon,
  PencilSquareIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const CardManager = () => {
  const { cards, loading, error, deleteCard, refreshCards } = useCards();
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);

  useEffect(() => {
    let isMounted = true;
    // Fetch security alerts for cards
    const fetchSecurityAlerts = async () => {
      try {
        // Fix the API URL to use the correct backend port
        const response = await fetch('http://localhost:5000/api/cards/security-alerts');
        
        // Only update state if component is still mounted
        if (!isMounted) return;
        
        const data = await response.json();
        if (data && Array.isArray(data)) {
          setSecurityAlerts(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching security alerts:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoadingAlerts(false);
        }
      }
    };
    
    fetchSecurityAlerts();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []); // Remove 'cards' dependency - only run once on mount

  const handleAddCard = () => {
    navigate('/cards/add');
  };

  const handleViewDetails = (cardId) => {
    navigate(`/cards/${cardId}`);
  };

  const handleEditCard = (cardId) => {
    navigate(`/cards/${cardId}/edit`);
  };

  const confirmDelete = (card) => {
    setSelectedCard(card);
    setShowDeleteModal(true);
  };

  const handleDeleteCard = async () => {
    if (!selectedCard) return;
    
    try {
      await deleteCard(selectedCard.id);
      toast.success('Card deleted successfully');
      setShowDeleteModal(false);
      setSelectedCard(null);
    } catch (err) {
      toast.error('Failed to delete card');
      console.error('Error deleting card:', err);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedCard(null);
  };

  // Get alerts for a specific card
  const getCardAlerts = (cardId) => {
    return securityAlerts.filter(alert => alert.cardId === cardId);
  };

  const renderCardList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-12">
          <LoadingSpinner size="h-10 w-10" />
          <p className="ml-4 text-gray-600 dark:text-gray-300">Loading your cards...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
          <p>Error loading cards: {error}</p>
          <button 
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
            onClick={refreshCards}
          >
            Try again
          </button>
        </div>
      );
    }

    if (!cards || cards.length === 0) {
      return (
        <div className="text-center py-12 px-4">
          <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No cards found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by adding your first card.
          </p>
          <div className="mt-6">
            <button
              onClick={handleAddCard}
              className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add New Card
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(card => {
          const cardAlerts = getCardAlerts(card.id);
          const hasAlerts = cardAlerts.length > 0;
          
          return (
            <motion.div
              key={card.id}
              className="bg-white dark:bg-dark-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-dark-700 relative"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {hasAlerts && (
                <div className="absolute top-2 right-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium text-xs rounded-full px-2 py-1 flex items-center">
                  <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                  {cardAlerts.length} Alert{cardAlerts.length > 1 ? 's' : ''}
                </div>
              )}
              
              <div 
                className="h-32 p-4 flex items-center justify-between"
                style={{ 
                  background: card.color || '#4F46E5',
                  backgroundImage: 'linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 100%)'
                }}
              >
                <div className="text-white">
                  <p className="text-sm opacity-80">
                    •••• •••• •••• {card.cardNumber ? card.cardNumber.slice(-4) : '****'}
                  </p>
                  <p className="font-medium mt-1">{card.cardName}</p>
                  <p className="text-sm mt-3 opacity-80">{card.cardHolder}</p>
                </div>
                
                <div className="text-white">
                  <div className="opacity-80 text-xs">Expires</div>
                  <div>{card.expiryDate}</div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium text-gray-900 dark:text-white flex items-center">
                    <CreditCardIcon className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
                    {card.cardType}
                  </div>
                  {hasAlerts ? (
                    <div className="text-red-600 dark:text-red-400 text-sm flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      Security alerts
                    </div>
                  ) : (
                    <div className="text-green-600 dark:text-green-400 text-sm flex items-center">
                      <ShieldCheckIcon className="h-4 w-4 mr-1" />
                      Secure
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex justify-between">
                  {card.currentMonthSpending !== undefined && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Spending</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${card.currentMonthSpending.toLocaleString()}
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          / ${card.monthlySpendingLimit?.toLocaleString() || '0'}
                        </span>
                      </p>
                    </div>
                  )}
                  
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleViewDetails(card.id)}
                      className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700"
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleEditCard(card.id)}
                      className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700"
                      title="Edit Card"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => confirmDelete(card)}
                      className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700"
                      title="Delete Card"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Progress bar for spending limit */}
                {card.currentMonthSpending !== undefined && card.monthlySpendingLimit && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-dark-700">
                      <div 
                        className={`h-2 rounded-full ${
                          (card.currentMonthSpending / card.monthlySpendingLimit) > 0.9 
                            ? 'bg-red-500' 
                            : (card.currentMonthSpending / card.monthlySpendingLimit) > 0.75
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`} 
                        style={{ 
                          width: `${Math.min(100, (card.currentMonthSpending / card.monthlySpendingLimit) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {hasAlerts && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-700">
                    <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Security Alerts:</h4>
                    <ul className="space-y-1">
                      {cardAlerts.slice(0, 2).map((alert, index) => (
                        <li key={index} className="text-xs text-gray-700 dark:text-gray-300 flex items-start">
                          <ExclamationTriangleIcon className="h-3 w-3 text-red-500 mr-1 flex-shrink-0 mt-0.5" />
                          <span>{alert.message}</span>
                        </li>
                      ))}
                      {cardAlerts.length > 2 && (
                        <li className="text-xs text-primary-600 dark:text-primary-400">
                          <Link to={`/cards/${card.id}`}>
                            View all {cardAlerts.length} alerts...
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Cards</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your credit and debit cards</p>
        </div>
        <button
          onClick={handleAddCard}
          className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add New Card
        </button>
      </div>

      {/* Security Alerts Summary */}
      {securityAlerts.length > 0 && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Security Alerts Detected</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                We've detected {securityAlerts.length} security concern{securityAlerts.length > 1 ? 's' : ''} with your cards. 
                Please review the alerts for each affected card.
              </p>
            </div>
          </div>
        </div>
      )}

      {renderCardList()}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-dark-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-dark-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Delete Card
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete the card "{selectedCard?.cardName}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-dark-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm dark:bg-red-700 dark:hover:bg-red-800"
                  onClick={handleDeleteCard}
                >
                  Delete
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-dark-700 dark:border-dark-600 dark:text-white dark:hover:bg-dark-600"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardManager;