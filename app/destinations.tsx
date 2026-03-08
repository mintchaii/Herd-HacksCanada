import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Mic, ChevronLeft, Home } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function DestinationsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
        
        <View style={styles.overlay}>
           <View style={styles.speechBubble}>
             <Text style={styles.speechText}>Where do you want to go?</Text>
           </View>
        </View>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.smallButton} onPress={() => router.back()}>
          <ChevronLeft size={30} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.largeMicButton}>
          <Mic size={40} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallButton} onPress={() => router.push('/')}>
          <Home size={30} color="#333" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F0',
  },
  mapContainer: {
    flex: 1,
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#eee',
    elevation: 5,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  speechBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  speechText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingBottom: 40,
    gap: 30,
  },
  largeMicButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#4285F4',
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
