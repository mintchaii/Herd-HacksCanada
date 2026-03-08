import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';

const COLORS = {
  yellow: "#F5C842",
  pink:   "#F2A8C0",
  purple: "#B49CE0",
  green:  "#9BC49A",
  bg:     "#FFF9F0", // Using the project's background color
  dark:   "#1A1A1A",
};

interface LoadingScreenProps {
  onDone: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onDone }) => {
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;
  
  const slideAnim1 = useRef(new Animated.Value(0)).current;
  const slideAnim2 = useRef(new Animated.Value(0)).current;
  const slideAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stage 1: Fade In
    Animated.stagger(100, [
      Animated.timing(fadeAnim1, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(fadeAnim2, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(fadeAnim3, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();

    // Stage 2: Rise Out and Finish
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim1, { toValue: 0, duration: 800, useNativeDriver: true }),
        Animated.timing(fadeAnim2, { toValue: 0, duration: 800, useNativeDriver: true }),
        Animated.timing(fadeAnim3, { toValue: 0, duration: 800, useNativeDriver: true }),
        Animated.timing(slideAnim1, { toValue: -60, duration: 800, useNativeDriver: true }),
        Animated.timing(slideAnim2, { toValue: -60, duration: 800, useNativeDriver: true }),
        Animated.timing(slideAnim3, { toValue: -60, duration: 800, useNativeDriver: true }),
      ]).start(() => {
        onDone();
      });
    }, 1800);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.iconContainer, 
        { 
          opacity: fadeAnim1, 
          transform: [{ translateY: slideAnim1 }] 
        }
      ]}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>🤝</Text>
        </View>
      </Animated.View>

      <Animated.View style={[
        styles.textContainer, 
        { 
          opacity: fadeAnim2, 
          transform: [{ translateY: slideAnim2 }] 
        }
      ]}>
        <Text style={styles.titleText}>Welcome to Gramco</Text>
      </Animated.View>

      <Animated.View style={[
        styles.subTextContainer, 
        { 
          opacity: fadeAnim3, 
          transform: [{ translateY: slideAnim3 }] 
        }
      ]}>
        <Text style={styles.subText}>What would you like{"\n"}to do today?</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  iconContainer: {
    marginBottom: 10,
  },
  iconBox: {
    width: 72,
    height: 72,
    backgroundColor: COLORS.purple,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.purple,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconText: {
    fontSize: 36,
  },
  textContainer: {
    alignItems: 'center',
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.dark,
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subTextContainer: {
    alignItems: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#888',
    letterSpacing: 0.03,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
