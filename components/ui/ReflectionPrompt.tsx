import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform
} from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../constants/theme';
import Button from './Button';

interface ReflectionPromptProps {
  prompt: string;
  onReflect?: () => void;
}

/**
 * Reflection Prompt Component
 * 
 * Provides gentle, thoughtful prompts for self-reflection
 * designed to foster emotional connection and personal growth
 * without judgment or pressure
 */
const ReflectionPrompt: React.FC<ReflectionPromptProps> = ({
  prompt,
  onReflect
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.promptText}>
        {prompt}
      </Text>
      
      <Button
        title="Reflect"
        onPress={onReflect || (() => {})}
        type="outline"
        size="small"
        style={styles.reflectButton}
      />
    </View>
  );
};

// Pre-made reflection prompts that embody Miles' supportive, empathetic persona
export const REFLECTION_PROMPTS = [
  "What's something small that brought you comfort today?",
  "When did you feel most at peace recently?",
  "What's something you're proud of that you haven't shared with anyone?",
  "What would feel like emotional support right now?",
  "What's something you need but have been hesitant to ask for?",
  "What's a small moment of connection you experienced recently?",
  "What helps you feel understood when you're struggling?",
  "What's something difficult you're facing that you haven't put into words yet?",
  "What's a gentle truth you're starting to accept?",
  "What would feel like kindness toward yourself today?"
];

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.large,
    marginBottom: SPACING.medium,
    ...SHADOWS.small,
  },
  promptText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.dark,
    lineHeight: 24,
    marginBottom: SPACING.medium,
  },
  reflectButton: {
    alignSelf: 'flex-end',
  }
});

export default ReflectionPrompt;
