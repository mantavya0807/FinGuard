require('dotenv').config();
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { IPQS } = require(path.join(__dirname, 'checkScam.js'));
const { checkGambling } = require(path.join(__dirname, 'checkGambling.js'));

function configureGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set. Please check your .env file.");
    process.exit(1);
  }
  return new GoogleGenerativeAI(apiKey);
}

async function generateNudge(url) {
  try {
    // Check for scam indicators
    const scamChecker = new IPQS();
    const scamResults = await scamChecker.checkScam(url);
    console.log("Scam results:", scamResults);

    // Check if it's a gambling site
    const gamblingResult = await checkGambling(url);
    console.log("Gambling result:", gamblingResult);

    // Determine if a nudge is needed
    const isGambling = gamblingResult === true; // Only explicit true is considered gambling

    // Extract positive scam findings
    const detectedThreats = [];
    for (const [key, value] of Object.entries(scamResults)) {
      if (value === true) {
        detectedThreats.push(key);
      }
    }

    // If not gambling AND no threats detected, do not generate a nudge
    if (!isGambling && detectedThreats.length === 0) {
      console.error("No significant risks detected. No nudge generated.");
      return null;
    }

    // Prepare inputs for the prompt
    let gamblingStatus = isGambling ? "Yes" : "No";
    if (gamblingResult === null || typeof gamblingResult === 'string') {
      gamblingStatus = "Unknown"; // Handle error/uncertainty case
    }

    let threatSummary = "None";
    if (detectedThreats.length > 0) {
      threatSummary = detectedThreats
        .map(threat => threat.charAt(0).toUpperCase() + threat.slice(1))
        .sort()
        .join(", ");
    }

    // Construct the prompt
    const prompt = `
Context:
- Website URL: ${url}
- Primary Activity Identified as Gambling: ${gamblingStatus}
- Detected Security Flags: ${threatSummary}

Task:
Generate a brief, user-friendly nudge message (1-2 sentences max) for a web user based *only* on the context above.

Instructions for the nudge:
- Purpose: To make the user aware of potential risks without causing panic or being overly technical. It's a gentle 'heads-up'.
- Tone: Cautious, helpful, simple language.
- Content Priority:
    1. If security flags (like unsafe, spamming, malware, phishing, suspicious) are detected, the nudge *must* focus on warning about these risks and advise caution or avoidance. Mentioning gambling is secondary or omitted if security flags are present.
    2. If *only* gambling is identified (no security flags), the nudge should mention it looks like a gambling site and advise caution, especially regarding financial activity.
    3. If gambling status is Unknown but security flags exist, focus only on the security flags.
- Do NOT: Mention the specific tools used, use jargon, or output anything other than the nudge message itself.

Generate the nudge message now:
`;

    // Initialize Gemini and generate content
    const genAI = configureGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const response = await model.generateContent(prompt);
    
    // Attempt to extract the nudge message from various potential response structures
    let nudgeMessage = "";
    if (response?.response?.text) {
      nudgeMessage = response.response.text().trim();
    } else if (response?.text) {
      nudgeMessage = response.text().trim();
    } else {
      console.error("Unexpected response structure from Gemini:", response);
      return null;
    }

    if (!nudgeMessage) {
      console.error(`Warning: Gemini returned an empty response for ${url}.`);
      return null;
    }
    
    return nudgeMessage;

  } catch (error) {
    console.error(`Error during nudge generation for ${url}: ${error.message}`);
    return null; // Indicate failure to generate nudge
  }
}

module.exports = { generateNudge };

// Main execution if called directly
if (require.main === module) {
  const testUrl = "http://alpha1company.ng";
  
  generateNudge(testUrl)
    .then(nudge => {
      if (nudge) {
        console.log(`Nudge Generated: ${nudge}`);
      } else {
        console.log("No nudge generated (or an error occurred).");
      }
    })
    .catch(error => {
      console.error(`Error: ${error.message}`);
    });
}
