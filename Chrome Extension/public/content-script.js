// Content script that runs in the context of web pages
console.log('FinGuard content script loaded');

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SHOW_NUDGE' && message.nudgeText) {
    // Create and show a custom notification on the page
    showNudgePopup(message.nudgeText);
    // Acknowledge receipt
    sendResponse({success: true});
    return true; // Keep the message channel open for the async response
  }
});

// Function to create and display a popup notification
function showNudgePopup(nudgeText) {
  // Create the container element
  const nudgeContainer = document.createElement('div');
  nudgeContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    max-width: 350px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 16px;
    z-index: 99999;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    animation: slideIn 0.3s ease-out forwards;
    border-left: 4px solid #ff9800;
  `;

  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // Create the header
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  `;

  const title = document.createElement('h3');
  title.textContent = 'FinGuard Alert';
  title.style.cssText = `
    margin: 0;
    font-size: 16px;
    color: #333;
    font-weight: 600;
  `;

  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.cssText = `
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    color: #666;
    padding: 0;
    margin: 0;
    line-height: 1;
  `;
  closeButton.onclick = () => {
    nudgeContainer.style.animation = 'fadeOut 0.3s forwards';
    setTimeout(() => {
      document.body.removeChild(nudgeContainer);
    }, 300);
  };

  header.appendChild(title);
  header.appendChild(closeButton);

  // Create the message
  const message = document.createElement('p');
  message.textContent = nudgeText;
  message.style.cssText = `
    margin: 0;
    font-size: 14px;
    color: #555;
    line-height: 1.4;
  `;

  // Assemble the popup
  nudgeContainer.appendChild(header);
  nudgeContainer.appendChild(message);
  document.body.appendChild(nudgeContainer);

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (document.body.contains(nudgeContainer)) {
      nudgeContainer.style.animation = 'fadeOut 0.3s forwards';
      setTimeout(() => {
        if (document.body.contains(nudgeContainer)) {
          document.body.removeChild(nudgeContainer);
        }
      }, 300);
    }
  }, 10000);
}