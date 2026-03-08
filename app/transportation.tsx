import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Platform, Alert } from 'react-native';
import { Car, Bus, Footprints, Mic, ChevronLeft, Home } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { speak, stopSpeaking } from '@/hooks/useSpeech';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import { useAppState } from '@/hooks/useAppState';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');

const COLORS = {
  uber: '#000000', // Black
  bus: '#F4B400', // Yellow
  walk: '#34A853', // Green
  blue: '#4285F4',
  background: '#FFF9F0',
};

export default function Transportation() {
  const router = useRouter();
  const { touchEnabled, setTouchEnabled } = useAppState();

  const handleCommand = (text: string) => {
    const command = text.toLowerCase();
    if (command.includes('uber') || command.includes('option a')) {
      handleUberChoice();
    } else if (command.includes('bus') || command.includes('option b')) {
      speak('Bus routes are being calculated.');
    } else if (command.includes('walk') || command.includes('car') || command.includes('option c')) {
      speak('Walking or driving directions will be shown.');
    } else if (command.includes('activate touch')) {
      setTouchEnabled(true);
      speak('Touch screen activated.');
    } else if (command.includes('deactivate touch')) {
      setTouchEnabled(false);
      speak('Touch screen deactivated.');
    } else if (command.includes('back') || command.includes('home')) {
      router.push('/');
    }
  };

  const restartPrompt = () => {
    speak('Options are: A, Uber. B, Bus. C, Walk or Car. Say your choice.');
  };

  const { isListening, startListening, stopListening } = useVoiceControl(
    handleCommand,
    () => {
      console.log('User started speaking, interrupting...');
      stopSpeaking();
    },
    () => {
      console.log('Mic stopped without command, restarting prompt.');
      restartPrompt();
    }
  );

  useEffect(() => {
    speak('Options are: A, Uber. B, Bus. C, Walk or Car. Say your choice.');
    
    const interval = setInterval(() => {
      if (!isListening) {
        speak('Please choose Uber, Bus, or Walk.');
      }
    }, 20000); // Updated to 20s
    
    return () => {
      clearInterval(interval);
      stopSpeaking();
    };
  }, [isListening]);

  const handleUberChoice = async () => {
    const message = "Confirm: Would you like to call a single-person Uber to the restaurant to arrive 5 to 10 minutes before your reservation?";
    await speak(message);
    
    Alert.alert(
      "Confirm Uber",
      message,
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Book Uber", 
          onPress: () => {
             speak("Booking your Uber now using your saved credit card. It will arrive shortly.");
             // Integration with Uber API would go here
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transportation</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity 
          style={[styles.fullWidthButton, { backgroundColor: COLORS.uber }]} 
          onPress={handleUberChoice}
        >
          <Car size={40} color="white" />
          <Text style={styles.buttonLabel}>A: Uber</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.fullWidthButton, { backgroundColor: COLORS.bus }]}
          onPress={() => speak("Bus routes are being calculated.")}
        >
          <Bus size={40} color="white" />
          <Text style={styles.buttonLabel}>B: Bus</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.fullWidthButton, { backgroundColor: COLORS.walk }]}
          onPress={() => speak("Walking or driving directions will be shown.")}
        >
          <Footprints size={40} color="white" />
          <Text style={styles.buttonLabel}>C: Walk/Car</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.smallButton} onPress={() => touchEnabled && router.back()}>
          <ChevronLeft size={30} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.largeMicButton, isListening && { backgroundColor: '#EA4335' }]}
          onPress={isListening ? stopListening : startListening}
        >
          <Mic size={40} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallButton} onPress={() => touchEnabled && router.push('/')}>
          <Home size={30} color="#333" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  grid: {
    flex: 1,
    gap: 20,
    paddingTop: 30,
  },
  fullWidthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 30,
    borderRadius: 30,
    gap: 20,
    elevation: 5,
  },
  buttonLabel: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingBottom: 50,
    gap: 30,
  },
  largeMicButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  smallButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 3,
  },
});
