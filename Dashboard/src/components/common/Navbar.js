import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useTheme } from '../../contexts/ThemeContext';
import NotificationList from './NotificationList';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

// Updated icon imports
import { 
  BellIcon, 
  UserCircleIcon, 
  Cog6ToothIcon, 
  ArrowRightEndOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const { theme } = useTheme();
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  
  // Track scroll for adding shadow effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Search for:', searchQuery);
  };
  
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isProfileDropdownOpen) setIsProfileDropdownOpen(false);
  };
  
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <motion.nav 
      className={`bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 transition-all duration-200 sticky top-0 z-30 ${
        scrolled ? 'shadow-md' : ''
      }`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <motion.span 
                className="text-primary-600 font-display text-2xl font-bold dark:text-primary-400 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <SparklesIcon className="h-6 w-6 mr-2" />
                FinGuard
              </motion.span>
            </Link>
            
            {/* Desktop Search Bar */}
            <div className="hidden md:ml-6 md:flex md:items-center">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search transactions, cards..."
                  className="input-field w-64 pl-10 bg-gray-50 dark:bg-dark-700 border-gray-200 dark:border-dark-600 focus:border-primary-400 focus:ring-primary-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </form>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Notifications */}
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleNotifications}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-300 dark:hover:bg-dark-700 dark:hover:text-primary-400 dark:focus:ring-primary-600"
              >
                <span className="sr-only">Notifications</span>
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <motion.span 
                    className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-danger-500 text-white text-xs font-bold flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.button>
              
              {/* Notification Dropdown */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-dark-800 ring-1 ring-black ring-opacity-5 dark:ring-dark-700 z-50"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <NotificationList />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Profile */}
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleProfileDropdown}
                className="flex items-center space-x-2 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-300 dark:hover:bg-dark-700 dark:hover:text-primary-400 dark:focus:ring-primary-600"
              >
                <span className="sr-only">User menu</span>
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.firstName} 
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-primary-200 dark:ring-primary-800"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-400 to-violet-500 text-white flex items-center justify-center">
                    {user?.firstName?.charAt(0) || <UserCircleIcon className="h-6 w-6" />}
                  </div>
                )}
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {user?.firstName || 'User'}
                </span>
              </motion.button>
              
              {/* Profile Dropdown */}
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div 
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-dark-800 ring-1 ring-black ring-opacity-5 dark:ring-dark-700 z-50"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="py-1">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-200 dark:hover:bg-dark-700 dark:hover:text-primary-400"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <div className="flex items-center">
                          <UserCircleIcon className="h-5 w-5 mr-2" />
                          <span>Your Profile</span>
                        </div>
                      </Link>
                      <Link 
                        to="/settings" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-200 dark:hover:bg-dark-700 dark:hover:text-primary-400"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <div className="flex items-center">
                          <Cog6ToothIcon className="h-5 w-5 mr-2" />
                          <span>Settings</span>
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-200 dark:hover:bg-dark-700 dark:hover:text-primary-400"
                      >
                        <div className="flex items-center">
                          <ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-2" />
                          <span>Sign out</span>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <ThemeToggle className="mr-2" />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-300 dark:hover:bg-dark-700 dark:hover:text-primary-400 dark:focus:ring-primary-600"
            >
              <span className="sr-only">Open menu</span>
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search..."
                  className="input-field w-full pl-10 bg-gray-50 dark:bg-dark-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </form>
              
              {/* Mobile Navigation Links */}
              <Link 
                to="/profile" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-200 dark:hover:bg-dark-700 dark:hover:text-primary-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <UserCircleIcon className="h-5 w-5 mr-2" />
                  <span>Your Profile</span>
                </div>
              </Link>
              <Link 
                to="/settings" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-200 dark:hover:bg-dark-700 dark:hover:text-primary-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Cog6ToothIcon className="h-5 w-5 mr-2" />
                  <span>Settings</span>
                </div>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-200 dark:hover:bg-dark-700 dark:hover:text-primary-400"
              >
                <div className="flex items-center">
                  <ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-2" />
                  <span>Sign out</span>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;