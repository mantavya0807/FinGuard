import React, { createContext, useState, useEffect } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Calculate unread count whenever notifications change
    const count = notifications.filter(notification => !notification.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Simulate fetching notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      // In a real app, this would be an API call
      const mockNotifications = [
        {
          id: '1',
          title: 'Spending Alert',
          message: 'You\'ve reached 80% of your dining budget this month.',
          type: 'warning',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false
        },
        {
          id: '2',
          title: 'New Reward',
          message: 'You\'ve earned $25 cashback on your Chase Sapphire card!',
          type: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false
        },
        {
          id: '3',
          title: 'Security Alert',
          message: 'Suspicious website detected while shopping. Transaction blocked.',
          type: 'danger',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true
        }
      ];
      
      setNotifications(mockNotifications);
    };
    
    fetchNotifications();
  }, []);

  const addNotification = (notification) => {
    setNotifications(prev => [
      {
        id: Date.now().toString(),
        timestamp: new Date(),
        read: false,
        ...notification
      },
      ...prev
    ]);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};