import { GoogleGenAI } from "@google/genai";

const category = [
  "Groceries",
  "U.S. Online Retail Purchases",
  "Gas",
  "Streaming Subscriptions",
  "Transit",
  "Food Services",
  "Hotels",
  "Capital One Hotels",
  "Wholesale Clubs",
  "Drugstore",
  "Other purchases"
];

const ai = new GoogleGenAI({
  apiKey: "AIzaSyDGQwYxgOOKbBnqGtG_tmWTv3BMFpSttJo",
});

async function getMerchantCategoryFromGemini(merchant) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `What merchant category is ${merchant}? Give answer as only merchant category from the following list: ${category.join(
        ", "
      )}`,
    });
    return response.text; // Assuming the response has a 'text' field
  } catch (error) {
    console.error("Error fetching the response:", error);
    return "An error occurred, please try again.";
  }
}

export { getMerchantCategoryFromGemini };
