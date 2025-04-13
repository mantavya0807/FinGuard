"use strict";

/**
 * Phishing Protection Service
 * This service provides utility functions for detecting phishing and fraudulent activities
 */

// Known phishing domains and patterns
const PHISHING_DOMAINS = [
  'amazonsecure-payment.com',
  'paypal-secure-checkout.com',
  'appleid-verification.com',
  'secure-bank-verification.com',
  'account-verify-now.com',
  'tax-refund-gov.com',
  'netflix-billing-update.com',
  'cashback-rewards-special.com',
  'prize-winner-claim.com',
  'crypto-investment-guaranteed.com'
];

// Suspicious word patterns that might indicate phishing
const SUSPICIOUS_PATTERNS = [
  /verify.*account/i,
  /secure.*payment/i,
  /confirm.*identity/i,
  /update.*billing/i,
  /\.ru\//i,
  /\.xyz\//i,
  /\.cc\//i,
  /unusual.*activity/i,
  /account.*suspended/i,
  /your.*prize/i,
  /lottery.*winner/i,
  /urgent.*action/i,
  /password.*reset/i,
  /security.*breach/i
];

// High-risk countries for transactions
const HIGH_RISK_COUNTRIES = ['RU', 'NG', 'BY', 'UA', 'PK', 'KP'];

/**
 * Check if a domain is a known phishing site
 * @param {string} domain - The domain to check
 * @returns {boolean} - True if the domain is suspicious
 */
function isKnownPhishingDomain(domain) {
  if (!domain) return false;
  
  // Normalize the domain
  const normalizedDomain = domain.toLowerCase().trim();
  
  // Direct match
  if (PHISHING_DOMAINS.includes(normalizedDomain)) {
    return true;
  }
  
  // Check if the domain contains any known phishing domains
  for (const phishingDomain of PHISHING_DOMAINS) {
    if (normalizedDomain.includes(phishingDomain)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if text contains suspicious patterns
 * @param {string} text - The text to analyze
 * @returns {object} - Result with isSuspicious flag and matched patterns
 */
function containsSuspiciousPatterns(text) {
  if (!text) return { isSuspicious: false, matches: [] };
  
  const normalizedText = text.toLowerCase().trim();
  const matches = [];
  
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(normalizedText)) {
      matches.push(pattern.toString());
    }
  }
  
  return {
    isSuspicious: matches.length > 0,
    matches
  };
}

/**
 * Check if a transaction amount is unusually high
 * @param {number} amount - The transaction amount
 * @param {number} threshold - The threshold amount (default: 1000)
 * @returns {boolean} - True if the amount is unusually high
 */
function isUnusuallyHighAmount(amount, threshold = 1000) {
  return Math.abs(amount) > threshold;
}

/**
 * Check if a transaction is from a high-risk country
 * @param {string} countryCode - The ISO country code
 * @returns {boolean} - True if the country is high-risk
 */
function isHighRiskCountry(countryCode) {
  if (!countryCode) return false;
  return HIGH_RISK_COUNTRIES.includes(countryCode.toUpperCase());
}

/**
 * Calculate the risk score for a transaction
 * @param {Object} transaction - The transaction object
 * @returns {Object} - Risk assessment result
 */
function assessTransactionRisk(transaction) {
  if (!transaction) {
    return { score: 0, reasons: ['Invalid transaction data'], isRisky: false };
  }
  
  let riskScore = 0;
  const reasons = [];
  
  // Check merchant name
  if (transaction.merchantName) {
    // Known phishing domain
    if (isKnownPhishingDomain(transaction.merchantName)) {
      riskScore += 80;
      reasons.push('Known phishing merchant');
    }
    
    // Suspicious patterns
    const patternCheck = containsSuspiciousPatterns(transaction.merchantName);
    if (patternCheck.isSuspicious) {
      riskScore += 40;
      reasons.push('Suspicious merchant name patterns');
    }
  }
  
  // Check amount
  if (isUnusuallyHighAmount(transaction.amount)) {
    riskScore += 20;
    reasons.push('Unusually high transaction amount');
  }
  
  // Check country
  if (transaction.location && transaction.location.country) {
    if (isHighRiskCountry(transaction.location.country)) {
      riskScore += 30;
      reasons.push('Transaction from high-risk country');
    }
  }
  
  // Check category
  const highRiskCategories = ['crypto', 'gambling', 'money_transfer', 'gift_card'];
  if (highRiskCategories.includes(transaction.category)) {
    riskScore += 15;
    reasons.push('High-risk transaction category');
  }
  
  // Determine if transaction is risky (threshold: 50)
  const isRisky = riskScore >= 50;
  
  return {
    score: riskScore,
    reasons,
    isRisky,
    riskLevel: riskScore >= 80 ? 'high' : (riskScore >= 50 ? 'medium' : 'low')
  };
}

/**
 * Detect phishing attempts in an array of transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} - Flagged suspicious transactions
 */
function detectPhishingTransactions(transactions) {
  if (!Array.isArray(transactions)) {
    return [];
  }
  
  return transactions
    .map(transaction => {
      const risk = assessTransactionRisk(transaction);
      return {
        ...transaction,
        risk,
        isSuspicious: risk.isRisky
      };
    })
    .filter(transaction => transaction.isSuspicious);
}

/**
 * Check if a merchant URL is suspicious
 * @param {string} url - The URL to check
 * @returns {Object} - Assessment result
 */
function assessMerchantUrl(url) {
  if (!url) {
    return { isSuspicious: false };
  }
  
  try {
    // Parse the URL
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    
    // Check if domain is known phishing
    const isPhishing = isKnownPhishingDomain(domain);
    
    // Check for suspicious patterns in the URL
    const patternCheck = containsSuspiciousPatterns(url);
    
    // Check for suspicious TLDs
    const suspiciousTlds = ['.xyz', '.top', '.tk', '.ml', '.ga', '.cf'];
    const hasSuspiciousTld = suspiciousTlds.some(tld => domain.endsWith(tld));
    
    // Check for IP address as domain
    const isIpAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain);
    
    // Calculate risk score
    let riskScore = 0;
    if (isPhishing) riskScore += 80;
    if (patternCheck.isSuspicious) riskScore += 40;
    if (hasSuspiciousTld) riskScore += 30;
    if (isIpAddress) riskScore += 50;
    
    const reasons = [];
    if (isPhishing) reasons.push('Known phishing domain');
    if (patternCheck.isSuspicious) reasons.push('Suspicious URL patterns detected');
    if (hasSuspiciousTld) reasons.push('Suspicious top-level domain');
    if (isIpAddress) reasons.push('IP address used as domain');
    
    return {
      isSuspicious: riskScore >= 50,
      riskScore,
      reasons,
      domain
    };
  } catch (error) {
    console.error('Error assessing URL:', error);
    return {
      isSuspicious: true,
      riskScore: 60,
      reasons: ['Invalid URL format'],
      error: error.message
    };
  }
}

module.exports = {
  isKnownPhishingDomain,
  containsSuspiciousPatterns,
  isUnusuallyHighAmount,
  isHighRiskCountry,
  assessTransactionRisk,
  detectPhishingTransactions,
  assessMerchantUrl,
  PHISHING_DOMAINS,
  SUSPICIOUS_PATTERNS,
  HIGH_RISK_COUNTRIES
};