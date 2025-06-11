import React from 'react';
import { 
  View, 
  Image, 
  Text, 
  StyleSheet, 
  Dimensions, 
  ImageSourcePropType 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../constants/theme';
import { ASSETS, getBrandGradient } from '../../utils/assets';
import Button from './Button';

interface OnboardingCardProps {
  title: string;
  description: string;
  imageSource: ImageSourcePropType;
  ctaText: string;
  onCtaPress: () => void;
  variant?: 'primary' | 'secondary';
}

/**
 * Enterprise-grade Onboarding Card component
 * Features:
 * - Consistent brand styling
 * - Responsive layout
 * - Support for Miles' supportive, empathetic tone
 */
const OnboardingCard: React.FC<OnboardingCardProps> = ({
  title,
  description,
  imageSource,
  ctaText,
  onCtaPress,
  variant = 'primary',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={imageSource} 
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.contentContainer}>
        <LinearGradient
          colors={getBrandGradient(variant)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.titleContainer}
        >
          <Text style={styles.title}>{title}</Text>
        </LinearGradient>
        
        <Text style={styles.description}>{description}</Text>
        
        <Button
          title={ctaText}
          onPress={onCtaPress}
          type={variant === 'primary' ? 'primary' : 'secondary'}
          size="large"
          fullWidth
        />
      </View>
    </View>
  );
};

// Get screen dimensions for responsive layout
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - SPACING.large * 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
    marginHorizontal: SPACING.large,
    marginVertical: SPACING.medium,
  },
  imageContainer: {
    height: 200,
    width: '100%',
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.medium,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: SPACING.large,
  },
  titleContainer: {
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: SPACING.medium,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.white,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.navy,
    marginBottom: SPACING.large,
    lineHeight: 24,
  },
});

export default OnboardingCard;
