import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../constants/theme';
import { Heart } from 'lucide-react-native';

interface EmotionalCheckInProps {
  onSelectEmotion?: (emotion: string) => void;
  recentEmotions?: string[];
}

/**
 * Emotional Check-In Component
 * Allows users to express how they're feeling in a safe, non-judgmental space
 */
const EmotionalCheckIn: React.FC<EmotionalCheckInProps> = ({
  onSelectEmotion,
  recentEmotions = ['understood', 'hopeful', 'calm', 'supported']
}) => {
  // Get color based on emotion
  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'understood':
        return COLORS.primary;
      case 'hopeful':
        return COLORS.subtleWarmth;
      case 'calm':
        return '#A7D7E8'; // Light blue
      case 'supported':
        return '#A3B9C9'; // Soft blue-grey
      case 'heard':
        return '#9DB1D0'; // Muted periwinkle
      case 'connected':
        return '#A9C0C7'; // Sage grey
      case 'reflective':
        return '#A0A7B8'; // Dusty lavender
      default:
        return COLORS.primaryLight;
    }
  };

  // Emotions that can be selected
  const emotionOptions = [
    ...recentEmotions,
    'heard',
    'connected',
    'reflective',
    'add'
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>How are you feeling?</Text>
        <Text style={styles.subtitle}>Tap to check in with your emotions</Text>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.emotionsContainer}
      >
        {emotionOptions.map((emotion, index) => (
          <TouchableOpacity 
            key={emotion} 
            style={[
              styles.emotionButton,
              { backgroundColor: emotion === 'add' ? COLORS.white : getEmotionColor(emotion) }
            ]}
            onPress={() => onSelectEmotion && onSelectEmotion(emotion)}
          >
            {emotion === 'add' ? (
              <Text style={styles.addEmotionText}>+</Text>
            ) : (
              <>
                <Text style={styles.emotionText}>{emotion}</Text>
                {index < 2 && <Heart size={12} color="#FFF" style={styles.emotionIcon} />}
              </>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    ...SHADOWS.small,
  },
  header: {
    marginBottom: SPACING.medium,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.dark,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
  },
  emotionsContainer: {
    paddingVertical: SPACING.small,
    flexDirection: 'row',
    gap: SPACING.small,
  },
  emotionButton: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emotionText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.white,
  },
  addEmotionText: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.primary,
  },
  emotionIcon: {
    marginLeft: 6,
  }
});

export default EmotionalCheckIn;
