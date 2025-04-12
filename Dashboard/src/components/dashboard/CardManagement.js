import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCards } from '../../hooks/useCards';
import Button from '../common/Button';
import Card from '../common/Card';

// Import icons
import { 
  PlusIcon, 
  CreditCardIcon, 
  EllipsisVerticalIcon,
  ChevronRightIcon,
  TrashIcon,
  PencilIcon,
  LockClosedIcon,
  StarIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';

// Import card utility functions
import { maskCardNumber } from '../../services/constants/cardTypes';

const CardManagement = () => {
  const { cards, loading, error, deleteCard } = useCards();
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  
  // Handle add new card
  const handleAddCard = () => {
    setShowAddCardModal(true);
  };
  
  // Handle delete card
  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Are you sure you want to remove this card?')) {
      try {
        await deleteCard(cardId);
      } catch (err) {
        console.error('Error deleting card:', err);
      }
    }
  };
  
  // Render card indicator
  const renderCardTypeIndicator = (cardType) => {
    const indicators = {
      'VISA': (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
          VISA
        </span>
      ),
      'MASTERCARD': (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800">
          MASTERCARD
        </span>
      ),
      'AMEX': (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
          AMEX
        </span>
      ),
      'DISCOVER': (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800">
          DISCOVER
        </span>
      )
    };
    
    return indicators[cardType] || (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
        CARD
      </span>
    );
  };
  
  // Render a credit card
  const renderCreditCard = (card) => {
    // Determine background color style for card
    const getCardBgStyle = () => {
      if (card.color) {
        return { backgroundColor: card.color };
      }
      
      // Default colors based on card type
      const cardColors = {
        'VISA': 'bg-gradient-to-r from-blue-900 to-blue-700',
        'MASTERCARD': 'bg-gradient-to-r from-red-800 to-red-600',
        'AMEX': 'bg-gradient-to-r from-green-800 to-green-600',
        'DISCOVER': 'bg-gradient-to-r from-orange-700 to-yellow-500'
      };
      
      return { className: cardColors[card.cardType] || 'bg-gradient-to-r from-gray-800 to-gray-600' };
    };
    
    const bgStyle = getCardBgStyle();
    const cardClasses = `relative p-5 rounded-xl shadow-lg transition-transform duration-300 transform hover:-translate-y-1 ${bgStyle.className || ''}`;
    
    return (
      <div 
        key={card.id} 
        className={cardClasses} 
        style={bgStyle.backgroundColor ? { backgroundColor: bgStyle.backgroundColor } : {}}
      >
        {/* Card Header */}
        <div className="flex justify-between mb-8">
          <div>
            <img 
              src={`/assets/icons/${card.logo || 'generic-card-logo.png'}`} 
              alt={card.cardName} 
              className="h-10"
            />
          </div>
          <Menu as="div" className="relative">
            <Menu.Button className="text-white hover:text-gray-200 focus:outline-none">
              <EllipsisVerticalIcon className="h-5 w-5" />
            </Menu.Button>
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to={`/cards/${card.id}`}
                        className={`flex items-center px-4 py-2 text-sm ${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit Card
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        <LockClosedIcon className="h-4 w-4 mr-2" />
                        Freeze Card
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        <StarIcon className="h-4 w-4 mr-2" />
                        Set as Default
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                          active ? 'bg-danger-50 text-danger-900' : 'text-danger-700'
                        }`}
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Remove Card
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
        
        {/* Card Number */}
        <div className="mb-6">
          <p className="text-sm text-white text-opacity-80 mb-1">Card Number</p>
          <p className="text-lg font-mono text-white tracking-wider">
            {card.cardNumber || '•••• •••• •••• ••••'}
          </p>
        </div>
        
        {/* Card Details */}
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-white text-opacity-80 mb-1">Card Holder</p>
            <p className="text-white font-medium">{card.cardHolder}</p>
          </div>
          <div>
            <p className="text-sm text-white text-opacity-80 mb-1">Expires</p>
            <p className="text-white font-medium">{card.expiryDate}</p>
          </div>
          <div>
            <p className="text-sm text-white text-opacity-80 mb-1">Type</p>
            <p className="text-white font-medium">{card.cardType}</p>
          </div>
        </div>
      </div>
    );
  };
  
  // Render card list
  const renderCardList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex justify-center items-center py-12 text-danger-600">
          <ExclamationCircleIcon className="h-6 w-6 mr-2" />
          <p>Error loading cards. Please try again later.</p>
        </div>
      );
    }
    
    if (!cards || cards.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <CreditCardIcon className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-500 mb-6">You haven't added any cards yet.</p>
          <Button variant="primary" onClick={handleAddCard}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Your First Card
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {cards.map(card => renderCreditCard(card))}
        
        {/* Add Card Button */}
        <button
          onClick={handleAddCard}
          className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-5 h-44 transition-colors duration-300 hover:border-primary-500 hover:bg-primary-50"
        >
          <PlusIcon className="h-10 w-10 text-gray-400" />
          <p className="mt-2 text-gray-500 font-medium">Add New Card</p>
        </button>
      </div>
    );
  };
  
  // Render card benefits
  const renderCardBenefits = () => {
    if (!cards || cards.length === 0) return null;
    
    return (
      <Card title="Card Rewards & Benefits" className="mb-6">
        <div className="divide-y divide-gray-200">
          {cards.map(card => (
            <div key={`benefits-${card.id}`} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <CreditCardIcon className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-900">{card.cardName}</span>
                </div>
                {renderCardTypeIndicator(card.cardType)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Travel Points</p>
                  <p className="text-lg font-semibold text-primary-600">{card.rewards.travelPoints}x</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Dining Points</p>
                  <p className="text-lg font-semibold text-primary-600">{card.rewards.diningPoints}x</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Grocery Points</p>
                  <p className="text-lg font-semibold text-primary-600">{card.rewards.groceryPoints}x</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Gas Cashback</p>
                  <p className="text-lg font-semibold text-primary-600">{card.rewards.gasCashback}%</p>
                </div>
              </div>
              
              <Link to={`/cards/${card.id}`} className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center">
                View Card Details
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
          ))}
        </div>
      </Card>
    );
  };
  
  // Render spending limits
  const renderSpendingLimits = () => {
    if (!cards || cards.length === 0) return null;
    
    return (
      <Card title="Monthly Spending Limits" className="mb-6">
        <div className="divide-y divide-gray-200">
          {cards.map(card => (
            <div key={`limits-${card.id}`} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <CreditCardIcon className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-900">{card.cardName}</span>
                </div>
                <div className="text-sm text-gray-500">
                  ${card.currentMonthSpending.toFixed(2)} / ${card.monthlySpendingLimit.toFixed(2)}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    (card.currentMonthSpending / card.monthlySpendingLimit) > 0.9 
                      ? 'bg-danger-500' 
                      : (card.currentMonthSpending / card.monthlySpendingLimit) > 0.75
                        ? 'bg-warning-500'
                        : 'bg-success-500'
                  }`}
                  style={{ width: `${Math.min(100, (card.currentMonthSpending / card.monthlySpendingLimit) * 100)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between mt-2">
                <div className="text-sm text-gray-500">
                  {((card.currentMonthSpending / card.monthlySpendingLimit) * 100).toFixed(0)}% of limit used
                </div>
                <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                  Adjust Limit
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Your Cards</h2>
        <Button variant="primary" onClick={handleAddCard}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Card
        </Button>
      </div>
      
      {renderCardList()}
      {renderCardBenefits()}
      {renderSpendingLimits()}
      
      {/* We would need to implement the Add Card Modal here */}
    </div>
  );
};

export default CardManagement;