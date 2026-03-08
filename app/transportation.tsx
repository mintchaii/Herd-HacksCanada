import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Platform, Alert } from 'react-native';
import { Car, Bus, Footprints, Mic, ChevronLeft, Home } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { speak, stopSpeaking } from '@/hooks/useSpeech';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import { useAppState } from '@/hooks/useAppState';

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
  const { touchEnabled } = useAppState();

  const mainPrompt = 'Transportation options: Uber, Bus, and Car or Walk. Please choose one.';

  const handleCommand = (text: string) => {
    const command = text.toLowerCase();
    if (command.includes('uber')) {
      handleUberChoice();
    } else if (command.includes('bus')) {
      handleBusChoice();
    } else if (command.includes('walk') || command.includes('car') || command.includes('drive')) {
      handleWalkChoice();
    } else if (command.includes('back')) {
      router.back();
    } else if (command.includes('home')) {
      router.push('/');
    }
  };

  const restartPrompt = () => {
    speak(mainPrompt);
  };

  const { isListening, startListening, stopListening } = useVoiceControl(
    handleCommand,
    () => {
      stopSpeaking();
    },
    () => {
      restartPrompt();
    }
  );

  useEffect(() => {
    speak(mainPrompt);
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleUberChoice = () => {
    const message = "Uber: Confirming a single-person Uber to Eastside Marios. It will arrive in 5 minutes.";
    speak(message);
    Alert.alert("Confirm Uber", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Book Uber", onPress: () => speak("Booking your Uber now.") }
    ]);
  };

  const handleBusChoice = () => {
    speak("Bus: The next bus 202 Express departs in 8 minutes from University Avenue.");
  };

  const handleWalkChoice = () => {
    speak("Car and Walk: Driving takes 6 minutes. Walking takes 25 minutes via King Street.");
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
          onPress={handleBusChoice}
        >
          <Bus size={50} color="white" />
          <Text style={styles.buttonLabel}>Bus</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.fullWidthButton, { backgroundColor: COLORS.walk }]}
          onPress={handleWalkChoice}
        >
          <Footprints size={50} color="white" />
          <Text style={styles.buttonLabel}>Car/Walk</Text>
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  grid: {
    flex: 1,
    gap: 25,
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
    fontSize: 36,
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
