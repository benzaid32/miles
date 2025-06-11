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
      // Default to a pleasant voice if available
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && (
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('karen') ||
          voice.name.toLowerCase().includes('female')
        )
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
      return ['default'];
    }
    return [];
  }
}

export const ttsService = new TextToSpeechService();
export default ttsService;