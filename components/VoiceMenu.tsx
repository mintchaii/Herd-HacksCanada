import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Platform } from 'react-native';
import { MapPin, Smartphone, ShoppingCart, Star, Mic, ChevronLeft, Home } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import { speak, stopSpeaking } from '@/hooks/useSpeech';
import { useAppState } from '@/hooks/useAppState';
import { TouchTogglePopup } from './TouchTogglePopup';

const { width, height } = Dimensions.get('window');

const COLORS = {
  leisure: '#FDCC47', // Yellow
  techSupport: '#F398AC', // Pink
  errands: '#B19CD9', // Purple
  favourites: '#99C794', // Green
  blue: '#4285F4', // Large Button Blue
  background: '#FFF9F0', // Creamy Beige
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

export default function VoiceMenu() {
  const router = useRouter();
  const { touchEnabled, setTouchEnabled } = useAppState();
  const [showTouchPopup, setShowTouchPopup] = useState(false);
  const [lastPromptTime, setLastPromptTime] = useState(Date.now());

  const handleCommand = (text: string) => {
    const command = text.toLowerCase().trim();
    console.log('Voice Command:', command);

    // Improved recognition for letters and context
    const isOptionA = command === 'a' || command.includes('option a') || command.includes('say a') || command.includes('leisure');
    const isOptionB = command === 'b' || command.includes('option b') || command.includes('say b') || command.includes('support') || command.includes('technology');
    const isOptionC = command === 'c' || command.includes('option c') || command.includes('say c') || command.includes('errands');
    const isOptionD = command === 'd' || command.includes('option d') || command.includes('say d') || command.includes('favourites') || command.includes('favorites');

    if (command.includes('activate touch')) {
      setTouchEnabled(true);
      speak('Touch screen features activated.');
    } else if (command.includes('deactivate touch') || command.includes('turn off touch')) {
      setTouchEnabled(false);
      speak('Touch screen features deactivated.');
    } else if (isOptionA) {
      speak('Opening Leisure menu.');
      router.push('/leisure');
    } else if (isOptionB) {
      speak('Opening Technology Support.');
    } else if (isOptionC) {
      speak('Opening Errands.');
    } else if (isOptionD) {
      speak('Opening Favourites.');
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
    // Initial prompt updated
    speak('What would you like to do today? Options are: A, Leisure. B, Technology Support. C, Errands. D, Favourites. Tap the blue button or speak your choice.');
    
    const interval = setInterval(() => {
      if (!isListening) {
        speak('Please choose an option: Leisure, Support, Errands, or Favourites. Or say Activate touch features.');
      }
    }, 20000); // Updated to 20s as requested
    
    return () => {
      clearInterval(interval);
      stopSpeaking();
    };
  }, [isListening]);

  return (
    <SafeAreaView style={styles.container}>
      <TouchTogglePopup visible={showTouchPopup} onClose={() => setShowTouchPopup(false)} />
      
      {/* App Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gramco</Text>
      </View>

      <View style={[styles.grid, !touchEnabled && { opacity: 0.8 }]}>
        <View style={styles.row}>
          <MenuButton 
            letter="A" 
            label="Leisure" 
            icon={<MapPin size={40} color="#333" />} 
            color={COLORS.leisure}
            onPress={() => router.push('/leisure')}
          />
          <MenuButton 
            letter="B" 
            label="Technology Support" 
            icon={<Smartphone size={40} color="#333" />} 
            color={COLORS.techSupport}
            onPress={() => console.log('Tech Support pressed')}
          />
        </View>
        <View style={styles.row}>
          <MenuButton 
            letter="C" 
            label="Errands" 
            icon={<ShoppingCart size={40} color="#333" />} 
            color={COLORS.errands}
            onPress={() => console.log('Errands pressed')}
          />
          <MenuButton 
            letter="D" 
            label="Favourites" 
            icon={<Star size={40} color="#333" />} 
            color={COLORS.favourites}
            onPress={() => console.log('Favourites pressed')}
          />
        </View>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.smallButton} 
          onPress={() => touchEnabled && setShowTouchPopup(true)}
        >
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
  grid: {
    flex: 1,
    paddingTop: 0, // Removed top padding as header handles it
    gap: 20,
    marginTop: 20, // Push buttons down
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -1,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
    flex: 0.38, // Slightly reduced to fit header
  },
  menuButton: {
    flex: 1,
    borderRadius: 30,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 5,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  letterText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 5,
  },
  labelButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
});
