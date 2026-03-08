import * as Speech from 'expo-speech';

export const speak = async (text: string) => {
  try {
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.2, // Cheerful
      rate: 1.0,  // Natural
    });
  } catch (error) {
    console.error('Speech error:', error);
  }
};

export const stopSpeaking = async () => {
  try {
    await Speech.stop();
  } catch (error) {
    console.error('Stop speech error:', error);
  }
};
