import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, LockClosedIcon, DevicePhoneMobileIcon, FingerPrintIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const SecurityScreen = () => {
  const recentAlerts = [
    {
      id: 1,
      type: 'fraud',
      description: 'Suspicious transaction attempt blocked at electronics-store-1992.com',
      date: '2 days ago',
      status: 'resolved'
    },
    {
      id: 2,
      type: 'login',
      description: 'New login detected from San Francisco, CA',
      date: '4 days ago',
      status: 'approved'
    },
    {
      id: 3,
      type: 'phishing',
      description: 'Phishing website detected while shopping: fake-amazon-deals.com',
      date: '1 week ago',
      status: 'blocked'
    }
  ];

  const securityFeatures = [
    {
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      icon: <DevicePhoneMobileIcon className="h-6 w-6" />,
      status: 'Enabled',
      action: 'Configure'
    },
    {
      title: 'Biometric Login',
      description: 'Use your fingerprint or face to access the app',
      icon: <FingerPrintIcon className="h-6 w-6" />,
      status: 'Available',
      action: 'Enable'
    },
    {
      title: 'Transaction Notifications',
      description: 'Get instant alerts for all card transactions',
      icon: <BellIcon className="h-6 w-6" />,
      status: 'Enabled',
      action: 'Configure'
    },
    {
      title: 'Secure Browsing',
      description: 'Protection against phishing and fraud sites',
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      status: 'Active',
      action: 'View Stats'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto"
    >
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl text-white p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">Security Center</h1>
        <p className="text-indigo-100">
          Your account security status and recent security events
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <ShieldCheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Security Status</h2>
              <p className="text-green-600 dark:text-green-400 font-medium">Protected</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <LockClosedIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Last Login</h2>
              <p className="text-gray-600 dark:text-gray-400">Today at 09:45 AM</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Security Alerts</h2>
              <p className="text-gray-600 dark:text-gray-400">{recentAlerts.length} in the last 7 days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
            <h2 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">Security Features</h2>
            <div className="divide-y divide-gray-200 dark:divide-dark-700">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-gray-100 p-2 rounded-lg dark:bg-dark-700">
                      {feature.icon}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900 dark:text-white">{feature.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded-full mr-2 ${
                      feature.status === 'Enabled' || feature.status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-dark-700 dark:text-gray-300'
                    }`}>
                      {feature.status}
                    </span>
                    <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                      {feature.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
          <h2 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">Recent Security Alerts</h2>
          <div className="divide-y divide-gray-200 dark:divide-dark-700">
            {recentAlerts.map(alert => (
              <div key={alert.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 p-1.5 rounded-full mt-0.5 ${
                    alert.type === 'fraud' ? 'bg-red-100 dark:bg-red-900/30' :
                    alert.type === 'login' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    'bg-yellow-100 dark:bg-yellow-900/30'
                  }`}>
                    <ExclamationTriangleIcon className={`h-4 w-4 ${
                      alert.type === 'fraud' ? 'text-red-600 dark:text-red-400' :
                      alert.type === 'login' ? 'text-blue-600 dark:text-blue-400' :
                      'text-yellow-600 dark:text-yellow-400'
                    }`} />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{alert.description}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{alert.date}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        alert.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        alert.status === 'blocked' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700">
            <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
              View all security events →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Fix for BellIcon missing from imports
const BellIcon = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={1.5} 
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" 
    />
  </svg>
);

export default SecurityScreen;