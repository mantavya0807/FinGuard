// Service for interacting with the nudge generator API
const API_URL = "http://localhost:3000/generateNudge";

/**
 * Generate a safety nudge for a given URL
 * @param {string} url - The URL to check
 * @returns {Promise<string|null>} - The nudge message or null if no risks detected
 */
export async function generateNudgeForUrl(url) {
  try {
    console.log("Generating nudge for URL:", url);
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Nudge API response:", data);
    
    // Return the nudge message if available
    return data.nudge || null;
  } catch (error) {
    console.error("Error generating nudge:", error);
    return null;
  }
}

/**
 * Show a popup notification with the nudge message
 * @param {string} nudgeText - The nudge message to display
 */
export function showNudgePopup(nudgeText) {
  // Get the current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs.length > 0) {
      const activeTab = tabs[0];
      
      // Send message to content script to show the popup
      chrome.tabs.sendMessage(activeTab.id, {
        type: 'SHOW_NUDGE',
        nudgeText: nudgeText
      }).catch(error => {
        console.error('Error sending message to content script:', error);
        
        // Fallback method if content script communication fails
        chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          function: createFallbackPopup,
          args: [nudgeText]
        }).catch(err => {
          console.error('Both content script message and fallback script failed:', err);
        });
      });
    }
  });
}

/**
 * Fallback function that will be injected into the page to create a popup
 * This is used if the content script communication fails
 * @param {string} nudgeText - The nudge message to display
 */
function createFallbackPopup(nudgeText) {
  // Create popup container
  const popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-left: 4px solid #ff9800;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    padding: 16px;
    max-width: 350px;
    z-index: 9999999;
    font-family: system-ui, -apple-system, sans-serif;
  `;

  // Create header
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  `;

  const title = document.createElement('h3');
  title.textContent = 'FinGuard Security Alert';
  title.style.cssText = `
    margin: 0;
    color: #333;
    font-size: 16px;
    font-weight: 600;
  `;

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = `
    background: none;
    border: none;
    color: #999;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  `;
  
  closeBtn.onclick = () => {
    document.body.removeChild(popup);
  };

  header.appendChild(title);
  header.appendChild(closeBtn);

  // Create message
  const message = document.createElement('p');
  message.textContent = nudgeText;
  message.style.cssText = `
    margin: 0;
    color: #444;
    font-size: 14px;
    line-height: 1.4;
  `;

  // Assemble popup
  popup.appendChild(header);
  popup.appendChild(message);
  document.body.appendChild(popup);

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (document.body.contains(popup)) {
      document.body.removeChild(popup);
    }
  }, 10000);
}