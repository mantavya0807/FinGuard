# FinGuard Chrome Extension

This Chrome extension analyzes websites for security concerns and provides nudges to users about potential risks. It uses the Nudge/js/generateNudge.js module via a backend server API.

## Features

- Real-time website analysis for security concerns
- Automatic safety nudges for suspicious or gambling websites
- Card recommendations for various merchant categories
- Manual safety alerts through popup notifications

## Setup Instructions

### 1. Server Setup (Required)

First, start the backend server that handles the integration with the Nudge module:

```bash
# Navigate to the server directory
cd /Users/ishaan/FinGuard/Server

# Install dependencies
npm install

# Start the server
npm run start
```

The server will run on http://localhost:3000

### 2. Chrome Extension Setup

```bash
# Navigate to the Chrome Extension directory
cd /Users/ishaan/FinGuard/Chrome\ Extension

# Install dependencies
npm install

# Build the extension
npm run build
```

### 3. Install in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select the `dist` directory in the Chrome Extension folder
4. The FinGuard extension should now appear in your extensions list

## Usage

- Click on the FinGuard extension icon to open the popup
- The popup will display:
  - Merchant information
  - Best card recommendation for the current merchant category
  - Security analysis of the current website
- If security concerns are detected, click the "Show Security Alert" button to display a notification

## API Integration

The extension communicates with a Node.js backend server that calls the Nudge/js/generateNudge.js module to analyze URLs for potentially suspicious or gambling-related content. The server exposes the following API endpoint:

- POST `/generateNudge`: Accepts a URL in the request body and returns a safety nudge if risks are detected

## Automatic Security Alerts

The extension includes a background script that automatically checks new websites you visit and displays a popup notification if security concerns are detected.

## Development

- Server code is in `/Users/ishaan/FinGuard/Server/`
- Chrome Extension code is in `/Users/ishaan/FinGuard/Chrome Extension/`
- Nudge logic is in `/Users/ishaan/FinGuard/Nudge/js/generateNudge.js`
