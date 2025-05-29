// Firebase configuration for Miles AI Coach
// Environment variables should be set in your deployment environment
// For development, create a .env file with these values

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/functions';
import { Platform } from 'react-native';

// Firebase configuration using environment variables for security
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Debug: Log the configuration (remove in production)
console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '***' + firebaseConfig.apiKey.slice(-4) : 'NOT SET',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId ? '***' + firebaseConfig.appId.slice(-6) : 'NOT SET'
});

// Validate that required environment variables are set
const requiredEnvVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0 && process.env.NODE_ENV === 'production') {
  console.error('Missing required Firebase environment variables:', missingEnvVars);
  throw new Error(`Missing required Firebase environment variables: ${missingEnvVars.join(', ')}`);
}

// Initialize Firebase only if it hasn't been initialized already
if (!firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
    
    // Configure Firestore settings BEFORE any other Firestore operations
    if (Platform.OS !== 'web') {
      try {
        firebase.firestore().settings({
          cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
          experimentalForceLongPolling: true // Better for React Native
        });
      } catch (error) {
        console.warn('Firestore settings already configured');
      }
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw new Error('Failed to initialize Firebase');
  }
}

// Export Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const functions = firebase.functions();

// Set auth persistence based on platform
try {
  // For React Native/Expo, use default persistence
  // Firebase will handle it automatically
  if (Platform.OS === 'web') {
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  }
} catch (error) {
  console.warn('Auth persistence setup:', error);
}

// Add connection state monitoring
db.enableNetwork().catch(error => {
  console.error('Failed to enable Firestore network:', error);
});

export { firebase, auth, db, functions };
