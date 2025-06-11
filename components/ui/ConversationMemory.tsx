import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform
} from 'react-native';
import { Heart } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../constants/theme';

interface ConversationMemoryProps {
  time: string;
  text: string;
  isFavorite?: boolean;
  onPress?: () => void;
  onToggleFavorite?: () => void;
}

/**
 * Conversation Memory Component
 * 
 * Displays a past conversation snippet to create continuity and
 * show Miles' deep understanding and memory of previous interactions
 */
const ConversationMemory: React.FC<ConversationMemoryProps> = ({
  time,
  text,
  isFavorite = false,
  onPress,
  onToggleFavorite
}) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.timeText}>{time}</Text>
        <TouchableOpacity 
          onPress={onToggleFavorite}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Heart 
            size={16} 
            color={COLORS.primary}
            fill={isFavorite ? COLORS.primary : 'transparent'}
          />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.contentText} numberOfLines={2}>
        "{text}"
      </Text>
    </TouchableOpacity>
  );
};

export const SAMPLE_CONVERSATIONS = [
  {
    id: '1',
    time: 'Yesterday, 9:41 PM',
    text: 'I felt really overwhelmed today, but talking it through helped me see things more clearly.',
    isFavorite: true
  },
  {
    id: '2',
    time: 'Monday, 11:23 PM',
    text: 'Sometimes I wonder if anyone really understands how I feel.',
    isFavorite: false
  },
  {
    id: '3',
    time: 'Last week',
    text: 'I've been feeling stuck lately. It's like I know what I want but can't seem to move forward.',
    isFavorite: false
  },
  {
    id: '4',
    time: '2 weeks ago',
    text: 'Today was actually a good day. I noticed a few small moments of joy that I might have missed before.',
    isFavorite: true
  }
];

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.medium,
    marginBottom: SPACING.small,
    ...SHADOWS.small
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  timeText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.gray
  },
  contentText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.dark,
    lineHeight: 20
  }
});

export default ConversationMemory;
