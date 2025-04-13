import { GoogleGenAI } from "@google/genai";

const category = [
  "Groceries",
  "Gas",
  "Online Retail",
  "Restaurants",
  "Fast Food",
  "Department Stores",
  "Travel Agencies",
  "Airlines",
  "Hotels",
  "Rideshare (Uber/Lyft)",
  "Streaming Services",
  "Pharmacies",
  "Utility Payments",
  "Entertainment",
  "Gyms",
  "Insurance",
  "Education",
  "Auto Repair",
  "Car Rentals",
];


const ai = new GoogleGenAI({
  apiKey: "AIzaSyDGQwYxgOOKbBnqGtG_tmWTv3BMFpSttJo",
});

async function getMerchantCategoryFromGemini(merchant) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `What merchant category is ${merchant}? Give answer as only merchant category from the following list: ${category.join(", ")}`,
    });
    return response.text; // Assuming the response has a 'text' field
  } catch (error) {
    console.error("Error fetching the response:", error);
    return "An error occurred, please try again.";
  }
}

export { getMerchantCategoryFromGemini };
