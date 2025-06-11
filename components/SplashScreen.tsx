import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Ensure minimum display time of 3 seconds
    const minimumDisplayTime = 3000;
    const startTime = Date.now();

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500, // Increased from 1000
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20, // Reduced from 50 for smoother animation
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Calculate remaining time to ensure minimum display duration
    const timer = setTimeout(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minimumDisplayTime - elapsedTime);
      
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, minimumDisplayTime);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8E8E8" />
      
      {/* Background gradient matching the attached design */}
      <LinearGradient
        colors={['#E8E8E8', '#D0D0D0']}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo Image */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/splash-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* App Name */}
        <Text style={styles.appName}>Miles</Text>
        
        {/* Subtitle */}
        <Text style={styles.subtitle}>AI Coaching App</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E8E8',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  appName: {
    fontSize: 64,
    fontWeight: '300', // Light weight to match the design
    color: '#2C3E50', // Dark blue-gray color matching the design
    letterSpacing: -2,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'System', // Using system font for consistency
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '400', // Regular weight
    color: '#2C3E50', // Same dark color as main title
    letterSpacing: 0.5,
    textAlign: 'center',
    fontFamily: 'System',
  },
}); 