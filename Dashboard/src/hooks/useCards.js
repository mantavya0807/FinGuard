import { useState, useEffect } from 'react';
import { getCards, addCard, updateCard, deleteCard } from '../services/api/cardsApi';

export const useCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const response = await getCards();
      setCards(response);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch cards');
      console.error('Error fetching cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const addNewCard = async (cardData) => {
    setLoading(true);
    try {
      const response = await addCard(cardData);
      setCards(prevCards => [...prevCards, response]);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to add card');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateExistingCard = async (cardId, cardData) => {
    setLoading(true);
    try {
      const response = await updateCard(cardId, cardData);
      setCards(prevCards => 
        prevCards.map(card => 
          card.id === cardId ? response : card
        )
      );
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update card');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeCard = async (cardId) => {
    setLoading(true);
    try {
      await deleteCard(cardId);
      setCards(prevCards => prevCards.filter(card => card.id !== cardId));
    } catch (err) {
      setError(err.message || 'Failed to delete card');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCardById = (cardId) => {
    return cards.find(card => card.id === cardId);
  };

  return {
    cards,
    loading,
    error,
    addCard: addNewCard,
    updateCard: updateExistingCard,
    deleteCard: removeCard,
    refreshCards: fetchCards,
    getCardById
  };
};