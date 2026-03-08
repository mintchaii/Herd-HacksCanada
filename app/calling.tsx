import { speak, stopSpeaking } from '@/hooks/useSpeech';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import { useRouter } from 'expo-router';
import { ChevronLeft, Home, Mic } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Dimensions, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function CallingScreen() {
  const router = useRouter();
  const onFinished = () => {
    setTimeout(() => {
      router.push('/transportation');
    }, 2000);
  };

  return <StatusScreen 
    title="Calling 519-886-8388..." 
    speechText="calling 519-886-8388" 
    onFinished={onFinished}
  />;
}

export function StatusScreen({ 
  title = "Calling 519-886-8388...", 
  speechText = "calling 519-886-8388",
  onFinished
}: { 
  title?: string; 
  speechText?: string;
  onFinished?: () => void;
}) {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fullPrompt = speechText;

  const handleCommand = (text: string) => {
    const command = text.toLowerCase().trim();
    resetTimer();
    if (command.includes('back')) {
      router.back();
    } else if (command.includes('home')) {
      router.push('/');
    }
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      speak(fullPrompt, onFinished);
    }, 10000);
  };

  const { isListening, startListening, stopListening } = useVoiceControl(
    handleCommand,
    () => stopSpeaking(),
    () => {
      speak(fullPrompt, onFinished);
      resetTimer();
    }
  );

  useEffect(() => {
    speak(fullPrompt, onFinished);
    resetTimer();
    return () => {
      stopSpeaking();
      if (timerRef.current) clearInterval(timerRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.statusText}>{title}</Text>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.smallButton} onPress={() => router.back()}>
          <ChevronLeft size={40} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.largeMicButton, isListening && { backgroundColor: '#EA4335' }]}
          onPress={isListening ? stopListening : startListening}
        >
          <Mic size={60} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallButton} onPress={() => router.push('/')}>
          <Home size={40} color="#333" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F0',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statusText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingBottom: 60,
    gap: 30,
  },
  largeMicButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
  },
  smallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#eee',
    elevation: 4,
  },
});
