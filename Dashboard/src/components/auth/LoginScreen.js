import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Card from '../common/Card';
import { motion } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Toaster } from 'react-hot-toast';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { login, user, authLoading, error, resetAuthState, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [loginAttempted, setLoginAttempted] = useState(false);
  
  // Reset auth state when component mounts or unmounts
  useEffect(() => {
    resetAuthState();
    
    return () => {
      resetAuthState();
    };
  }, [resetAuthState]);
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // Clear form errors when user types
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };
  
  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoginAttempted(true);
    
    try {
      console.log("Submitting login form");
      await login(formData.email, formData.password);
      console.log("Login API call completed");
      // Don't navigate here - let the auth context handle it
    } catch (err) {
      console.error('Login error:', err);
      // Auth context will handle the error state
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <Toaster position="top-right" />
      
      <motion.div 
        className="max-w-md w-full space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center" variants={itemVariants}>
          <motion.div 
            className="inline-flex items-center justify-center p-4 bg-white dark:bg-dark-800 rounded-full shadow-md mb-6"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <SparklesIcon className="h-10 w-10 text-primary-600 dark:text-primary-400" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400">FinGuard</h1>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              create a new account
            </Link>
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card shadow={true} className="px-8 py-10 bg-white dark:bg-dark-800 border-none rounded-xl">
            {error && (
              <motion.div 
                className="mb-4 bg-danger-50 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-400 px-4 py-3 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {error}
              </motion.div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <InputField
                id="email"
                label="Email Address"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                error={formErrors.email}
                icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
                className="focus-within:ring-2 focus-within:ring-primary-500 rounded-lg"
              />
              
              <InputField
                id="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                error={formErrors.password}
                icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
                className="focus-within:ring-2 focus-within:ring-primary-500 rounded-lg"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-dark-700 dark:bg-dark-800"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Remember me
                  </label>
                </div>
                
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                    Forgot your password?
                  </Link>
                </div>
              </div>
              
              <div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  loading={authLoading}
                  disabled={authLoading}
                  className="group relative bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-700 hover:to-violet-700"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <LockClosedIcon className="h-5 w-5 text-primary-300 group-hover:text-primary-200" />
                  </span>
                  Sign in
                </Button>
              </div>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-dark-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-dark-800 text-gray-500 dark:text-gray-400">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-dark-600 rounded-md shadow-sm bg-white dark:bg-dark-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-600"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                  </svg>
                  Google
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-dark-600 rounded-md shadow-sm bg-white dark:bg-dark-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-600"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/>
                  </svg>
                  Apple
                </motion.button>
              </div>
            </div>
          </Card>
        </motion.div>
        
        {/* Demo account info - remove in production */}
        <motion.div 
          className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400"
          variants={itemVariants}
        >
          <p>For demo: Email: demo@finguard.com / Password: demo123</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;