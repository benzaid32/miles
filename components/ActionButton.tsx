import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SHADOWS, SPACING } from '@/constants/theme';

interface ActionButtonProps {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
  isWide?: boolean;
}

export default function ActionButton({ 
  icon, 
  label, 
  onPress, 
  isWide = false 
}: ActionButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.button, isWide && styles.wideButton]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[COLORS.coral, '#F86E60']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.8 }}
        style={[styles.gradient, isWide && styles.wideGradient]}
      >
        {icon}
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: 24,
    ...SHADOWS.medium,
  },
  wideButton: {
    flex: 2,
  },
  gradient: {
    borderRadius: 24,
    padding: SPACING.medium,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wideGradient: {
    paddingHorizontal: SPACING.large,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.white,
    marginTop: SPACING.small,
    textAlign: 'center',
  },
});