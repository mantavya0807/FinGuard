import React, { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { usePlaid } from '../../hooks/usePlaid';
import Button from '../common/Button';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const PlaidLink = ({ onSuccess, onExit, buttonText = 'Connect Account', className = '', variant = 'primary', size = 'md' }) => {
  const { linkToken, generateLinkToken, loading, error } = usePlaid();
  const [tokenRetries, setTokenRetries] = useState(0);
  
  // Generate a link token on component mount
  useEffect(() => {
    if (!linkToken && tokenRetries < 3) {
      generateLinkToken();
    }
  }, [linkToken, generateLinkToken, tokenRetries]);
  
  // Handle Plaid success
  const handleSuccess = useCallback(
    async (publicToken, metadata) => {
      toast.success("Bank connected successfully!");
      if (typeof onSuccess === 'function') {
        onSuccess(publicToken, metadata);
      }
    },
    [onSuccess]
  );
  
  // Handle Plaid exit
  const handleExit = useCallback(
    (err, metadata) => {
      if (err != null) {
        toast.error(`Connection error: ${err.display_message || err.error_message}`);
      }
      
      if (typeof onExit === 'function') {
        onExit(err, metadata);
      }
    },
    [onExit]
  );
  
  // Configure Plaid Link
  const config = {
    token: linkToken,
    onSuccess: handleSuccess,
    onExit: handleExit,
  };
  
  const { open, ready } = usePlaidLink(config);
  
  // Generate a new link token if there was an error
  const handleRetry = () => {
    setTokenRetries(prev => prev + 1);
    generateLinkToken();
    toast.info("Retrying connection...");
  };
  
  if (error?.linkToken) {
    return (
      <Button
        variant="outline"
        onClick={handleRetry}
        className={className}
        icon={<ArrowPathIcon className="h-5 w-5" />}
      >
        Retry Connection
      </Button>
    );
  }
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => {
        if (ready) {
          open();
        } else {
          toast.info("Plaid connection is initializing...");
          // Try regenerating the token if not ready
          if (!linkToken) {
            handleRetry();
          }
        }
      }}
      disabled={loading?.linkToken}
      loading={loading?.linkToken}
      className={className}
      icon={!loading?.linkToken && <PlusIcon className="h-5 w-5" />}
    >
      {buttonText}
    </Button>
  );
};

export default PlaidLink;