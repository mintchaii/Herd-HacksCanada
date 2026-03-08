import { useAppState } from '@/hooks/useAppState';
import { speak, stopSpeaking } from '@/hooks/useSpeech';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import { useRouter } from 'expo-router';
import { ChevronLeft, Home, Mic } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Dimensions, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function TransportationScreen() {
  const router = useRouter();
  const { touchEnabled } = useAppState();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const titleDisplay = "Transport";
  const options = ["Uber", "Bus", "Car"];
  const infoMsg = `Transportation. would you like to travel to your destination by Uber, by bus or by car?`;

  const handleCommand = (text: string) => {
    const command = text.toLowerCase();
    resetTimer();

    if (command.includes('uber')) {
      handleChoice('uber');
    } else if (command.includes('bus')) {
      handleChoice('bus');
    } else if (command.includes('car')) {
      handleChoice('car');
    } else if (command.includes('back')) {
      router.back();
    } else if (command.includes('home')) {
      router.push('/');
    }
  };

  const handleChoice = (path: string) => {
    stopAndClear();
    router.push(`/${path}` as any);
  };

  const stopAndClear = () => {
    stopSpeaking();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      speak(infoMsg);
    }, 10000);
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
      stopAndClear();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{titleDisplay}</Text>
        
        <View style={styles.infoList}>
          {options.map((option, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.infoItem} 
              onPress={() => handleChoice(option.toLowerCase())}
            >
              <Text style={styles.infoText}>{option}</Text>
            </TouchableOpacity>
          ))}
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
    fontSize: 56,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 60,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  infoList: {
    width: '100%',
    gap: 30,
  },
  infoItem: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  infoText: {
    fontSize: 32,
    color: '#333',
    fontWeight: '800',
    textAlign: 'center',
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
