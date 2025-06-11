import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';
import * as Haptics from 'expo-haptics';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '@/constants/theme';

// Define validation schema
const resetPasswordSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address'),
});

export default function ForgotPasswordScreen() {
  // State
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Hooks
  const router = useRouter();
  const { resetPassword } = useAuth();
  
  // Validate form input
  const validateForm = () => {
    try {
      resetPasswordSchema.parse({ email });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };
  
  // Handle password reset
  const handleResetPassword = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    try {
      setLoading(true);
      await resetPassword(email);
      setSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // We don't tell the user if the email exists or not for security reasons
      // Instead, we show a success message either way to prevent email enumeration
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={COLORS.navy} />
          </TouchableOpacity>
          
          <Image 
            source={require('@/assets/images/logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you instructions to reset your password
          </Text>
        </View>
        
        {success ? (
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successText}>
              If an account exists with the email you provided, we've sent password reset instructions to {email}
            </Text>
            <TouchableOpacity
              style={styles.returnButton}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.returnButtonText}>Return to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            {errors.auth && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errors.auth}</Text>
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Mail size={20} color={COLORS.gray} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
              />
            </View>
            {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
            
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.resetButtonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.xlarge,
    paddingBottom: SPACING.xlarge,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xlarge,
    position: 'relative',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 10,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: SPACING.medium,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.navy,
    marginBottom: SPACING.small,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: SPACING.medium,
    borderRadius: 8,
    marginBottom: SPACING.large,
  },
  errorText: {
    fontFamily: FONTS.medium,
    color: '#D32F2F',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    marginBottom: 6,
    height: 56,
  },
  inputIconContainer: {
    paddingHorizontal: SPACING.medium,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.navy,
  },
  fieldError: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#D32F2F',
    marginBottom: SPACING.medium,
    marginLeft: SPACING.small,
  },
  resetButton: {
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.large,
  },
  resetButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  successContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: SPACING.large,
    alignItems: 'center',
  },
  successTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.navy,
    marginBottom: SPACING.medium,
  },
  successText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.large,
  },
  returnButton: {
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: SPACING.medium,
  },
  returnButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
