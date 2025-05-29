import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { z } from 'zod';
import { firebase, auth, db } from '../constants/firebase';

// Define types for user profile data following enterprise standards
const UserProfileSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  createdAt: z.number(),
  lastLogin: z.number(),
  isOnboarded: z.boolean().default(false),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// Authentication state interface
interface AuthState {
  user: firebase.User | null;
  profile: UserProfile | null;
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
    isLoading: true,
    error: null,
  });

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: firebase.User | null) => {
      try {
        if (user) {
          const profile = await fetchUserProfile(user.uid);
          setState({
            user,
            profile,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            profile: null,
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
    });

    return unsubscribe;
  }, []);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data() as Record<string, any>;
        return UserProfileSchema.parse({
          ...userData,
          userId
        });
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  };

  // Create or update user profile in Firestore
  const saveUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
    try {
      const userRef = db.collection('users').doc(userId);
      const currentTimestamp = Date.now();
      
      // Filter out undefined values as Firestore doesn't accept them
      const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      await userRef.set({
        ...filteredData,
        lastLogin: currentTimestamp,
      }, { merge: true });
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw new Error('Failed to save user profile');
    }
  };

  // Sign up handler
  const signUp = async (email: string, password: string, name?: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      if (!user) {
        throw new Error('Failed to create user account');
      }
      
      // Create initial profile
      const newProfile: UserProfile = {
        userId: user.uid,
        email: user.email || email,
        displayName: name,
        createdAt: Date.now(),
        lastLogin: Date.now(),
        isOnboarded: false,
      };
      
      await saveUserProfile(user.uid, newProfile);
      
      setState(prev => ({
        ...prev,
        user,
        profile: newProfile,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Sign up error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to create account'
      }));
      throw error;
    }
  };

  // Sign in handler
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      if (!user) {
        throw new Error('Authentication failed');
      }
      
      // Update last login
      await saveUserProfile(user.uid, { lastLogin: Date.now() });
      
      const profile = await fetchUserProfile(user.uid);
      
      setState(prev => ({
        ...prev,
        user,
        profile,
        isLoading: false,
      }));
    } catch (error) {
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
      
      // Google Sign In not implemented for React Native in this version
      // In a real app, you would integrate with Expo AuthSession or similar
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Google sign in is not implemented for mobile in this version'
      }));
      
      throw new Error('Google sign in is not implemented for mobile in this version');
    } catch (error) {
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
      
      await auth.sendPasswordResetEmail(email);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error) {
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
      
      await auth.signOut();
      
      setState({
        user: null,
        profile: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
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
      
      await saveUserProfile(state.user.uid, data);
      
      // Refresh profile data
      const updatedProfile = await fetchUserProfile(state.user.uid);
      
      setState(prev => ({
        ...prev,
        profile: updatedProfile,
        isLoading: false,
      }));
    } catch (error) {
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
      
      const profile = await fetchUserProfile(state.user.uid);
      
      setState(prev => ({
        ...prev,
        profile,
        isLoading: false,
      }));
    } catch (error) {
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
