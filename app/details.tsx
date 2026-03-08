import { useAppState } from '@/hooks/useAppState';
import { speak, stopSpeaking } from '@/hooks/useSpeech';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Home, Mic, Phone } from 'lucide-react-native';
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

  const nameDisplay = "East Side Mario's";
  const addressDisplay = "Address: 450 King street North";
  const hoursDisplay = "Hours: sunday - 11am to 10 pm. monday to thursday - 11am to 9pm. friday to saturday - 11am to 11pm.";
  const phoneDisplay = "calling option for East Side Mario's. Tap the blue button and speak your choice.";

  const infoMsg = `${nameDisplay}. ${addressDisplay}. ${hoursDisplay}. ${phoneDisplay}`;

  const visualHours = "Hours: (S) 11-10 | (M-Th) 11-9 | (F-S) 11-11";
  const visualPhone = "Call: 519-886-8388";

  const handleCommand = (text: string) => {
    const command = text.toLowerCase();

    const isConfirmation = 
      command.includes('ok') || 
      command.includes('great') || 
      command.includes('next') || 
      command.includes('thank you') || 
      command.includes('confirmed');

    if (command.includes('call') || command.includes('phone') || command.includes('number')) {
      handleCall();
    } else if (isConfirmation || command.includes('address') || command.includes('transport') || command.includes('go')) {
      handleNext();
    } else if (command.includes('back')) {
      router.back();
    } else if (command.includes('home')) {
      router.push('/');
    }
  };

  const handleCall = () => {
    stopAndClear();
    router.push('/calling');
  };

  const handleCallRequest = () => {
    stopAndClear();
    router.push('/calling');
  };

  const handleNext = () => {
    stopAndClear();
    router.push('/transportation');
  };

  const stopAndClear = () => {
    stopSpeaking();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // resetTimer function removed as per instruction
  // const resetTimer = () => {
  //   if (timerRef.current) clearInterval(timerRef.current);
  //   timerRef.current = setInterval(() => {
  //     speak(infoMsg);
  //   }, 10000);
  // };

  const { isListening, startListening, stopListening } = useVoiceControl(
    handleCommand,
    () => stopSpeaking(),
    () => {
      speak(infoMsg);
      // resetTimer(); // Removed as per instruction
    }
  );

  useEffect(() => {
    speak(infoMsg);
    // resetTimer(); // Removed as per instruction
    
    return () => {
      stopSpeaking(); // Modified cleanup
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.clickableArea} 
        activeOpacity={1} 
        onPress={handleNext}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{nameDisplay}</Text>
          
          <View style={styles.infoList}>
            <TouchableOpacity style={styles.infoItem} onPress={handleNext}>
              <Text style={styles.infoText}>{addressDisplay}</Text>
            </TouchableOpacity>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{visualHours}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.callButton}
              onPress={handleCallRequest}
            >
              <Phone size={24} color="white" />
              <Text style={styles.callButtonText}>{visualPhone}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

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
  clickableArea: {
    flex: 1,
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
    letterSpacing: 2,
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
  detailItem: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  detailLabel: {
    fontSize: 24,
    color: '#444',
    fontWeight: '600',
    textAlign: 'center',
  },
  callButton: {
    backgroundColor: '#4285F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 20,
    marginTop: 10,
    gap: 15,
  },
  callButtonText: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
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
