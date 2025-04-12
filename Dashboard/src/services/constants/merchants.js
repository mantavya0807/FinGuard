// Common merchants with their category and logo
export const MERCHANTS = {
    // E-commerce
    'amazon.com': {
      name: 'Amazon',
      category: 'Shopping',
      logo: 'amazon-logo.png',
      safetyScore: 98,
      transactionsPerMonth: 'Millions',
      knownPromos: ['Prime offers', 'Subscribe & Save'],
      isTrusted: true
    },
    'walmart.com': {
      name: 'Walmart',
      category: 'Shopping',
      logo: 'walmart-logo.png',
      safetyScore: 97,
      transactionsPerMonth: 'Millions',
      knownPromos: ['Rollback prices', 'Walmart+'],
      isTrusted: true
    },
    'bestbuy.com': {
      name: 'Best Buy',
      category: 'Electronics',
      logo: 'bestbuy-logo.png',
      safetyScore: 96,
      transactionsPerMonth: 'Millions',
      knownPromos: ['Price match guarantee', 'My Best Buy rewards'],
      isTrusted: true
    },
    'target.com': {
      name: 'Target',
      category: 'Shopping',
      logo: 'target-logo.png',
      safetyScore: 96,
      transactionsPerMonth: 'Millions',
      knownPromos: ['Target Circle offers', 'RedCard 5% off'],
      isTrusted: true
    },
    'ebay.com': {
      name: 'eBay',
      category: 'Shopping',
      logo: 'ebay-logo.png',
      safetyScore: 90,
      transactionsPerMonth: 'Millions',
      knownPromos: ['eBay Bucks', 'Certified refurbished'],
      isTrusted: true
    },
    'etsy.com': {
      name: 'Etsy',
      category: 'Shopping',
      logo: 'etsy-logo.png',
      safetyScore: 92,
      transactionsPerMonth: 'Millions',
      knownPromos: ['Free shipping offers', 'Star Seller discounts'],
      isTrusted: true
    },
    
    // Travel
    'airbnb.com': {
      name: 'Airbnb',
      category: 'Travel',
      logo: 'airbnb-logo.png',
      safetyScore: 94,
      transactionsPerMonth: 'Millions',
      knownPromos: ['First-time user discounts', 'Weekly stay discounts'],
      isTrusted: true
    },
    'booking.com': {
      name: 'Booking.com',
      category: 'Travel',
      logo: 'booking-logo.png',
      safetyScore: 95,
      transactionsPerMonth: 'Millions',
      knownPromos: ['Genius loyalty discounts', 'Early booking deals'],
      isTrusted: true
    },
    'expedia.com': {
      name: 'Expedia',
      category: 'Travel',
      logo: 'expedia-logo.png',
      safetyScore: 93,
      transactionsPerMonth: 'Millions',
      knownPromos: ['Bundle & save', 'Member prices'],
      isTrusted: true
    },
    'delta.com': {
      name: 'Delta Airlines',
      category: 'Travel',
      logo: 'delta-logo.png',
      safetyScore: 96,
      transactionsPerMonth: 'Millions',
      knownPromos: ['SkyMiles deals', 'Companion certificates'],
      isTrusted: true
    },
    'southwest.com': {
      name: 'Southwest Airlines',
      category: 'Travel',
      logo: 'southwest-logo.png',
      safetyScore: 95,
      transactionsPerMonth: 'Millions',
      knownPromos: ['Rapid Rewards points', 'Companion Pass'],
      isTrusted: true
    },
    
    // Food & Dining
    'doordash.com': {
      name: 'DoorDash',
      category: 'Dining',
      logo: 'doordash-logo.png',
      safetyScore: 88,
      transactionsPerMonth: 'Millions',
      knownPromos: ['DashPass free delivery', 'First order discounts'],
      isTrusted: true
    },
    'ubereats.com': {
      name: 'Uber Eats',
      category: 'Dining',
      logo: 'ubereats-logo.png',
      safetyScore: 89,
      transactionsPerMonth: 'Millions',
      knownPromos: ['Uber One membership', 'Special offers'],
      isTrusted: true
    },
    'grubhub.com': {
      name: 'Grubhub',
      category: 'Dining',
      logo: 'grubhub-logo.png',
      safetyScore: 87,
      transactionsPerMonth: 'Millions',
      knownPromos: ['Grubhub+ free delivery', 'Rewards program'],
      isTrusted: true
    },
    'starbucks.com': {
      name: 'Starbucks',
      category: 'Dining',
      logo: 'starbucks-logo.png',
      safetyScore: 95,
      transactionsPerMonth: 'Millions',
      knownPromos: ['Rewards stars', 'Happy hour specials'],
      isTrusted: true
    },
    
    // Grocery
    'instacart.com': {
      name: 'Instacart',
      category: 'Grocery',
      logo: 'instacart-logo.png',
      safetyScore: 92,
      transactionsPerMonth: 'Millions',
      knownPromos: ['Instacart+ free delivery', 'Store loyalty card linkage'],
      isTrusted: true
    },
    'wholefoodsmarket.com': {
      name: 'Whole Foods',
      category: 'Grocery',
      logo: 'wholefoods-logo.png',
      safetyScore: 94,
      transactionsPerMonth: 'Millions',
      knownPromos: ['Prime member discounts', 'Weekly deals'],
      isTrusted: true
    },
    'kroger.com': {
      name: 'Kroger',
      category: 'Grocery',
      logo: 'kroger-logo.png',
      safetyScore: 93,
      transactionsPerMonth: 'Millions',
      knownPromos: ['Digital coupons', 'Fuel points'],
      isTrusted: true
    },
    
    // Subscription Services
    'netflix.com': {
      name: 'Netflix',
      category: 'Entertainment',
      logo: 'netflix-logo.png',
      safetyScore: 97,
      transactionsPerMonth: 'Millions',
      knownPromos: ['First month free', 'Basic/Standard/Premium plans'],
      isTrusted: true
    },
    'spotify.com': {
      name: 'Spotify',
      category: 'Entertainment',
      logo: 'spotify-logo.png',
      safetyScore: 96,
      transactionsPerMonth: 'Millions',
      knownPromos: ['Student discounts', 'Family plans'],
      isTrusted: true
    },
    'disneyplus.com': {
      name: 'Disney+',
      category: 'Entertainment',
      logo: 'disneyplus-logo.png',
      safetyScore: 96,
      transactionsPerMonth: 'Millions',
      knownPromos: ['Bundle with Hulu & ESPN+', 'Annual subscription savings'],
      isTrusted: true
    },
    
    // Gas
    'shell.com': {
      name: 'Shell',
      category: 'Gas',
      logo: 'shell-logo.png',
      safetyScore: 94,
      transactionsPerMonth: 'Millions',
      knownPromos: ['Fuel Rewards program', 'Shell GO+ rewards'],
      isTrusted: true
    },
    'exxon.com': {
      name: 'Exxon',
      category: 'Gas',
      logo: 'exxon-logo.png',
      safetyScore: 93,
      transactionsPerMonth: 'Millions',
      knownPromos: ['Exxon Mobil Rewards+', 'Plenti points'],
      isTrusted: true
    },
    
    // Known Scam Sites (for demonstration)
    'amazonsecure-payment.com': {
      name: 'Fake Amazon',
      category: 'Phishing',
      logo: 'warning-logo.png',
      safetyScore: 5,
      transactionsPerMonth: 'Unknown',
      knownPromos: [],
      isTrusted: false,
      warningMessage: 'This is a known phishing site! Do not enter any personal information.'
    },
    'paypal-secure-checkout.com': {
      name: 'Fake PayPal',
      category: 'Phishing',
      logo: 'warning-logo.png',
      safetyScore: 3,
      transactionsPerMonth: 'Unknown',
      knownPromos: [],
      isTrusted: false,
      warningMessage: 'This is a known phishing site attempting to steal PayPal credentials!'
    },
    'appleid-verification.com': {
      name: 'Fake Apple',
      category: 'Phishing',
      logo: 'warning-logo.png',
      safetyScore: 4,
      transactionsPerMonth: 'Unknown',
      knownPromos: [],
      isTrusted: false,
      warningMessage: 'This site is attempting to steal Apple ID credentials!'
    }
  };
  
  // Get merchant information from URL
  export const getMerchantFromUrl = (url) => {
    if (!url) return null;
    
    try {
      // Extract domain from URL
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      
      // Look for exact match
      if (MERCHANTS[domain]) {
        return {
          ...MERCHANTS[domain],
          domain
        };
      }
      
      // Look for partial match (for subdomains)
      for (const merchantDomain in MERCHANTS) {
        if (domain.includes(merchantDomain) || merchantDomain.includes(domain)) {
          return {
            ...MERCHANTS[merchantDomain],
            domain: merchantDomain
          };
        }
      }
      
      // No match found
      return {
        name: domain,
        category: 'Unknown',
        logo: 'unknown-logo.png',
        safetyScore: 50, // Average/unknown score
        transactionsPerMonth: 'Unknown',
        knownPromos: [],
        isTrusted: null, // Unknown trust status
        domain
      };
    } catch (error) {
      console.error('Error parsing URL:', error);
      return null;
    }
  };
  
  // Categories with their default reward types
  export const MERCHANT_CATEGORIES = {
    'Shopping': {
      defaultRewardType: 'generalCashback',
      icon: 'shopping-icon.svg',
      color: '#4F46E5' // primary-600
    },
    'Electronics': {
      defaultRewardType: 'generalCashback',
      icon: 'electronics-icon.svg',
      color: '#4F46E5' // primary-600
    },
    'Travel': {
      defaultRewardType: 'travelPoints',
      icon: 'travel-icon.svg', 
      color: '#3730A3' // primary-800
    },
    'Dining': {
      defaultRewardType: 'diningPoints',
      icon: 'dining-icon.svg',
      color: '#DC2626' // danger-600
    },
    'Grocery': {
      defaultRewardType: 'groceryPoints',
      icon: 'grocery-icon.svg',
      color: '#16A34A' // success-600
    },
    'Entertainment': {
      defaultRewardType: 'generalCashback',
      icon: 'entertainment-icon.svg',
      color: '#8B5CF6' // purple-500
    },
    'Gas': {
      defaultRewardType: 'gasCashback',
      icon: 'gas-icon.svg',
      color: '#F59E0B' // warning-500
    },
    'Utilities': {
      defaultRewardType: 'generalCashback',
      icon: 'utilities-icon.svg',
      color: '#6B7280' // gray-500
    },
    'Healthcare': {
      defaultRewardType: 'generalCashback',
      icon: 'healthcare-icon.svg',
      color: '#06B6D4' // cyan-500
    },
    'Phishing': {
      defaultRewardType: null,
      icon: 'warning-icon.svg',
      color: '#DC2626' // danger-600
    },
    'Unknown': {
      defaultRewardType: 'generalCashback',
      icon: 'unknown-icon.svg',
      color: '#6B7280' // gray-500
    }
  };
  
  // Get category information
  export const getCategoryInfo = (category) => {
    return MERCHANT_CATEGORIES[category] || MERCHANT_CATEGORIES['Unknown'];
  };