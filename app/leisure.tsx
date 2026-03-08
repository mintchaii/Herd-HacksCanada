import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Platform } from 'react-native';
import { Users, Map, Mic, ChevronLeft, Home } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import { speak, stopSpeaking } from '@/hooks/useSpeech';
import { useAppState } from '@/hooks/useAppState';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');

const COLORS = {
  connect: '#4285F4', // Blue
  destinations: '#EA4335', // Red/Pinkish
  blue: '#4285F4',
  background: '#FFF9F0',
};

interface MenuButtonProps {
  label: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ label, icon, color, onPress }) => (
  <TouchableOpacity 
    style={[styles.menuButton, { backgroundColor: color }]} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.iconContainer}>
      {icon}
    </View>
    <Text style={styles.labelButtonText}>{label}</Text>
  </TouchableOpacity>
);

export default function LeisureMenu() {
  const router = useRouter();
  const { touchEnabled, setTouchEnabled } = useAppState();

  const mainPrompt = 'Would you like to connect to neighbours or choose a destination? Tap the blue button or speak your choice.';

  const handleCommand = (text: string) => {
    const command = text.toLowerCase();
    if (command.includes('connect') || command.includes('neighbor')) {
      speak('Connecting you with neighbours.');
    } else if (command.includes('destination') || command.includes('choose')) {
      speak('Where would you like to go? opening map.');
      router.push('/destinations');
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
        speak('Please choose to connect with neighbours or choose a destination.');
      }
    }, 20000);
    
    return () => {
      clearInterval(interval);
      stopSpeaking();
    };
  }, [isListening]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leisure</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.row}>
          <MenuButton 
            label="Connect with Neighbours" 
            icon={<Users size={40} color="white" />} 
            color={COLORS.connect}
            onPress={() => console.log('Connect pressed')}
          />
          <MenuButton 
            label="Choose a Destination" 
            icon={<Map size={40} color="white" />} 
            color={COLORS.destinations}
            onPress={() => router.push('/destinations')}
          />
        </View>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.smallButton} onPress={() => touchEnabled && router.back()}>
          <ChevronLeft size={30} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.largeMicButton, isListening && { backgroundColor: '#EA4335' }]}
          onPress={isListening ? stopListening : startListening}
        >
          <Mic size={60} color="white" />
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
    paddingTop: 20,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 20,
    height: width * 0.55, // Increased height
  },
  menuButton: {
    flex: 1,
    borderRadius: 35,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 20,
    borderRadius: 25,
    marginBottom: 15,
  },
  labelButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    lineHeight: 26,
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
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 15,
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
