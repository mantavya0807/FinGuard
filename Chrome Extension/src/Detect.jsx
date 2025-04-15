import React, { useEffect, useState } from "react";
import { getMerchantCategoryFromGemini } from "./GeminiChat";
import { findBestCardForCategory } from "./bestCardFinder";
import { generateNudgeForUrl, showNudgePopup } from "./nudgeService";
import { getCardDetails, autofillCardDetails } from "./autofillService";

function Detect() {
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("");
  const [isCheckoutPage, setIsCheckoutPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bestCard, setBestCard] = useState(null);
  const [error, setError] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [nudgeText, setNudgeText] = useState("");
  const [isAnalyzingSecurity, setIsAnalyzingSecurity] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [autofillStatus, setAutofillStatus] = useState(null);
  const [activeCardDetails, setActiveCardDetails] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs && tabs.length > 0) {
        const currentTab = tabs[0];
        setCurrentUrl(currentTab.url);

        chrome.scripting.executeScript(
          {
            target: { tabId: currentTab.id },
            func: () => {
              const hostname = window.location.hostname.replace(/^www\./, "");
              const parts = hostname.split(".");
              // Capitalize first letter of merchant name
              const merchantRaw = parts.length > 0 ? parts[0] : "unknown";
              const merchant = merchantRaw.charAt(0).toUpperCase() + merchantRaw.slice(1);

              const checkoutKeywords = [
                "checkout", "payment", "purchase", "pay now", 
                "billing", "shipping", "order", "complete purchase", 
                "confirm order", "place order", "review order", "finalize"
              ];
              const pageContent = `${window.location.href.toLowerCase()} ${document.title.toLowerCase()}`;
              const isCheckout = checkoutKeywords.some((kw) =>
                pageContent.includes(kw)
              );

              return { 
                merchant, 
                isCheckout,
                url: window.location.href
              };
            },
          },
          async (results) => {
            if (chrome.runtime.lastError || !results || results.length === 0) {
              console.error("Script injection failed");
              setLoading(false);
              return;
            }

            const { merchant, isCheckout, url } = results[0].result;
            setMerchant(merchant);
            setIsCheckoutPage(isCheckout);
            setCurrentUrl(url);

            try {
              // Fetch merchant category from Gemini API (or other source)
              const categoryResult = await getMerchantCategoryFromGemini(
                merchant
              );
              if (categoryResult && categoryResult !== "") {
                setCategory(categoryResult);
              } else {
                // If category is empty, set a default category
                setCategory("Gas");
              }
            } catch (err) {
              console.error("Gemini category fetch failed:", err);
              setCategory("Gas");
            }

            // Now that we have the category, fetch the best card for this category
            if (category && category !== "") {
              try {
                const cardResult = await findBestCardForCategory(category);
                setBestCard(cardResult);
                console.log("Best card set:", cardResult); // Debugging
              } catch (err) {
                console.error("Error fetching the best card:", err);
                setError("Could not retrieve the best card.");
              }
            } else {
              console.error("Invalid category:", category);
              setError("Invalid or empty category.");
            }

            // Generate security nudge for the current URL
            try {
              setIsAnalyzingSecurity(true);
              const nudge = await generateNudgeForUrl(url);
              setNudgeText(nudge || "No security concerns detected for this website.");
            } catch (error) {
              console.error("Error generating nudge:", error);
              setNudgeText("Unable to analyze website safety at the moment.");
            } finally {
              setIsAnalyzingSecurity(false);
            }

            setLoading(false);
          }
        );
      } else {
        setMerchant("Could not retrieve tab URL");
        setCategory("Unknown");
        setIsCheckoutPage(false);
        setLoading(false);
      }
    });
  }, [category]); // Add category as a dependency to re-run effect when category changes

  // Handler for showing the nudge popup
  const handleShowNudgeClick = () => {
    if (nudgeText && nudgeText !== "No security concerns detected for this website.") {
      showNudgePopup(nudgeText);
    }
  };
  
  // Handler for autofilling card details
  const handleAutofillClick = async () => {
    if (!bestCard || !bestCard.cardName) {
      setAutofillStatus({ success: false, message: "No card information available." });
      return;
    }
    
    setIsAutofilling(true);
    setAutofillStatus(null);
    setActiveCardDetails(null);
    setTransactionDetails(null);
    
    try {
      // 1. Get card details from the server
      const cardDetails = await getCardDetails(bestCard.cardName);
      
      if (!cardDetails) {
        setAutofillStatus({ 
          success: false, 
          message: "Could not retrieve card details." 
        });
        return;
      }
      
      // Store card details for display
      setActiveCardDetails(cardDetails);
      
      // 2. Autofill the card details in the page
      const result = await autofillCardDetails(cardDetails);
      
      console.log("Autofill result:", result);
      
      if (result.success) {
        setTransactionDetails(result.transactionDetails);
        setAutofillStatus({ 
          success: true, 
          message: `Successfully filled ${cardDetails.cardName} details.`,
          filledFields: result.formFields?.length || 0
        });
      } else {
        setTransactionDetails(null);
        setAutofillStatus({ 
          success: false, 
          message: "Could not autofill the card details. Form fields may not be detected.",
          debug: result.debugInfo
        });
      }
    } catch (error) {
      console.error("Error in autofill process:", error);
      setAutofillStatus({ 
        success: false, 
        message: "An error occurred during autofill." 
      });
    } finally {
      setIsAutofilling(false);
    }
  };

  return (
    <div className="finguard-container">
      <div className="finguard-header">
        <img src="/icons/logo.svg" alt="FinGuard Logo" className="finguard-logo" />
        <h1 className="finguard-title">FinGuard</h1>
      </div>
      
      {loading ? (
        <div className="finguard-loading">
          <div className="finguard-spinner"></div>
          <p>Analyzing page...</p>
        </div>
      ) : (
        <>
          <div className="finguard-section">
            <h2 className="finguard-section-title">Merchant Information</h2>
            <div className="finguard-card">
              <div className="finguard-info-row">
                <span className="finguard-info-label">Merchant:</span>
                <span className="finguard-info-value">{merchant}</span>
              </div>
              <div className="finguard-info-row">
                <span className="finguard-info-label">Category:</span>
                <span className="finguard-info-value">{category}</span>
              </div>
            </div>
          </div>
          
          <div className="finguard-section">
            <h2 className="finguard-section-title">Card Recommendations</h2>
            
            {isCheckoutPage ? (
              bestCard ? (
                <div className="finguard-card">
                  <div className="finguard-message finguard-message-info">
                    {bestCard.message}
                  </div>
                  
                  <button
                    onClick={handleAutofillClick}
                    disabled={isAutofilling}
                    className={`finguard-button finguard-button-primary`}
                  >
                    {isAutofilling ? "Filling Card Details..." : "Autofill Card Details"}
                  </button>
                  
                  {autofillStatus && (
                    <div className={`finguard-message ${autofillStatus.success ? 'finguard-message-success' : 'finguard-message-danger'}`}
                      style={{ marginTop: '12px' }}
                    >
                      {autofillStatus.message}
                    </div>
                  )}
                  
                  {activeCardDetails && (
                    <div style={{
                      marginTop: "16px",
                      padding: "12px",
                      backgroundColor: "var(--gray-100)",
                      borderRadius: "var(--border-radius)",
                      border: "1px solid var(--gray-300)"
                    }}>
                      <h4 style={{ 
                        margin: "0 0 8px", 
                        fontSize: "14px", 
                        color: "var(--gray-700)",
                        borderBottom: "1px solid var(--gray-300)",
                        paddingBottom: "4px"
                      }}>
                        Card Details Used:
                      </h4>
                      
                      <ul style={{ 
                        margin: "0", 
                        padding: "0 0 0 16px", 
                        fontSize: "12px", 
                        color: "var(--gray-700)" 
                      }}>
                        <li>Card: {activeCardDetails.cardName}</li>
                        <li>Number: {activeCardDetails.cardNumber.replace(/(\d{4})/g, '$1 ').trim()}</li>
                        <li>Cardholder: {activeCardDetails.cardHolder}</li>
                        <li>Expires: {activeCardDetails.expiryDate}</li>
                        <li>CVV: {activeCardDetails.cvv}</li>
                      </ul>
                      
                      <p style={{ 
                        margin: "8px 0 0", 
                        fontSize: "10px", 
                        color: "var(--gray-600)",
                        fontStyle: "italic"
                      }}>
                        Note: This is a test card for demonstration purposes only.
                      </p>
                    </div>
                  )}
                  
                  {transactionDetails && transactionDetails.amount && (
                    <div className="finguard-transaction-info" style={{
                      marginTop: "16px",
                      padding: "12px",
                      backgroundColor: "var(--gray-100)",
                      borderRadius: "var(--border-radius)",
                      border: "1px solid var(--gray-300)"
                    }}>
                      <h4 style={{ 
                        margin: "0 0 8px", 
                        fontSize: "14px", 
                        color: "var(--gray-700)",
                        borderBottom: "1px solid var(--gray-300)",
                        paddingBottom: "4px"
                      }}>
                        Transaction Details:
                      </h4>
                      <div style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: "12px 0",
                        padding: "8px",
                        backgroundColor: "var(--success-light)",
                        borderRadius: "var(--border-radius)",
                        border: "1px solid var(--success-color)",
                        fontSize: "16px",
                        fontWeight: "600"
                      }}>
                        <span style={{ marginRight: "4px" }}>
                          {transactionDetails.currency === 'USD' ? '$' : 
                           transactionDetails.currency === 'EUR' ? '€' : 
                           transactionDetails.currency === 'GBP' ? '£' : ''}
                        </span>
                        <span>
                          {transactionDetails.amount.toFixed(2)}
                        </span>
                      </div>
                      <p style={{
                        margin: "4px 0 0",
                        fontSize: "11px",
                        color: "var(--gray-600)",
                        textAlign: "center"
                      }}>
                        Transaction recorded at {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              ) : error ? (
                <div className="finguard-message finguard-message-warning">
                  {error}
                </div>
              ) : (
                <div className="finguard-empty-state">
                  No card recommendations available.
                </div>
              )
            ) : (
              <div className="finguard-card">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto 12px' }}>
                  <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="var(--gray-500)"/>
                </svg>
                <p style={{ color: "var(--gray-600)", fontStyle: "italic", fontSize: "0.875rem" }}>
                  Card recommendations will appear when you're on a checkout page.
                </p>
              </div>
            )}
          </div>
          
          <div className="finguard-section">
            <h2 className="finguard-section-title">
              Security Analysis
              {!isAnalyzingSecurity && (
                <span 
                  className={`finguard-status-badge ${
                    nudgeText && nudgeText !== "No security concerns detected for this website."
                      ? 'finguard-status-warning'
                      : 'finguard-status-secure'
                  }`}
                >
                  {nudgeText && nudgeText !== "No security concerns detected for this website."
                    ? 'Warning'
                    : 'Secure'
                  }
                </span>
              )}
            </h2>
            
            {isAnalyzingSecurity ? (
              <div className="finguard-loading">
                <div className="finguard-spinner"></div>
                <p>Analyzing security...</p>
              </div>
            ) : (
              <div className="finguard-card">
                <div 
                  className={`finguard-message ${
                    nudgeText && nudgeText !== "No security concerns detected for this website."
                      ? 'finguard-message-warning'
                      : 'finguard-message-success'
                  }`}
                >
                  {nudgeText}
                </div>
                
                {nudgeText && nudgeText !== "No security concerns detected for this website." && (
                  <button 
                    onClick={handleShowNudgeClick}
                    className="finguard-button finguard-button-warning"
                  >
                    Show Security Alert
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Detect;