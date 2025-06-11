import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '@/constants/theme';
import ProgressCircle from './ProgressCircle';

interface GoalProgressProps {
  percentage: number;
  title: string;
  subtitle: string;
}

export default function GoalProgress({ percentage, title, subtitle }: GoalProgressProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.progressContainer}>
        <ProgressCircle percentage={percentage} size={220} strokeWidth={16} />
      </View>
      
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.xlarge,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.navy,
    marginBottom: SPACING.medium,
    textAlign: 'center',
  },
  progressContainer: {
    marginVertical: SPACING.large,
    alignItems: 'center',
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SPACING.medium,
  },
});