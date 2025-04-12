// src/popup/App.js
import React, { useState } from "react";
import { getMerchantCategoryFromGemini } from "./GeminiChat"; // Import the API function

function Detect() {
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState(""); // New state to store the merchant category

  const handleClick = async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs && tabs.length > 0) {
        const currentUrl = tabs[0].url;
        try {
          const urlObject = new URL(currentUrl);
          let hostname = urlObject.hostname;

          if (hostname.startsWith("www.")) {
            hostname = hostname.slice(4);
          }

          const parts = hostname.split(".");
          const merchantName =
            parts.length > 0 ? parts[0] : "Could not identify merchant";

          setMerchant(merchantName);

          // Get the merchant category from Gemini
          const categoryResponse = await getMerchantCategoryFromGemini(
            merchantName
          );
          setCategory(categoryResponse); // Update state with the category
        } catch (error) {
          setMerchant("Invalid URL");
          setCategory(""); // Clear category if there was an error
          console.error("Error parsing URL:", error);
        }
      } else {
        setMerchant("Could not retrieve tab URL");
        setCategory("");
      }
    });
  };

  return (
    <div>
      <button onClick={handleClick}>Get Merchant</button>
      {merchant && <p>Merchant: {merchant}</p>}
      {category && <p>Merchant Category: {category}</p>}
    </div>
  );
}

export default Detect;