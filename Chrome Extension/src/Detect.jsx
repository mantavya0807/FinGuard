import React, { useEffect, useState } from "react";
import { getMerchantCategoryFromGemini } from "./GeminiChat";
import { findBestCardForCategory } from "./bestCardFinder"; // Assuming this is the path to the file

function Detect() {
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("");
  const [isCheckoutPage, setIsCheckoutPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bestCard, setBestCard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs && tabs.length > 0) {
        const currentTab = tabs[0];

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

              return { merchant, isCheckout };
            },
          },
          async (results) => {
            if (chrome.runtime.lastError || !results || results.length === 0) {
              console.error("Script injection failed");
              setLoading(false);
              return;
            }

            const { merchant, isCheckout } = results[0].result;
            setMerchant(merchant);
            setIsCheckoutPage(isCheckout);

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

  return (
    <div>
      <h2>Merchant Info</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>Merchant: {merchant}</p>
          <p>Category: {category}</p>
          <p>This page {isCheckoutPage ? "is" : "is not"} a checkout page.</p>
          {bestCard ? (
            <div>
              <h3>Best Card for {category}</h3>
              <p>{bestCard.message}</p>
            </div>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <p>No card recommendations available.</p>
          )}
        </>
      )}
    </div>
  );
}

export default Detect;
