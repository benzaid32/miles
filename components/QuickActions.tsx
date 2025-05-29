import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SPACING } from '@/constants/theme';
import ActionButton from './ActionButton';
import { Mic, Flame, Sparkles } from 'lucide-react-native';

export default function QuickActions() {
  return (
    <View style={styles.container}>
      <ActionButton 
        icon={<Mic size={24} color="white" />}
        label="Voice Journal"
      />
      
      <ActionButton 
        icon={<Flame size={24} color="white" />}
        label="Emergency Pep Talk"
        isWide
      />
      
      <ActionButton 
        icon={<Sparkles size={24} color="white" />}
        label="AI Workout"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.medium,
  },
});