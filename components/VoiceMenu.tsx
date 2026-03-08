import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Platform, StatusBar } from 'react-native';
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

export default function VoiceMenu() {
  const router = useRouter();
  const { touchEnabled, setTouchEnabled } = useAppState();
  const [showTouchPopup, setShowTouchPopup] = useState(false);
  
  const mainPrompt = 'What would you like to do today? Your options are: Leisure, Technology Support, Errands, or Favourites. Tap the blue button or speak your choice.';

  const handleCommand = (text: string) => {
    const command = text.toLowerCase().trim();
    console.log('Voice Command:', command);

    const isOptionA = command.includes('leisure');
    const isOptionB = command.includes('support') || command.includes('technology');
    const isOptionC = command.includes('errands');
    const isOptionD = command.includes('favourites') || command.includes('favorites');

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

  const restartPrompt = () => {
    console.log('Restarting prompt...');
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
        speak('Please choose an option: Leisure, Support, Errands, or Favourites. Or say Activate touch features.');
      }
    }, 20000);
    
    return () => {
      clearInterval(interval);
      stopSpeaking();
    };
  }, [isListening]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TouchTogglePopup visible={showTouchPopup} onClose={() => setShowTouchPopup(false)} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gramco</Text>
      </View>

      <View style={[styles.grid, !touchEnabled && { opacity: 0.8 }]}>
        <View style={styles.row}>
          <MenuButton 
            label="Leisure" 
            icon={<MapPin size={40} color="#333" />} 
            color={COLORS.leisure}
            onPress={() => router.push('/leisure')}
          />
          <MenuButton 
            label="Technology Support" 
            icon={<Smartphone size={40} color="#333" />} 
            color={COLORS.techSupport}
            onPress={() => console.log('Tech Support pressed')}
          />
        </View>
        <View style={styles.row}>
          <MenuButton 
            label="Errands" 
            icon={<ShoppingCart size={40} color="#333" />} 
            color={COLORS.errands}
            onPress={() => console.log('Errands pressed')}
          />
          <MenuButton 
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
  grid: {
    flex: 1,
    paddingTop: 5,
    gap: 12,
    marginTop: 15,
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 5,
  },
  headerTitle: {
    fontSize: 52,
    fontWeight: '900',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -1,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
    flex: 0.38, // Increased to make buttons bigger
  },
  menuButton: {
    flex: 1,
    borderRadius: 35,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 20,
    borderRadius: 25,
    marginBottom: 15,
  },
  labelButtonText: {
    fontSize: 22, // Increased font size
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 28,
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
    width: 150, // 1.5x size
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
});
