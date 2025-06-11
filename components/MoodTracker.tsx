import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '@/constants/theme';

const moodEmojis = ['😞', '😐', '🙂', '😊'];

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState(2);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood & Habits</Text>
      
      <View style={styles.content}>
        <View style={styles.moodContainer}>
          {moodEmojis.map((emoji, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.emojiButton,
                selectedMood === index && styles.selectedEmoji
              ]}
              onPress={() => setSelectedMood(index)}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(selectedMood + 1) * 25}%` }]} />
        </View>
        
        <TouchableOpacity style={styles.streakContainer}>
          <Text style={styles.streakText}>7-Day Consistency Streak!</Text>
          <ChevronRight color={COLORS.gray} size={20} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.large,
    ...SHADOWS.medium,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.navy,
    marginBottom: SPACING.medium,
  },
  content: {
    gap: SPACING.medium,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.small,
  },
  emojiButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  selectedEmoji: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 2,
    borderColor: COLORS.teal,
  },
  emoji: {
    fontSize: 28,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.teal,
    borderRadius: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.small,
  },
  streakText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.navy,
  },
});