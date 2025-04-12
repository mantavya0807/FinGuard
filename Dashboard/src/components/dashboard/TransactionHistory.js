import React, { useState, useEffect } from 'react';
import { useCards } from '../../hooks/useCards';
import { getCardTransactions } from '../../services/api/cardsApi';
import { format } from 'date-fns';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowSmallDownIcon,
  ArrowSmallUpIcon,
  ShoppingBagIcon,
  GlobeAmericasIcon,
  HomeIcon,
  CreditCardIcon,
  TruckIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Card from '../common/Card';
import InputField from '../common/InputField';
// Assuming you have a LoadingSpinner component
import LoadingSpinner from '../common/LoadingSpinner'; 

const TransactionHistory = () => {
  const { cards } = useCards();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    dateRange: 'month',
    category: '',
    cardId: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });

  // Fetch transactions effect (assuming this exists or needs to be added)
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Combine transactions from all cards or filter by selected cardId
        let allTransactions = [];
        const cardIdsToFetch = filters.cardId ? [filters.cardId] : cards.map(c => c.id);
        
        for (const cardId of cardIdsToFetch) {
          const cardTransactions = await getCardTransactions(cardId, filters); // Pass filters if API supports it
          allTransactions = [...allTransactions, ...cardTransactions];
        }
        
        // Apply client-side filtering if API doesn't support all filters
        let filteredTransactions = allTransactions;
        if (filters.search) {
          filteredTransactions = filteredTransactions.filter(t => 
            t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
            t.category.toLowerCase().includes(filters.search.toLowerCase())
          );
        }
        if (filters.category) {
          filteredTransactions = filteredTransactions.filter(t => t.category === filters.category);
        }
        // Add date range filtering if needed (API might handle this)

        setTransactions(filteredTransactions);
      } catch (err) {
        setError('Failed to fetch transactions.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (cards.length > 0 || filters.cardId) {
      fetchTransactions();
    } else if (!cards.length) {
        setLoading(false); // No cards, no transactions to fetch
        setTransactions([]);
    }
  }, [cards, filters]); // Re-fetch when cards or filters change

  // Sorting logic
  const sortedTransactions = React.useMemo(() => {
    let sortableItems = [...transactions];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [transactions, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return null; // Or a default neutral icon
    }
    return sortConfig.direction === 'ascending' ? <ArrowSmallUpIcon className="h-4 w-4 inline ml-1" /> : <ArrowSmallDownIcon className="h-4 w-4 inline ml-1" />;
  };


  // Category Icons Map
  const categoryIcons = {
    'Groceries': <ShoppingBagIcon className="h-5 w-5 text-green-500" />,
    'Travel': <GlobeAmericasIcon className="h-5 w-5 text-blue-500" />,
    'Housing': <HomeIcon className="h-5 w-5 text-yellow-500" />,
    'Utilities': <BuildingOfficeIcon className="h-5 w-5 text-pink-500" />,
    'Entertainment': <ComputerDesktopIcon className="h-5 w-5 text-purple-500" />,
    'Transportation': <TruckIcon className="h-5 w-5 text-orange-500" />,
    'Personal Care': <UserGroupIcon className="h-5 w-5 text-indigo-500" />,
    'Card Payment': <CreditCardIcon className="h-5 w-5 text-gray-500" />,
    'Other': <CreditCardIcon className="h-5 w-5 text-gray-400" /> // Default icon
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const renderFilters = () => (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
          <InputField
            id="search"
            name="search"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={handleFilterChange}
            icon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
            className="pl-10"
          />
        </div>
        <Button 
          variant="secondary" 
          onClick={() => setShowFilters(!showFilters)}
          icon={<FunnelIcon className="h-5 w-5" />}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border border-gray-200 dark:border-dark-700 rounded-lg bg-gray-50 dark:bg-dark-800">
          <div>
            <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
            <select 
              id="dateRange" 
              name="dateRange" 
              value={filters.dateRange} 
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select 
              id="category" 
              name="category" 
              value={filters.category} 
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            >
              <option value="">All Categories</option>
              {Object.keys(categoryIcons).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="cardId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card</label>
            <select 
              id="cardId" 
              name="cardId" 
              value={filters.cardId} 
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            >
              <option value="">All Cards</option>
              {cards.map(card => (
                <option key={card.id} value={card.id}>
                  {card.cardName} (...{card.last4})
                </option>
              ))}
            </select>
          </div>
          {/* Add more filters if needed */}
        </div>
      )}
    </div>
  );

  const renderSummary = () => {
      const totalSpent = sortedTransactions.reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0);
      const totalReceived = sortedTransactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0);
      
      return (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent ({filters.dateRange})</p>
                  <p className="text-xl font-semibold text-danger-600 dark:text-danger-400">${totalSpent.toFixed(2)}</p>
              </Card>
              <Card>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Received ({filters.dateRange})</p>
                  <p className="text-xl font-semibold text-success-600 dark:text-success-400">${totalReceived.toFixed(2)}</p>
              </Card>
              <Card>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Net Flow ({filters.dateRange})</p>
                  <p className={`text-xl font-semibold ${totalReceived - totalSpent >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                      ${(totalReceived - totalSpent).toFixed(2)}
                  </p>
              </Card>
          </div>
      );
  };

  const renderTransactions = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-10">
          <LoadingSpinner /> 
          <p className="ml-3 text-gray-500 dark:text-gray-400">Loading transactions...</p>
        </div>
      );
    }

    if (error) {
        return <p className="text-center text-danger-600 dark:text-danger-400 p-4">{error}</p>;
    }

    if (!sortedTransactions || sortedTransactions.length === 0) {
      return <p className="text-center text-gray-500 dark:text-gray-400 p-10">No transactions found matching your filters.</p>;
    }

    // Render the actual list/table of transactions
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
          <thead className="bg-gray-50 dark:bg-dark-800">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('date')}
              >
                Date {getSortIcon('date')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Description
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('category')}
              >
                Category {getSortIcon('category')}
              </th>
               <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Card
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('amount')}
              >
                Amount {getSortIcon('amount')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-900 divide-y divide-gray-200 dark:divide-dark-700">
            {sortedTransactions.map((transaction) => {
              const cardInfo = cards.find(c => c.id === transaction.cardId);
              return (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-dark-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      {categoryIcons[transaction.category] || categoryIcons['Other']}
                      <span className="ml-2">{transaction.category}</span>
                    </span>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {cardInfo ? `${cardInfo.cardName} (...${cardInfo.last4})` : 'N/A'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${transaction.amount < 0 ? 'text-danger-600 dark:text-danger-400' : 'text-success-600 dark:text-success-400'}`}>
                    {transaction.amount < 0 ? '-' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">Transaction History</h2>
         {/* Optional: Add a button or link here if needed */}
      </div>
      
      {renderFilters()}
      
      {!loading && !error && transactions.length > 0 && renderSummary()}
      
      <Card>
        {renderTransactions()}
      </Card>
    </div>
  );
};

export default TransactionHistory;