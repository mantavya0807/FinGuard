import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Updated Heroicons imports
import { 
  HomeIcon, 
  CreditCardIcon, 
  ShieldCheckIcon, 
  ChartPieIcon, 
  GiftIcon, 
  BanknotesIcon,
  ReceiptPercentIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Collapse sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };
    
    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: HomeIcon
    },
    {
      name: 'My Cards',
      path: '/cards',
      icon: CreditCardIcon
    },
    {
      name: 'Payments',
      path: '/payments/history',
      icon: BanknotesIcon
    },
    {
      name: 'Security',
      path: '/security',
      icon: ShieldCheckIcon
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: ChartPieIcon
    },
    {
      name: 'Rewards',
      path: '/rewards',
      icon: GiftIcon
    },
  ];
  
  return (
    <motion.div 
      className={`flex flex-col h-full bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 transition-all duration-300 dark:from-dark-900 dark:to-dark-800 dark:border-dark-700 relative`}
      initial={false}
      animate={{ width: isExpanded ? '240px' : '80px' }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-700">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/" className="text-xl font-semibold text-primary-600 dark:text-primary-400 flex items-center">
                <SparklesIcon className="h-6 w-6 mr-2" />
                FinGuard
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-400 dark:hover:bg-dark-700 dark:hover:text-primary-400"
        >
          {isExpanded ? (
            <ChevronLeftIcon className="h-5 w-5" />
          ) : (
            <ChevronRightIcon className="h-5 w-5" />
          )}
        </motion.button>
      </div>
      
      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <motion.li key={item.path} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to={item.path}
                className={`flex items-center py-2 px-3 rounded-lg transition-colors duration-200 ${
                  isActive(item.path) 
                    ? 'bg-primary-50 text-primary-700 font-medium dark:bg-primary-900/30 dark:text-primary-400' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-dark-700 dark:hover:text-primary-400'
                }`}
              >
                <item.icon className="h-6 w-6 flex-shrink-0" />
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-3 whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>
      
      {/* Sidebar Footer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="p-4 border-t border-gray-200 dark:border-dark-700"
          >
        
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Sidebar;