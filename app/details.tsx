import { useAppState } from '@/hooks/useAppState';
import { speak, stopSpeaking } from '@/hooks/useSpeech';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Home, Mic } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Dimensions, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function DetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    name: string; 
    address: string; 
    phone: string; 
    hours: string; 
  }>();
  const { touchEnabled } = useAppState();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // User specifically requested these exact strings:
  const nameDisplay = "East Side Mario's";
  const addressDisplay = "Address: 450 King St N";
  const hoursDisplay = "Hours: (S) 11-10 | (M-Th) 11-9 | (F-S) 11-11";
  const phoneDisplay = "Call: 519-886-8388";

  const infoMsg = `${nameDisplay}. ${addressDisplay}. ${hoursDisplay}. ${phoneDisplay}.`;

  const handleCommand = (text: string) => {
    const command = text.toLowerCase();
    resetTimer(); // Reset timer on any voice command

    if (command.includes('address') || command.includes('transport') || command.includes('next') || command.includes('go')) {
      handleNext();
    } else if (command.includes('back')) {
      router.back();
    } else if (command.includes('home')) {
      router.push('/');
    }
  };

  const handleNext = () => {
    stopSpeaking();
    if (timerRef.current) clearInterval(timerRef.current);
    router.push('/transportation');
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      speak(infoMsg);
    }, 8000);
  };

  const { isListening, startListening, stopListening } = useVoiceControl(
    handleCommand,
    () => stopSpeaking(),
    () => {
      speak(infoMsg);
      resetTimer();
    }
  );

  useEffect(() => {
    speak(infoMsg);
    resetTimer();
    
    return () => {
      stopSpeaking();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{nameDisplay}</Text>
        
        <View style={styles.infoList}>
          <TouchableOpacity style={styles.infoItem} onPress={handleNext}>
            <Text style={styles.infoText}>{addressDisplay}</Text>
          </TouchableOpacity>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoText}>{hoursDisplay}</Text>
          </View>
          
          <TouchableOpacity style={styles.infoItem} onPress={handleNext}>
            <Text style={styles.infoText}>{phoneDisplay}</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 50,
    letterSpacing: 2, // Slightly more spaced out
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  infoList: {
    width: '100%',
    gap: 25,
  },
  infoItem: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  infoText: {
    fontSize: 26,
    color: '#444',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 36,
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
