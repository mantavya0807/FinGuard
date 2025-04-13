import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCardIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import InputField from '../common/InputField';
import Button from '../common/Button';
import { useCards } from '../../hooks/useCards';
import { CARD_TYPES, detectCardType } from '../../services/constants/cardTypes';

const AddCardScreen = () => {
  const navigate = useNavigate();
  const { addCard, loading } = useCards();
  
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    pin: '',
    cardType: 'VISA',
    creditLimit: 5000,
    color: '#1E3A8A'
  });
  
  const [errors, setErrors] = useState({});
  
  // Handle card number input and detect card type
  const handleCardNumberChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, cardNumber: value }));
    
    // Auto-detect card type
    const detectedType = detectCardType(value);
    if (detectedType) {
      setFormData(prev => ({ ...prev, cardType: detectedType }));
    }
    
    // Clear error when user types
    if (errors.cardNumber) {
      setErrors(prev => ({ ...prev, cardNumber: null }));
    }
  };
  
  // Handle form field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (formData.cardNumber.replace(/\s/g, '').length < 15) {
      newErrors.cardNumber = 'Card number should be at least 15 digits';
    }
    
    if (!formData.cardName) {
      newErrors.cardName = 'Card name is required';
    }
    
    if (!formData.cardHolder) {
      newErrors.cardHolder = 'Cardholder name is required';
    }
    
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Format should be MM/YY';
    }
    
    if (!formData.pin) {
      newErrors.pin = 'PIN is required';
    } else if (!/^\d{4}$/.test(formData.pin)) {
      newErrors.pin = 'PIN must be 4 digits';
    }
    
    if (!formData.cardType) {
      newErrors.cardType = 'Card type is required';
    }
    
    if (!formData.creditLimit) {
      newErrors.creditLimit = 'Credit limit is required';
    } else if (isNaN(formData.creditLimit) || formData.creditLimit <= 0) {
      newErrors.creditLimit = 'Credit limit must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await addCard(formData);
      toast.success('Card added successfully!');
      navigate('/cards');
    } catch (err) {
      console.error('Error adding card:', err);
      toast.error('Failed to add card. Please try again.');
      setErrors({
        form: 'Failed to add card. Please try again.'
      });
    }
  };
  
  const renderCardPreview = () => {
    const last4 = formData.cardNumber 
      ? formData.cardNumber.slice(-4) 
      : '0000';
      
    const name = formData.cardName || 'My Card';
    const holder = formData.cardHolder || 'CARDHOLDER NAME';
    const expiry = formData.expiryDate || 'MM/YY';
    
    return (
      <div className="relative w-full h-56 rounded-xl overflow-hidden shadow-lg mb-8"
           style={{ 
             backgroundColor: formData.color,
             backgroundImage: 'linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)'
           }}>
        <div className="p-6 flex flex-col justify-between h-full">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              {formData.cardType === 'VISA' && (
                <div className="text-white font-bold tracking-widest text-lg">VISA</div>
              )}
              {formData.cardType === 'MASTERCARD' && (
                <div className="flex space-x-1">
                  <div className="h-6 w-6 rounded-full bg-red-500 opacity-80"></div>
                  <div className="h-6 w-6 rounded-full bg-yellow-500 opacity-80"></div>
                </div>
              )}
              {formData.cardType === 'AMEX' && (
                <div className="text-white font-bold tracking-widest text-lg">AMEX</div>
              )}
              {(formData.cardType !== 'VISA' && formData.cardType !== 'MASTERCARD' && formData.cardType !== 'AMEX') && (
                <CreditCardIcon className="h-8 w-8 text-white" />
              )}
            </div>
            <div>
              <span className="text-xs text-white text-opacity-80">Credit Limit</span>
              <p className="text-sm text-white font-medium">${Number(formData.creditLimit).toLocaleString()}</p>
            </div>
          </div>
          
          {/* Chip */}
          <div className="mb-4">
            <div className="h-10 w-14 bg-yellow-300 rounded-md bg-opacity-80 p-1">
              <div className="h-full w-full border-2 border-yellow-500 rounded opacity-50"></div>
            </div>
          </div>
          
          {/* Card Number */}
          <div className="mb-6">
            <div className="text-xs text-white text-opacity-80 mb-1">Card Number</div>
            <div className="font-mono text-xl text-white tracking-wider">
              •••• •••• •••• {last4}
            </div>
          </div>
          
          {/* Card Details */}
          <div className="flex justify-between text-white">
            <div>
              <div className="text-xs text-white text-opacity-80 mb-1">Card Holder</div>
              <div className="font-medium tracking-wide uppercase">{holder}</div>
            </div>
            <div>
              <div className="text-xs text-white text-opacity-80 mb-1">Expires</div>
              <div className="font-medium">{expiry}</div>
            </div>
          </div>
        </div>
        
        {/* Decorative card design elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-0 right-0 h-32 w-32 bg-white bg-opacity-5 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 h-24 w-24 bg-white bg-opacity-5 rounded-full -ml-12 -mb-12"></div>
        </div>
      </div>
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          icon={<ArrowLeftIcon className="h-5 w-5" />}
          onClick={() => navigate('/cards')}
          className="mr-4"
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Card</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Card Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              id="cardNumber"
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              error={errors.cardNumber}
              required
              maxLength={19}
              icon={<CreditCardIcon className="h-5 w-5 text-gray-400" />}
            />
            
            <InputField
              id="cardName"
              label="Card Name/Nickname"
              placeholder="e.g. My Travel Card"
              value={formData.cardName}
              onChange={handleChange}
              error={errors.cardName}
              required
            />
            
            <InputField
              id="cardHolder"
              label="Cardholder Name"
              placeholder="John Doe"
              value={formData.cardHolder}
              onChange={handleChange}
              error={errors.cardHolder}
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <InputField
                id="expiryDate"
                label="Expiry Date"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={handleChange}
                error={errors.expiryDate}
                required
                maxLength={5}
              />
              
              <InputField
                id="pin"
                label="PIN"
                type="password"
                placeholder="4 digits"
                value={formData.pin}
                onChange={handleChange}
                error={errors.pin}
                required
                maxLength={4}
              />
            </div>
            
            <div>
              <label htmlFor="cardType" className="label">Card Type</label>
              <select
                id="cardType"
                name="cardType"
                value={formData.cardType}
                onChange={handleChange}
                className="input-field w-full dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                required
              >
                <option value="AMEX_BCE">AMEX Blue Cash Everyday Card</option>
                <option value="AMEX_BCP">AMEX Blue Cash Preferred Card</option>
                <option value="CAPITAL_SAVOR">CapitalOne Savor Card</option>
                <option value="CAPITAL_QUICKSILVER">CapitalOne Quicksilver Rewards</option>
                <option value="DISCOVER_STUDENT">Discover It Student Card</option>
                <option value="CHASE_FREEDOM">Chase Freedom Unlimited</option>
              </select>
              {errors.cardType && <p className="mt-1 text-sm text-danger-500">{errors.cardType}</p>}
            </div>
            
            <InputField
              id="creditLimit"
              label="Credit Limit"
              type="number"
              placeholder="5000"
              value={formData.creditLimit}
              onChange={handleChange}
              error={errors.creditLimit}
              min="0"
              step="100"
              required
            />
            
            <div>
              <label className="label">Card Color</label>
              <div className="flex items-center space-x-2">
                {['#1E3A8A', '#DC2626', '#059669', '#7C3AED', '#2563EB'].map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-900 dark:border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  />
                ))}
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-8 h-8 p-0 border-0 rounded-full cursor-pointer"
                />
              </div>
            </div>
            
            {/* Error message */}
            {errors.form && (
              <div className="mt-4 bg-danger-50 border border-danger-200 text-danger-700 dark:bg-danger-900/30 dark:border-danger-800 dark:text-danger-400 px-4 py-3 rounded-lg text-sm">
                {errors.form}
              </div>
            )}
            
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/cards')}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={loading}
              >
                Add Card
              </Button>
            </div>
          </form>
        </div>
        
        <div className="lg:pt-10">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Card Preview</h2>
          {renderCardPreview()}
          
          <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 dark:bg-primary-900/20 dark:border-primary-900">
            <h3 className="font-medium text-primary-700 dark:text-primary-300 mb-2">Important Note</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              When you add a credit card, we create a corresponding account through the Nessie API. This allows you to track spending, manage payments, and optimize rewards - all in one place.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AddCardScreen;