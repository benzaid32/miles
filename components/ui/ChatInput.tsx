import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Keyboard,
  Platform,
  Dimensions,
} from 'react-native';
import { Mic, Send, Pause, StopCircle, Heart } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../constants/theme';
import { isAndroid, elevationShadowStyle } from '../../utils/platform';
import MilesAvatar from './MilesAvatar';

// Define the chat input states for voice interaction
type VoiceState = 'idle' | 'listening' | 'processing';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStartRecording?: () => void;
  onStopRecording?: () => Promise<string | null>;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Voice-first emotional companion chat interface for Miles AI
 * Features:
 * - Designed for deep emotional connection and understanding
 * - Gentle, non-judgmental voice interactions
 * - Safe space for authentic expression
 * - Visual cues that convey patient presence and active listening
 * - Android-optimized interactions for reliable emotional support
 */
const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStartRecording,
  onStopRecording,
  placeholder = 'Type a message...',
  disabled = false,
}) => {
  // Input state
  const [message, setMessage] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  
  // Animation values
  const micScale = useRef(new Animated.Value(1)).current;
  const wavesOpacity = useRef(new Animated.Value(0)).current;
  
  // Start voice recording animation
  const startRecordingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(micScale, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(micScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    Animated.timing(wavesOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  
  // Stop voice recording animation
  const stopRecordingAnimation = () => {
    micScale.stopAnimation();
    Animated.timing(micScale, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    
    Animated.timing(wavesOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  
  // Handle sending text messages
  const handleSendMessage = () => {
    if (message.trim() === '') return;
    
    onSendMessage(message.trim());
    setMessage('');
    Keyboard.dismiss();
  };
  
  // Handle voice recording
  const handleVoicePress = async () => {
    if (voiceState === 'idle') {
      if (onStartRecording) {
        onStartRecording();
      }
      setVoiceState('listening');
      startRecordingAnimation();
    } else if (voiceState === 'listening') {
      if (onStopRecording) {
        setVoiceState('processing');
        stopRecordingAnimation();
        
        try {
          const transcription = await onStopRecording();
          if (transcription) {
            onSendMessage(transcription);
          }
        } catch (error) {
          console.error('Error processing voice:', error);
        }
        
        setVoiceState('idle');
      }
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Emotional Check-in Indicator */}
      {voiceState === 'listening' && (
        <Animated.View 
          style={[
            styles.listeningFeedback, 
            { opacity: wavesOpacity }
          ]}
        >
          <Text style={styles.listeningText}>Miles is listening...</Text>
        </Animated.View>
      )}
      
      <View style={styles.inputRow}>
        {/* Miles Avatar - represents emotional presence */}
        <MilesAvatar 
          size="small" 
          listening={voiceState === 'listening'}
          animatePresence={true}
          style={styles.avatarContainer}
        />
        
        {/* Voice interaction area - central to emotional connection */}
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={placeholder}
            placeholderTextColor={COLORS.gray}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            editable={!disabled && voiceState === 'idle'}
            selectionColor={COLORS.primary}
            {...(isAndroid && {
              textAlignVertical: 'center',
              underlineColorAndroid: 'transparent',
            })}
          />
          
          {/* Heart button for expressing emotions */}
          <TouchableOpacity 
            style={styles.emotionButton}
            onPress={() => setMessage(message + '❤️')}
            disabled={disabled}
          >
            <Heart size={18} color={COLORS.primary} />
          </TouchableOpacity>
          
          {/* Send button - for text messages */}
          {message.trim().length > 0 ? (
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={disabled || message.trim() === ''}
            >
              <Send size={18} color={COLORS.white} />
            </TouchableOpacity>
          ) : (
            /* Voice button - for deeper emotional expression */
            <TouchableOpacity
              style={[
                styles.voiceButton,
                voiceState === 'listening' && styles.listeningButton,
                voiceState === 'processing' && styles.processingButton,
              ]}
              onPress={handleVoicePress}
              disabled={disabled || voiceState === 'processing'}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: micScale }] }}>
                {voiceState === 'idle' && <Mic size={18} color={COLORS.white} />}
                {voiceState === 'listening' && <StopCircle size={18} color={COLORS.white} />}
                {voiceState === 'processing' && <Pause size={18} color={COLORS.white} />}
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

// Get screen width for responsive design
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    ...Platform.select({
      android: {
        paddingBottom: SPACING.medium,
      },
    }),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: SPACING.small,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    ...SHADOWS.small,
  },
  textInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.dark,
    maxHeight: 100,
    padding: SPACING.small,
    ...Platform.select({
      android: {
        paddingTop: SPACING.small,
      },
    }),
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.small / 2,
    ...SHADOWS.small,
  },
  listeningButton: {
    backgroundColor: COLORS.primaryLight,
  },
  processingButton: {
    backgroundColor: COLORS.gray,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.small / 2,
    ...SHADOWS.small,
  },
  emotionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listeningFeedback: {
    position: 'absolute',
    top: -40,
    left: SCREEN_WIDTH / 2 - 80,
    width: 160,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  listeningText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.white,
  },
});

export default ChatInput;
