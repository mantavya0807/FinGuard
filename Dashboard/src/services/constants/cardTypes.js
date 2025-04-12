// Card types with their properties
export const CARD_TYPES = {
    VISA: {
      name: 'Visa',
      pattern: /^4/,
      icon: 'visa-icon.svg',
      lengths: [16],
      cvvLength: 3,
      luhn: true,
      backgroundColor: '#1A1F71',
      textColor: '#FFFFFF'
    },
    MASTERCARD: {
      name: 'Mastercard',
      pattern: /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/,
      icon: 'mastercard-icon.svg',
      lengths: [16],
      cvvLength: 3,
      luhn: true,
      backgroundColor: '#EB001B',
      textColor: '#FFFFFF'
    },
    AMEX: {
      name: 'American Express',
      pattern: /^3[47]/,
      icon: 'amex-icon.svg',
      lengths: [15],
      cvvLength: 4,
      luhn: true,
      backgroundColor: '#006FCF',
      textColor: '#FFFFFF'
    },
    DISCOVER: {
      name: 'Discover',
      pattern: /^(6011|65|64[4-9]|622)/,
      icon: 'discover-icon.svg',
      lengths: [16, 19],
      cvvLength: 3,
      luhn: true,
      backgroundColor: '#FF6600',
      textColor: '#FFFFFF'
    },
    DINERS: {
      name: 'Diners Club',
      pattern: /^(36|38|30[0-5])/,
      icon: 'diners-icon.svg',
      lengths: [14, 16, 19],
      cvvLength: 3,
      luhn: true,
      backgroundColor: '#0079BE',
      textColor: '#FFFFFF'
    },
    JCB: {
      name: 'JCB',
      pattern: /^35/,
      icon: 'jcb-icon.svg',
      lengths: [16, 19],
      cvvLength: 3,
      luhn: true,
      backgroundColor: '#0B4EA2',
      textColor: '#FFFFFF'
    },
    UNIONPAY: {
      name: 'UnionPay',
      pattern: /^62/,
      icon: 'unionpay-icon.svg',
      lengths: [16, 19],
      cvvLength: 3,
      luhn: false,
      backgroundColor: '#D10429',
      textColor: '#FFFFFF'
    }
  };
  
  // Detect card type from card number
  export const detectCardType = (cardNumber) => {
    if (!cardNumber) return null;
    
    // Remove spaces and dashes
    cardNumber = cardNumber.replace(/[\s-]/g, '');
    
    for (const [type, config] of Object.entries(CARD_TYPES)) {
      if (config.pattern.test(cardNumber)) {
        return type;
      }
    }
    
    return null;
  };
  
  // Validate card number using Luhn algorithm (mod 10 check)
  export const validateCardNumber = (cardNumber) => {
    if (!cardNumber) return false;
    
    // Remove spaces and dashes
    cardNumber = cardNumber.replace(/[\s-]/g, '');
    
    // Check that it contains only digits
    if (!/^\d+$/.test(cardNumber)) return false;
    
    // Detect card type
    const cardType = detectCardType(cardNumber);
    if (!cardType) return false;
    
    // Check card length
    const cardConfig = CARD_TYPES[cardType];
    if (!cardConfig.lengths.includes(cardNumber.length)) return false;
    
    // Skip Luhn check for card types that don't require it
    if (!cardConfig.luhn) return true;
    
    // Luhn algorithm
    let sum = 0;
    let shouldDouble = false;
    
    // Loop through values starting from the rightmost digit
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i));
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return (sum % 10) === 0;
  };
  
  // Format card number with spaces for display
  export const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    
    // Remove any existing spaces
    cardNumber = cardNumber.replace(/\s+/g, '');
    
    // Detect card type
    const cardType = detectCardType(cardNumber);
    
    // Format based on card type
    if (cardType === 'AMEX') {
      // Format as XXXX XXXXXX XXXXX
      return cardNumber.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
    } else {
      // Format as XXXX XXXX XXXX XXXX
      return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
  };
  
  // Mask card number for display
  export const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    
    // Remove any existing spaces
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    
    // Keep last 4 digits, mask the rest
    const lastFour = cleanNumber.slice(-4);
    const maskedPart = '•'.repeat(cleanNumber.length - 4);
    
    // Format with spaces
    if (cleanNumber.length === 15) { // AMEX
      return `${maskedPart.slice(0, 4)} ${maskedPart.slice(4, 10)} ${lastFour}`;
    } else {
      const groups = [];
      for (let i = 0; i < maskedPart.length; i += 4) {
        groups.push(maskedPart.slice(i, i + 4));
      }
      groups.push(lastFour);
      return groups.join(' ');
    }
  };
  
  // Validate expiration date (MM/YY format)
  export const validateExpiryDate = (expiryDate) => {
    if (!expiryDate) return false;
    
    // Check format
    const pattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!pattern.test(expiryDate)) return false;
    
    // Extract month and year
    const [month, year] = expiryDate.split('/').map(part => parseInt(part, 10));
    
    // Get current date
    const now = new Date();
    const currentYear = now.getFullYear() % 100; // Get last 2 digits of year
    const currentMonth = now.getMonth() + 1; // January is 0
    
    // Check if expired
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    
    return true;
  };
  
  // Validate CVV
  export const validateCVV = (cvv, cardType) => {
    if (!cvv || !cardType) return false;
    
    // Get expected CVV length
    const expectedLength = CARD_TYPES[cardType]?.cvvLength || 3;
    
    // Check that it contains only digits and has correct length
    return /^\d+$/.test(cvv) && cvv.length === expectedLength;
  };