import { useState, useCallback, useRef } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { stopSpeaking } from './useSpeech';

export const useVoiceControl = (onCommand: (text: string) => void, onUserSpeaking?: () => void, onEndWithoutCommand?: () => void) => {
  const [isListening, setIsListening] = useState(false);
  const hasResult = useRef(false);

  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    hasResult.current = false;
  });

  useSpeechRecognitionEvent('speechstart', () => {
    if (onUserSpeaking) {
      onUserSpeaking();
    }
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript;
    if (transcript) {
      hasResult.current = true;
      onCommand(transcript);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event.error);
    setIsListening(false);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
    if (!hasResult.current && onEndWithoutCommand) {
      onEndWithoutCommand();
    }
  });

  const startListening = useCallback(async () => {
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      console.warn('Speech recognition permission not granted');
      return;
    }

    // Ensure absolute silence when starting to listen
    await stopSpeaking();
    
    setIsListening(true);
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: false,
    });
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    ExpoSpeechRecognitionModule.stop();
  }, []);

  return { isListening, startListening, stopListening };
};
