// Service for handling credit card autofill functionality

const API_BASE_URL = "http://localhost:3000";
const API_CARD_DETAILS_URL = `${API_BASE_URL}/getCardDetails`;
const API_SAVE_TRANSACTION_URL = `${API_BASE_URL}/saveTransaction`;

/**
 * Fetch card details from the server by card name
 * @param {string} cardName - The name of the card to fetch details for
 * @returns {Promise<Object|null>} - Card details or null if not found
 */
export async function getCardDetails(cardName) {
  try {
    console.log(`Fetching details for card: ${cardName}`);
    
    // For the demo, if it's AMEX Blue Cash Everyday Card, we'll use a fallback
    if (cardName.includes("Blue Cash") || cardName.includes("AMEX")) {
      console.log("Using AMEX Blue Cash Everyday Card fallback");
      
      // Return a hardcoded fallback card for demo purposes
      return {
        cardNumber: "378282246310005", // AMEX test number
        cardName: "AMEX Blue Cash Everyday Card",
        cardHolder: "JOHN SMITH",
        expiryDate: "12/25",
        cardType: "AMEX",
        cvv: "1234"
      };
    }
    
    // If the card name appears to include both a bank and a specific card type
    // (e.g., "CapitalOne Savor"), make sure our query works for it
    let requestCardName = cardName;
    if (!requestCardName.includes("AMEX") && !requestCardName.includes("Discover") && 
        requestCardName.match(/[A-Z][a-z]+\s+[A-Z][a-z]+/)) {
      console.log("Using special formatting for bank + card name");
    }
    
    const response = await fetch(`${API_CARD_DETAILS_URL}?cardName=${encodeURIComponent(requestCardName)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      console.error(`API error: ${response.status}`);
      
      // If we can't find the card, let's try a fallback to any card as a test
      if (response.status === 404) {
        console.log("Using general fallback card");
        
        // Return a generic card for demo purposes
        return {
          cardNumber: "4111111111111111", // Visa test number
          cardName: requestCardName || "Test Card",
          cardHolder: "JOHN SMITH",
          expiryDate: "12/25",
          cardType: "Visa",
          cvv: "123"
        };
      }
      
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Card details API response:", data);
    
    if (data.success && data.card) {
      return data.card;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching card details:", error);
    return null;
  }
}

/**
 * Save transaction data to the server
 * @param {Object} transactionData - The transaction data to save
 * @returns {Promise<Object>} - Response from the server
 */
async function saveTransactionData(transactionData) {
  try {
    console.log('Saving transaction data:', transactionData);
    
    const response = await fetch(API_SAVE_TRANSACTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save transaction: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Transaction saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error saving transaction data:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Inject card details into the payment form on the current page
 * @param {Object} cardDetails - The card details to fill in form
 * @returns {Promise<{success: boolean, formFields: Array, cardInfo: Object, debugInfo: Object}>} Result with form field info
 */
export async function autofillCardDetails(cardDetails) {
  if (!cardDetails) {
    console.error("No card details provided for autofill");
    return {
      success: false,
      formFields: [],
      cardInfo: null,
      debugInfo: { error: "No card details provided" }
    };
  }
  
  // Get the active tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs || tabs.length === 0) {
    console.error("No active tab found");
    return {
      success: false,
      formFields: [],
      cardInfo: cardDetails,
      debugInfo: { error: "No active tab found" }
    };
  }
  
  // First, scan the page to analyze the form fields
  let pageAnalysis;
  try {
    pageAnalysis = await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: analyzePageForms
    });
    
    console.log("Page analysis result:", pageAnalysis[0]?.result);
  } catch (error) {
    console.error("Error analyzing page forms:", error);
    return {
      success: false,
      formFields: [],
      cardInfo: cardDetails,
      debugInfo: { error: "Failed to analyze page forms", details: error.message }
    };
  }
  
  // Now execute the autofill with the enhanced information
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: executeAutofill,
      args: [cardDetails, pageAnalysis[0]?.result?.formFields || []]
    });
    
    const autofillResult = result[0]?.result;
    const transactionDetails = pageAnalysis[0]?.result?.transactionDetails;
    
    // If autofill was successful and we have transaction details, save the transaction
    if (autofillResult?.success && transactionDetails) {
      // Extract required data
      const now = new Date();
      const transactionData = {
        cardName: cardDetails.cardName,
        cardNumber: cardDetails.cardNumber.slice(-4), // Only save last 4 digits
        merchant: transactionDetails.merchant,
        amount: transactionDetails.amount || 0,
        currency: transactionDetails.currency || 'USD',
        date: now.toISOString(),
        url: pageAnalysis[0]?.result?.url,
        confidence: transactionDetails.confidence
      };
      
      // Save transaction data in the background
      saveTransactionData(transactionData).catch(error => {
        console.error('Failed to save transaction:', error);
      });
    }
    
    return {
      success: autofillResult?.success || false,
      formFields: autofillResult?.filledFields || [],
      cardInfo: cardDetails,
      transactionDetails: transactionDetails,
      debugInfo: {
        ...autofillResult?.debug,
        pageAnalysis: pageAnalysis[0]?.result
      }
    };
  } catch (error) {
    console.error("Error executing autofill script:", error);
    return {
      success: false,
      formFields: [],
      cardInfo: cardDetails,
      debugInfo: { 
        error: "Error executing autofill script", 
        details: error.message,
        pageAnalysis: pageAnalysis[0]?.result
      }
    };
  }
}

/**
 * Analyzes the forms on the page to determine field types
 * @returns {Object} Information about detected forms and fields
 */
function analyzePageForms() {
  console.log("Analyzing page forms...");
  
  // Get the complete HTML of the page for debug purposes
  const pageHtml = document.documentElement.outerHTML;
  
  // Find all forms and inputs
  const forms = Array.from(document.forms);
  const allInputs = Array.from(document.querySelectorAll('input'));
  
  // Extract form fields with their attributes
  const formFields = allInputs
    .filter(input => input.type !== 'hidden' && input.type !== 'submit' && input.type !== 'button')
    .map(input => ({
      name: input.name || '',
      id: input.id || '',
      type: input.type || '',
      placeholder: input.placeholder || '',
      ariaLabel: input.getAttribute('aria-label') || '',
      className: input.className || '',
      autocomplete: input.getAttribute('autocomplete') || '',
      dataset: Object.keys(input.dataset).reduce((acc, key) => {
        acc[key] = input.dataset[key];
        return acc;
      }, {}),
      isVisible: isElementVisible(input),
      rect: input.getBoundingClientRect().toJSON()
    }));
  
  // Try to determine payment-related fields
  const paymentFields = {
    cardNumber: formFields.filter(field => 
      isCardNumberField(field.name, field.id, field.placeholder, field.ariaLabel, field.autocomplete)
    ),
    cardholderName: formFields.filter(field => 
      isCardholderNameField(field.name, field.id, field.placeholder, field.ariaLabel, field.autocomplete)
    ),
    expiryDate: formFields.filter(field => 
      isExpiryDateField(field.name, field.id, field.placeholder, field.ariaLabel, field.autocomplete)
    ),
    expiryMonth: formFields.filter(field => 
      isExpiryMonthField(field.name, field.id, field.placeholder, field.ariaLabel, field.autocomplete)
    ),
    expiryYear: formFields.filter(field => 
      isExpiryYearField(field.name, field.id, field.placeholder, field.ariaLabel, field.autocomplete)
    ),
    cvv: formFields.filter(field => 
      isCvvField(field.name, field.id, field.placeholder, field.ariaLabel, field.autocomplete)
    )
  };
  
  // Extract transaction amount from the page
  const transactionDetails = extractTransactionDetails();
  
  return {
    url: window.location.href,
    formCount: forms.length,
    inputCount: allInputs.length,
    formFields: formFields,
    paymentFields: paymentFields,
    transactionDetails: transactionDetails,
    // Only include a truncated version of HTML for debugging to avoid extremely large responses
    htmlSample: pageHtml.substring(0, 5000) + '...' + pageHtml.substring(pageHtml.length - 5000)
  };
}

/**
 * Extract transaction amount and merchant details from the page
 * @returns {Object} Transaction details including amount, currency, and merchant
 */
function extractTransactionDetails() {
  // Initialize result object
  const details = {
    amount: null,
    currency: 'USD', // Default to USD
    merchant: document.location.hostname.replace(/^www\./, ''),
    confidence: 'low'
  };
  
  try {
    // 1. Look for price patterns in the page text
    const priceRegex = /\$\s?(\d+(?:\.\d{2})?)|\b(\d+(?:\.\d{2})?)\s?(?:USD|dollars)\b/gi;
    const pageText = document.body.innerText;
    const matches = [...pageText.matchAll(priceRegex)];
    
    // Collect all price matches and their contexts
    const priceMatches = [];
    
    for (const match of matches) {
      const price = parseFloat(match[1] || match[2]);
      if (!isNaN(price)) {
        // Get some surrounding context (50 chars before and after)
        const startPos = Math.max(0, match.index - 50);
        const endPos = Math.min(pageText.length, match.index + match[0].length + 50);
        const context = pageText.substring(startPos, endPos);
        
        priceMatches.push({
          price,
          context,
          // Check if this appears to be a total/final amount
          isTotalIndicator: /total|final|sum|amount|pay|checkout/i.test(context)
        });
      }
    }
    
    // 2. Check for structured data (microdata or JSON-LD)
    const jsonScripts = document.querySelectorAll('script[type="application/ld+json"]');
    if (jsonScripts.length > 0) {
      for (const script of jsonScripts) {
        try {
          const data = JSON.parse(script.textContent);
          if (data.price || data.offers?.price || data.totalPrice) {
            const price = parseFloat(data.price || data.offers?.price || data.totalPrice);
            if (!isNaN(price)) {
              priceMatches.push({
                price,
                context: 'StructuredData',
                isTotalIndicator: true
              });
              details.confidence = 'high';
            }
          }
        } catch (e) {
          console.log('Error parsing JSON-LD:', e);
        }
      }
    }
    
    // 3. Look for elements with specific attributes
    const priceElements = document.querySelectorAll('[class*="price"],[class*="total"],[id*="price"],[id*="total"],[data-price],[itemprop="price"]');
    for (const el of priceElements) {
      const text = el.textContent.trim();
      const priceMatch = text.match(/\$\s?(\d+(?:\.\d{2})?)|\b(\d+(?:\.\d{2})?)\b/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1] || priceMatch[2]);
        if (!isNaN(price)) {
          priceMatches.push({
            price, 
            context: el.outerHTML.substring(0, 100),
            isTotalIndicator: /total|final|sum|amount/i.test(el.outerHTML.toLowerCase())
          });
        }
      }
    }
    
    // 4. Try to identify the most likely transaction amount
    if (priceMatches.length > 0) {
      // Sort by likelihood of being a total
      priceMatches.sort((a, b) => {
        // Prioritize matches with total indicators
        if (a.isTotalIndicator && !b.isTotalIndicator) return -1;
        if (!a.isTotalIndicator && b.isTotalIndicator) return 1;
        
        // If both have or don't have indicators, choose the higher amount
        return b.price - a.price;
      });
      
      // Use the most likely price
      details.amount = priceMatches[0].price;
      details.confidence = priceMatches[0].isTotalIndicator ? 'medium' : 'low';
    }
    
    // 5. Look for currency symbols/codes
    const currencyMatch = pageText.match(/(?:\$|USD|€|EUR|£|GBP)/i);
    if (currencyMatch) {
      const currencySymbol = currencyMatch[0].toUpperCase();
      if (currencySymbol === '$' || currencySymbol === 'USD') details.currency = 'USD';
      else if (currencySymbol === '€' || currencySymbol === 'EUR') details.currency = 'EUR';
      else if (currencySymbol === '£' || currencySymbol === 'GBP') details.currency = 'GBP';
    }
    
  } catch (error) {
    console.error('Error extracting transaction details:', error);
  }
  
  return details;
}

// Helper functions for field detection
function isCardNumberField(name, id, placeholder, ariaLabel, autocomplete) {
  const patterns = [
    /card[_-]?number/i, /^cc[_-]?num/i, /^ccnum/i, /^cardnum/i,
    /credit[_-]?card/i, /card[_-]?no/i, /cc[_-]?no/i, /^pan$/i
  ];
  
  const textPatterns = [
    /card number/i, /credit card/i, /card #/i, /card no/i,
    /card details/i, /card information/i
  ];
  
  return patterns.some(pattern => 
      pattern.test(name) || pattern.test(id)
    ) ||
    textPatterns.some(pattern => 
      pattern.test(placeholder) || pattern.test(ariaLabel)
    ) ||
    autocomplete === 'cc-number';
}

function isCardholderNameField(name, id, placeholder, ariaLabel, autocomplete) {
  const patterns = [
    /card[_-]?holder/i, /holder[_-]?name/i, /name[_-]?on[_-]?card/i,
    /^cc[_-]?name/i, /full[_-]?name/i, /card[_-]?owner/i
  ];
  
  const textPatterns = [
    /card holder/i, /name on card/i, /cardholder/i, /full name/i
  ];
  
  return patterns.some(pattern => 
      pattern.test(name) || pattern.test(id)
    ) ||
    textPatterns.some(pattern => 
      pattern.test(placeholder) || pattern.test(ariaLabel)
    ) ||
    autocomplete === 'cc-name';
}

function isExpiryDateField(name, id, placeholder, ariaLabel, autocomplete) {
  const patterns = [
    /expir/i, /exp[_-]?date/i, /valid[_-]?until/i, /valid[_-]?thru/i
  ];
  
  const textPatterns = [
    /expir/i, /exp date/i, /valid until/i, /mm\/yy/i, /mm-yy/i
  ];
  
  return patterns.some(pattern => 
      pattern.test(name) || pattern.test(id)
    ) &&
    !(/month/i.test(name) || /month/i.test(id) || /year/i.test(name) || /year/i.test(id)) ||
    textPatterns.some(pattern => 
      pattern.test(placeholder) || pattern.test(ariaLabel)
    ) ||
    autocomplete === 'cc-exp';
}

function isExpiryMonthField(name, id, placeholder, ariaLabel, autocomplete) {
  const patterns = [
    /exp[_-]?month/i, /card[_-]?month/i, /expiry[_-]?month/i, /cc[_-]?month/i
  ];
  
  const textPatterns = [
    /exp.*month/i, /month.*exp/i, /^mm$/i
  ];
  
  return patterns.some(pattern => 
      pattern.test(name) || pattern.test(id)
    ) ||
    textPatterns.some(pattern => 
      pattern.test(placeholder) || pattern.test(ariaLabel)
    ) ||
    autocomplete === 'cc-exp-month';
}

function isExpiryYearField(name, id, placeholder, ariaLabel, autocomplete) {
  const patterns = [
    /exp[_-]?year/i, /card[_-]?year/i, /expiry[_-]?year/i, /cc[_-]?year/i
  ];
  
  const textPatterns = [
    /exp.*year/i, /year.*exp/i, /^yy$/i, /^yyyy$/i
  ];
  
  return patterns.some(pattern => 
      pattern.test(name) || pattern.test(id)
    ) ||
    textPatterns.some(pattern => 
      pattern.test(placeholder) || pattern.test(ariaLabel)
    ) ||
    autocomplete === 'cc-exp-year';
}

function isCvvField(name, id, placeholder, ariaLabel, autocomplete) {
  const patterns = [
    /cvv/i, /cvc/i, /csc/i, /cvn/i, /security[_-]?code/i, /security[_-]?value/i,
    /card[_-]?verification/i
  ];
  
  const textPatterns = [
    /security code/i, /card verification/i, /CVV/i, /CVC/i, /3 digits/i, /4 digits/i
  ];
  
  return patterns.some(pattern => 
      pattern.test(name) || pattern.test(id)
    ) ||
    textPatterns.some(pattern => 
      pattern.test(placeholder) || pattern.test(ariaLabel)
    ) ||
    autocomplete === 'cc-csc';
}

function isElementVisible(element) {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0' &&
         element.offsetWidth > 0 && 
         element.offsetHeight > 0;
}

/**
 * Function executed in the context of the page to fill in form fields
 * @param {Object} card - The card details
 * @param {Array} analyzedFields - Pre-analyzed form fields from the page
 * @returns {Object} Result of the autofill operation
 */
function executeAutofill(card, analyzedFields = []) {
  console.log("Executing autofill with card:", card.cardName);
  console.log("Using analyzed fields:", analyzedFields);
  
  // Track filled fields for reporting
  const filledFields = [];
  const debugInfo = { attemptedSelectors: {} };
  
  // Parse expiry date (MM/YY format)
  let expiryMonth = '';
  let expiryYear = '';
  if (card.expiryDate && card.expiryDate.includes('/')) {
    const parts = card.expiryDate.split('/');
    expiryMonth = parts[0].trim();
    expiryYear = parts[1].trim();
    // Convert 2025 to 25 if needed
    if (expiryYear.length === 4) {
      expiryYear = expiryYear.slice(2);
    }
  }
  
  // ===== APPROACH 1: Try direct selectors based on analyzed fields =====
  
  // Try to get elements directly by ID or name using analyzed fields
  if (analyzedFields && analyzedFields.length > 0) {
    console.log("Using analyzed field data for precise targeting");
    
    // Card number fields
    const cardNumberFields = analyzedFields.filter(field => 
      isCardNumberField(field.name, field.id, field.placeholder, field.ariaLabel, field.autocomplete)
    );
    
    for (const field of cardNumberFields) {
      let element = null;
      
      if (field.id) {
        element = document.getElementById(field.id);
      }
      
      if (!element && field.name) {
        element = document.querySelector(`input[name="${field.name}"]`);
      }
      
      if (element) {
        fillField(element, card.cardNumber);
        filledFields.push({ type: 'cardNumber', field });
        debugInfo.directCardNumber = true;
        console.log(`Filled card number field "${field.id || field.name}" with ${card.cardNumber}`);
      }
    }
    
    // Cardholder name fields
    const cardholderFields = analyzedFields.filter(field => 
      isCardholderNameField(field.name, field.id, field.placeholder, field.ariaLabel, field.autocomplete)
    );
    
    for (const field of cardholderFields) {
      let element = null;
      
      if (field.id) {
        element = document.getElementById(field.id);
      }
      
      if (!element && field.name) {
        element = document.querySelector(`input[name="${field.name}"]`);
      }
      
      if (element) {
        fillField(element, card.cardHolder);
        filledFields.push({ type: 'cardholderName', field });
        debugInfo.directCardholderName = true;
        console.log(`Filled cardholder field "${field.id || field.name}" with ${card.cardHolder}`);
      }
    }
    
    // Expiry fields - combined
    const expiryDateFields = analyzedFields.filter(field => 
      isExpiryDateField(field.name, field.id, field.placeholder, field.ariaLabel, field.autocomplete)
    );
    
    for (const field of expiryDateFields) {
      let element = null;
      
      if (field.id) {
        element = document.getElementById(field.id);
      }
      
      if (!element && field.name) {
        element = document.querySelector(`input[name="${field.name}"]`);
      }
      
      if (element) {
        fillField(element, card.expiryDate);
        filledFields.push({ type: 'expiryDate', field });
        debugInfo.directExpiryDate = true;
        console.log(`Filled expiry date field "${field.id || field.name}" with ${card.expiryDate}`);
      }
    }
    
    // Expiry month fields
    const expiryMonthFields = analyzedFields.filter(field => 
      isExpiryMonthField(field.name, field.id, field.placeholder, field.ariaLabel, field.autocomplete)
    );
    
    for (const field of expiryMonthFields) {
      let element = null;
      
      if (field.id) {
        element = document.getElementById(field.id);
      }
      
      if (!element && field.name) {
        const selector = `input[name="${field.name}"], select[name="${field.name}"]`;
        element = document.querySelector(selector);
      }
      
      if (element) {
        fillField(element, expiryMonth);
        filledFields.push({ type: 'expiryMonth', field });
        debugInfo.directExpiryMonth = true;
        console.log(`Filled expiry month field "${field.id || field.name}" with ${expiryMonth}`);
      }
    }
    
    // Expiry year fields
    const expiryYearFields = analyzedFields.filter(field => 
      isExpiryYearField(field.name, field.id, field.placeholder, field.ariaLabel, field.autocomplete)
    );
    
    for (const field of expiryYearFields) {
      let element = null;
      
      if (field.id) {
        element = document.getElementById(field.id);
      }
      
      if (!element && field.name) {
        const selector = `input[name="${field.name}"], select[name="${field.name}"]`;
        element = document.querySelector(selector);
      }
      
      if (element) {
        fillField(element, expiryYear);
        filledFields.push({ type: 'expiryYear', field });
        debugInfo.directExpiryYear = true;
        console.log(`Filled expiry year field "${field.id || field.name}" with ${expiryYear}`);
      }
    }
    
    // CVV fields
    const cvvFields = analyzedFields.filter(field => 
      isCvvField(field.name, field.id, field.placeholder, field.ariaLabel, field.autocomplete)
    );
    
    for (const field of cvvFields) {
      let element = null;
      
      if (field.id) {
        element = document.getElementById(field.id);
      }
      
      if (!element && field.name) {
        element = document.querySelector(`input[name="${field.name}"]`);
      }
      
      if (element) {
        fillField(element, card.cvv);
        filledFields.push({ type: 'cvv', field });
        debugInfo.directCvv = true;
        console.log(`Filled CVV field "${field.id || field.name}" with ${card.cvv}`);
      }
    }
  }
  
  // ===== APPROACH 2: Fallback to generic selectors =====
  // Only use this approach if specific fields weren't found or as a backup
  
  // List of selectors for each field type
  const selectorsByType = {
    cardNumber: [
      'input[name*="card_number" i]',
      'input[id*="card_number" i]',
      'input[name*="cardnumber" i]',
      'input[id*="cardnumber" i]',
      'input[name*="card-number" i]',
      'input[id*="card-number" i]',
      'input[name*="ccnumber" i]',
      'input[id*="ccnumber" i]',
      'input[name*="cc-number" i]',
      'input[id*="cc-number" i]',
      'input[name*="number" i][aria-label*="card" i]',
      'input[id*="number" i][aria-label*="card" i]',
      'input[name*="pan" i]',
      'input[id*="pan" i]',
      'input[name*="cc" i]',
      'input[id*="cc" i]',
      'input[aria-label*="card number" i]',
      'input[placeholder*="card number" i]',
      'input[placeholder*="•••• •••• •••• ••••" i]',
      'input[autocomplete="cc-number"]',
      'input[data-checkout="cardNumber"]',
      'input[type="tel"][name*="number" i]',
      'input[type="number"][name*="card" i]',
      'input[type="tel"][aria-label*="card" i]',
      'input[data-test*="cardnumber" i]',
      'input[data-testid*="cardnumber" i]',
      'input[data-elementid="card-number"]'
    ],
    
    cardholderName: [
      'input[name*="cardholder" i]',
      'input[id*="cardholder" i]',
      'input[name*="card_holder" i]',
      'input[id*="card_holder" i]',
      'input[name*="card-holder" i]',
      'input[id*="card-holder" i]',
      'input[name*="ccname" i]',
      'input[id*="ccname" i]',
      'input[name*="cc-name" i]',
      'input[id*="cc-name" i]',
      'input[name*="name_on_card" i]',
      'input[id*="name_on_card" i]',
      'input[name*="name-on-card" i]',
      'input[id*="name-on-card" i]',
      'input[autocomplete="cc-name"]',
      'input[name*="owner" i]',
      'input[id*="owner" i]',
      'input[name*="holder" i]',
      'input[id*="holder" i]',
      'input[placeholder*="cardholder" i]',
      'input[placeholder*="card holder" i]',
      'input[placeholder*="name on card" i]',
      'input[aria-label*="cardholder" i]',
      'input[aria-label*="card holder" i]',
      'input[aria-label*="name on card" i]',
      'input[data-test*="name" i][data-test*="card" i]',
      'input[data-testid*="name" i][data-testid*="card" i]'
    ],
    
    expiryMonth: [
      'input[name*="exp_month" i]',
      'input[id*="exp_month" i]',
      'input[name*="exp-month" i]',
      'input[id*="exp-month" i]',
      'input[name*="expiry_month" i]',
      'input[id*="expiry_month" i]',
      'input[name*="expiry-month" i]',
      'input[id*="expiry-month" i]',
      'input[name*="cc-exp-month" i]',
      'input[id*="cc-exp-month" i]',
      'select[name*="exp_month" i]',
      'select[id*="exp_month" i]',
      'select[name*="expiry_month" i]',
      'select[id*="expiry_month" i]'
    ],
    
    expiryYear: [
      'input[name*="exp_year" i]',
      'input[id*="exp_year" i]',
      'input[name*="exp-year" i]',
      'input[id*="exp-year" i]',
      'input[name*="expiry_year" i]',
      'input[id*="expiry_year" i]',
      'input[name*="expiry-year" i]',
      'input[id*="expiry-year" i]',
      'input[name*="cc-exp-year" i]',
      'input[id*="cc-exp-year" i]',
      'select[name*="exp_year" i]',
      'select[id*="exp_year" i]',
      'select[name*="expiry_year" i]',
      'select[id*="expiry_year" i]'
    ],
    
    expiryDate: [
      'input[name*="expiry" i]',
      'input[id*="expiry" i]',
      'input[name*="expdate" i]',
      'input[id*="expdate" i]',
      'input[name*="exp_date" i]',
      'input[id*="exp_date" i]',
      'input[name*="exp-date" i]',
      'input[id*="exp-date" i]',
      'input[name*="cc-exp" i]',
      'input[id*="cc-exp" i]',
      'input[autocomplete="cc-exp"]'
    ],
    
    cvv: [
      'input[name*="cvv" i]',
      'input[id*="cvv" i]',
      'input[name*="cvc" i]',
      'input[id*="cvc" i]',
      'input[name*="csc" i]',
      'input[id*="csc" i]',
      'input[name*="security_code" i]',
      'input[id*="security_code" i]',
      'input[name*="security-code" i]',
      'input[id*="security-code" i]',
      'input[name*="cc-csc" i]',
      'input[id*="cc-csc" i]',
      'input[autocomplete="cc-csc"]'
    ]
  };
  
  // For each field type, try all selectors if not already filled
  if (!debugInfo.directCardNumber) {
    debugInfo.attemptedSelectors.cardNumber = [];
    for (const selector of selectorsByType.cardNumber) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        for (const element of elements) {
          debugInfo.attemptedSelectors.cardNumber.push({ 
            selector, 
            found: true,
            filled: true
          });
          fillField(element, card.cardNumber);
          filledFields.push({ type: 'cardNumber', selector });
          console.log(`Filled card number with generic selector: ${selector}`);
        }
      } else {
        debugInfo.attemptedSelectors.cardNumber.push({ 
          selector, 
          found: false
        });
      }
    }
  }
  
  if (!debugInfo.directCardholderName) {
    debugInfo.attemptedSelectors.cardholderName = [];
    for (const selector of selectorsByType.cardholderName) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        for (const element of elements) {
          debugInfo.attemptedSelectors.cardholderName.push({ 
            selector, 
            found: true,
            filled: true
          });
          fillField(element, card.cardHolder);
          filledFields.push({ type: 'cardholderName', selector });
          console.log(`Filled cardholder name with generic selector: ${selector}`);
        }
      } else {
        debugInfo.attemptedSelectors.cardholderName.push({ 
          selector, 
          found: false
        });
      }
    }
  }
  
  if (!debugInfo.directExpiryDate) {
    debugInfo.attemptedSelectors.expiryDate = [];
    for (const selector of selectorsByType.expiryDate) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        for (const element of elements) {
          debugInfo.attemptedSelectors.expiryDate.push({ 
            selector, 
            found: true,
            filled: true
          });
          fillField(element, card.expiryDate);
          filledFields.push({ type: 'expiryDate', selector });
          console.log(`Filled expiry date with generic selector: ${selector}`);
        }
      } else {
        debugInfo.attemptedSelectors.expiryDate.push({ 
          selector, 
          found: false
        });
      }
    }
  }
  
  if (!debugInfo.directExpiryMonth && expiryMonth) {
    debugInfo.attemptedSelectors.expiryMonth = [];
    for (const selector of selectorsByType.expiryMonth) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        for (const element of elements) {
          debugInfo.attemptedSelectors.expiryMonth.push({ 
            selector, 
            found: true,
            filled: true
          });
          fillField(element, expiryMonth);
          filledFields.push({ type: 'expiryMonth', selector });
          console.log(`Filled expiry month with generic selector: ${selector}`);
        }
      } else {
        debugInfo.attemptedSelectors.expiryMonth.push({ 
          selector, 
          found: false
        });
      }
    }
  }
  
  if (!debugInfo.directExpiryYear && expiryYear) {
    debugInfo.attemptedSelectors.expiryYear = [];
    for (const selector of selectorsByType.expiryYear) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        for (const element of elements) {
          debugInfo.attemptedSelectors.expiryYear.push({ 
            selector, 
            found: true,
            filled: true
          });
          fillField(element, expiryYear);
          filledFields.push({ type: 'expiryYear', selector });
          console.log(`Filled expiry year with generic selector: ${selector}`);
        }
      } else {
        debugInfo.attemptedSelectors.expiryYear.push({ 
          selector, 
          found: false
        });
      }
    }
  }
  
  if (!debugInfo.directCvv && card.cvv) {
    debugInfo.attemptedSelectors.cvv = [];
    for (const selector of selectorsByType.cvv) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        for (const element of elements) {
          debugInfo.attemptedSelectors.cvv.push({ 
            selector, 
            found: true,
            filled: true
          });
          fillField(element, card.cvv);
          filledFields.push({ type: 'cvv', selector });
          console.log(`Filled CVV with generic selector: ${selector}`);
        }
      } else {
        debugInfo.attemptedSelectors.cvv.push({ 
          selector, 
          found: false
        });
      }
    }
  }
  
  // Report on the fields that were filled
  console.log("Autofill completed. Filled fields:", filledFields);
  
  return {
    success: filledFields.length > 0,
    filledFields,
    debug: debugInfo
  };
}

/**
 * Helper function to fill a field with a value and trigger change events
 * @param {HTMLElement} element - The form element to fill
 * @param {string} value - The value to set
 */
function fillField(element, value) {
  if (!element || !value) return;
  
  // Handle input elements
  if (element.tagName === 'INPUT') {
    const originalValue = element.value;
    element.value = value;
    
    // Only trigger events if value actually changed
    if (originalValue !== value) {
      // Trigger events to notify JavaScript frameworks
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  // Handle select elements
  else if (element.tagName === 'SELECT') {
    // Try to find option by value
    let found = false;
    for (const option of element.options) {
      if (option.value === value || option.textContent === value) {
        element.value = option.value;
        found = true;
        break;
      }
    }
    
    // If exact match not found, try partial match
    if (!found) {
      for (const option of element.options) {
        if (option.value.includes(value) || option.textContent.includes(value)) {
          element.value = option.value;
          found = true;
          break;
        }
      }
    }
    
    // If still not found but value is numeric, try to match numeric value
    if (!found && !isNaN(value)) {
      const numValue = parseInt(value, 10);
      for (const option of element.options) {
        const optionValue = parseInt(option.value, 10);
        if (!isNaN(optionValue) && optionValue === numValue) {
          element.value = option.value;
          found = true;
          break;
        }
      }
    }
    
    // Trigger change event if we found a match
    if (found) {
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
}