import React from 'react';
import { Link } from 'react-router-dom';
import NotificationItem from './NotificationItem';
import { useNotifications } from '../../hooks/useNotifications';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';

const NotificationList = () => {
  const { notifications, markAllAsRead, unreadCount } = useNotifications();
  
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };
  
  return (
    <div className="bg-white rounded-md shadow-lg overflow-hidden max-h-96">
      <div className="flex items-center justify-between px-4 py-3 bg-primary-50 border-b border-gray-200">
        <div className="flex items-center">
          <BellIcon className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-sm font-medium text-primary-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-800">
              {unreadCount} new
            </span>
          )}
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs font-medium text-primary-600 hover:text-primary-800 flex items-center"
          >
            <CheckIcon className="h-4 w-4 mr-1" />
            Mark all as read
          </button>
        )}
      </div>
      
      <div className="overflow-y-auto max-h-72">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <NotificationItem 
              key={notification.id} 
              notification={notification}
            />
          ))
        ) : (
          <div className="py-6 px-4 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
              <BellIcon className="h-6 w-6 text-gray-400" />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              No notifications to display.
            </p>
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center">
        <Link
          to="/notifications"
          className="text-sm font-medium text-primary-600 hover:text-primary-800"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationList;