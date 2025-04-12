import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const RewardsHistoryScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    timeframe: 'all',
    category: 'all',
    status: 'all'
  });
  
  // Mock rewards history data
  const rewardsHistory = [
    {
      id: 'reward_101',
      title: '5% Cashback on Dining',
      description: 'Received cashback from dining purchases',
      value: '$25.50',
      date: '2025-03-15',
      category: 'cashback',
      status: 'credited',
      card: 'Capital One Savor'
    },
    {
      id: 'reward_102',
      title: 'Annual Travel Credit',
      description: 'Annual $300 travel credit used for hotel booking',
      value: '$300.00',
      date: '2025-02-22',
      category: 'travel',
      status: 'redeemed',
      card: 'Chase Sapphire Reserve'
    },
    {
      id: 'reward_103',
      title: 'Statement Credit',
      description: 'Statement credit for online shopping',
      value: '$15.00',
      date: '2025-02-10',
      category: 'credit',
      status: 'credited',
      card: 'American Express Blue Cash'
    },
    {
      id: 'reward_104',
      title: 'Welcome Bonus',
      description: '60,000 points welcome bonus after meeting spending requirement',
      value: '60,000 pts',
      date: '2025-01-15',
      category: 'points',
      status: 'earned',
      card: 'Chase Sapphire Preferred'
    },
    {
      id: 'reward_105',
      title: 'Amazon Prime Membership',
      description: 'Free Amazon Prime membership for 1 year',
      value: '$139.00',
      date: '2024-12-05',
      category: 'membership',
      status: 'pending',
      card: 'Amazon Prime Visa'
    },
    {
      id: 'reward_106',
      title: 'Airport Lounge Access',
      description: 'Priority Pass Select membership',
      value: 'Benefit',
      date: '2024-11-20',
      category: 'travel',
      status: 'active',
      card: 'American Express Platinum'
    }
  ];
  
  // Apply filters and search to rewards history
  const filteredRewards = rewardsHistory.filter(reward => {
    // Search term filter
    if (searchTerm && !reward.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !reward.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (filters.category !== 'all' && reward.category !== filters.category) {
      return false;
    }
    
    // Status filter
    if (filters.status !== 'all' && reward.status !== filters.status) {
      return false;
    }
    
    // Timeframe filter
    if (filters.timeframe !== 'all') {
      const rewardDate = new Date(reward.date);
      const now = new Date();
      
      if (filters.timeframe === 'month' && 
          (rewardDate.getMonth() !== now.getMonth() || 
           rewardDate.getFullYear() !== now.getFullYear())) {
        return false;
      }
      
      if (filters.timeframe === '3months') {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        if (rewardDate < threeMonthsAgo) {
          return false;
        }
      }
      
      if (filters.timeframe === 'year') {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        if (rewardDate < oneYearAgo) {
          return false;
        }
      }
    }
    
    return true;
  });
  
  // Group rewards by month/year
  const groupedRewards = filteredRewards.reduce((groups, reward) => {
    const date = new Date(reward.date);
    const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    
    groups[monthYear].push(reward);
    return groups;
  }, {});
  
  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Get status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case 'credited':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'redeemed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'earned':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'active':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-dark-700 dark:text-gray-300';
    }
  };
  
  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'cashback':
        return <CurrencyDollarIcon className="h-5 w-5 text-green-500" />;
      case 'travel':
        return <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>;
      case 'credit':
        return <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>;
      case 'points':
        return <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>;
      case 'membership':
        return <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>;
      default:
        return <CalendarIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link 
            to="/rewards"
            className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            <span>Back to Rewards</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rewards History</h1>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-dark-800 border border-gray-100 dark:border-dark-700 mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search rewards..."
                className="input-field w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            
            <button
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-dark-700 dark:border-dark-600 dark:text-gray-200 dark:hover:bg-dark-600"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <FunnelIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
              Filter
              <ChevronDownIcon className={`h-5 w-5 ml-1 text-gray-500 dark:text-gray-400 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {filterOpen && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 dark:bg-dark-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timeframe</label>
                  <select
                    className="input-field w-full"
                    value={filters.timeframe}
                    onChange={(e) => handleFilterChange('timeframe', e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="month">This Month</option>
                    <option value="3months">Last 3 Months</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    className="input-field w-full"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="cashback">Cashback</option>
                    <option value="travel">Travel</option>
                    <option value="credit">Statement Credit</option>
                    <option value="points">Points</option>
                    <option value="membership">Membership</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    className="input-field w-full"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="credited">Credited</option>
                    <option value="redeemed">Redeemed</option>
                    <option value="earned">Earned</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium dark:text-primary-400 dark:hover:text-primary-300"
                  onClick={() => setFilters({ timeframe: 'all', category: 'all', status: 'all' })}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
          
          {Object.keys(groupedRewards).length === 0 ? (
            <div className="text-center py-10">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No rewards found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {Object.entries(groupedRewards).map(([monthYear, rewards]) => (
                <motion.div key={monthYear} variants={itemVariants}>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">{monthYear}</h3>
                  <div className="space-y-4">
                    {rewards.map(reward => (
                      <motion.div 
                        key={reward.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-dark-700 dark:border-dark-600"
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-start">
                          <div className="bg-white p-2 rounded-lg shadow-sm dark:bg-dark-800">
                            {getCategoryIcon(reward.category)}
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex flex-col sm:flex-row sm:justify-between">
                              <div>
                                <div className="flex items-center">
                                  <h4 className="font-medium text-gray-900 dark:text-white">{reward.title}</h4>
                                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getStatusBadge(reward.status)}`}>
                                    {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{reward.description}</p>
                              </div>
                              <div className="mt-2 sm:mt-0 flex flex-col items-end">
                                <span className="font-bold text-primary-600 dark:text-primary-400">{reward.value}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(reward.date)}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-gray-600 dark:text-gray-300">{reward.card}</span>
                              <Link 
                                to={`/rewards/${reward.id}`}
                                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                              >
                                View details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RewardsHistoryScreen;