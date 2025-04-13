import React from 'react';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import format from 'date-fns/format';
import { 
  ExclamationCircleIcon, 
  CheckCircleIcon, 
  InformationCircleIcon,
  BellIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationItem = ({ notification }) => {
  const { markAsRead, removeNotification } = useNotifications();
  
  const getIcon = () => {
    switch (notification.type) {
      case 'warning':
        return <ExclamationCircleIcon className="h-6 w-6 text-warning-500" />;
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-success-500" />;
      case 'danger':
        return <ExclamationCircleIcon className="h-6 w-6 text-danger-500" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-primary-500" />;
    }
  };
  
  const getTimeLabel = () => {
    try {
      return formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown time';
    }
  };
  
  const getBgColor = () => {
    if (!notification.read) {
      return 'bg-gray-50';
    }
    return 'bg-white';
  };
  
  const handleMarkAsRead = (e) => {
    e.stopPropagation();
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };
  
  const handleRemove = (e) => {
    e.stopPropagation();
    removeNotification(notification.id);
  };
  
  return (
    <div 
      className={`${getBgColor()} px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors duration-150`}
      onClick={handleMarkAsRead}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
              {notification.title}
            </p>
            <button 
              onClick={handleRemove}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mt-1">
            {notification.message}
          </p>
          
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-gray-500 flex items-center">
              <BellIcon className="h-3 w-3 mr-1" />
              {getTimeLabel()}
            </p>
            
            {!notification.read && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                New
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;