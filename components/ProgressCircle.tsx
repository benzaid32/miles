import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, FONTS } from '@/constants/theme';

interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export default function ProgressCircle({ 
  percentage, 
  size = 200, 
  strokeWidth = 12 
}: ProgressCircleProps) {
  // Calculate values for the SVG circle
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.lightGray}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.teal}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      
      <View style={styles.textContainer}>
        <Text style={styles.percentageText}>{percentage}%</Text>
        <Text style={styles.labelText}>to Goal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontFamily: FONTS.bold,
    fontSize: 40,
    color: COLORS.navy,
  },
  labelText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray,
  },
});