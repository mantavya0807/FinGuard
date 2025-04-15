// Updated useCards.js - Completely rebuilt for reliability

import { useState, useEffect, useCallback } from 'react';
import cardsApi, { MOCK_CARDS } from '../services/api/cardsApi';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for managing cards
 * @param {boolean} useMockData - Whether to use mock data instead of API calls (for development)
 * @returns {Object} Cards state and functions
 */
export const useCards = (useMockData = false) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Fetch all cards
  const fetchCards = useCallback(async () => {
    if (loading && initialized) return; // Prevent duplicate fetches
    
    setLoading(true);
    setError(null);
    
    try {
      // Use mock data or real API based on parameter
      let cardsData;
      
      if (useMockData) {
        // Simulate API delay with mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        cardsData = [...MOCK_CARDS];
      } else {
        cardsData = await cardsApi.getCards();
      }
      
      setCards(cardsData);
      setInitialized(true);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError(err.message || 'Failed to fetch cards');
      
      // If API fails but we have mock data available, use it as fallback
      if (useMockData) {
        setCards([...MOCK_CARDS]);
        toast.error('Using mock data - API connection failed');
      }
    } finally {
      setLoading(false);
    }
  }, [useMockData, loading, initialized]);

  // Initial data fetch
  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Get a card by ID
  const getCardById = useCallback((cardId) => {
    return cards.find(card => card.id === cardId);
  }, [cards]);

  // Add a new card
  const addCard = useCallback(async (cardData) => {
    setLoading(true);
    
    try {
      let newCard;
      
      if (useMockData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create mock card with ID
        newCard = {
          id: 'card_' + Math.random().toString(36).substring(2, 10),
          ...cardData,
          cardAddedDate: new Date().toISOString()
        };
        
        setCards(prevCards => [...prevCards, newCard]);
        toast.success('Card added successfully');
      } else {
        newCard = await cardsApi.addCard(cardData);
        setCards(prevCards => [...prevCards, newCard]);
      }
      
      return newCard;
    } catch (err) {
      console.error('Error adding card:', err);
      setError(err.message || 'Failed to add card');
      toast.error('Failed to add card');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  // Update an existing card
  const updateCard = useCallback(async (cardId, cardData) => {
    setLoading(true);
    
    try {
      let updatedCard;
      
      if (useMockData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update card in local state
        updatedCard = { ...getCardById(cardId), ...cardData };
        
        setCards(prevCards => 
          prevCards.map(card => card.id === cardId ? updatedCard : card)
        );
        
        toast.success('Card updated successfully');
      } else {
        updatedCard = await cardsApi.updateCard(cardId, cardData);
        
        setCards(prevCards => 
          prevCards.map(card => card.id === cardId ? updatedCard : card)
        );
      }
      
      return updatedCard;
    } catch (err) {
      console.error('Error updating card:', err);
      setError(err.message || 'Failed to update card');
      toast.error('Failed to update card');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMockData, getCardById]);

  // Delete a card
  const deleteCard = useCallback(async (cardId) => {
    setLoading(true);
    
    try {
      if (useMockData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Remove card from local state
        setCards(prevCards => prevCards.filter(card => card.id !== cardId));
        toast.success('Card deleted successfully');
      } else {
        await cardsApi.deleteCard(cardId);
        setCards(prevCards => prevCards.filter(card => card.id !== cardId));
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting card:', err);
      setError(err.message || 'Failed to delete card');
      toast.error('Failed to delete card');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  // Get security alerts for cards
  const getCardSecurityAlerts = useCallback(async (cardId = null) => {
    try {
      let alerts;
      
      if (useMockData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Create mock alerts (empty for now, add mock alerts if needed)
        alerts = [];
      } else {
        if (cardId) {
          alerts = await cardsApi.getCardSecurityAlertsById(cardId);
        } else {
          alerts = await cardsApi.getCardSecurityAlerts();
        }
      }
      
      return alerts;
    } catch (err) {
      console.error('Error fetching security alerts:', err);
      return [];
    }
  }, [useMockData]);

  // Reset any errors and refresh cards
  const refreshCards = useCallback(() => {
    setError(null);
    return fetchCards();
  }, [fetchCards]);

  return {
    cards,
    loading,
    error,
    getCardById,
    addCard,
    updateCard,
    deleteCard,
    getCardSecurityAlerts,
    refreshCards,
    initialized
  };
};

export default useCards;