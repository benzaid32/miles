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

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
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
    
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    return true;
  }

  private async initializeNativeSpeech(): Promise<boolean> {
    // For React Native, we'll implement this later with expo-speech
    // For now, return false to use text fallback
    console.log('Native speech recognition not yet implemented');
    return false;
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
        confidence: result[0].confidence || 0.9,
        isFinal: result.isFinal
      });
    };

    this.recognition.onerror = (event: any) => {
      onError(event.error || 'Speech recognition error');
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      onError('Failed to start speech recognition');
      this.isListening = false;
    }
  }

  private async startNativeListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void,
    options: SpeechRecognitionOptions
  ): Promise<void> {
    onError('Native speech recognition not yet implemented');
  }

  stopListening(): void {
    if (Platform.OS === 'web' && this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.warn('Error stopping speech recognition:', error);
      }
    }
    this.isListening = false;
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechService();
export default speechService;