// MongoDB connection details will be handled by the backend API
const apiUrl = "http://localhost:3000/findBestCard"; // Your backend API endpoint

// Function to find the best credit card for a given category
async function findBestCardForCategory(category) {
  try {
    // Send a request to your backend API to find the best card for the category
    console.log("Finding best card for category:", category);
    const response = await fetch(
      `${apiUrl}?category=${category}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch best card data");
    }

    const data = await response.json();
    console.log("API response data:", data);
    
    // Return complete card data including cardName for future reference
    if (data.cardName) {
      return {
        cardName: data.cardName,
        category: data.category,
        reward: data.reward,
        message: data.message
      };
    } else if (data.message) {
      return { message: data.message };
    }

    return null;
  } catch (error) {
    console.error("Error finding best card:", error);
    return { message: "An error occurred while finding the best card." };
  }
}

// Function to be called by the Chrome extension (as before)
async function getBestCardForCurrentWebsite() {
  const currentWebsiteCategory = getCurrentWebsiteCategory();
  return await findBestCardForCategory(currentWebsiteCategory);
}

// Function to determine the category of the current website (as before)
function getCurrentWebsiteCategory() {
  return "Groceries"; // Example category, you'd extract this dynamically from the website
}

// Export functions for use in the extension
export { findBestCardForCategory, getBestCardForCurrentWebsite };
