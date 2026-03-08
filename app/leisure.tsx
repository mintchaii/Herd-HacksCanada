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
  letter: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ letter, label, icon, color, onPress }) => (
  <TouchableOpacity 
    style={[styles.menuButton, { backgroundColor: color }]} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.iconContainer}>
      {icon}
    </View>
    <Text style={styles.letterText}>{letter}</Text>
    <Text style={styles.labelButtonText}>{label}</Text>
  </TouchableOpacity>
);

export default function LeisureMenu() {
  const router = useRouter();
  const { touchEnabled, setTouchEnabled } = useAppState();

  const handleCommand = (text: string) => {
    const command = text.toLowerCase();
    if (command.includes('connect') || command.includes('option a')) {
      speak('Connecting you with others.');
    } else if (command.includes('destination') || command.includes('option b')) {
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

  const { isListening, startListening, stopListening } = useVoiceControl(
    handleCommand,
    () => {
      console.log('User started speaking, interrupting...');
      stopSpeaking();
    }
  );

  useEffect(() => {
    speak('Leisure Menu. Options are: A, Connect. B, Destinations. Say your choice or use the blue button.');
    
    const interval = setInterval(() => {
      if (!isListening) {
        speak('Please choose Connect or Destinations.');
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
            letter="A" 
            label="Connect" 
            icon={<Users size={40} color="white" />} 
            color={COLORS.connect}
            onPress={() => console.log('Connect pressed')}
          />
          <MenuButton 
            letter="B" 
            label="Destinations" 
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
    paddingTop: 40,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 20,
    height: width * 0.45,
  },
  menuButton: {
    flex: 1,
    borderRadius: 30,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  letterText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 5,
  },
  labelButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
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
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
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
