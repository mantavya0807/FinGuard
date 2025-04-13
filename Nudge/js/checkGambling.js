require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

function configureGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set. Please check your .env file.');
    process.exit(1);
  }
  console.log('Using API Key:', apiKey);
  return new GoogleGenerativeAI(apiKey);
}

async function checkGambling(url) {
  try {
    const genAI = configureGemini();
    // Choose a model suitable for classification tasks.
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    
    // Construct the prompt. (Spacing and newlines do not affect the API call.)
    const prompt = `
Analyze the website content accessible at the following URL: ${url}

Is the primary purpose of this website related to gambling activities?
Gambling activities include, but are not limited to: online casinos,
sports betting, poker sites, lottery sites, bingo sites, or sites
offering games of chance for money.

Please respond with ONLY the single digit '1' if YES (it is primarily a gambling website).
Please respond with ONLY the single digit '0' if NO (it is not primarily a gambling website).

Do not provide any explanation, reasoning, or additional text. Your entire response must be '1' or '0'.
    `;

    console.log('Sending prompt to Gemini:', prompt);

    const response = await model.generateContent(prompt);
    // Log the full response for debugging purposes.
    console.log('Raw response from API:', response);

    // Try to extract the text.
    let resultText = '';
    if (typeof response.text === 'function') {
      // Some SDK versions might offer text() directly on the response.
      resultText = response.text().trim();
    } else if (response.response && typeof response.response.text === 'function') {
      // Fallback for structure: response.response.text()
      resultText = response.response.text().trim();
    } else if (response.response) {
      // Perhaps the API returned the text directly.
      resultText = String(response.response).trim();
    } else {
      console.error('Unexpected response structure:', response);
      throw new Error('Unexpected response structure from Gemini API');
    }

    console.log('Extracted result text:', resultText);

    // Evaluate the result assuming a simple '1' or '0'.
    if (resultText === '1') {
      return true;
    } else if (resultText === '0') {
      return false;
    } else {
      console.error(`Warning: Unexpected response format for URL ${url}: '${resultText}'. Expected '1' or '0'.`);
      return "Something probably went wrong";
    }
  } catch (error) {
    console.error(`Error in checkGambling for ${url}: ${error.message}`);
    return null;
  }
}

// Export the function for use in other modules
module.exports = { checkGambling };

// Main execution if called directly
if (require.main === module) {
  const websiteUrl = "https://www.betmgm.com";

  checkGambling(websiteUrl)
    .then(classificationResult => {
      if (classificationResult !== null) {
        console.log('Classification result:', classificationResult);
      } else {
        console.error(`Failed to classify URL: ${websiteUrl}`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    });
}
