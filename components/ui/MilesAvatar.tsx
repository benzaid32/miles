import React from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  ViewStyle, 
  StyleProp, 
  Platform,
  Animated 
} from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { isAndroid } from '../../utils/platform';

// Define avatar size options
type AvatarSize = 'small' | 'medium' | 'large';

interface MilesAvatarProps {
  size?: AvatarSize;
  style?: StyleProp<ViewStyle>;
  animatePresence?: boolean;
  listening?: boolean;
}

/**
 * Miles AI Avatar Component
 * 
 * Represents the visual identity of Miles as an emotional companion.
 * Features gentle, supportive visual elements that convey:
 * - Emotional safety and understanding
 * - Patient, non-judgmental presence
 * - Authentic care and deep listening
 */
const MilesAvatar: React.FC<MilesAvatarProps> = ({
  size = 'medium',
  style,
  animatePresence = false,
  listening = false,
}) => {
  // Animation values
  const breatheAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  
  React.useEffect(() => {
    if (animatePresence) {
      // Gentle breathing animation to convey presence
      Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
    
    if (listening) {
      // Subtle pulse animation to indicate active listening
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
    
    return () => {
      // Clean up animations on unmount
      breatheAnim.stopAnimation();
      pulseAnim.stopAnimation();
    };
  }, [animatePresence, listening, breatheAnim, pulseAnim]);
  
  // Get size dimensions
  const getSize = () => {
    switch (size) {
      case 'small':
        return styles.smallAvatar;
      case 'large':
        return styles.largeAvatar;
      case 'medium':
      default:
        return styles.mediumAvatar;
    }
  };
  
  // Combine scale animations
  const scale = Animated.multiply(
    listening ? pulseAnim : new Animated.Value(1),
    animatePresence 
      ? breatheAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.05],
        })
      : new Animated.Value(1)
  );
  
  // Combine opacity animation for subtle presence
  const opacity = breatheAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.9, 1],
  });
  
  return (
    <Animated.View
      style={[
        styles.container,
        getSize(),
        style,
        { 
          transform: [{ scale }],
          opacity: animatePresence ? opacity : 1,
        },
      ]}
    >
      <Image
        source={require('../../assets/images/miles-avatar.png')}
        style={styles.avatarImage}
        resizeMode="contain"
      />
      
      {/* Active listening indicator */}
      {listening && (
        <View style={styles.listeningIndicator} />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  smallAvatar: {
    width: 40,
    height: 40,
  },
  mediumAvatar: {
    width: 60,
    height: 60,
  },
  largeAvatar: {
    width: 100,
    height: 100,
  },
  avatarImage: {
    width: '80%',
    height: '80%',
  },
  listeningIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.small,
  },
});

export default MilesAvatar;
