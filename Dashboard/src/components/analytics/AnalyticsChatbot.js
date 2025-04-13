import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  PaperAirplaneIcon, 
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import * as chatbotApi from '../../services/api/chatbotApi';

const AnalyticsChatbot = ({ isOverlay = false }) => {
  const { user } = useAuth();
  const {
    loading
  } = useAnalytics();
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      content: 'Hello! I\'m your financial assistant. I can help analyze your spending, suggest ways to optimize your budget, and answer questions about your transactions. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of chat whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Sample suggested questions
  const suggestedQuestions = [
    "Where am I spending the most money?",
    "How can I optimize my rewards?",
    "Am I overspending on any categories?",
    "Show me my top merchants",
    "What suspicious transactions should I check?"
  ];
  
  // Function to handle sending messages
  const handleSendMessage = async (e) => {
    // If e is an event object, prevent default behavior
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    
    // Get message content - either from input or directly passed
    const messageContent = typeof e === 'string' ? e : inputValue;
    
    // Don't process empty messages
    if (!messageContent.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue(''); // Clear input field
    setIsProcessing(true);
    
    try {
      // Process the message with the API
      const response = await chatbotApi.processMessage(messageContent, user?.id);
      
      // Add AI response to chat
      setMessages(prev => [
        ...prev, 
        {
          id: Date.now(),
          type: 'system',
          content: response.response,
          timestamp: new Date(),
          context: response.context,
          isErrorFallback: response.error
        }
      ]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Generate fallback response
      const fallbackResponse = await generateFallbackResponse(messageContent);
      
      // Add fallback response to chat
      setMessages(prev => [
        ...prev, 
        {
          id: Date.now(),
          type: 'system',
          content: fallbackResponse,
          timestamp: new Date(),
          isErrorFallback: true
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Function to handle clicking a suggested question
  const handleSuggestedQuestion = (question) => {
    // Just pass the question text directly
    handleSendMessage(question);
  };
  
  // Local fallback response generator for when the API fails
  const generateFallbackResponse = async (query) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simple regex-based response system as fallback
    if (/spending|spend|most money|where.*money/i.test(query)) {
      return "Based on your transaction history, your highest spending appears to be in dining and groceries. Would you like me to suggest ways to reduce spending in these categories?";
    } 
    else if (/rewards|optimize rewards|best card/i.test(query)) {
      return "To maximize your rewards, I generally recommend using cards with higher cashback rates for your top spending categories. For example, many cards offer 3-5% back on groceries or dining.";
    }
    else if (/overspending|budget|over budget/i.test(query)) {
      return "When analyzing your transactions, I notice some potential areas where you might be overspending compared to typical budgets. Consider setting category-specific budget limits to help control spending.";
    }
    else if (/merchants|top merchants|where.*shop/i.test(query)) {
      return "From what I can see, you frequently shop at grocery stores and online retailers. Identifying your top merchants can help you optimize rewards and find potential savings opportunities.";
    }
    else if (/suspicious|fraud|scam|questionable/i.test(query)) {
      return "It's always good to review your transactions regularly for any suspicious activity. Look for merchants you don't recognize or amounts that seem unusual for your spending patterns.";
    }
    else if (/hello|hi|hey|greetings/i.test(query)) {
      return "Hello! I'm your AI financial assistant. I can analyze your spending, help optimize your rewards, alert you to suspicious transactions, and more. What would you like to know about your finances today?";
    }
    else if (/thank|thanks/i.test(query)) {
      return "You're welcome! If you have any other financial questions or need more insights, feel free to ask anytime.";
    }
    else {
      return "I'm having trouble connecting to get detailed insights right now, but I'd be happy to try answering your question in general terms. Could you rephrase or ask me something specific about your spending, budget, or rewards?";
    }
  };
  
  // Render time relative to now
  const renderTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'just now';
    }
  };

  // Check if data is still loading
  const isDataLoading = Object.values(loading).some(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-dark-800 ${isOverlay ? 'h-full' : 'rounded-xl shadow-md'} flex flex-col`}
    >
      {!isOverlay && (
        <div className="p-6 border-b border-gray-200 dark:border-dark-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2 text-primary-600" />
            Financial Assistant
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Get personalized insights and answers about your financial data
          </p>
        </div>
      )}
      
      {/* Chat Messages */}
      <div className={`flex-1 overflow-y-auto p-4 ${isOverlay ? 'h-64' : 'h-96'}`}>
        {isDataLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <LoadingSpinner size="h-10 w-10" />
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Loading your financial data...
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${
                  message.type === 'user' ? 'flex justify-end' : 'flex justify-start'
                }`}
              >
                <div
                  className={`px-4 py-3 rounded-lg max-w-[80%] ${
                    message.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : message.type === 'error'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {/* Parse message content for markdown-like formatting */}
                  {message.content.split('\n').map((line, i) => {
                    // Bold text
                    const parts = line.split(/(\*\*.*?\*\*)/g);
                    return (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>
                        {parts.map((part, j) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j}>{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                      </p>
                    );
                  })}
                  
                  {message.context && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
                      <p>Based on {message.context.transactionCount} transactions</p>
                    </div>
                  )}
                  
                  {message.isErrorFallback && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
                      <p>Note: Using limited data mode</p>
                    </div>
                  )}
                  
                  <div className="text-xs opacity-70 mt-1 text-right">
                    {renderTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="mb-4 flex justify-start">
                <div className="px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Suggested Questions */}
      {messages.length <= 2 && !isProcessing && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-dark-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full transition-colors"
                onClick={() => handleSuggestedQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-dark-700">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            className="input-field flex-1 py-2"
            placeholder="Ask me about your finances..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isProcessing || isDataLoading}
          />
          <button
            type="submit"
            className={`ml-2 p-2 rounded-full ${
              isProcessing || !inputValue.trim() || isDataLoading
                ? 'bg-gray-200 text-gray-500 dark:bg-dark-700 dark:text-gray-400 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
            disabled={isProcessing || !inputValue.trim() || isDataLoading}
          >
            {isProcessing ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default AnalyticsChatbot;