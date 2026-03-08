import { useAppState } from '@/hooks/useAppState';
import { speak, stopSpeaking } from '@/hooks/useSpeech';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Car, ChevronLeft, Clock, Home, MapPin, Mic, Phone, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const UW_COORDS = {
  latitude: 43.4723,
  longitude: -80.5449,
};
const REGIONAL_RADIUS = 25000; // 25 km
const DEFAULT_RADIUS = 1500; // 1.5 km

// Using the key from environment or app.js config
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAgVvn36Hu7ARvmF8hc1zUb5oqgNghGT1c';

interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'restaurant' | 'grocery' | 'pharmacy';
  address?: string;
  phone?: string;
  hours?: string[];
}

const MOCK_PLACES: Place[] = [
  {
    id: '1',
    name: 'Eastside Marios',
    latitude: 43.4745,
    longitude: -80.5228,
    type: 'restaurant',
    address: '450 King St N, Waterloo, ON N2J 2Z6',
    phone: '519-886-3000',
    hours: ['Monday - Sunday: 11:00 AM - 11:00 PM'],
  },
  {
    id: '2',
    name: 'University Grill',
    latitude: 43.4720,
    longitude: -80.5440,
    type: 'restaurant',
    address: '200 University Ave W, Waterloo, ON',
    phone: '519-555-0101',
  },
  {
    id: '3',
    name: 'Shoppers Drug Mart',
    latitude: 43.4760,
    longitude: -80.5240,
    type: 'pharmacy',
    address: 'Conestoga Mall, Waterloo, ON',
    phone: '519-555-0102',
  },
  {
    id: '4',
    name: 'Sobeys Columbia',
    latitude: 43.4800,
    longitude: -80.5400,
    type: 'grocery',
    address: 'Northfield Dr W, Waterloo, ON',
    phone: '519-555-0103',
  },
  {
    id: '5',
    name: 'Waterloo Pharmacy',
    latitude: 43.4680,
    longitude: -80.5200,
    type: 'pharmacy',
    address: 'King St S, Waterloo, ON',
  },
  {
    id: '6',
    name: 'Zehrs Beechwood',
    latitude: 43.4600,
    longitude: -80.5550,
    type: 'grocery',
    address: 'Fischer-Hallman Rd, Waterloo, ON',
  }
];

export default function DestinationsScreen() {
  const router = useRouter();
  const { touchEnabled } = useAppState();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>(MOCK_PLACES);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const mapRef = useRef<MapView>(null);

  const mainPrompt = 'I have loaded restaurants, grocery stores, and pharmacies in the Waterloo region. You can tap a pin to see details. Eastside Marios is located on King Street.';

  const handleCommand = (text: string) => {
    const command = text.toLowerCase().trim();
    console.log('Voice Command:', command);

    if (command.includes('phone') || command.includes('call') || command.includes('transportation')) {
      if (selectedPlace) {
        handleCallRequest();
      } else {
        speak('Please select a place on the map first.');
      }
    } else if (command.includes('eastside') || command.includes('mario')) {
      const em = MOCK_PLACES.find(p => p.name.includes('Eastside'));
      if (em) handleMarkerPress(em);
    } else if (command.includes('direction')) {
      handleDirections();
    } else if (command.includes('back')) {
      router.back();
    } else if (command.includes('home')) {
      router.push('/');
    }
  };

  const handleDirections = () => {
    speak('Centering map on the University of Waterloo hub.');
    
    const region = {
      ...UW_COORDS,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
    
    mapRef.current?.animateToRegion(region, 1000);
  };

  const restartPrompt = () => {
    speak(mainPrompt);
  };

  const { isListening, startListening, stopListening } = useVoiceControl(
    handleCommand,
    () => stopSpeaking(),
    () => restartPrompt()
  );

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        // Fallback to UW if no permission
        setLocation({
          coords: { ...UW_COORDS, accuracy: 1, altitude: 1, altitudeAccuracy: 1, heading: 1, speed: 1 },
          timestamp: Date.now()
        } as any);
      } else {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      }
      setLoading(false);
    })();

    speak(mainPrompt);
    
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleMarkerPress = (place: Place) => {
    setSelectedPlace(place);
    setShowModal(true);
    
    let detailMsg = `${place.name}. `;
    if (place.address) detailMsg += `Address: ${place.address}. `;
    if (place.phone) detailMsg += `Phone Number: ${place.phone}. `;
    if (place.hours) detailMsg += `Business Hours: ${place.hours[0]}. `;
    detailMsg += "Would you like to see transportation options?";
    
    speak(detailMsg);
  };

  const handleCallRequest = () => {
    if (selectedPlace) {
      speak(`Opening transportation options for ${selectedPlace.name}.`);
      setShowModal(false);
      router.push('/transportation');
    }
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'restaurant': return '#800080'; // Purple
      case 'pharmacy': return '#FFA500'; // Orange
      case 'grocery': return '#FFFF00'; // Yellow
      default: return '#FBBC05';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Locating nearby services...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        {mapError ? (
          <View style={styles.errorContainer}>
            <X size={50} color="#EA4335" />
            <Text style={styles.errorText}>Failed to load map. Please check your connection.</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => setMapError(false)}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : location && (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            onMapReady={() => setMapReady(true)}
            {...({
              onError: (e: any) => {
                console.log('Map error:', e);
                setMapError(true);
              }
            } as any)}
            initialRegion={{
              latitude: location?.coords?.latitude ?? 43.6532,
              longitude: location?.coords?.longitude ?? -79.3832,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            {mapReady && (
              <>
                <Marker
                  key="user-location"
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title="You are here"
                  pinColor="#000"
                />
                {places.map((place) => (
                  <Marker
                    key={`place-${place.id}`}
                    coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                    title={place.name}
                    pinColor={getMarkerColor(place.type)}
                    onPress={() => handleMarkerPress(place)}
                  />
                ))}
              </>
            )}
          </MapView>
        )}
        
        {mapReady && (
          <TouchableOpacity 
            style={styles.directionsButton} 
            onPress={handleDirections}
          >
            <MapPin size={28} color="white" />
            <Text style={styles.directionsButtonText}>Waterloo Hub</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.smallButton} onPress={() => router.back()}>
          <ChevronLeft size={40} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.largeMicButton, isListening && { backgroundColor: '#EA4335' }]}
          onPress={isListening ? stopListening : startListening}
        >
          <Mic size={60} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallButton} onPress={() => router.push('/')}>
          <Home size={40} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Modal moved to end of hierarchy */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
              <X size={24} color="#666" />
            </TouchableOpacity>

            {selectedPlace && (
              <>
                <Text style={styles.placeName}>{selectedPlace.name}</Text>

                <View style={styles.infoRow}>
                  <MapPin size={20} color="#666" />
                  <Text style={styles.infoText}>{selectedPlace.address}</Text>
                </View>

                {selectedPlace.phone && (
                  <View style={styles.infoRow}>
                    <Phone size={20} color="#666" />
                    <Text style={styles.infoText}>{selectedPlace.phone}</Text>
                  </View>
                )}

                {selectedPlace.hours && (
                  <View style={styles.hoursContainer}>
                    <View style={styles.infoRow}>
                      <Clock size={20} color="#666" />
                      <Text style={styles.infoText}>Opening Hours:</Text>
                    </View>
                    {selectedPlace.hours.map((day, index) => (
                      <Text key={index} style={styles.hourLine}>{day}</Text>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.requestButton}
                  onPress={handleCallRequest}
                >
                  <Car size={24} color="white" />
                  <Text style={styles.requestButtonText}>Transportation</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#666',
  },
  mapContainer: {
    flex: 1,
    marginTop: 10,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    elevation: 8,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    marginTop: 15,
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    minHeight: height * 0.5,
  },
  closeButton: {
    position: 'absolute',
    right: 30,
    top: 30,
    zIndex: 1,
  },
  placeName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    paddingRight: 40,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 18,
    color: '#444',
    flex: 1,
  },
  hoursContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  hourLine: {
    fontSize: 16,
    color: '#666',
    marginLeft: 35,
    marginBottom: 2,
  },
  requestButton: {
    backgroundColor: '#4285F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
    borderRadius: 30,
    gap: 15,
    elevation: 5,
  },
  requestButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  directionsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#34A853',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  directionsButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 15,
    shadowColor: '#4285F4',
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
