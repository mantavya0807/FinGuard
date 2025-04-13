import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import InputField from '../common/InputField';
import Button from '../common/Button';
import { useCards } from '../../hooks/useCards';
import { CARD_TYPES, detectCardType } from '../../services/constants/cardTypes';

const CreateCardModal = ({ isOpen, onClose }) => {
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
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Detect card type when card number changes
  useEffect(() => {
    if (formData.cardNumber) {
      const detectedType = detectCardType(formData.cardNumber);
      if (detectedType) {
        setFormData(prev => ({ ...prev, cardType: detectedType }));
      }
    }
  }, [formData.cardNumber]);
  
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
        [name]: ''
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
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      await addCard(formData);
      setIsSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          cardName: '',
          cardNumber: '',
          cardHolder: '',
          expiryDate: '',
          pin: '',
          cardType: 'VISA',
          creditLimit: 5000,
          color: '#1E3A8A'
        });
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error adding card:', err);
      setErrors({
        form: 'Failed to add card. Please try again.'
      });
    }
  };
  
  // Render success message
  const renderSuccessMessage = () => {
    return (
      <div className="text-center py-6">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-100">
          <CheckCircleIcon className="h-6 w-6 text-success-600" />
        </div>
        <h3 className="mt-3 text-lg font-medium text-gray-900">Card Added Successfully!</h3>
        <p className="mt-2 text-sm text-gray-500">
          Your card has been added and is ready to use.
        </p>
      </div>
    );
  };
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-dark-800">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex justify-between items-center"
                >
                  {isSuccess ? 'Success' : 'Add New Card'}
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </Dialog.Title>
                
                <div className="mt-4">
                  {isSuccess ? (
                    renderSuccessMessage()
                  ) : (
                    <div className="space-y-4">
                      <InputField
                        id="cardNumber"
                        label="Card Number"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        error={errors.cardNumber}
                        required
                        maxLength={19}
                        icon={<CreditCardIcon className="h-5 w-5 text-gray-400" />}
                      />
                      
                      <InputField
                        id="cardName"
                        label="Card Name"
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
                          <option value="VISA">Visa</option>
                          <option value="MASTERCARD">Mastercard</option>
                          <option value="AMEX">American Express</option>
                          <option value="DISCOVER">Discover</option>
                          <option value="DINERS">Diners Club</option>
                          <option value="JCB">JCB</option>
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
                      
                      {/* Form actions */}
                      <div className="mt-6 flex justify-between">
                        <Button variant="outline" onClick={onClose}>
                          Cancel
                        </Button>
                        
                        <Button
                          variant="primary"
                          onClick={handleSubmit}
                          loading={loading}
                        >
                          Add Card
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateCardModal;