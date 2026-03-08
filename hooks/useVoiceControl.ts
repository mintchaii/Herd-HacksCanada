import { useState, useCallback, useEffect } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

export const useVoiceControl = (onCommand: (text: string) => void, onUserSpeaking?: () => void) => {
  const [isListening, setIsListening] = useState(false);

  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent('speechstart', () => {
    if (onUserSpeaking) {
      onUserSpeaking();
    }
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript;
    if (transcript) {
      onCommand(transcript);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event.error);
    setIsListening(false);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  const startListening = useCallback(async () => {
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      console.warn('Speech recognition permission not granted');
      return;
    }

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
