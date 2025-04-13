import React, { useEffect, useState } from "react";
import { getMerchantCategoryFromGemini } from "./GeminiChat";

function Detect() {
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("");
  const [isCheckoutPage, setIsCheckoutPage] = useState(null);
  const [loading, setLoading] = useState(true);

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

              const checkoutKeywords = [
                "checkout",
                "payment",
                "purchase",
              ];
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
              const categoryResult = await getMerchantCategoryFromGemini(
                merchant
              );
              setCategory(categoryResult);
            } catch (err) {
              console.error("Gemini category fetch failed:", err);
              setCategory("Unknown");
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
  }, []);

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
        </>
      )}
    </div>
  );
}

export default Detect;
