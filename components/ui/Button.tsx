import React from 'react';
import {
  TouchableOpacity,
  TouchableNativeFeedback,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { isAndroid, elevationShadowStyle } from '../../utils/platform';

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  androidRippleColor?: string;
}

/**
 * Enterprise-grade Button component with Android optimization
 * Features:
 * - Proper ripple effect on Android
 * - Loading state
 * - Cross-platform shadow implementation
 * - Various button types and sizes
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  androidRippleColor,
}) => {
  // Get button style based on type - using Miles emotional companion colors
  const getButtonStyle = () => {
    switch (type) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'text':
        return styles.textButton;
      default:
        return styles.primaryButton;
    }
  };

  // Get text style based on type
  const getTextStyle = () => {
    switch (type) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'text':
        return styles.textButtonText;
      default:
        return styles.primaryText;
    }
  };

  // Get button size
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'medium':
        return styles.mediumButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  // Get text size
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return styles.smallText;
      case 'medium':
        return styles.mediumText;
      case 'large':
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };

  // Get content color for activity indicator
  const getContentColor = () => {
    switch (type) {
      case 'primary':
        return COLORS.white;
      case 'secondary':
        return COLORS.white;
      case 'outline':
      case 'text':
        return COLORS.primary;
      default:
        return COLORS.white;
    }
  };

  // Combined styles
  const buttonStyle = [
    styles.button,
    getButtonStyle(),
    getButtonSize(),
    fullWidth && styles.fullWidth,
    disabled && styles.disabledButton,
    style,
  ];

  const buttonTextStyle = [
    styles.text,
    getTextStyle(),
    getTextSize(),
    disabled && styles.disabledText,
    textStyle,
  ];

  // For Android, we use TouchableNativeFeedback for better native feel
  // For iOS, we use TouchableOpacity
  const ButtonContent = () => (
    <View style={buttonStyle}>
      {loading ? (
        <ActivityIndicator size="small" color={getContentColor()} />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          <Text style={buttonTextStyle}>{title}</Text>
          {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
        </View>
      )}
    </View>
  );

  if (isAndroid && type !== 'text') {
    const rippleColor = androidRippleColor || 
      (type === 'primary' ? 'rgba(255, 255, 255, 0.3)' : 
       type === 'secondary' ? 'rgba(255, 255, 255, 0.3)' : 
       'rgba(42, 157, 143, 0.3)');
    
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        disabled={disabled || loading}
        background={TouchableNativeFeedback.Ripple(rippleColor, false)}
        useForeground={true}
      >
        <ButtonContent />
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress} 
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <ButtonContent />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    ...elevationShadowStyle(2),
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconContainer: {
    marginRight: SPACING.small,
  },
  rightIconContainer: {
    marginLeft: SPACING.small,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.primaryLight,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
    ...Platform.select({
      android: {
        elevation: 0,
      },
      ios: {
        shadowOpacity: 0,
      },
    }),
  },
  textButton: {
    backgroundColor: 'transparent',
    ...Platform.select({
      android: {
        elevation: 0,
      },
      ios: {
        shadowOpacity: 0,
      },
    }),
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  mediumButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  largeButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  text: {
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.white,
  },
  outlineText: {
    color: COLORS.primary,
  },
  textButtonText: {
    color: COLORS.primary,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  fullWidth: {
    width: '100%',
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.lightGray,
  },
  disabledText: {
    color: COLORS.gray,
  },
});

export default Button;
