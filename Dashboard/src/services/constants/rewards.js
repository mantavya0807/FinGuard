// Common credit card reward programs and benefits
export const REWARDS = {
    // Cash Back Programs
    GENERAL_CASHBACK: {
      name: 'Cash Back',
      type: 'cashback',
      description: 'Earn cash back on all purchases',
      icon: 'cashback-icon.svg',
      color: '#16A34A' // success-600
    },
    ROTATING_CASHBACK: {
      name: 'Rotating Cash Back',
      type: 'cashback',
      description: 'Earn bonus cash back in categories that change quarterly',
      icon: 'rotating-cashback-icon.svg',
      color: '#059669' // green-600
    },
    CATEGORY_CASHBACK: {
      name: 'Category Cash Back',
      type: 'cashback',
      description: 'Earn bonus cash back in specific spending categories',
      icon: 'category-cashback-icon.svg',
      color: '#10B981' // green-500
    },
    
    // Points Programs
    TRAVEL_POINTS: {
      name: 'Travel Points',
      type: 'points',
      description: 'Earn points for travel purchases',
      icon: 'travel-points-icon.svg',
      color: '#3B82F6' // blue-500
    },
    DINING_POINTS: {
      name: 'Dining Points',
      type: 'points',
      description: 'Earn points for restaurant and dining purchases',
      icon: 'dining-points-icon.svg',
      color: '#EC4899' // pink-500
    },
    GROCERY_POINTS: {
      name: 'Grocery Points',
      type: 'points',
      description: 'Earn points for grocery store purchases',
      icon: 'grocery-points-icon.svg',
      color: '#8B5CF6' // purple-500
    },
    GENERAL_POINTS: {
      name: 'General Points',
      type: 'points',
      description: 'Earn points on all purchases',
      icon: 'general-points-icon.svg',
      color: '#6366F1' // indigo-500
    },
    
    // Miles Programs
    AIRLINE_MILES: {
      name: 'Airline Miles',
      type: 'miles',
      description: 'Earn miles that can be redeemed for flights',
      icon: 'airline-miles-icon.svg',
      color: '#2563EB' // blue-600
    },
    FLEXIBLE_TRAVEL: {
      name: 'Flexible Travel Rewards',
      type: 'miles',
      description: 'Earn miles that can be transferred to multiple travel partners',
      icon: 'flexible-travel-icon.svg',
      color: '#1D4ED8' // blue-700
    },
    
    // Special Benefits
    WELCOME_BONUS: {
      name: 'Welcome Bonus',
      type: 'bonus',
      description: 'One-time bonus for meeting initial spending requirement',
      icon: 'welcome-bonus-icon.svg',
      color: '#F59E0B' // amber-500
    },
    ANNUAL_BONUS: {
      name: 'Annual Bonus',
      type: 'bonus',
      description: 'Bonus points or benefits on your card anniversary',
      icon: 'annual-bonus-icon.svg',
      color: '#D97706' // amber-600
    },
    NO_ANNUAL_FEE: {
      name: 'No Annual Fee',
      type: 'fee',
      description: 'This card has no annual fee',
      icon: 'no-annual-fee-icon.svg',
      color: '#4B5563' // gray-600
    },
    NO_FOREIGN_TRANSACTION: {
      name: 'No Foreign Transaction Fees',
      type: 'fee',
      description: 'No fees on purchases made outside the US',
      icon: 'no-foreign-fee-icon.svg',
      color: '#4B5563' // gray-600
    },
    AIRPORT_LOUNGE: {
      name: 'Airport Lounge Access',
      type: 'travel',
      description: 'Complimentary access to airport lounges',
      icon: 'airport-lounge-icon.svg',
      color: '#7C3AED' // violet-600
    },
    TSA_PRECHECK: {
      name: 'TSA PreCheck or Global Entry',
      type: 'travel',
      description: 'Credit for TSA PreCheck or Global Entry application fee',
      icon: 'tsa-precheck-icon.svg',
      color: '#7C3AED' // violet-600
    },
    RENTAL_CAR_INSURANCE: {
      name: 'Rental Car Insurance',
      type: 'travel',
      description: 'Coverage for rental car damage or theft',
      icon: 'rental-car-icon.svg',
      color: '#7C3AED' // violet-600
    },
    EXTENDED_WARRANTY: {
      name: 'Extended Warranty',
      type: 'purchase',
      description: 'Extends manufacturer warranty on eligible purchases',
      icon: 'extended-warranty-icon.svg',
      color: '#4B5563' // gray-600
    },
    PURCHASE_PROTECTION: {
      name: 'Purchase Protection',
      type: 'purchase',
      description: 'Coverage for damaged or stolen items',
      icon: 'purchase-protection-icon.svg',
      color: '#4B5563' // gray-600
    },
    PRICE_PROTECTION: {
      name: 'Price Protection',
      type: 'purchase',
      description: 'Refund if you find a lower price on an eligible purchase',
      icon: 'price-protection-icon.svg',
      color: '#4B5563' // gray-600
    },
    ZERO_LIABILITY: {
      name: 'Zero Liability Protection',
      type: 'security',
      description: 'Not responsible for unauthorized charges',
      icon: 'zero-liability-icon.svg',
      color: '#4B5563' // gray-600
    },
    FRAUD_ALERTS: {
      name: 'Fraud Alerts',
      type: 'security',
      description: 'Real-time notifications of suspicious activity',
      icon: 'fraud-alerts-icon.svg',
      color: '#4B5563' // gray-600
    }
  };
  
  // Common credit card issuers with their reward programs
  export const CARD_ISSUERS = {
    'CHASE': {
      name: 'Chase',
      logo: 'chase-logo.png',
      primaryColor: '#1A6FB0',
      secondaryColor: '#006BB6',
      textColor: '#FFFFFF',
      rewardProgram: 'Ultimate Rewards',
      rewardTypes: ['points', 'cashback'],
      popularCards: [
        'Chase Sapphire Preferred',
        'Chase Sapphire Reserve',
        'Chase Freedom Unlimited',
        'Chase Freedom Flex'
      ]
    },
    'AMEX': {
      name: 'American Express',
      logo: 'amex-logo.png',
      primaryColor: '#006FCF',
      secondaryColor: '#0072CE',
      textColor: '#FFFFFF',
      rewardProgram: 'Membership Rewards',
      rewardTypes: ['points', 'cashback'],
      popularCards: [
        'American Express Gold Card',
        'American Express Platinum Card',
        'American Express Blue Cash Preferred',
        'American Express Green Card'
      ]
    },
    'CAPITAL_ONE': {
      name: 'Capital One',
      logo: 'capital-one-logo.png',
      primaryColor: '#004977',
      secondaryColor: '#D03027',
      textColor: '#FFFFFF',
      rewardProgram: 'Capital One Rewards',
      rewardTypes: ['miles', 'cashback'],
      popularCards: [
        'Capital One Venture',
        'Capital One Quicksilver',
        'Capital One Savor',
        'Capital One SavorOne'
      ]
    },
    'CITI': {
      name: 'Citi',
      logo: 'citi-logo.png',
      primaryColor: '#003A79',
      secondaryColor: '#C31C4A',
      textColor: '#FFFFFF',
      rewardProgram: 'ThankYou Points',
      rewardTypes: ['points', 'cashback'],
      popularCards: [
        'Citi Premier',
        'Citi Double Cash',
        'Citi Custom Cash',
        'Citi Rewards+'
      ]
    },
    'DISCOVER': {
      name: 'Discover',
      logo: 'discover-logo.png',
      primaryColor: '#FF6600',
      secondaryColor: '#EBF8FF',
      textColor: '#000000',
      rewardProgram: 'Discover Cashback',
      rewardTypes: ['cashback'],
      popularCards: [
        'Discover it Cash Back',
        'Discover it Miles',
        'Discover it Chrome',
        'Discover it Student Cash Back'
      ]
    },
    'BANK_OF_AMERICA': {
      name: 'Bank of America',
      logo: 'bofa-logo.png',
      primaryColor: '#012169',
      secondaryColor: '#E31837',
      textColor: '#FFFFFF',
      rewardProgram: 'Bank of America Rewards',
      rewardTypes: ['points', 'cashback'],
      popularCards: [
        'Bank of America Customized Cash Rewards',
        'Bank of America Travel Rewards',
        'Bank of America Premium Rewards',
        'Bank of America Unlimited Cash Rewards'
      ]
    },
    'WELLS_FARGO': {
      name: 'Wells Fargo',
      logo: 'wells-fargo-logo.png',
      primaryColor: '#D71E28',
      secondaryColor: '#FFFF00',
      textColor: '#FFFFFF',
      rewardProgram: 'Wells Fargo Rewards',
      rewardTypes: ['points', 'cashback'],
      popularCards: [
        'Wells Fargo Active Cash',
        'Wells Fargo Reflect',
        'Wells Fargo Autograph',
        'Wells Fargo Visa Signature'
      ]
    },
    'US_BANK': {
      name: 'U.S. Bank',
      logo: 'us-bank-logo.png',
      primaryColor: '#002D72',
      secondaryColor: '#D1D3D4',
      textColor: '#FFFFFF',
      rewardProgram: 'U.S. Bank Rewards',
      rewardTypes: ['points', 'cashback'],
      popularCards: [
        'U.S. Bank Altitude Reserve',
        'U.S. Bank Altitude Go',
        'U.S. Bank Cash+',
        'U.S. Bank Altitude Connect'
      ]
    }
  };
  
  // Popular consumer cards with their reward structures
  export const POPULAR_CARDS = {
    'CHASE_SAPPHIRE_RESERVE': {
      name: 'Chase Sapphire Reserve',
      issuer: 'CHASE',
      type: 'VISA',
      annualFee: 550,
      signupBonus: '60,000 points after spending $4,000 in the first 3 months',
      pointsMultipliers: {
        travel: 3,
        dining: 3,
        general: 1
      },
      benefits: [
        'TRAVEL_POINTS',
        'DINING_POINTS',
        'NO_FOREIGN_TRANSACTION',
        'AIRPORT_LOUNGE',
        'TSA_PRECHECK',
        'RENTAL_CAR_INSURANCE'
      ],
      recommendedFor: ['Frequent travelers', 'Dining enthusiasts', 'Luxury benefits'],
      color: '#1A365D'
    },
    'AMEX_GOLD': {
      name: 'American Express Gold Card',
      issuer: 'AMEX',
      type: 'AMEX',
      annualFee: 250,
      signupBonus: '60,000 Membership Rewards points after spending $4,000 in the first 6 months',
      pointsMultipliers: {
        restaurants: 4,
        supermarkets: 4,
        flights: 3,
        general: 1
      },
      benefits: [
        'DINING_POINTS',
        'GROCERY_POINTS',
        'TRAVEL_POINTS',
        'WELCOME_BONUS'
      ],
      recommendedFor: ['Foodies', 'Grocery shoppers', 'Travelers'],
      color: '#B7935B'
    },
    'CAPITAL_ONE_VENTURE': {
      name: 'Capital One Venture',
      issuer: 'CAPITAL_ONE',
      type: 'VISA',
      annualFee: 95,
      signupBonus: '75,000 miles after spending $4,000 in the first 3 months',
      pointsMultipliers: {
        travel: 5,
        general: 2
      },
      benefits: [
        'FLEXIBLE_TRAVEL',
        'NO_FOREIGN_TRANSACTION',
        'TSA_PRECHECK',
        'WELCOME_BONUS'
      ],
      recommendedFor: ['Travel hackers', 'Straightforward rewards', 'Moderate annual fee'],
      color: '#004977'
    },
    'DISCOVER_IT_CASH': {
      name: 'Discover it Cash Back',
      issuer: 'DISCOVER',
      type: 'DISCOVER',
      annualFee: 0,
      signupBonus: 'Cash back match at the end of the first year',
      pointsMultipliers: {
        rotatingCategories: 5,
        general: 1
      },
      benefits: [
        'ROTATING_CASHBACK',
        'NO_ANNUAL_FEE',
        'WELCOME_BONUS',
        'ZERO_LIABILITY'
      ],
      recommendedFor: ['No annual fee seekers', 'Cash back maximizers', 'First-time cardholders'],
      color: '#FF6600'
    },
    'AMEX_BLUE_CASH_PREFERRED': {
      name: 'American Express Blue Cash Preferred',
      issuer: 'AMEX',
      type: 'AMEX',
      annualFee: 95,
      signupBonus: '$350 statement credit after spending $3,000 in the first 6 months',
      pointsMultipliers: {
        supermarkets: 6,
        streaming: 6,
        gas: 3,
        transit: 3,
        general: 1
      },
      benefits: [
        'CATEGORY_CASHBACK',
        'GROCERY_POINTS',
        'WELCOME_BONUS',
        'PURCHASE_PROTECTION'
      ],
      recommendedFor: ['Families', 'Grocery shoppers', 'Commuters'],
      color: '#0072CE'
    },
    'CITI_DOUBLE_CASH': {
      name: 'Citi Double Cash',
      issuer: 'CITI',
      type: 'MASTERCARD',
      annualFee: 0,
      signupBonus: 'None',
      pointsMultipliers: {
        general: 2 // 1% when you buy, 1% when you pay
      },
      benefits: [
        'GENERAL_CASHBACK',
        'NO_ANNUAL_FEE',
        'ZERO_LIABILITY',
        'FRAUD_ALERTS'
      ],
      recommendedFor: ['Simplicity fans', 'Flat-rate cashback seekers', 'No annual fee seekers'],
      color: '#003A79'
    },
    'CHASE_FREEDOM_UNLIMITED': {
      name: 'Chase Freedom Unlimited',
      issuer: 'CHASE',
      type: 'VISA',
      annualFee: 0,
      signupBonus: 'Additional 1.5% cash back on all purchases (up to $20,000) in the first year',
      pointsMultipliers: {
        travel: 5,
        dining: 3,
        drugstores: 3,
        general: 1.5
      },
      benefits: [
        'CATEGORY_CASHBACK',
        'GENERAL_CASHBACK',
        'NO_ANNUAL_FEE',
        'PURCHASE_PROTECTION'
      ],
      recommendedFor: ['Chase ecosystem users', 'Everyday spenders', 'Rewards maximizers'],
      color: '#006BB6'
    },
    'CAPITAL_ONE_SAVOR': {
      name: 'Capital One Savor',
      issuer: 'CAPITAL_ONE',
      type: 'MASTERCARD',
      annualFee: 95,
      signupBonus: '$300 cash bonus after spending $3,000 in the first 3 months',
      pointsMultipliers: {
        dining: 4,
        entertainment: 4,
        streaming: 4,
        grocery: 3,
        general: 1
      },
      benefits: [
        'CATEGORY_CASHBACK',
        'DINING_POINTS',
        'NO_FOREIGN_TRANSACTION',
        'EXTENDED_WARRANTY'
      ],
      recommendedFor: ['Foodies', 'Entertainment enthusiasts', 'Active lifestyles'],
      color: '#D03027'
    }
  };
  
  // Get card issuer data
  export const getCardIssuer = (issuerId) => {
    return CARD_ISSUERS[issuerId] || null;
  };
  
  // Get reward data
  export const getReward = (rewardId) => {
    return REWARDS[rewardId] || null;
  };
  
  // Get popular card data
  export const getPopularCard = (cardId) => {
    return POPULAR_CARDS[cardId] || null;
  };
  
  // Get recommended cards for a category
  export const getRecommendedCardsForCategory = (category) => {
    const recommendations = [];
    
    for (const [cardId, card] of Object.entries(POPULAR_CARDS)) {
      // Check point multipliers for this category
      if (card.pointsMultipliers[category.toLowerCase()] && 
          card.pointsMultipliers[category.toLowerCase()] > 1) {
        recommendations.push({
          ...card,
          id: cardId,
          multiplier: card.pointsMultipliers[category.toLowerCase()]
        });
      }
    }
    
    // Sort by point multiplier (highest first)
    return recommendations.sort((a, b) => b.multiplier - a.multiplier);
  };