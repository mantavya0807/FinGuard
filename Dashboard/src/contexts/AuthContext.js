import React, { createContext, useState, useEffect, useCallback } from 'react';
import { login, register, logout, getCurrentUser } from '../services/api/authApi';
import supabase from '../services/supabaseClient';
import { toast } from 'react-hot-toast';

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

  // Update the checkLoggedIn function with better error handling:
  const checkLoggedIn = useCallback(async () => {
    try {
      console.log('Checking if user is logged in...');
      // Get session from Supabase with a timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Session check timeout")), 5000)
      );
      
      const { data, error } = await Promise.race([sessionPromise, timeoutPromise]);
      
      if (error) {
        console.error('Session retrieval error:', error);
        setUser(null); // Ensure user is null
        setLoading(false);
        setAuthChecked(true);
        return;
      }
      
      if (data?.session) {
        console.log('Session found, fetching user data...');
        try {
          // Attempt to get user data with 5s timeout
          const userPromise = getCurrentUser();
          const userTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("User data fetch timeout")), 5000)
          );
          
          const userData = await Promise.race([userPromise, userTimeoutPromise]);
          console.log('User data retrieved successfully:', userData.email);
          setUser(userData);
        } catch (userError) {
          console.error('Failed to get user data:', userError);
          // If getCurrentUser fails but we have a session,
          // attempt minimal user data extraction from session
          try {
            const { user } = data.session;
            if (user) {
              console.log('Using minimal user data from session');
              setUser({
                id: user.id,
                email: user.email,
                emailVerified: user.email_confirmed_at != null,
                // Minimal data
              });
            } else {
              // Something is wrong with the session, clear it
              console.log('Invalid session, signing out');
              await supabase.auth.signOut();
              setUser(null);
            }
          } catch (extractError) {
            console.error('Could not extract user from session:', extractError);
            // Clear invalid auth state
            await supabase.auth.signOut().catch(e => console.error('Error during sign out:', e));
            setUser(null);
          }
        }
      } else {
        console.log('No active session found');
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
    } finally {
      // Always set these regardless of outcome
      setLoading(false);
      setAuthChecked(true);
    }
  }, []);
  
  // IMPORTANT: Actually call the checkLoggedIn function
  useEffect(() => {
    console.log("Running initial auth check");
    checkLoggedIn();

    // Add a safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Auth check timed out after 10 seconds');
        setLoading(false);
        setAuthChecked(true);
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [checkLoggedIn]);
  
  // Also update your auth state listener to handle duplicate events:
  useEffect(() => {
    if (!authChecked) return;
    
    console.log("Setting up auth state listener");
    let lastEvent = null;
    let lastTimestamp = 0;
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Debounce rapidly firing duplicate events
        const now = Date.now();
        if (lastEvent === event && now - lastTimestamp < 1000) {
          console.log(`Ignoring duplicate ${event} event`);
          return;
        }
        
        lastEvent = event;
        lastTimestamp = now;
        
        console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
        
        if (event === 'SIGNED_IN' && session) {
          try {
            // Use timeout on getCurrentUser
            const userPromise = getCurrentUser();
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error("User data fetch timeout")), 5000)
            );
            
            const userData = await Promise.race([userPromise, timeoutPromise]);
            console.log('User data after sign in:', userData.email);
            setUser(userData);
            setAuthLoading(false);
            toast.success('Signed in successfully!');
          } catch (err) {
            console.error('Failed to get user data after sign in:', err);
            // Try to extract minimal user data from session
            if (session?.user) {
              setUser({
                id: session.user.id,
                email: session.user.email,
                emailVerified: session.user.email_confirmed_at != null,
              });
              setAuthLoading(false);
            } else {
              setUser(null);
              setAuthLoading(false);
              toast.error('Failed to get user data');
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing user state');
          setUser(null);
          setAuthLoading(false);
          toast.success('Signed out successfully');
        } else if (event === 'INITIAL_SESSION' && session && !user) {
          // Handle initial session without triggering duplicate work
          console.log('Initial session with no user set, setting up user');
          try {
            const userData = await getCurrentUser();
            console.log('User data from initial session:', userData.email);
            setUser(userData);
          } catch (err) {
            console.error('Failed to get user data from initial session:', err);
            if (session?.user) {
              setUser({
                id: session.user.id,
                email: session.user.email,
              });
            }
          }
        }
      }
    );
    
    // Cleanup function
    return () => {
      if (authListener?.subscription) {
        console.log("Cleaning up auth listener");
        authListener.subscription.unsubscribe();
      }
    };
  }, [authChecked, user]);
  
  // Login function
  const loginUser = async (email, password) => {
    setAuthLoading(true);
    setError(null);
    
    try {
      console.log(`Attempting to log in user: ${email}`);
      const result = await login(email, password);
      console.log('Login API call successful');
      
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
        // Simplify the loading state logic
        loading: loading,
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