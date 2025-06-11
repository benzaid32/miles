# Voice-First Interaction Implementation Plan

## 🎤 OVERVIEW
The voice-first interaction is the key differentiator mentioned in the contract. This document outlines the complete implementation strategy for adding speech recognition and text-to-speech capabilities to Miles AI Coach.

---

## 🏗️ TECHNICAL ARCHITECTURE

### Platform Strategy
- **Web**: Web Speech API (built-in browser support)
- **iOS/Android**: expo-speech + expo-av for recording
- **Fallback**: Text-based interaction for unsupported devices

### Core Components Needed

1. **Speech Recognition Service** (`lib/speechService.ts`)
2. **Text-to-Speech Service** (`lib/ttsService.ts`)
3. **Voice Chat Component** (`components/VoiceChat.tsx`)
4. **Audio Manager** (`lib/audioManager.ts`)
5. **Voice UI Components** (`components/ui/VoiceButton.tsx`)

---

## 📦 REQUIRED DEPENDENCIES

```json
{
  "expo-speech": "~12.1.0",
  "expo-av": "~14.1.0",
  "expo-permissions": "~15.1.0"
}
```

---

## 🔧 IMPLEMENTATION DETAILS

### 1. Speech Recognition Service

```typescript
// lib/speechService.ts
import { Platform } from 'react-native';

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

class SpeechService {
  private recognition: any = null;
  private isListening = false;

  async initialize(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return this.initializeWebSpeech();
    } else {
      return this.initializeNativeSpeech();
    }
  }

  private initializeWebSpeech(): boolean {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    return true;
  }

  private async initializeNativeSpeech(): Promise<boolean> {
    // For React Native, we'll use a combination of expo-speech and custom recording
    // This requires additional native implementation
    return true;
  }

  async startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void,
    options: SpeechRecognitionOptions = {}
  ): Promise<void> {
    if (Platform.OS === 'web') {
      return this.startWebListening(onResult, onError, options);
    } else {
      return this.startNativeListening(onResult, onError, options);
    }
  }

  private startWebListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void,
    options: SpeechRecognitionOptions
  ): void {
    if (!this.recognition) {
      onError('Speech recognition not initialized');
      return;
    }

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      onResult({
        transcript: result[0].transcript,
        confidence: result[0].confidence,
        isFinal: result.isFinal
      });
    };

    this.recognition.onerror = (event: any) => {
      onError(event.error);
    };

    this.recognition.start();
    this.isListening = true;
  }

  private async startNativeListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void,
    options: SpeechRecognitionOptions
  ): Promise<void> {
    // Implementation for React Native using expo-speech
    // This would require additional setup for recording and processing
    onError('Native speech recognition not yet implemented');
  }

  stopListening(): void {
    if (Platform.OS === 'web' && this.recognition) {
      this.recognition.stop();
    }
    this.isListening = false;
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechService();
```

### 2. Text-to-Speech Service

```typescript
// lib/ttsService.ts
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

interface TTSOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  language?: string;
}

class TextToSpeechService {
  private isSpeaking = false;
  private currentUtterance: any = null;

  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (Platform.OS === 'web') {
      return this.speakWeb(text, options);
    } else {
      return this.speakNative(text, options);
    }
  }

  private async speakWeb(text: string, options: TTSOptions): Promise<void> {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported');
      return;
    }

    // Stop any current speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1;
    utterance.lang = options.language || 'en-US';

    // Find a suitable voice
    const voices = speechSynthesis.getVoices();
    if (options.voice) {
      const selectedVoice = voices.find(voice => voice.name === options.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    } else {
      // Default to a pleasant female voice if available
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.isSpeaking = false;
      this.currentUtterance = null;
    };

    this.currentUtterance = utterance;
    speechSynthesis.speak(utterance);
  }

  private async speakNative(text: string, options: TTSOptions): Promise<void> {
    try {
      this.isSpeaking = true;
      
      await Speech.speak(text, {
        language: options.language || 'en-US',
        pitch: options.pitch || 1,
        rate: options.rate || 0.9,
        onDone: () => {
          this.isSpeaking = false;
        },
        onError: (error) => {
          console.error('Native TTS error:', error);
          this.isSpeaking = false;
        }
      });
    } catch (error) {
      console.error('Native TTS error:', error);
      this.isSpeaking = false;
    }
  }

  stop(): void {
    if (Platform.OS === 'web') {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    } else {
      Speech.stop();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  async getAvailableVoices(): Promise<string[]> {
    if (Platform.OS === 'web') {
      if ('speechSynthesis' in window) {
        const voices = speechSynthesis.getVoices();
        return voices.map(voice => voice.name);
      }
    } else {
      // For React Native, expo-speech doesn't provide voice listing
      // but we can return common voice identifiers
      return ['default'];
    }
    return [];
  }
}

export const ttsService = new TextToSpeechService();
```

### 3. Voice Chat Component

```typescript
// components/VoiceChat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
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
        setError('Speech recognition not supported on this device');
      }
    } catch (err) {
      setError('Failed to initialize speech recognition');
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
        <Text style={styles.fallbackText}>Use text chat instead</Text>
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
          <Text style={styles.speakingText}>Miles is speaking...</Text>
        </TouchableOpacity>
      )}

      {/* Live Transcript */}
      {transcript && (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>
      )}

      {/* Status Text */}
      <Text style={styles.statusText}>
        {isListening 
          ? 'Listening... Speak now' 
          : isAISpeaking 
          ? 'Miles is responding...'
          : 'Tap to speak with Miles'
        }
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SPACING.large,
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
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.small,
  },
  fallbackText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
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
  },
  statusText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SPACING.medium,
  },
});
```

---

## 🔄 INTEGRATION WITH EXISTING CHAT

### Modified ChatUI Component

```typescript
// Update components/ChatUI.tsx to include voice functionality

import VoiceChat from './VoiceChat';

// Add to ChatUI component:
const [isVoiceMode, setIsVoiceMode] = useState(false);
const [isAISpeaking, setIsAISpeaking] = useState(false);

// Add voice message handler
const handleVoiceTranscript = (transcript: string) => {
  // Send voice transcript as regular message
  handleSend([{
    _id: Date.now(),
    text: transcript,
    createdAt: new Date(),
    user: { _id: user?.uid || 'unknown' }
  }]);
};

// Add AI response speaking
const handleSpeakResponse = async (response: string) => {
  setIsAISpeaking(true);
  await ttsService.speak(response);
  setIsAISpeaking(false);
};

// Add voice mode toggle in render
{isVoiceMode ? (
  <VoiceChat
    onTranscript={handleVoiceTranscript}
    onSpeakResponse={handleSpeakResponse}
    isAISpeaking={isAISpeaking}
  />
) : (
  // Existing GiftedChat component
)}
```

---

## 🧪 TESTING STRATEGY

### 1. Cross-Platform Testing
- Test on multiple browsers (Chrome, Safari, Firefox)
- Test on iOS and Android devices
- Verify fallback to text chat when voice unavailable

### 2. Voice Quality Testing
- Test in noisy environments
- Test with different accents and speaking speeds
- Verify transcript accuracy

### 3. Performance Testing
- Monitor memory usage during long conversations
- Test battery impact on mobile devices
- Verify real-time response times

### 4. Accessibility Testing
- Ensure voice features work with screen readers
- Test keyboard navigation for voice controls
- Verify visual indicators for hearing-impaired users

---

## 📱 USER EXPERIENCE CONSIDERATIONS

### 1. Onboarding
- Voice permission request flow
- Voice feature tutorial
- Microphone testing

### 2. Error Handling
- Clear error messages for permission denied
- Graceful fallback to text chat
- Network connectivity issues

### 3. Privacy
- Clear indication when microphone is active
- Option to disable voice features
- Local processing when possible

This implementation plan provides a comprehensive voice-first interaction system that differentiates Miles from text-based competitors while maintaining cross-platform compatibility and user experience quality.