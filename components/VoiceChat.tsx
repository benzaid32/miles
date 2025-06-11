import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react-native';
import { speechService } from '@/lib/speechService';
import { ttsService } from '@/lib/ttsService';
import { COLORS, FONTS, SPACING } from '@/constants/theme';

interface VoiceChatProps {
  onTranscript: (text: string) => void;
  onSpeakResponse: (text: string) => void;
  isAISpeaking: boolean;
  disabled?: boolean;
}

export default function VoiceChat({ 
  onTranscript, 
  onSpeakResponse, 
  isAISpeaking,
  disabled = false 
}: VoiceChatProps) {
  const [isListening, setIsListening] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeSpeech();
  }, []);

  useEffect(() => {
    if (isListening) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isListening]);

  const initializeSpeech = async () => {
    try {
      const initialized = await speechService.initialize();
      setIsInitialized(initialized);
      if (!initialized) {
        setError('Voice features not supported on this device');
      }
    } catch (err) {
      setError('Failed to initialize voice features');
      console.error('Speech initialization error:', err);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    waveAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    Animated.timing(waveAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const startListening = async () => {
    if (!isInitialized || disabled || isAISpeaking) return;

    try {
      setError(null);
      setTranscript('');
      
      await speechService.startListening(
        (result) => {
          setTranscript(result.transcript);
          if (result.isFinal && result.transcript.trim()) {
            onTranscript(result.transcript.trim());
            setTranscript('');
            stopListening();
          }
        },
        (error) => {
          setError(error);
          setIsListening(false);
        }
      );
      
      setIsListening(true);
    } catch (err) {
      setError('Failed to start listening');
      console.error('Start listening error:', err);
    }
  };

  const stopListening = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const speakResponse = async (text: string) => {
    try {
      await ttsService.speak(text, {
        rate: 0.9,
        pitch: 1,
        language: 'en-US'
      });
      onSpeakResponse(text);
    } catch (err) {
      console.error('TTS error:', err);
    }
  };

  const stopSpeaking = () => {
    ttsService.stop();
  };

  if (!isInitialized && error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.fallbackText}>Voice features are not available on this device</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Voice Waves Animation */}
      {isListening && (
        <Animated.View 
          style={[
            styles.waveContainer,
            {
              opacity: waveAnim,
              transform: [{
                scale: waveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.5]
                })
              }]
            }
          ]}
        >
          <View style={styles.wave} />
          <View style={[styles.wave, styles.wave2]} />
          <View style={[styles.wave, styles.wave3]} />
        </Animated.View>
      )}

      {/* Main Voice Button */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[
            styles.voiceButton,
            isListening && styles.listeningButton,
            disabled && styles.disabledButton
          ]}
          onPress={toggleListening}
          disabled={disabled || isAISpeaking}
          activeOpacity={0.8}
        >
          {isListening ? (
            <MicOff size={32} color={COLORS.white} />
          ) : (
            <Mic size={32} color={COLORS.white} />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* AI Speaking Indicator */}
      {isAISpeaking && (
        <TouchableOpacity
          style={styles.speakingButton}
          onPress={stopSpeaking}
        >
          <Volume2 size={24} color={COLORS.primary} />
          <Text style={styles.speakingText}>Miles is speaking... (tap to stop)</Text>
        </TouchableOpacity>
      )}

      {/* Live Transcript */}
      {transcript && (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptText}>"{transcript}"</Text>
        </View>
      )}

      {/* Status Text */}
      <Text style={styles.statusText}>
        {isListening 
          ? 'Listening... Speak now' 
          : isAISpeaking 
          ? 'Miles is responding...'
          : 'Tap the microphone to speak with Miles'
        }
      </Text>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SPACING.large,
    minHeight: 300,
    justifyContent: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: SPACING.large,
    backgroundColor: COLORS.error + '20',
    borderRadius: 12,
    margin: SPACING.medium,
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.small,
  },
  fallbackText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SPACING.small,
  },
  waveContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wave: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
  },
  wave2: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  wave3: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  listeningButton: {
    backgroundColor: COLORS.error,
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  speakingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 20,
    marginTop: SPACING.medium,
  },
  speakingText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: SPACING.small,
  },
  transcriptContainer: {
    backgroundColor: COLORS.background,
    padding: SPACING.medium,
    borderRadius: 12,
    marginTop: SPACING.medium,
    maxWidth: '90%',
  },
  transcriptText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.dark,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statusText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SPACING.medium,
  },
});