import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  
  const springTransition = {
    type: 'spring',
    stiffness: 500,
    damping: 30
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative p-2 rounded-full focus:outline-none transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-dark-700 text-yellow-300 hover:bg-dark-600'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div 
        initial={false}
        animate={{
          rotate: theme === 'dark' ? 360 : 0
        }}
        transition={springTransition}
      >
        {theme === 'dark' ? (
          <SunIcon className="h-5 w-5" />
        ) : (
          <MoonIcon className="h-5 w-5" />
        )}
      </motion.div>

      {/* Decorative elements */}
      {theme === 'dark' && (
        <>
          <motion.span
            className="absolute h-1 w-1 rounded-full bg-yellow-300 opacity-70"
            animate={{
              x: [0, 10, 0],
              y: [0, -10, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              delay: 0.2
            }}
            style={{ top: '15%', right: '25%' }}
          />
          <motion.span
            className="absolute h-1 w-1 rounded-full bg-yellow-300 opacity-70"
            animate={{
              x: [0, -8, 0],
              y: [0, 8, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              delay: 0.5
            }}
            style={{ bottom: '20%', left: '25%' }}
          />
        </>
      )}
    </motion.button>
  );
};

export default ThemeToggle;