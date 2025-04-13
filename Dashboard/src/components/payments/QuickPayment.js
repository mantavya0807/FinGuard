import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon, 
  ArrowPathIcon,
  ShoppingCartIcon,
  BuildingStorefrontIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import nessieApi from '../../services/api/nessieApi';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-hot-toast';

// Predefined merchant categories
const MERCHANT_CATEGORIES = [
  { id: 'dining', name: 'Dining', icon: <BuildingStorefrontIcon className="h-5 w-5" /> },
  { id: 'groceries', name: 'Groceries', icon: <ShoppingCartIcon className="h-5 w-5" /> },
  { id: 'shopping', name: 'Shopping', icon: <ShoppingCartIcon className="h-5 w-5" /> },
  { id: 'utilities', name: 'Utilities', icon: <BanknotesIcon className="h-5 w-5" /> },
  { id: 'entertainment', name: 'Entertainment', icon: <BuildingStorefrontIcon className="h-5 w-5" /> }
];

// Predefined merchants for quick selection
const PREDEFINED_MERCHANTS = [
  { id: '57cf75cea73e494d8675ec49', name: 'Apple Store', category: 'shopping' },
  { id: '57cf75cea73e494d8675ec4a', name: 'Target', category: 'shopping' },
  { id: '57cf75cea73e494d8675ec4b', name: 'Whole Foods', category: 'groceries' },
  { id: '57cf75cea73e494d8675ec4c', name: 'Starbucks', category: 'dining' },
  { id: '57cf75cea73e494d8675ec4d', name: 'Netflix', category: 'entertainment' },
  { id: '57cf75cea73e494d8675ec4e', name: 'Amazon', category: 'shopping' },
  { id: '57cf75cea73e494d8675ec4f', name: 'Electric Company', category: 'utilities' },
  { id: '57cf75cea73e494d8675ec50', name: 'Water Utility', category: 'utilities' }
];

// Component for making quick payments
const QuickPayment = ({ accountId, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [step, setStep] = useState(1); // Step 1: Merchant selection, Step 2: Amount & details
  const [fetchingMerchants, setFetchingMerchants] = useState(false);

  // Fetch merchants from API or use predefined ones
  useEffect(() => {
    const getMerchants = async () => {
      setFetchingMerchants(true);
      try {
        // Try to fetch real merchants from the API
        const merchantsData = await nessieApi.getMerchants();
        if (merchantsData && merchantsData.length > 0) {
          setMerchants(merchantsData);
        } else {
          // If no merchants found, use predefined ones
          setMerchants(PREDEFINED_MERCHANTS);
        }
      } catch (error) {
        console.error('Error fetching merchants:', error);
        // Fallback to predefined merchants
        setMerchants(PREDEFINED_MERCHANTS);
      } finally {
        setFetchingMerchants(false);
      }
    };

    getMerchants();
  }, []);

  // Reset the form
  const resetForm = () => {
    setSelectedMerchant(null);
    setSelectedCategory(null);
    setAmount('');
    setDescription('');
    setStep(1);
  };

  // Handle merchant selection
  const handleMerchantSelect = (merchant) => {
    setSelectedMerchant(merchant);
    
    // Find category by ID
    const category = MERCHANT_CATEGORIES.find(c => c.id === merchant.category);
    setSelectedCategory(category || MERCHANT_CATEGORIES[0]);
    
    // Move to next step
    setStep(2);
  };

  // Handle category selection (when creating custom merchant)
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // Handle amount change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setAmount(value);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!accountId) {
      toast.error('No account selected');
      return;
    }
    
    if (!selectedMerchant) {
      toast.error('Please select a merchant');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare purchase data
      const purchaseData = {
        merchant_id: selectedMerchant.id,
        medium: 'balance',
        purchase_date: new Date().toISOString(),
        amount: parseFloat(amount),
        description: description || `Payment to ${selectedMerchant.name}`,
        status: 'completed',
        type: selectedCategory?.id || 'other'
      };
      
      // Make the API call
      const response = await nessieApi.createPurchase(accountId, purchaseData);
      
      toast.success(`Payment of $${amount} to ${selectedMerchant.name} successful!`);
      
      // Reset form
      resetForm();
      
      // Callback if provided
      if (onPaymentSuccess) {
        onPaymentSuccess(response);
      }
    } catch (error) {
      console.error('Error making payment:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    setStep(1);
  };

  // Render merchant selection step
  const renderMerchantSelection = () => (
    <div>
      <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">
        Select a Merchant
      </h3>
      
      {fetchingMerchants ? (
        <div className="flex justify-center my-6">
          <LoadingSpinner size="h-8 w-8" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {merchants.map((merchant) => (
            <motion.button
              key={merchant.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleMerchantSelect(merchant)}
              className="p-3 border border-gray-200 dark:border-dark-600 rounded-lg flex flex-col items-center justify-center bg-white dark:bg-dark-700 hover:bg-gray-50 dark:hover:bg-dark-600 h-24"
            >
              <div className="rounded-full bg-primary-100 dark:bg-primary-800/30 p-2 mb-2">
                {MERCHANT_CATEGORIES.find(c => c.id === merchant.category)?.icon || 
                <ShoppingCartIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                {merchant.name}
              </span>
            </motion.button>
          ))}
          
          {/* Custom merchant option */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedMerchant({ id: 'custom', name: 'Custom Merchant' });
              setStep(2);
            }}
            className="p-3 border border-dashed border-gray-300 dark:border-dark-500 rounded-lg flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-700 hover:bg-gray-100 dark:hover:bg-dark-600 h-24"
          >
            <div className="rounded-full bg-gray-100 dark:bg-dark-600 p-2 mb-2">
              <PlusIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Custom Merchant
            </span>
          </motion.button>
        </div>
      )}
    </div>
  );

  // Render payment details step
  const renderPaymentDetails = () => (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button
            type="button"
            onClick={handleBack}
            className="mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
            {selectedMerchant.id === 'custom' ? 'Custom Payment' : `Payment to ${selectedMerchant.name}`}
          </h3>
        </div>
        
        {selectedMerchant.id === 'custom' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Merchant Name
            </label>
            <input
              type="text"
              className="input-field w-full"
              placeholder="Enter merchant name"
              value={selectedMerchant.name}
              onChange={(e) => setSelectedMerchant({...selectedMerchant, name: e.target.value})}
              required
            />
          </div>
        )}
        
        {selectedMerchant.id === 'custom' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {MERCHANT_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className={`p-2 border ${
                    selectedCategory?.id === category.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-300'
                  } rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-600`}
                >
                  <div className="mb-1">
                    {category.icon}
                  </div>
                  <span className="text-xs font-medium">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">$</span>
            </div>
            <input
              type="text"
              className="input-field w-full pl-8"
              placeholder="0.00"
              value={amount}
              onChange={handleAmountChange}
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (Optional)
          </label>
          <input
            type="text"
            className="input-field w-full"
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={resetForm}
          className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-dark-700 dark:border-dark-600 dark:text-gray-300 dark:hover:bg-dark-600"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-900"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center">
              <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Processing...
            </div>
          ) : (
            'Make Payment'
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-700">
      <div className="flex items-center mb-5">
        <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 mr-3">
          <CreditCardIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Payment
        </h2>
      </div>
      
      {step === 1 ? renderMerchantSelection() : renderPaymentDetails()}
    </div>
  );
};

// Add missing icons
const PlusIcon = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M12 4v16m8-8H4" 
    />
  </svg>
);

const ArrowLeftIcon = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M10 19l-7-7m0 0l7-7m-7 7h18" 
    />
  </svg>
);

export default QuickPayment;