// Background script that monitors tabs and generates safety nudges

// Track when a tab is updated (URL changes or page loads)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only process when the page is loaded completely
  if (changeInfo.status === 'complete' && tab.url) {
    // Skip Chrome internal pages and extension pages
    if (!tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
      try {
        // Call the nudge API
        const response = await fetch('http://localhost:3000/generateNudge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: tab.url }),
        });

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        // If a nudge was generated, show it in the page
        if (data.nudge) {
          // Send message to the content script to show the popup
          chrome.tabs.sendMessage(tabId, {
            type: 'SHOW_NUDGE',
            nudgeText: data.nudge
          }).catch(error => {
            console.error('Error sending message to content script:', error);
          });
        }
      } catch (error) {
        console.error('Error generating nudge:', error);
      }
    }
  }
});