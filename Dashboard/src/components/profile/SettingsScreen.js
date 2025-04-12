import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import Card from '../common/Card';
import Button from '../common/Button';
import InputField from '../common/InputField';
import { SunIcon, MoonIcon, ComputerDesktopIcon, LockClosedIcon, BellIcon, ShieldCheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const SettingsScreen = () => {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    securityAlerts: true,
    transactionAlerts: true,
    marketingEmails: false
  });
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Implement password change logic
    console.log('Password change submitted:', passwordData);
  };
  
  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    // Implement notification settings update
    console.log('Notification settings updated:', notificationSettings);
  };
  
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Settings</h1>
      
      {/* Appearance Settings */}
      <Card 
        title="Appearance" 
        subtitle="Customize how FinGuard looks for you"
        className="mb-6"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Theme</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-colors ${
                  theme === 'light' 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' 
                    : 'border-gray-200 hover:border-gray-300 dark:border-dark-700 dark:hover:border-dark-600'
                }`}
                onClick={() => theme !== 'light' && toggleTheme()}
              >
                <div className="bg-white dark:bg-gray-100 p-3 rounded-full mb-3">
                  <SunIcon className="h-6 w-6 text-yellow-500" />
                </div>
                <p className="font-medium text-gray-900 dark:text-white">Light</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                  Light mode for daytime
                </p>
              </div>
              
              <div 
                className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-colors ${
                  theme === 'dark' 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' 
                    : 'border-gray-200 hover:border-gray-300 dark:border-dark-700 dark:hover:border-dark-600'
                }`}
                onClick={() => theme !== 'dark' && toggleTheme()}
              >
                <div className="bg-dark-800 p-3 rounded-full mb-3">
                  <MoonIcon className="h-6 w-6 text-yellow-300" />
                </div>
                <p className="font-medium text-gray-900 dark:text-white">Dark</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                  Dark mode for nighttime
                </p>
              </div>
              
              <div className="border border-gray-200 dark:border-dark-700 rounded-lg p-4 flex flex-col items-center cursor-not-allowed opacity-60">
                <div className="bg-gradient-to-r from-white to-dark-800 p-3 rounded-full mb-3">
                  <ComputerDesktopIcon className="h-6 w-6 text-gray-500" />
                </div>
                <p className="font-medium text-gray-900 dark:text-white">Auto</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                  Follow system preference (Coming soon)
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Security Settings */}
      <Card 
        title="Security" 
        subtitle="Manage your password and security settings"
        className="mb-6"
      >
        <div className="space-y-6">
          <form onSubmit={handlePasswordSubmit}>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <LockClosedIcon className="h-5 w-5 mr-2 text-primary-500" />
              Change Password
            </h3>
            
            <div className="space-y-4">
              <InputField
                id="currentPassword"
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
              
              <InputField
                id="newPassword"
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                helpText="Password must be at least 8 characters long"
              />
              
              <InputField
                id="confirmPassword"
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
              
              <div className="flex justify-end">
                <Button type="submit" variant="primary">
                  Update Password
                </Button>
              </div>
            </div>
          </form>
          
          <hr className="border-gray-200 dark:border-dark-700" />
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2 text-primary-500" />
              Two-Factor Authentication
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Add an extra layer of security to your account by enabling two-factor authentication.
            </p>
            
            <Button variant="outline">
              Enable Two-Factor Authentication
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Notification Settings */}
      <Card 
        title="Notifications" 
        subtitle="Control how and when you receive notifications"
        className="mb-6"
      >
        <form onSubmit={handleNotificationSubmit}>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <BellIcon className="h-5 w-5 mr-2 text-primary-500" />
              Notification Preferences
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="emailNotifications" className="font-medium text-gray-700 dark:text-gray-200">
                    Email Notifications
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications via email
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    name="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-dark-600"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="pushNotifications" className="font-medium text-gray-700 dark:text-gray-200">
                    Push Notifications
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications on your device
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <input
                    type="checkbox"
                    id="pushNotifications"
                    name="pushNotifications"
                    checked={notificationSettings.pushNotifications}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-dark-600"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="securityAlerts" className="font-medium text-gray-700 dark:text-gray-200">
                    Security Alerts
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified about suspicious activity
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <input
                    type="checkbox"
                    id="securityAlerts"
                    name="securityAlerts"
                    checked={notificationSettings.securityAlerts}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-dark-600"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="transactionAlerts" className="font-medium text-gray-700 dark:text-gray-200">
                    Transaction Alerts
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive alerts for transactions and spending
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <input
                    type="checkbox"
                    id="transactionAlerts"
                    name="transactionAlerts"
                    checked={notificationSettings.transactionAlerts}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-dark-600"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="marketingEmails" className="font-medium text-gray-700 dark:text-gray-200">
                    Marketing Emails
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive promotional offers and updates
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <input
                    type="checkbox"
                    id="marketingEmails"
                    name="marketingEmails"
                    checked={notificationSettings.marketingEmails}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-dark-600"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button type="submit" variant="primary">
                Save Notification Settings
              </Button>
            </div>
          </div>
        </form>
      </Card>
      
      {/* Privacy Settings */}
      <Card 
        title="Privacy" 
        subtitle="Control your data and privacy settings"
        className="mb-6"
      >
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-primary-500" />
            Privacy Options
          </h3>
          
          <div className="flex justify-between">
            <div>
              <Button variant="outline">
                Download My Data
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Get a copy of all data associated with your account
              </p>
            </div>
            
            <Button variant="danger">
              Delete Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsScreen;