import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCardIcon, EllipsisVerticalIcon, ChevronRightIcon, LockClosedIcon, PencilIcon } from '@heroicons/react/24/outline';

const CardDropdown = ({ children, isOpen, setIsOpen, position = "right" }) => {
  return (
    <div className="relative">
      {isOpen && (
        <div 
          className={`absolute ${position === "right" ? "right-0" : "left-0"} mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 divide-y divide-gray-100`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

const CreditCard = ({ card, onViewDetails, onFreeze, onEdit }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Format expiry date to MM/YY
  const formatExpiryDate = (date) => {
    if (!date) return 'MM/YY';
    return date;
  };
  
  // Format last 4 digits of card number
  const getLast4 = (cardNumber) => {
    if (!cardNumber) return '****';
    const parts = cardNumber.split(' ');
    return parts[parts.length - 1];
  };
  
  // Get card type logo
  const getCardLogo = (type) => {
    switch (type) {
      case 'VISA':
        return (
          <div className="text-white font-bold tracking-widest text-lg">VISA</div>
        );
      case 'MASTERCARD':
        return (
          <div className="flex space-x-1">
            <div className="h-6 w-6 rounded-full bg-red-500 opacity-80"></div>
            <div className="h-6 w-6 rounded-full bg-yellow-500 opacity-80"></div>
          </div>
        );
      case 'AMEX':
        return (
          <div className="text-white font-bold tracking-widest text-lg">AMEX</div>
        );
      default:
        return <CreditCardIcon className="h-8 w-8 text-white" />;
    }
  };
  
  return (
    <div className="w-full relative" style={{ perspective: "1000px" }}>
      <motion.div 
        className="relative w-full h-56 rounded-xl cursor-pointer"
        style={{ 
          transformStyle: "preserve-3d",
          transition: "transform 0.5s"
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        onClick={flipCard}
      >
        {/* Front of the card */}
        <motion.div 
          className="absolute w-full h-full rounded-xl shadow-lg overflow-hidden"
          style={{ 
            backgroundColor: card.color || '#4C1D95',
            backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)`,
            backfaceVisibility: "hidden"
          }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="p-6 flex flex-col justify-between h-full">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                {getCardLogo(card.cardType)}
              </div>
              <div className="relative">
                <button 
                  className="text-white hover:text-gray-200 focus:outline-none"
                  onClick={handleMenuToggle}
                >
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </button>
                
                {isMenuOpen && (
                  <CardDropdown isOpen={isMenuOpen} setIsOpen={setIsMenuOpen}>
                    <div className="px-1 py-1">
                      <button
                        className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          onViewDetails(card.id);
                        }}
                      >
                        <ChevronRightIcon className="mr-2 h-5 w-5" />
                        View Details
                      </button>
                      <button
                        className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          onEdit(card.id);
                        }}
                      >
                        <PencilIcon className="mr-2 h-5 w-5" />
                        Edit Card
                      </button>
                    </div>
                    <div className="px-1 py-1">
                      <button
                        className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          onFreeze(card.id);
                        }}
                      >
                        <LockClosedIcon className="mr-2 h-5 w-5" />
                        {card.frozen ? 'Unfreeze Card' : 'Freeze Card'}
                      </button>
                    </div>
                  </CardDropdown>
                )}
              </div>
            </div>
            
            {/* Chip */}
            <div className="flex items-center mb-4">
              <div className="h-10 w-14 bg-yellow-300 rounded-md bg-opacity-80 mr-2 p-1">
                <div className="h-full w-full border-2 border-yellow-500 rounded opacity-50"></div>
              </div>
              {card.frozen && (
                <div className="flex items-center bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                  <LockClosedIcon className="h-3 w-3 mr-1" />
                  FROZEN
                </div>
              )}
            </div>
            
            {/* Card Number */}
            <div className="mb-6">
              <div className="text-xs text-white text-opacity-80 mb-1">Card Number</div>
              <div className="font-mono text-xl text-white tracking-wider">{card.cardNumber}</div>
            </div>
            
            {/* Card Details */}
            <div className="flex justify-between text-white">
              <div>
                <div className="text-xs text-white text-opacity-80 mb-1">Card Holder</div>
                <div className="font-medium tracking-wide">{card.cardHolder}</div>
              </div>
              <div>
                <div className="text-xs text-white text-opacity-80 mb-1">Expires</div>
                <div className="font-medium">{formatExpiryDate(card.expiryDate)}</div>
              </div>
            </div>
          </div>
          
          {/* Decorative card design elements */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-0 right-0 h-32 w-32 bg-white bg-opacity-5 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 h-24 w-24 bg-white bg-opacity-5 rounded-full -ml-12 -mb-12"></div>
          </div>
        </motion.div>
        
        {/* Back of the card */}
        <motion.div 
          className="absolute w-full h-full rounded-xl shadow-lg overflow-hidden"
          style={{ 
            backgroundColor: card.color || '#4C1D95',
            backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)`,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div className="h-full flex flex-col">
            {/* Black magnetic strip */}
            <div className="h-12 bg-black mt-6 w-full"></div>
            
            {/* CVV */}
            <div className="flex-1 p-6">
              <div className="bg-white bg-opacity-90 p-2 h-10 flex items-center justify-end rounded-sm mt-6">
                <div className="text-gray-900 font-mono tracking-widest text-right">***</div>
              </div>
              
              <div className="mt-6">
                <div className="text-xs text-white text-opacity-80 mb-1">Card Type</div>
                <div className="text-white font-medium">{card.cardType}</div>
              </div>
              
              <div className="mt-4">
                <div className="text-xs text-white text-opacity-80 mb-1">Card ID</div>
                <div className="text-white font-mono text-sm">{card.id}</div>
              </div>
              
              <div className="mt-8 text-white text-opacity-70 text-xs max-w-xs">
                For customer service, please call the number on the front of the card.
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Card usage info */}
      {!isFlipped && (
        <div className="mt-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100 dark:bg-dark-800 dark:border-dark-700">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Spending</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                ${card.currentMonthSpending.toLocaleString()}
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  / ${card.monthlySpendingLimit.toLocaleString()}
                </span>
              </p>
            </div>
            
            <motion.button
              className="btn-primary py-1 px-3 text-sm rounded-lg inline-flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(card.id);
              }}
            >
              Details
            </motion.button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-dark-700">
            <motion.div 
              className={`h-2.5 rounded-full ${
                (card.currentMonthSpending / card.monthlySpendingLimit) > 0.9 
                  ? 'bg-danger-500' 
                  : (card.currentMonthSpending / card.monthlySpendingLimit) > 0.75
                    ? 'bg-warning-500'
                    : 'bg-success-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (card.currentMonthSpending / card.monthlySpendingLimit) * 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            ></motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function CreditCardsShowcase() {
  // Sample cards data
  const cards = [
    {
      id: 'card_123456',
      cardName: 'Chase Sapphire Reserve',
      cardType: 'VISA',
      cardNumber: '•••• •••• •••• 4567',
      cardHolder: 'Alex Morgan',
      expiryDate: '05/26',
      cvv: '***',
      color: '#1E3A8A',
      rewards: {
        travelPoints: 3,
        diningPoints: 3,
        groceryPoints: 1,
        gasCashback: 1,
        generalCashback: 1,
      },
      monthlySpendingLimit: 5000,
      currentMonthSpending: 2340,
      frozen: false
    },
    {
      id: 'card_234567',
      cardName: 'Capital One Savor',
      cardType: 'MASTERCARD',
      cardNumber: '•••• •••• •••• 8901',
      cardHolder: 'Alex Morgan',
      expiryDate: '11/25',
      cvv: '***',
      color: '#7F1D1D',
      rewards: {
        travelPoints: 1,
        diningPoints: 4,
        groceryPoints: 3,
        gasCashback: 2,
        generalCashback: 1,
      },
      monthlySpendingLimit: 3000,
      currentMonthSpending: 1250,
      frozen: true
    }
  ];

  const handleViewDetails = (cardId) => {
    alert(`View details for card ${cardId}`);
  };

  const handleFreeze = (cardId) => {
    alert(`Freeze/unfreeze card ${cardId}`);
  };

  const handleEdit = (cardId) => {
    alert(`Edit card ${cardId}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">My Credit Cards</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map(card => (
          <CreditCard 
            key={card.id}
            card={card}
            onViewDetails={handleViewDetails}
            onFreeze={handleFreeze}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </div>
  );
}