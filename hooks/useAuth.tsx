import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { z } from 'zod';
import { supabase } from '../constants/supabase';
import type { User, Session } from '@supabase/supabase-js';

// Define types for user profile data following enterprise standards
const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  display_name: z.string().optional().nullable(),
  created_at: z.string(),
  last_login: z.string(),
  is_onboarded: z.boolean().default(false),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// Authentication state interface
interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

// Authentication context interface
interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    error: null,
  });

  // Handle auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthStateChange(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      handleAuthStateChange(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle auth state changes
  const handleAuthStateChange = async (session: Session | null) => {
    try {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setState({
          user: session.user,
          profile,
          session,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          profile: null,
          session: null,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Auth state change error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load user data'
      }));
    }
  };

  // Fetch user profile from Supabase
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // User profile doesn't exist yet
          return null;
        }
        throw error;
      }
      
      return UserProfileSchema.parse(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  };

  // Create or update user profile in Supabase
  const saveUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
    try {
      const currentTimestamp = new Date().toISOString();
      
      const { error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          ...data,
          last_login: currentTimestamp,
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw new Error('Failed to save user profile');
    }
  };

  // Sign up handler
  const signUp = async (email: string, password: string, name?: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create initial profile
        const newProfile: Partial<UserProfile> = {
          id: data.user.id,
          email: data.user.email || email,
          display_name: name,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          is_onboarded: false,
        };
        
        await saveUserProfile(data.user.id, newProfile);
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Sign up error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to create account'
      }));
      throw error;
    }
  };

  // Sign in handler
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Update last login
        await saveUserProfile(data.user.id, { 
          last_login: new Date().toISOString() 
        });
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Sign in error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Invalid email or password'
      }));
      throw error;
    }
  };

  // Google sign-in handler
  const signInWithGoogle = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      
      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Google sign in failed'
      }));
      throw error;
    }
  };

  // Password reset handler
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Password reset error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to send password reset email'
      }));
      throw error;
    }
  };

  // Sign out handler
  const signOut = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setState({
        user: null,
        profile: null,
        session: null,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to sign out'
      }));
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    try {
      if (!state.user) {
        throw new Error('No authenticated user');
      }
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await saveUserProfile(state.user.id, data);
      
      // Refresh profile data
      const updatedProfile = await fetchUserProfile(state.user.id);
      
      setState(prev => ({
        ...prev,
        profile: updatedProfile,
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Update profile error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to update profile'
      }));
      throw error;
    }
  };

  // Refresh profile data
  const refreshProfile = async (): Promise<void> => {
    try {
      if (!state.user) {
        return;
      }
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const profile = await fetchUserProfile(state.user.id);
      
      setState(prev => ({
        ...prev,
        profile,
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Refresh profile error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to refresh profile data'
      }));
      throw error;
    }
  };

  const authContextValue: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};