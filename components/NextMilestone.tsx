import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '@/constants/theme';

export default function NextMilestone() {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.9}>
      <View style={styles.leftSection}>
        <Text style={styles.title}>Next Milestone</Text>
        
        <Text style={styles.milestoneText}>Complete 5K Run Prep</Text>
        
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <View style={styles.whyWallContainer}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/3621185/pexels-photo-3621185.jpeg?auto=compress&cs=tinysrgb&w=300' }}
            style={styles.whyWallImage}
          />
          <Text style={styles.whyWallText}>For my kids' soccer games!</Text>
        </View>
        
        <View style={styles.chevronContainer}>
          <ChevronRight color={COLORS.gray} size={24} strokeWidth={1.5} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.large,
    flexDirection: 'row',
    ...SHADOWS.medium,
  },
  leftSection: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: SPACING.medium,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.navy,
    marginBottom: SPACING.medium,
  },
  milestoneText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.navy,
    marginBottom: SPACING.medium,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    width: '45%',
    height: '100%',
    backgroundColor: COLORS.teal,
    borderRadius: 4,
  },
  rightSection: {
    width: 140,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  whyWallContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: SPACING.medium,
    alignItems: 'center',
    transform: [{ rotate: '3deg' }],
    ...SHADOWS.small,
  },
  whyWallImage: {
    width: 120,
    height: 80,
    borderRadius: 12,
    marginBottom: SPACING.small,
  },
  whyWallText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    textAlign: 'center',
    color: COLORS.navy,
  },
  chevronContainer: {
    alignSelf: 'flex-end',
    marginTop: SPACING.medium,
  },
});