import React, { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as SplashScreenExpo from 'expo-splash-screen';
import { AppProviders } from '@/components/AppProviders';
import SplashScreen from '@/components/SplashScreen';
import { COLORS, FONTS } from '@/constants/theme';

// Import polyfills needed for Firebase auth
import '@/lib/polyfills';

// Prevent expo splash screen from auto-hiding
SplashScreenExpo.preventAutoHideAsync().catch(() => {
  // Ignore error
});

/**
 * Root layout component that configures the app's navigation structure
 * and handles font loading, splash screen, and error states following iOS production standards
 */
export default function RootLayout() {
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [expoSplashHidden, setExpoSplashHidden] = useState(false);
  
  // Load custom fonts with error handling
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  // Handle expo splash screen hiding when fonts are loaded
  useEffect(() => {
    async function hideSplash() {
      try {
        if (fontsLoaded || fontError) {
          // Hide the native splash screen
          await SplashScreenExpo.hideAsync();
          setExpoSplashHidden(true);
        }
      } catch (error) {
        console.error('Failed to hide expo splash screen:', error);
        setExpoSplashHidden(true); // Ensure we proceed even if there's an error
      }
    }
    
    hideSplash();
  }, [fontsLoaded, fontError]);

  // Handle custom splash screen finish
  const handleSplashFinish = () => {
    setShowCustomSplash(false);
  };

  // Show custom splash screen while fonts are loading or during splash duration
  if (!expoSplashHidden || showCustomSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }
  
  // Error state - handle font loading failures gracefully
  if (fontError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load application fonts. Please restart the app.</Text>
      </View>
    );
  }
  
  // Main app structure with proper navigation hierarchy
  return (
    <AppProviders>
      <StatusBar style="auto" />
      <Slot />
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontFamily: 'System',
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
});