import { useAppState } from '@/hooks/useAppState';
import { speak, stopSpeaking } from '@/hooks/useSpeech';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import { useRouter } from 'expo-router';
import { ChevronLeft, Home, Mic } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Dimensions, ImageBackground, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function DestinationsScreen() {
  const router = useRouter();
  const { touchEnabled } = useAppState();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const mainPrompt = 'Where do you want to go?';

  const handleCommand = (text: string) => {
    const command = text.toLowerCase().trim();
    console.log('Voice Command:', command);
    resetTimer();

    if (command.includes('next') || command.includes('yes') || command.includes('correct') || command.includes('eastside') || command.includes('mario')) {
      handleNavigateToDetails();
    } else if (command.includes('back')) {
      router.back();
    } else if (command.includes('home')) {
      router.push('/');
    }
  };

  const handleNavigateToDetails = () => {
    stopSpeaking();
    if (timerRef.current) clearInterval(timerRef.current);
    router.push({
      pathname: '/details',
      params: {
        name: "East Side Mario's",
        address: "450 King St N",
        hours: "(S) 11-10 | (M-Th) 11-9 | (F-S) 11-11",
        phone: "519-886-8388"
      }
    });
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      speak(mainPrompt);
    }, 10000);
  };

  const { isListening, startListening, stopListening } = useVoiceControl(
    handleCommand,
    () => stopSpeaking(),
    () => {
      speak(mainPrompt);
      resetTimer();
    }
  );

  useEffect(() => {
    speak(mainPrompt);
    resetTimer();
    return () => {
      stopSpeaking();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.clickableArea} 
        activeOpacity={1} 
        onPress={handleNavigateToDetails}
      >
        <ImageBackground 
          source={require('@/assets/images/map_static_v2.png')} 
          style={styles.mapBackground}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <Text style={styles.promptText}>Where do you want to go?</Text>
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
        </ImageBackground>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // White background for the zoom-out look
  },
  clickableArea: {
    flex: 1,
  },
  mapBackground: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    width: '100%',
  },
  promptText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 20,
    overflow: 'hidden',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    elevation: 5,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingBottom: 60,
    gap: 30,
    backgroundColor: 'rgba(255, 249, 240, 0.4)',
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
