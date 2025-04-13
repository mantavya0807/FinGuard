import React, { useEffect, useState } from "react";
import { getMerchantCategoryFromGemini } from "./GeminiChat";
import { findBestCardForCategory } from "./bestCardFinder";
import { generateNudgeForUrl, showNudgePopup } from "./nudgeService";

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
              const merchant = parts.length > 0 ? parts[0] : "unknown";

              const checkoutKeywords = ["checkout", "payment", "purchase"];
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

  return (
    <div style={{ padding: "16px", fontFamily: "system-ui, sans-serif" }}>
      <h2 style={{ margin: "0 0 16px", color: "#333" }}>FinGuard</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 8px", color: "#444", fontSize: "16px" }}>Merchant Information</h3>
            <p style={{ margin: "4px 0", color: "#555" }}>Merchant: {merchant}</p>
            <p style={{ margin: "4px 0", color: "#555" }}>Category: {category}</p>
            <p style={{ margin: "4px 0", color: "#555" }}>
              This page {isCheckoutPage ? "is" : "is not"} a checkout page.
            </p>
          </div>
          
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 8px", color: "#444", fontSize: "16px" }}>Best Card Recommendation</h3>
            {bestCard ? (
              <div style={{ 
                padding: "12px", 
                backgroundColor: "#f0f8ff", 
                borderRadius: "4px", 
                border: "1px solid #cce5ff" 
              }}>
                <p style={{ margin: "0", color: "#004085" }}>{bestCard.message}</p>
              </div>
            ) : error ? (
              <p style={{ color: "#856404", backgroundColor: "#fff3cd", padding: "8px", borderRadius: "4px" }}>
                {error}
              </p>
            ) : (
              <p style={{ color: "#666" }}>No card recommendations available.</p>
            )}
          </div>
          
          <div>
            <h3 style={{ margin: "0 0 8px", color: "#444", fontSize: "16px" }}>Security Analysis</h3>
            {isAnalyzingSecurity ? (
              <p>Analyzing website safety...</p>
            ) : (
              <>
                <div style={{ 
                  padding: "12px", 
                  borderRadius: "4px",
                  backgroundColor: nudgeText && nudgeText !== "No security concerns detected for this website." 
                    ? "#fff3cd" 
                    : "#d4edda",
                  border: nudgeText && nudgeText !== "No security concerns detected for this website."
                    ? "1px solid #ffeeba"
                    : "1px solid #c3e6cb",
                  marginBottom: "12px"
                }}>
                  <p style={{ 
                    margin: "0",
                    color: nudgeText && nudgeText !== "No security concerns detected for this website."
                      ? "#856404"
                      : "#155724"
                  }}>
                    {nudgeText}
                  </p>
                </div>
                
                {nudgeText && nudgeText !== "No security concerns detected for this website." && (
                  <button 
                    onClick={handleShowNudgeClick}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#ff9800",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Show Security Alert
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Detect;
