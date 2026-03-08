import { useAppState } from '@/hooks/useAppState';
import { speak, stopSpeaking } from '@/hooks/useSpeech';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { ChevronLeft, Clock, Home, MapPin, Mic, Phone, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

// Using the key from app.json
const GOOGLE_MAPS_API_KEY = 'AIzaSyAgVvn36Hu7ARvmF8hc1zUb5oqgNghGT1c';

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

import { makeCall } from '@/utils/blandAI';

export default function DestinationsScreen() {
  const router = useRouter();
  const { touchEnabled } = useAppState();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const mapRef = useRef<MapView>(null);

  const mainPrompt = 'I have loaded nearby restaurants, grocery stores, and pharmacies on the map. You can tap a pin to see details or say call to request a reservation.';

  const handleCommand = (text: string) => {
    const command = text.toLowerCase().trim();
    console.log('Voice Command:', command);

    if (command.includes('call') || command.includes('request')) {
      if (selectedPlace) {
        handleCallRequest();
      } else {
        speak('Please select a place on the map first.');
      }
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
    () => stopSpeaking(),
    () => restartPrompt()
  );

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      fetchNearbyPlaces(location.coords.latitude, location.coords.longitude);
    })();

    speak(mainPrompt);
    
    return () => {
      stopSpeaking();
    };
  }, []);

  const fetchNearbyPlaces = async (lat: number, lng: number) => {
    try {
      const types = ['restaurant', 'grocery_or_supermarket', 'pharmacy'];
      const allPlaces: Place[] = [];

      for (const type of types) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=${type}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();

        if (data.results) {
          data.results.slice(0, 5).forEach((item: any) => {
            allPlaces.push({
              id: item.place_id,
              name: item.name,
              latitude: item.geometry.location.lat,
              longitude: item.geometry.location.lng,
              type: type === 'restaurant' ? 'restaurant' : type === 'pharmacy' ? 'pharmacy' : 'grocery',
              address: item.vicinity
            });
          });
        }
      }
      setPlaces(allPlaces);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching places:', error);
      setLoading(false);
    }
  };

  const handleMarkerPress = async (place: Place) => {
    setSelectedPlace(place);
    setDetailsLoading(true);
    setShowModal(true);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.id}&fields=formatted_phone_number,opening_hours,formatted_address&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.result) {
        const updatedPlace = {
          ...place,
          phone: data.result.formatted_phone_number,
          address: data.result.formatted_address,
          hours: data.result.opening_hours?.weekday_text
        };
        setSelectedPlace(updatedPlace);
        speak(`${place.name}. Located at ${updatedPlace.address}. Would you like to request a call?`);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCallRequest = async () => {
    if (selectedPlace?.phone) {
      speak(`Calling ${selectedPlace.name} on your behalf.`);
      
      try {
        await makeCall(
          selectedPlace.phone,
          `I am calling to make a reservation or inquiry at ${selectedPlace.name}. Please help the customer with their request.`,
          'the user'
        );
        speak('Call has been placed successfully!');
      } catch (error) {
        speak('Sorry, I was unable to place the call. Please try again.');
      }
      
      setShowModal(false);
    } else {
      speak('Sorry, I do not have a phone number for this location.');
    }
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'restaurant': return '#4285F4'; // Blue
      case 'grocery': return '#34A853'; // Green
      case 'pharmacy': return '#EA4335'; // Red
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
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            {mapReady && (
              <>
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title="You are here"
                  pinColor="#000"
                />
                {places.map(place => (
                  <Marker
                    key={place.id}
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

            {detailsLoading ? (
              <ActivityIndicator size="large" color="#4285F4" />
            ) : selectedPlace && (
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
                  <Phone size={24} color="white" />
                  <Text style={styles.requestButtonText}>Request Call</Text>
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
