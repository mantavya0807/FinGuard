import api from './index';
import supabase from '../supabaseClient';

// Login user with Supabase
export const login = async (email, password) => {
  console.log("Login API call started");
  try {
    // Use Supabase authentication
    console.log("Calling supabase.auth.signInWithPassword");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    console.log("Supabase auth result:", error ? "Error" : "Success");

    if (error) {
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }

    console.log("Login successful, getting profile data");
    // Get user profile data from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
    }

    console.log("Returning user data");
    // Format user data
    const userData = {
      id: data.user.id,
      email: data.user.email,
      firstName: profileData?.first_name || 'User',
      lastName: profileData?.last_name || '',
      accountCreated: data.user.created_at,
      profileImage: profileData?.profile_image || null
    };

    return {
      token: data.session.access_token,
      user: userData
    };
  } catch (error) {
    console.error('Login API error:', error);
    throw error;
  }
};

// Register new user with Supabase
export const register = async (userData) => {
  try {
    // Validate required fields
    const requiredFields = ['email', 'password', 'firstName', 'lastName'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Use Supabase to sign up
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName
        }
      }
    });

    if (error) {
      throw new Error(error.message || 'Registration failed. Please try again.');
    }

    // Create an entry in the profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
          created_at: new Date().toISOString()
        }
      ]);

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Continue anyway - the auth trigger in Supabase should handle this
    }

    // Format response
    return {
      token: data.session?.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        accountCreated: data.user.created_at,
        profileImage: null
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Logout user with Supabase
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message || 'Logout failed');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Get current user from Supabase
export const getCurrentUser = async () => {
  try {
    // Get current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new Error(sessionError.message);
    }
    
    if (!sessionData.session) {
      throw new Error('No active session found');
    }
    
    // Get user data
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      throw new Error(userError.message);
    }
    
    // Get profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
    }
    
    return {
      id: userData.user.id,
      email: userData.user.email,
      firstName: profileData?.first_name || 'User',
      lastName: profileData?.last_name || '',
      accountCreated: userData.user.created_at,
      profileImage: profileData?.profile_image || null
    };
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

// Update user profile in Supabase
export const updateProfile = async (userData) => {
  try {
    // Get user ID from session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new Error(sessionError.message);
    }
    
    if (!sessionData.session) {
      throw new Error('No active session found');
    }
    
    const userId = sessionData.session.user.id;
    
    // Update profile in database
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (updateError) {
      throw new Error(updateError.message || 'Failed to update profile');
    }
    
    // Update user metadata in auth
    const { error: authUpdateError } = await supabase.auth.updateUser({
      data: {
        first_name: userData.firstName,
        last_name: userData.lastName
      }
    });
    
    if (authUpdateError) {
      console.error('Error updating auth metadata:', authUpdateError);
    }
    
    return {
      ...userData,
      id: userId,
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

// Change password via Supabase
export const changePassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      throw new Error(error.message || 'Failed to change password');
    }
    
    return { success: true, message: 'Password changed successfully' };
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};