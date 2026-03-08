import { useAppState } from '@/hooks/useAppState';
import { speak, stopSpeaking } from '@/hooks/useSpeech';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import { useRouter } from 'expo-router';
import { ChevronLeft, Home, Mic } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Dimensions, ImageBackground, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function DestinationsScreen() {
  const router = useRouter();
  const { touchEnabled } = useAppState();

  const mainPrompt = 'Where do you want to go?';

  const handleCommand = (text: string) => {
    const command = text.toLowerCase().trim();
    console.log('Voice Command:', command);

    if (command.includes('next') || command.includes('yes') || command.includes('correct') || command.includes('eastside') || command.includes('mario')) {
      handleNavigateToDetails();
    } else if (command.includes('back')) {
      router.back();
    } else if (command.includes('home')) {
      router.push('/');
    }
  };

  const handleNavigateToDetails = () => {
    speak('Opening details for East Side Marios.');
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

  const { isListening, startListening, stopListening } = useVoiceControl(
    handleCommand,
    () => stopSpeaking(),
    () => speak(mainPrompt)
  );

  useEffect(() => {
    speak(mainPrompt);
    return () => {
      stopSpeaking();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground 
        source={require('@/assets/images/map_static.png')} 
        style={styles.mapBackground}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.promptText}>{mainPrompt}</Text>
          
          {/* Transparent touchable area for the red pin neighborhood */}
          <TouchableOpacity 
            style={styles.pinHotspot}
            onPress={handleNavigateToDetails}
          />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mapBackground: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  promptText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    overflow: 'hidden',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  pinHotspot: {
    position: 'absolute',
    top: '40%', // Estimated based on the red pin location in common map crops
    left: '50%',
    width: 150,
    height: 150,
    marginLeft: -75,
    marginTop: -75,
    // backgroundColor: 'rgba(255, 0, 0, 0.2)', // For debugging, make it transparent later
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
    backgroundColor: 'rgba(255, 249, 240, 0.5)',
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
