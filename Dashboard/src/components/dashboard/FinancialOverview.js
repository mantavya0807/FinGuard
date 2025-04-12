import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  LineElement, 
  BarElement, 
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { 
  ArrowSmallUpIcon,  // Changed from ArrowSmUpIcon
  ArrowSmallDownIcon, // Changed from ArrowSmDownIcon
  BanknotesIcon,
  ShoppingBagIcon,
  HomeIcon,
  TruckIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BoltIcon,          // Changed from LightningBoltIcon
  GlobeAltIcon       // Changed from GlobeIcon
} from '@heroicons/react/24/solid';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  LineElement, 
  BarElement, 
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

const FinancialOverview = () => {
  const [timeRange, setTimeRange] = useState('month');
  
  // Spending trend data
  const spendingData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Expenses',
        data: [1800, 2200, 1950, 2400, 2100, 2300],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Income',
        data: [3200, 3200, 3400, 3400, 3600, 3600],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };
  
  // Category spending data
  const categoryData = {
    labels: [
      'Grocery',
      'Dining',
      'Shopping',
      'Travel',
      'Housing',
      'Transport',
      'Entertainment',
      'Utilities'
    ],
    datasets: [
      {
        data: [420, 350, 290, 180, 950, 240, 160, 210],
        backgroundColor: [
          '#10B981', // Grocery - green
          '#EF4444', // Dining - red
          '#F59E0B', // Shopping - amber
          '#6366F1', // Travel - indigo
          '#3B82F6', // Housing - blue
          '#8B5CF6', // Transport - purple
          '#EC4899', // Entertainment - pink
          '#6B7280'  // Utilities - gray
        ],
        borderWidth: 0
      }
    ]
  };
  
  // Rewards earned data
  const rewardsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Cashback',
        data: [25, 32, 28, 36, 40, 45],
        backgroundColor: '#3B82F6',
      },
      {
        label: 'Points',
        data: [18, 24, 22, 28, 30, 35],
        backgroundColor: '#8B5CF6',
      }
    ]
  };
  
  // Financial stats
  const stats = [
    {
      name: 'Monthly Income',
      value: '$3,600.00',
      change: '+5.25%',
      trend: 'up'
    },
    {
      name: 'Monthly Expenses',
      value: '$2,300.00',
      change: '+2.4%',
      trend: 'up'
    },
    {
      name: 'Savings Rate',
      value: '36.1%',
      change: '+1.5%',
      trend: 'up'
    },
    {
      name: 'Total Rewards',
      value: '$45.75',
      change: '+12.3%',
      trend: 'up'
    }
  ];
  
  // Budget progress
  const budgets = [
    {
      category: 'Dining',
      icon: <BanknotesIcon className="h-5 w-5 text-red-500" />,
      spent: 350,
      limit: 400,
      percentage: 87.5
    },
    {
      category: 'Groceries',
      icon: <ShoppingBagIcon className="h-5 w-5 text-green-500" />,
      spent: 420,
      limit: 500,
      percentage: 84
    },
    {
      category: 'Housing',
      icon: <HomeIcon className="h-5 w-5 text-blue-500" />,
      spent: 950,
      limit: 1000,
      percentage: 95
    },
    {
      category: 'Transport',
      icon: <TruckIcon className="h-5 w-5 text-purple-500" />,
      spent: 240,
      limit: 300,
      percentage: 80
    },
    {
      category: 'Entertainment',
      icon: <UserGroupIcon className="h-5 w-5 text-pink-500" />,
      spent: 160,
      limit: 200,
      percentage: 80
    },
    {
      category: 'Education',
      icon: <AcademicCapIcon className="h-5 w-5 text-yellow-500" />,
      spent: 75,
      limit: 100,
      percentage: 75
    },
    {
      category: 'Utilities',
      icon: <BoltIcon className="h-5 w-5 text-gray-500" />,
      spent: 210,
      limit: 250,
      percentage: 84
    },
    {
      category: 'Travel',
      icon: <GlobeAltIcon className="h-5 w-5 text-indigo-500" />,
      spent: 180,
      limit: 300,
      percentage: 60
    }
  ];
  
  // Chart options
  const spendingOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value}`
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };
  
  const categoryOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: $${context.raw}`;
          }
        }
      }
    }
  };
  
  const rewardsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value}`
        }
      }
    }
  };
  
  // Render time range selector
  const renderTimeRangeSelector = () => {
    const ranges = [
      { id: 'month', label: 'Month' },
      { id: 'quarter', label: 'Quarter' },
      { id: 'year', label: 'Year' },
      { id: 'all', label: 'All Time' }
    ];
    
    return (
      <div className="flex space-x-2 mb-6">
        {ranges.map(range => (
          <Button
            key={range.id}
            variant={timeRange === range.id ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range.id)}
          >
            {range.label}
          </Button>
        ))}
      </div>
    );
  };
  
  // Render stats cards
  const renderStats = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <p className="stat-title">{stat.name}</p>
            <p className="stat-value">{stat.value}</p>
            <p className="stat-description flex items-center">
              {stat.trend === 'up' ? (
                <ArrowSmallUpIcon className="h-4 w-4 text-success-500 mr-1" />
              ) : (
                <ArrowSmallDownIcon className="h-4 w-4 text-danger-500 mr-1" />
              )}
              <span className={`${
                stat.trend === 'up' ? 'text-success-600' : 'text-danger-600'
              }`}>
                {stat.change} from last {timeRange}
              </span>
            </p>
          </div>
        ))}
      </div>
    );
  };
  
  // Render charts
  const renderCharts = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Income vs Expenses" className="h-80">
          <Line data={spendingData} options={spendingOptions} />
        </Card>
        
        <Card title="Spending by Category" className="h-80">
          <div className="flex justify-center h-full">
            <Doughnut data={categoryData} options={categoryOptions} />
          </div>
        </Card>
      </div>
    );
  };
  
  // Render rewards chart
  const renderRewardsChart = () => {
    return (
      <Card title="Rewards Earned" className="mb-6 h-80">
        <Bar data={rewardsData} options={rewardsOptions} />
      </Card>
    );
  };
  
  // Render budget progress
  const renderBudgetProgress = () => {
    return (
      <Card title="Budget Progress" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget, index) => (
            <div key={index} className="flex items-center p-3 border border-gray-100 rounded-lg">
              <div className="mr-4">
                {budget.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <p className="text-sm font-medium text-gray-700">{budget.category}</p>
                  <p className="text-sm text-gray-500">
                    ${budget.spent} / ${budget.limit}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      budget.percentage >= 90 ? 'bg-danger-500' :
                      budget.percentage >= 75 ? 'bg-warning-500' :
                      'bg-success-500'
                    }`}
                    style={{ width: `${budget.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };
  
  return (
    <div className="p-6">
      {renderTimeRangeSelector()}
      {renderStats()}
      {renderCharts()}
      {renderRewardsChart()}
      {renderBudgetProgress()}
    </div>
  );
};

export default FinancialOverview;