import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

// Context providers
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Common components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';

// Auth screens
import LoginScreen from './components/auth/LoginScreen';
import RegisterScreen from './components/auth/RegisterScreen';

// Custom hooks
import { useAuth } from './hooks/useAuth';

// Dashboard screens
import Dashboard from './components/dashboard/Dashboard'; // New Dashboard component
import CardManagement from './components/dashboard/CardManagement';
import CardDetailScreen from './components/dashboard/CardDetailScreen';
import AddCardScreen from './components/dashboard/AddCardScreen'; // New screen for adding cards manually

// Payment screens
import PaymentHistoryScreen from './components/payments/PaymentHistoryScreen';

// Plaid screens
import PlaidScreen from './components/plaid/PlaidScreen';

// Rewards screens
import RewardsScreen from './components/rewards/RewardsScreen';
import RewardDetailsScreen from './components/rewards/RewardDetailsScreen';
import RewardsHistoryScreen from './components/rewards/RewardsHistoryScreen';

// Profile screens
import ProfileScreen from './components/profile/ProfileScreen';
import SettingsScreen from './components/profile/SettingsScreen';

// Analytics screens
import AnalyticsScreen from './components/analytics/AnalyticsScreen';

// Security screens
import SecurityScreen from './components/security/SecurityScreen';

// Placeholder for any missing components
const PlaceholderScreen = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{title || "Coming Soon"}</h1>
    <p className="text-gray-600 dark:text-gray-400 max-w-md text-center">
      This feature is currently under development and will be available soon.
    </p>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-dark-900">
        <LoadingSpinner size="h-12 w-12" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const AppLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

function App() {
  // Apply theme class to html element
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.add(theme);
    
    return () => {
      document.documentElement.classList.remove('light', 'dark');
    };
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#333',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '12px 16px',
                },
                success: {
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <Routes>
              {/* Auth routes */}
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Cards routes */}
              <Route path="/cards" element={
                <ProtectedRoute>
                  <AppLayout>
                    <CardManagement />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/cards/add" element={
                <ProtectedRoute>
                  <AppLayout>
                    <AddCardScreen />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/cards/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <CardDetailScreen />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Payment routes */}
              <Route path="/payments/history" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PaymentHistoryScreen />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Accounts/Plaid routes */}
              <Route path="/accounts" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PlaidScreen />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Security routes */}
              <Route path="/security" element={
                <ProtectedRoute>
                  <AppLayout>
                    <SecurityScreen />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Analytics routes */}
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <AppLayout>
                    <AnalyticsScreen />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Rewards routes */}
              <Route path="/rewards" element={
                <ProtectedRoute>
                  <AppLayout>
                    <RewardsScreen />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/rewards/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <RewardDetailsScreen />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/rewards/history" element={
                <ProtectedRoute>
                  <AppLayout>
                    <RewardsHistoryScreen />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Taxes route */}
              <Route path="/taxes" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PlaceholderScreen title="Tax Management" />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Profile routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProfileScreen />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <AppLayout>
                    <SettingsScreen />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;