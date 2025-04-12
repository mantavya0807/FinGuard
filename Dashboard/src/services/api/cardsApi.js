import api from './index';
import { CARD_TYPES } from '../constants/cardTypes';

// Mock credit card data for the hackathon
const mockCards = [
  {
    id: 'card_123456',
    cardName: 'Chase Sapphire Reserve',
    cardType: 'VISA',
    cardNumber: '•••• •••• •••• 4567',
    cardHolder: 'Alex Morgan',
    expiryDate: '05/26',
    cvv: '***',
    billingAddress: {
      street: '123 Financial Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    },
    color: '#1E3A8A',
    logo: 'chase-logo.png',
    rewards: {
      travelPoints: 3,
      diningPoints: 3,
      groceryPoints: 1,
      gasCashback: 1,
      generalCashback: 1,
    },
    monthlySpendingLimit: 5000,
    currentMonthSpending: 2340,
    cardAddedDate: new Date('2023-04-12')
  },
  {
    id: 'card_234567',
    cardName: 'Capital One Savor',
    cardType: 'MASTERCARD',
    cardNumber: '•••• •••• •••• 8901',
    cardHolder: 'Alex Morgan',
    expiryDate: '11/25',
    cvv: '***',
    billingAddress: {
      street: '123 Financial Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    },
    color: '#DC2626',
    logo: 'capital-one-logo.png',
    rewards: {
      travelPoints: 1,
      diningPoints: 4,
      groceryPoints: 3,
      gasCashback: 2,
      generalCashback: 1,
    },
    monthlySpendingLimit: 3000,
    currentMonthSpending: 1250,
    cardAddedDate: new Date('2022-11-08')
  },
  {
    id: 'card_345678',
    cardName: 'American Express Blue Cash',
    cardType: 'AMEX',
    cardNumber: '•••• •••• •••• 3456',
    cardHolder: 'Alex Morgan',
    expiryDate: '08/27',
    cvv: '****',
    billingAddress: {
      street: '123 Financial Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    },
    color: '#065F46',
    logo: 'amex-logo.png',
    rewards: {
      travelPoints: 2,
      diningPoints: 1,
      groceryPoints: 6,
      gasCashback: 3,
      generalCashback: 1,
    },
    monthlySpendingLimit: 4000,
    currentMonthSpending: 1890,
    cardAddedDate: new Date('2023-09-15')
  }
];

// Get all cards
export const getCards = async () => {
  try {
    // In a real app, this would hit an actual endpoint
    // For the hackathon, we'll use mock data
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return mockCards;
    
    // In a real implementation, we would call the API
    // return api.get('/cards');
  } catch (error) {
    throw error;
  }
};

// Get card by ID
export const getCardById = async (cardId) => {
  try {
    // In a real app, this would hit an actual endpoint
    // For the hackathon, we'll use mock data
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const card = mockCards.find(card => card.id === cardId);
    
    if (!card) {
      throw new Error('Card not found');
    }
    
    return card;
    
    // In a real implementation, we would call the API
    // return api.get(`/cards/${cardId}`);
  } catch (error) {
    throw error;
  }
};

// Add a new card
export const addCard = async (cardData) => {
  try {
    // In a real app, this would hit an actual endpoint
    // For the hackathon, we'll use mock data
    
    // Validate card data
    if (!cardData.cardNumber || !cardData.cardHolder || !cardData.expiryDate || !cardData.cvv) {
      throw new Error('All card details are required');
    }
    
    // Check card type based on first digit (simplified for demo)
    let cardType = 'VISA';
    const firstDigit = cardData.cardNumber.charAt(0);
    
    if (firstDigit === '3') {
      cardType = 'AMEX';
    } else if (firstDigit === '5') {
      cardType = 'MASTERCARD';
    } else if (firstDigit === '6') {
      cardType = 'DISCOVER';
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a new card object with mock ID and masked card number
    const newCard = {
      id: 'card_' + Math.random().toString(36).substring(2, 10),
      cardName: cardData.cardName || `${cardType} Card`,
      cardType,
      cardNumber: '•••• •••• •••• ' + cardData.cardNumber.slice(-4),
      cardHolder: cardData.cardHolder,
      expiryDate: cardData.expiryDate,
      cvv: '***',
      billingAddress: cardData.billingAddress || {
        street: '123 Default St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      },
      color: cardData.color || '#3B82F6',
      logo: `${cardType.toLowerCase()}-logo.png`,
      rewards: cardData.rewards || {
        travelPoints: 1,
        diningPoints: 1,
        groceryPoints: 1,
        gasCashback: 1,
        generalCashback: 1,
      },
      monthlySpendingLimit: cardData.monthlySpendingLimit || 1000,
      currentMonthSpending: 0,
      cardAddedDate: new Date()
    };
    
    return newCard;
    
    // In a real implementation, we would call the API
    // return api.post('/cards', cardData);
  } catch (error) {
    throw error;
  }
};

// Update a card
export const updateCard = async (cardId, cardData) => {
  try {
    // In a real app, this would hit an actual endpoint
    // For the hackathon, we'll use mock data
    
    // Find the card to update
    const cardIndex = mockCards.findIndex(card => card.id === cardId);
    
    if (cardIndex === -1) {
      throw new Error('Card not found');
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Create updated card with only the fields that can be updated
    const updatedCard = {
      ...mockCards[cardIndex],
      cardName: cardData.cardName || mockCards[cardIndex].cardName,
      billingAddress: cardData.billingAddress || mockCards[cardIndex].billingAddress,
      monthlySpendingLimit: cardData.monthlySpendingLimit || mockCards[cardIndex].monthlySpendingLimit,
      color: cardData.color || mockCards[cardIndex].color,
      rewards: cardData.rewards || mockCards[cardIndex].rewards
    };
    
    return updatedCard;
    
    // In a real implementation, we would call the API
    // return api.put(`/cards/${cardId}`, cardData);
  } catch (error) {
    throw error;
  }
};

// Delete a card
export const deleteCard = async (cardId) => {
  try {
    // In a real app, this would hit an actual endpoint
    // For the hackathon, we'll use mock data
    
    // Check if card exists
    const cardIndex = mockCards.findIndex(card => card.id === cardId);
    
    if (cardIndex === -1) {
      throw new Error('Card not found');
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return { success: true };
    
    // In a real implementation, we would call the API
    // return api.delete(`/cards/${cardId}`);
  } catch (error) {
    throw error;
  }
};

// Get card transactions
export const getCardTransactions = async (cardId, filters = {}) => {
  try {
    // In a real app, this would hit an actual endpoint
    // For the hackathon, we'll use mock data
    
    // Check if card exists
    const card = mockCards.find(card => card.id === cardId);
    
    if (!card) {
      throw new Error('Card not found');
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 900));
    
    // Generate mock transactions for this card
    const mockTransactions = [
      {
        id: 'trx_' + Math.random().toString(36).substring(2, 10),
        cardId,
        merchantName: 'Amazon',
        merchantCategory: 'Shopping',
        amount: 67.99,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        status: 'completed',
        rewardsEarned: 0.68
      },
      {
        id: 'trx_' + Math.random().toString(36).substring(2, 10),
        cardId,
        merchantName: 'Starbucks',
        merchantCategory: 'Dining',
        amount: 5.45,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
        status: 'completed',
        rewardsEarned: card.rewards.diningPoints * 0.01 * 5.45
      },
      {
        id: 'trx_' + Math.random().toString(36).substring(2, 10),
        cardId,
        merchantName: 'Shell Gas',
        merchantCategory: 'Gas',
        amount: 45.20,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
        status: 'completed',
        rewardsEarned: card.rewards.gasCashback * 0.01 * 45.20
      },
      {
        id: 'trx_' + Math.random().toString(36).substring(2, 10),
        cardId,
        merchantName: 'Whole Foods',
        merchantCategory: 'Grocery',
        amount: 87.32,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
        status: 'completed',
        rewardsEarned: card.rewards.groceryPoints * 0.01 * 87.32
      },
      {
        id: 'trx_' + Math.random().toString(36).substring(2, 10),
        cardId,
        merchantName: 'Delta Airlines',
        merchantCategory: 'Travel',
        amount: 325.60,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
        status: 'completed',
        rewardsEarned: card.rewards.travelPoints * 0.01 * 325.60
      }
    ];
    
    // Apply any filters (simplified for demo)
    let filteredTransactions = [...mockTransactions];
    
    if (filters.category) {
      filteredTransactions = filteredTransactions.filter(
        tx => tx.merchantCategory.toLowerCase() === filters.category.toLowerCase()
      );
    }
    
    if (filters.startDate) {
      filteredTransactions = filteredTransactions.filter(
        tx => new Date(tx.date) >= new Date(filters.startDate)
      );
    }
    
    if (filters.endDate) {
      filteredTransactions = filteredTransactions.filter(
        tx => new Date(tx.date) <= new Date(filters.endDate)
      );
    }
    
    return filteredTransactions;
    
    // In a real implementation, we would call the API
    // return api.get(`/cards/${cardId}/transactions`, { params: filters });
  } catch (error) {
    throw error;
  }
};

// Get best card for a merchant/category
export const getBestCardForMerchant = async (merchantName, merchantCategory) => {
  try {
    // In a real app, this would hit an actual endpoint with a sophisticated algorithm
    // For the hackathon, we'll use a simplified approach
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Get all user cards
    const userCards = await getCards();
    
    // Determine which reward category applies
    let relevantRewardType;
    
    switch (merchantCategory.toLowerCase()) {
      case 'travel':
        relevantRewardType = 'travelPoints';
        break;
      case 'dining':
      case 'restaurant':
        relevantRewardType = 'diningPoints';
        break;
      case 'grocery':
      case 'supermarket':
        relevantRewardType = 'groceryPoints';
        break;
      case 'gas':
        relevantRewardType = 'gasCashback';
        break;
      default:
        relevantRewardType = 'generalCashback';
    }
    
    // Find the card with the highest reward rate for this category
    let bestCard = null;
    let highestRewardRate = 0;
    
    userCards.forEach(card => {
      if (card.rewards[relevantRewardType] > highestRewardRate) {
        highestRewardRate = card.rewards[relevantRewardType];
        bestCard = card;
      }
    });
    
    if (!bestCard) {
      throw new Error('No suitable card found');
    }
    
    return {
      card: bestCard,
      rewardRate: highestRewardRate,
      estimatedRewards: `${highestRewardRate}%`,
      category: merchantCategory
    };
    
    // In a real implementation, we would call the API
    // return api.get('/cards/best-for-merchant', { params: { merchantName, merchantCategory } });
  } catch (error) {
    throw error;
  }
};