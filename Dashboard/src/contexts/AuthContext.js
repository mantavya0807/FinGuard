import React, { createContext, useState, useEffect, useCallback } from 'react';
import { login, register, logout, getCurrentUser } from '../services/api/authApi';
import supabase from '../services/supabaseClient';
import { toast } from 'react-hot-toast'; // Import toast for notifications

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Check if user is logged in with Supabase
  const checkLoggedIn = useCallback(async () => {
    try {
      // Get session from Supabase
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session retrieval error:', error);
        setLoading(false);
        setAuthChecked(true);
        return;
      }
      
      if (data?.session) {
        // Valid session exists, fetch user data
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (userError) {
          console.error('Failed to get user data:', userError);
          // Clear invalid auth state
          await supabase.auth.signOut();
        }
      }
      
      setLoading(false);
      setAuthChecked(true);
    } catch (err) {
      console.error('Auth check failed:', err);
      setLoading(false);
      setAuthChecked(true);
    }
  }, []);
  
  // IMPORTANT: Actually call the checkLoggedIn function
  useEffect(() => {
    console.log("Running initial auth check");
    checkLoggedIn();
  }, [checkLoggedIn]);
  
  // Set up auth state change listener
  useEffect(() => {
    console.log("Setting up auth state listener");
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
        
        if (event === 'SIGNED_IN' && session) {
          try {
            const userData = await getCurrentUser();
            console.log('User data after sign in:', userData);
            setUser(userData);
            setLoading(false);
            setAuthLoading(false);
            toast.success('Signed in successfully!');
          } catch (err) {
            console.error('Failed to get user data after sign in:', err);
            setLoading(false);
            setAuthLoading(false);
            toast.error('Failed to get user data');
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
          setAuthLoading(false);
          toast.success('Signed out successfully');
        }
      }
    );
    
    // Cleanup function to remove the listener
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);
  
  // Login function
  const loginUser = async (email, password) => {
    setAuthLoading(true);
    setError(null);
    
    try {
      const result = await login(email, password);
      
      // If we reach here, login was successful but we'll let the auth listener
      // handle the user state update
      
      return result;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
      setAuthLoading(false);
      toast.error(err.message || 'Login failed');
      throw err;
    }
  };
  
  // Register function
  const registerUser = async (userData) => {
    setAuthLoading(true);
    setError(null);
    
    try {
      const result = await register(userData);
      
      // Registration successful, but we'll let the auth listener
      // handle the user state update
      toast.success('Account created successfully!');
      
      return result;
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed');
      setAuthLoading(false);
      toast.error(err.message || 'Registration failed');
      throw err;
    }
  };
  
  // Logout function
  const logoutUser = async () => {
    setAuthLoading(true);
    
    try {
      await logout();
      // We'll let the auth listener handle the state update
    } catch (err) {
      console.error('Logout failed:', err);
      setError(err.message || 'Logout failed');
      setAuthLoading(false);
      toast.error('Failed to log out');
    }
  };
  
  // Update user function
  const updateUser = (userData) => {
    setUser(prev => ({...prev, ...userData}));
    // Add API call to update user data on the server if needed
  };

  // Reset any auth errors
  const resetAuthState = () => {
    setError(null);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading: loading || (authLoading && !authChecked),
        authLoading,
        error,
        login: loginUser,
        register: registerUser,
        logout: logoutUser,
        updateUser,
        resetAuthState,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;