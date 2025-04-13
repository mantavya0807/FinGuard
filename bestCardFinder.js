// bestCardFinder.js - Chrome Extension for finding the best credit card to use

// MongoDB connection details
const userCardsUri = "mongodb+srv://manas1:hardpass@cluster0.hzb6xlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const userCardsDbName = "creditCardsDB";
const userCardsCollectionName = "cards";

const rewardsUri = "mongodb+srv://manas1:hardpass@cluster0.hzb6xlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const rewardsDbName = "card_rewards";
const rewardsCollectionName = "rewards";

// Function to find the best credit card for a given category
async function findBestCardForCategory(category) {
  try {
    // Connect to MongoDB to get user's cards
    const userCardsClient = await connectToMongoDB(userCardsUri);
    const userCardsDb = userCardsClient.db(userCardsDbName);
    const userCardsCollection = userCardsDb.collection(userCardsCollectionName);
    
    // Get all cards owned by the user
    const userCards = await userCardsCollection.find({}).toArray();
    const userCardNames = userCards.map(card => card.cardName);
    
    if (userCardNames.length === 0) {
      return { message: "You don't have any credit cards in your account." };
    }
    
    // Connect to MongoDB to get rewards data
    const rewardsClient = await connectToMongoDB(rewardsUri);
    const rewardsDb = rewardsClient.db(rewardsDbName);
    const rewardsCollection = rewardsDb.collection(rewardsCollectionName);
    
    // Find all rewards for the user's cards
    const allRewards = await rewardsCollection.find({
      card_name: { $in: userCardNames }
    }).toArray();
    
    // Filter rewards for the specific category
    const categoryRewards = allRewards.filter(reward => 
      reward.category.toLowerCase() === category.toLowerCase()
    );
    
    // If no specific category rewards found, look for "other purchases"
    let rewardsToConsider = categoryRewards;
    if (categoryRewards.length === 0) {
      rewardsToConsider = allRewards.filter(reward => 
        reward.category.toLowerCase() === "other purchases"
      );
    }
    
    if (rewardsToConsider.length === 0) {
      return { message: "No rewards found for your cards." };
    }
    
    // Find the card with the highest reward percentage
    let bestCard = null;
    let highestReward = 0;
    
    for (const reward of rewardsToConsider) {
      // Extract the percentage from the reward string (e.g., "5%" -> 5)
      const rewardMatch = reward.reward.match(/(\d+(\.\d+)?)%/);
      if (rewardMatch) {
        const rewardPercentage = parseFloat(rewardMatch[1]);
        if (rewardPercentage > highestReward) {
          highestReward = rewardPercentage;
          bestCard = reward;
        }
      }
    }
    
    // Close MongoDB connections
    await userCardsClient.close();
    await rewardsClient.close();
    
    if (bestCard) {
      return {
        cardName: bestCard.card_name,
        category: bestCard.category,
        reward: bestCard.reward,
        message: `Use your ${bestCard.card_name} for ${highestReward}% cash back on ${bestCard.category}.`
      };
    } else {
      return { message: "Could not determine the best card." };
    }
    
  } catch (error) {
    console.error("Error finding best card:", error);
    return { message: "An error occurred while finding the best card." };
  }
}

// Helper function to connect to MongoDB
async function connectToMongoDB(uri) {
  // In a real implementation, you would use a MongoDB client library
  // For Chrome extensions, you might need to use a backend service or API
  // This is a placeholder for the actual implementation
  throw new Error("MongoDB connection not implemented. Use a backend service or API instead.");
}

// Function to be called by the Chrome extension
async function getBestCardForCurrentWebsite() {
  // This function would be called when the user clicks the extension icon
  // The category would be determined by the extension's content script
  const currentWebsiteCategory = getCurrentWebsiteCategory();
  return await findBestCardForCategory(currentWebsiteCategory);
}

// Function to determine the category of the current website
function getCurrentWebsiteCategory() {
  // This would be implemented by the extension's content script
  // It would analyze the current website and return one of the standardized categories
  // For now, this is a placeholder
  return "Groceries"; // Example category
}

// Export functions for use in the extension
export {
  findBestCardForCategory,
  getBestCardForCurrentWebsite
}; 