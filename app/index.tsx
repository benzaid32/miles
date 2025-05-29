import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

/**
 * Root index component that redirects based on authentication state
 * - If user is authenticated, redirect to home screen
 * - If user is not authenticated, redirect to onboarding or auth
 * - While checking auth state, show loading indicator
 */
export default function Index() {
  const { user, isLoading } = useAuth();
  const [initialCheck, setInitialCheck] = useState(false);
  
  // Wait for auth state to be determined
  useEffect(() => {
    if (!isLoading) {
      setInitialCheck(true);
    }
  }, [isLoading]);
  
  // Show loading indicator while checking auth state
  if (!initialCheck) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.teal} />
      </View>
    );
  }
  
  // Redirect based on authentication state
  if (user) {
    return <Redirect href="/(tabs)" />;
  }
  
  // Not authenticated, redirect to auth flow
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
