import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  StyleProp,
  Platform,
  ReturnKeyTypeOptions,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { isAndroid } from '../../utils/platform';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helper?: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  showRequiredIndicator?: boolean;
}

/**
 * Enterprise-grade Input component with Android optimization
 * Features:
 * - Android-specific input behavior
 * - Error and helper text handling
 * - Left and right icons support
 * - Proper form field styling
 */
const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helper,
      rightIcon,
      leftIcon,
      onRightIconPress,
      containerStyle,
      inputStyle,
      fullWidth = false,
      showRequiredIndicator = false,
      secureTextEntry,
      onFocus,
      onBlur,
      placeholder,
      value,
      returnKeyType,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isSecureVisible, setIsSecureVisible] = useState(!secureTextEntry);

    // Handle Android-specific return key types
    const getReturnKeyType = (): ReturnKeyTypeOptions => {
      if (returnKeyType) return returnKeyType;
      
      if (isAndroid) {
        return 'default';
      }
      
      return 'done';
    };

    // Handle focus state
    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus && onFocus(e);
    };

    // Handle blur state
    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur && onBlur(e);
    };

    // Toggle password visibility
    const toggleSecureVisibility = () => {
      setIsSecureVisible(!isSecureVisible);
    };

    return (
      <View style={[styles.container, fullWidth && styles.fullWidth, containerStyle]}>
        {label && (
          <View style={styles.labelContainer}>
            <Text style={styles.label}>{label}</Text>
            {showRequiredIndicator && <Text style={styles.requiredIndicator}>*</Text>}
          </View>
        )}
        
        <View
          style={[
            styles.inputContainer,
            isFocused && styles.focusedInput,
            error ? styles.errorInput : null,
          ]}
        >
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          
          <TextInput
            ref={ref}
            style={[
              styles.input,
              leftIcon && styles.inputWithLeftIcon,
              rightIcon && styles.inputWithRightIcon,
              inputStyle,
            ]}
            placeholder={placeholder}
            placeholderTextColor={COLORS.gray}
            secureTextEntry={secureTextEntry && !isSecureVisible}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={value}
            returnKeyType={getReturnKeyType()}
            selectionColor={COLORS.teal}
            {...(isAndroid && {
              textAlignVertical: 'center',
              underlineColorAndroid: 'transparent',
            })}
            {...rest}
          />
          
          {rightIcon && (
            <TouchableOpacity
              style={styles.rightIconContainer}
              onPress={onRightIconPress || (secureTextEntry ? toggleSecureVisibility : undefined)}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>
        
        {(error || helper) && (
          <Text style={[styles.helperText, error ? styles.errorText : null]}>
            {error || helper}
          </Text>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.medium,
  },
  fullWidth: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.navy,
    marginBottom: 6,
  },
  requiredIndicator: {
    color: COLORS.coral,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    ...Platform.select({
      android: {
        elevation: 0,
      },
      ios: {
        shadowOpacity: 0,
      },
    }),
  },
  focusedInput: {
    borderColor: COLORS.teal,
    ...Platform.select({
      android: {
        elevation: 0,
      },
    }),
  },
  errorInput: {
    borderColor: COLORS.coral,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: SPACING.medium,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.navy,
    ...Platform.select({
      android: {
        paddingVertical: 8,
      },
    }),
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIconContainer: {
    paddingLeft: SPACING.medium,
  },
  rightIconContainer: {
    paddingRight: SPACING.medium,
  },
  helperText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 6,
    marginLeft: 4,
  },
  errorText: {
    color: COLORS.coral,
  },
});

export default Input;
