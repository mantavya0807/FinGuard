import api from './index';

// Process a chatbot message with RAG
export const processMessage = async (message, userId) => {
  try {
    const response = await api.post('http://localhost:5000/api/chatbot/process', { 
      message,
      userId 
    });
    return response;
  } catch (error) {
    console.error('Error processing chatbot message:', error);
    throw error;
  }
};

// For backward compatibility, also provide a default export
const chatbotApi = {
  processMessage
};

export default chatbotApi;