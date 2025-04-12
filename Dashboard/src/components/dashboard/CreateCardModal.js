import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XIcon, CreditCardIcon, CheckCircleIcon } from '@heroicons/react/outline';
import InputField from '../common/InputField';
import Button from '../common/Button';
import { useCards } from '../../hooks/useCards';
import { detectCardType, validateCardNumber, validateExpiryDate, validateCVV } from '../../services/constants/cardTypes';

const CreateCardModal = ({ isOpen, onClose }) => {
  const { addCard, loading } = useCards();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    monthlySpendingLimit: 1000,
    color: '#1E3A8A'
  });
  
  const [errors, setErrors] = useState({});
  const [cardType, setCardType] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Detect card type when card number changes
  useEffect(() => {
    if (formData.cardNumber) {
      const detectedType = detectCardType(formData.cardNumber);
      setCardType(detectedType);
    } else {
      setCardType(null);
    }
  }, [formData.cardNumber]);
  
  // Handle form field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Validate step 1
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Invalid card number';
    }
    
    if (!formData.cardHolder) {
      newErrors.cardHolder = 'Cardholder name is required';
    }
    
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!validateExpiryDate(formData.expiryDate)) {
      newErrors.expiryDate = 'Invalid expiry date (MM/YY)';
    }
    
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (cardType && !validateCVV(formData.cvv, cardType)) {
      newErrors.cvv = `CVV must be ${cardType === 'AMEX' ? '4' : '3'} digits`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate step 2
  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.cardName) {
      newErrors.cardName = 'Card nickname is required';
    }
    
    if (!formData.billingAddress.street) {
      newErrors['billingAddress.street'] = 'Street address is required';
    }
    
    if (!formData.billingAddress.city) {
      newErrors['billingAddress.city'] = 'City is required';
    }
    
    if (!formData.billingAddress.state) {
      newErrors['billingAddress.state'] = 'State is required';
    }
    
    if (!formData.billingAddress.zipCode) {
      newErrors['billingAddress.zipCode'] = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.billingAddress.zipCode)) {
      newErrors['billingAddress.zipCode'] = 'Invalid ZIP code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleSubmit();
    }
  };
  
  // Handle back
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      const cardData = {
        ...formData,
        cardType: cardType || 'VISA',
        rewards: {
          travelPoints: 1,
          diningPoints: 1,
          groceryPoints: 1,
          gasCashback: 1,
          generalCashback: 1
        }
      };
      
      await addCard(cardData);
      setIsSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          cardName: '',
          cardNumber: '',
          cardHolder: '',
          expiryDate: '',
          cvv: '',
          billingAddress: {
            street: '',
            city: '',
            state: '',
            zipCode: ''
          },
          monthlySpendingLimit: 1000,
          color: '#1E3A8A'
        });
        setStep(1);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error adding card:', err);
      setErrors({
        form: 'Failed to add card. Please try again.'
      });
    }
  };
  
  // Render card details form (step 1)
  const renderCardDetailsForm = () => {
    return (
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
            id="cvv"
            label="CVV"
            type="password"
            placeholder={cardType === 'AMEX' ? '4 digits' : '3 digits'}
            value={formData.cvv}
            onChange={handleChange}
            error={errors.cvv}
            required
            maxLength={cardType === 'AMEX' ? 4 : 3}
          />
        </div>
        
        {cardType && (
          <div className="bg-primary-50 p-3 rounded-lg flex items-center">
            <CreditCardIcon className="h-5 w-5 text-primary-600 mr-2" />
            <p className="text-sm text-primary-700">
              {cardType} card detected
            </p>
          </div>
        )}
      </div>
    );
  };
  
  // Render card settings form (step 2)
  const renderCardSettingsForm = () => {
    return (
      <div className="space-y-4">
        <InputField
          id="cardName"
          label="Card Nickname"
          placeholder="e.g. My Travel Card"
          value={formData.cardName}
          onChange={handleChange}
          error={errors.cardName}
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
                  formData.color === color ? 'border-gray-900' : 'border-transparent'
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
        
        <InputField
          id="billingAddress.street"
          label="Street Address"
          placeholder="123 Main St"
          value={formData.billingAddress.street}
          onChange={handleChange}
          error={errors['billingAddress.street']}
          required
        />
        
        <div className="grid grid-cols-2 gap-4">
          <InputField
            id="billingAddress.city"
            label="City"
            placeholder="New York"
            value={formData.billingAddress.city}
            onChange={handleChange}
            error={errors['billingAddress.city']}
            required
          />
          
          <InputField
            id="billingAddress.state"
            label="State"
            placeholder="NY"
            value={formData.billingAddress.state}
            onChange={handleChange}
            error={errors['billingAddress.state']}
            required
          />
        </div>
        
        <InputField
          id="billingAddress.zipCode"
          label="ZIP Code"
          placeholder="10001"
          value={formData.billingAddress.zipCode}
          onChange={handleChange}
          error={errors['billingAddress.zipCode']}
          required
        />
        
        <InputField
          id="monthlySpendingLimit"
          label="Monthly Spending Limit"
          type="number"
          placeholder="1000"
          value={formData.monthlySpendingLimit}
          onChange={handleChange}
          error={errors.monthlySpendingLimit}
          min="0"
          step="100"
        />
      </div>
    );
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  {isSuccess ? 'Success' : `Add New Card ${step === 1 ? '(1/2)' : '(2/2)'}`}
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </Dialog.Title>
                
                <div className="mt-4">
                  {isSuccess ? (
                    renderSuccessMessage()
                  ) : (
                    <>
                      {/* Steps indicator */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                              1
                            </div>
                            <div className={`h-0.5 w-12 ${
                              step > 1 ? 'bg-primary-600' : 'bg-gray-200'
                            }`}></div>
                          </div>
                          <div className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                              2
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-gray-500">Card Details</span>
                          <span className="text-xs text-gray-500">Card Settings</span>
                        </div>
                      </div>
                      
                      {/* Form contents based on step */}
                      {step === 1 ? renderCardDetailsForm() : renderCardSettingsForm()}
                      
                      {/* Error message */}
                      {errors.form && (
                        <div className="mt-4 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
                          {errors.form}
                        </div>
                      )}
                      
                      {/* Form actions */}
                      <div className="mt-6 flex justify-between">
                        {step === 1 ? (
                          <Button variant="outline" onClick={onClose}>
                            Cancel
                          </Button>
                        ) : (
                          <Button variant="outline" onClick={handleBack}>
                            Back
                          </Button>
                        )}
                        
                        <Button
                          variant="primary"
                          onClick={handleNextStep}
                          loading={loading}
                        >
                          {step === 1 ? 'Next' : 'Add Card'}
                        </Button>
                      </div>
                    </>
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