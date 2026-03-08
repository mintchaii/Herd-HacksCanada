import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useAppState } from '@/hooks/useAppState';
import { Power, PowerOff, X } from 'lucide-react-native';

export const TouchTogglePopup = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const { touchEnabled, setTouchEnabled } = useAppState();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <X size={24} color="#666" />
          </TouchableOpacity>
          
          <Text style={styles.title}>Touch Controls</Text>
          <Text style={styles.status}>
            Currently: <Text style={{ color: touchEnabled ? '#34A853' : '#EA4335', fontWeight: 'bold' }}>
              {touchEnabled ? 'ON' : 'OFF'}
            </Text>
          </Text>

          <TouchableOpacity 
            style={[styles.toggleButton, { backgroundColor: touchEnabled ? '#EA4335' : '#34A853' }]}
            onPress={() => setTouchEnabled(!touchEnabled)}
          >
            {touchEnabled ? <PowerOff color="white" size={30} /> : <Power color="white" size={30} />}
            <Text style={styles.buttonText}>
              {touchEnabled ? 'Turn OFF Touch' : 'Turn ON Touch'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.hint}>You can also say "Activate touch" or "Deactivate touch"</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
  },
  close: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  status: {
    fontSize: 18,
    marginBottom: 30,
    color: '#666',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 20,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  }
});
