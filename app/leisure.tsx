import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Platform, Modal, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Users, Map, Mic, ChevronLeft, Home, Phone, MessageSquare, Send, CheckCircle2, RotateCcw, X as CloseIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import { speak, stopSpeaking } from '@/hooks/useSpeech';
import { useAppState } from '@/hooks/useAppState';
import { makeCall, getCallDetails } from '@/utils/blandAI';

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

  // Connect Modal States
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callTask, setCallTask] = useState('');
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'completed' | 'error'>('idle');
  const [callId, setCallId] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const mainPrompt = 'You have chosen the Leisure option. Would you like to connect with your neighbours or choose a destination?';

  const handleCommand = (text: string) => {
    const command = text.toLowerCase();
    
    if (showConnectModal) {
      if (command.includes('call') || command.includes('number')) {
        const digits = text.replace(/\D/g, '');
        if (digits.length >= 10) {
          setPhoneNumber(digits);
          speak(`Setting phone number to ${digits.split('').join(' ')}. Now, what would you like me to ask them?`);
        }
      } else if (command.includes('ask') || command.includes('task')) {
        const taskText = text.split(/ask|task/i)[1]?.trim();
        if (taskText) {
          setCallTask(taskText);
          speak(`Got it. I will ask: ${taskText}. Should I start the call now?`);
        }
      } else if (command.includes('start') || command.includes('yes') || command.includes('confirm')) {
        handleStartCall();
      } else if (command.includes('close') || command.includes('cancel')) {
        setShowConnectModal(false);
      }
      return;
    }

    if (command.includes('connect') || command.includes('neighbor')) {
      setShowConnectModal(true);
      speak('Opening call connection. Please provide a phone number and tell me what you would like to ask.');
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

  const handleStartCall = async () => {
    if (!phoneNumber || !callTask) {
      speak('Please provide both a phone number and a question before starting the call.');
      return;
    }

    setCallStatus('calling');
    speak(`Initiating AI call to ${phoneNumber}. I will summarize the discussion for you shortly.`);

    try {
      const data = await makeCall(phoneNumber, callTask, 'User');
      if (data.call_id) {
        setCallId(data.call_id);
        // Start polling for summary after a delay
        setTimeout(() => pollForSummary(data.call_id), 15000);
      }
    } catch (error) {
      setCallStatus('error');
      speak('Sorry, there was an error starting the call. Please try again.');
    }
  };

  const pollForSummary = async (id: string) => {
    setLoadingSummary(true);
    try {
      const details = await getCallDetails(id);
      if (details.status === 'completed' || details.summary) {
        setSummary(details.summary || 'The call was completed, but no summary was generated.');
        setCallStatus('completed');
        speak('The call is finished. I have received a summary of the discussion.');
      } else {
        // Continue polling if not done
        setTimeout(() => pollForSummary(id), 10000);
      }
    } catch (error) {
      console.error('Error polling for summary:', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const resetModal = () => {
    setPhoneNumber('');
    setCallTask('');
    setCallStatus('idle');
    setCallId(null);
    setSummary(null);
  };

  const restartPrompt = () => {
    if (showConnectModal) {
      if (!phoneNumber) speak('Please tell me the phone number you would like to call.');
      else if (!callTask) speak('What would you like me to ask the person I am calling?');
      else if (callStatus === 'idle') speak('Say start call or confirm to begin.');
    } else {
      speak(mainPrompt);
    }
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
    if (!showConnectModal) {
      speak(mainPrompt);
    }
    
    const interval = setInterval(() => {
      if (!isListening && !showConnectModal) {
        speak(mainPrompt);
      }
    }, 10000);
    
    return () => {
      clearInterval(interval);
      stopSpeaking();
    };
  }, [isListening, showConnectModal]);

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
            onPress={() => {
              setShowConnectModal(true);
              speak('Opening call connection. Please provide a phone number and tell me what you would like to ask.');
            }}
          />
          <MenuButton 
            label="Choose a Destination" 
            icon={<Map size={40} color="white" />} 
            color={COLORS.destinations}
            onPress={() => router.push('/destinations')}
          />
        </View>
      </View>

      <Modal
        visible={showConnectModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConnectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>AI Connect</Text>
              <TouchableOpacity onPress={() => setShowConnectModal(false)}>
                <CloseIcon size={30} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              {callStatus === 'idle' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <View style={styles.inputWrapper}>
                      <Phone size={24} color={COLORS.connect} />
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. 5550123"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>What to ask?</Text>
                    <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingTop: 12 }]}>
                      <MessageSquare size={24} color={COLORS.connect} style={{ marginTop: 2 }} />
                      <TextInput
                        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                        placeholder="e.g. Ask if they want to play bridge tomorrow"
                        value={callTask}
                        onChangeText={setCallTask}
                        multiline
                      />
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.actionButton, (!phoneNumber || !callTask) && { opacity: 0.5 }]}
                    onPress={handleStartCall}
                    disabled={!phoneNumber || !callTask}
                  >
                    <Send size={24} color="white" />
                    <Text style={styles.actionButtonText}>Start AI Call</Text>
                  </TouchableOpacity>
                </>
              )}

              {callStatus === 'calling' && (
                <View style={styles.statusView}>
                  <ActivityIndicator size="large" color={COLORS.connect} />
                  <Text style={styles.statusTitle}>AI is Calling...</Text>
                  <Text style={styles.statusDescription}>
                    Calling {phoneNumber} to ask: "{callTask}"
                  </Text>
                  <Text style={styles.statusSubtext}>
                    Please wait. We will provide a summary of the discussion shortly.
                  </Text>
                </View>
              )}

              {callStatus === 'completed' && (
                <View style={styles.statusView}>
                  <CheckCircle2 size={60} color="#4CAF50" />
                  <Text style={styles.statusTitle}>Call Completed</Text>
                  
                  <View style={styles.summaryContainer}>
                    <Text style={styles.summaryLabel}>Discussion Summary:</Text>
                    {loadingSummary ? (
                      <ActivityIndicator size="small" color={COLORS.connect} />
                    ) : (
                      <Text style={styles.summaryText}>{summary}</Text>
                    )}
                  </View>

                  <TouchableOpacity style={styles.retryButton} onPress={resetModal}>
                    <RotateCcw size={20} color="white" />
                    <Text style={styles.retryButtonText}>New Call</Text>
                  </TouchableOpacity>
                </View>
              )}

              {callStatus === 'error' && (
                <View style={styles.statusView}>
                  <CloseIcon size={60} color={COLORS.destinations} />
                  <Text style={styles.statusTitle}>Call Failed</Text>
                  <Text style={styles.statusDescription}>Something went wrong while initiating the call.</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={() => setCallStatus('idle')}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
    height: width * 0.55, 
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    paddingBottom: 50,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  modalScroll: {
    gap: 20,
  },
  inputGroup: {
    gap: 10,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    borderWidth: 1.5,
    borderColor: '#EEE',
    gap: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 18,
    color: '#333',
  },
  actionButton: {
    backgroundColor: COLORS.connect,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 25,
    gap: 12,
    marginTop: 10,
    elevation: 4,
    shadowColor: COLORS.connect,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 20,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  statusDescription: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  statusSubtext: {
    fontSize: 16,
    color: COLORS.connect,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  summaryContainer: {
    backgroundColor: '#F0F7FF',
    borderRadius: 25,
    padding: 20,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#D0E6FF',
    gap: 10,
  },
  summaryLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.connect,
  },
  summaryText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 26,
  },
  retryButton: {
    backgroundColor: '#666',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 20,
    gap: 10,
    marginTop: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
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
