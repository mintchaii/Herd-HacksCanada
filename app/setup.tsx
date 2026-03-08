import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { speak, stopSpeaking } from '@/hooks/useSpeech';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import { useAppState } from '@/hooks/useAppState';
import { Mic, CheckCircle, ChevronRight, XCircle } from 'lucide-react-native';

const STEPS = [
  { key: 'firstName', label: 'First Name', prompt: 'What is your first name?' },
  { key: 'lastName', label: 'Last Name', prompt: 'What is your last name?' },
  { key: 'phoneNumber', label: 'Phone Number', prompt: 'What is your phone number?' },
  { key: 'email', label: 'Email', prompt: 'What is your email address?' },
  // ... more steps for CC and Health can be added
];
export default function SetupScreen() {
  const { touchEnabled, setTouchEnabled } = useAppState();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [inputValue, setInputValue] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const handleCommand = (text: string) => {
    const command = text.toLowerCase();
    
    if (command.includes('activate touch')) {
      setTouchEnabled(true);
      speak('Touch screen activated.');
      return;
    } else if (command.includes('deactivate touch')) {
      setTouchEnabled(false);
      speak('Touch screen deactivated.');
      return;
    }

    if (isConfirming) {
      if (command.includes('yes') || command.includes('confirm') || command.includes('correct')) {
        confirmStep();
      } else if (command.includes('no') || command.includes('change') || command.includes('wrong')) {
        setIsConfirming(false);
        speak(`Okay, please say or spell your ${STEPS[currentStep].label} again.`);
      }
    } else {
      // Process input (could be spelling)
      const processedInput = command.replace(/\s/g, ''); // Simplistic spelling handling
      setInputValue(processedInput);
    }
  };

  const restartPrompt = () => {
    speak(STEPS[currentStep].prompt);
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
    startStep();
    
    const interval = setInterval(() => {
      if (!isListening && !isConfirming) {
        speak(`Still waiting for your ${STEPS[currentStep].label}. ${STEPS[currentStep].prompt}`);
      }
    }, 20000);

    return () => {
      clearInterval(interval);
      stopSpeaking();
    };
  }, [currentStep, isListening, isConfirming]);

  const startStep = async () => {
    const step = STEPS[currentStep];
    if (step) {
      await speak(step.prompt);
    }
  };

  const handleNext = () => {
    if (!inputValue) return;
    setIsConfirming(true);
    speak(`${inputValue}. Is this correct? Say yes to confirm or no to change.`);
  };

  const confirmStep = () => {
    const newData = { ...formData, [STEPS[currentStep].key]: inputValue };
    setFormData(newData);
    speak(`Action taken: Stored ${inputValue} as ${STEPS[currentStep].label}.`);
    setIsConfirming(false);
    setInputValue('');
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      speak("Thank you. Initial setup is complete. Your profile has been stored.");
      // save to backend here
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={styles.progress}>
          <Text style={styles.stepText}>Step {currentStep + 1} of {STEPS.length}</Text>
        </View>

        <Text style={styles.prompt}>{STEPS[currentStep]?.prompt}</Text>

        {!isConfirming ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, !touchEnabled && { backgroundColor: '#eee' }]}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Type or speak..."
              placeholderTextColor="#999"
              editable={touchEnabled}
              autoFocus
            />
            <TouchableOpacity 
              style={[styles.nextButton, !touchEnabled && { opacity: 0.5 }]} 
              onPress={handleNext}
              disabled={!touchEnabled && !isListening} // Allow voice if listening
            >
              <ChevronRight color="white" size={30} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.confirmContainer}>
            <Text style={styles.confirmText}>You said: {inputValue}</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity style={styles.confirmButton} onPress={confirmStep}>
                <CheckCircle color="white" size={24} />
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmButton, { backgroundColor: '#EA4335' }]} onPress={() => setIsConfirming(false)}>
                <XCircle color="white" size={24} />
                <Text style={styles.buttonText}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.micContainer}>
           <TouchableOpacity 
             style={[styles.largeMicButton, isListening && { backgroundColor: '#EA4335' }]}
             onPress={isListening ? stopListening : startListening}
           >
              <Mic size={40} color="white" />
           </TouchableOpacity>
           <Text style={styles.micHint}>{isListening ? 'Listening...' : 'Tap help button to speak'}</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F0',
  },
  inner: {
    flex: 1,
    padding: 30,
    justifyContent: 'space-between',
  },
  progress: {
    alignItems: 'center',
    marginBottom: 40,
  },
  stepText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  prompt: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    height: 70,
    borderRadius: 20,
    paddingHorizontal: 20,
    fontSize: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  nextButton: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  confirmContainer: {
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 24,
    color: '#333',
    marginBottom: 30,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#34A853',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 15,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  micContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  largeMicButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    marginBottom: 10,
  },
  micHint: {
    color: '#666',
    fontSize: 16,
  }
});
