import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/constants/theme';

/**
 * AuthLayout provides the navigation structure for authentication screens
 * Contains sign-in and sign-up routes with consistent styling
 * Following Enterprise React Native + Expo Router standards
 */
export default function AuthLayout() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.white },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="login"
          options={{
            title: 'Login',
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            title: 'Register',
          }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{
            title: 'Forgot Password',
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});
