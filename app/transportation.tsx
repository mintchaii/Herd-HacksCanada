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

  const mainPrompt = 'Which transport would you like? Options are: Uber, Bus, or Walk. Speak your choice.';

  const handleCommand = (text: string) => {
    const command = text.toLowerCase();
    if (command.includes('uber')) {
      handleUberChoice();
    } else if (command.includes('bus')) {
      speak('Bus routes are being calculated.');
    } else if (command.includes('walk') || command.includes('car')) {
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
    speak(mainPrompt);
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
    speak(mainPrompt);
    
    const interval = setInterval(() => {
      if (!isListening) {
        speak('Please choose Uber, Bus, or Walk.');
      }
    }, 20000);
    
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
          <Car size={50} color="white" />
          <Text style={styles.buttonLabel}>Uber</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.fullWidthButton, { backgroundColor: COLORS.bus }]}
          onPress={() => speak("Bus routes are being calculated.")}
        >
          <Bus size={50} color="white" />
          <Text style={styles.buttonLabel}>Bus</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.fullWidthButton, { backgroundColor: COLORS.walk }]}
          onPress={() => speak("Walking or driving directions will be shown.")}
        >
          <Footprints size={50} color="white" />
          <Text style={styles.buttonLabel}>Walk/Car</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.smallButton} onPress={() => touchEnabled && router.back()}>
          <ChevronLeft size={40} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.largeMicButton, isListening && { backgroundColor: '#EA4335' }]}
          onPress={isListening ? stopListening : startListening}
        >
          <Mic size={60} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallButton} onPress={() => touchEnabled && router.push('/')}>
          <Home size={40} color="#333" />
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
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  grid: {
    flex: 1,
    gap: 25,
    paddingTop: 30,
    justifyContent: 'center',
  },
  fullWidthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 35,
    borderRadius: 40,
    gap: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  buttonLabel: {
    color: 'white',
    fontSize: 32,
    fontWeight: '800',
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
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 15,
    shadowColor: COLORS.blue,
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
