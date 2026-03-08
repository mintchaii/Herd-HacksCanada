
Readme · MD

# Gramco 🎙️📍

A voice-first mobile app that helps seniors navigate everyday tasks — hands-free.

## What it does

Gramco is an accessibility-focused app controlled primarily by voice commands. Users can navigate menus, find nearby places, make calls, and complete errands — all without touching the screen. A touch screen toggle is available for users who prefer or need it.

## Features

- 🎙️ **Voice Control** — navigate the entire app using voice commands
- 📍 **Nearby Places** — find restaurants, pharmacies, and grocery stores on an interactive map
- 👆 **Touch Toggle** — enable or disable touch screen at any time by voice or tap

## Tech Stack

- **React Native** (Expo)
- **Bland AI** — automated calling
- **Google Maps & Places API** — location and nearby search
- **expo-speech-recognition** — voice input
- **expo-location** — user location

## Getting Started

```bash
npm install
npx expo start --dev-client --tunnel
```

## Environment Variables

Create a `.env` file in the root directory:
```
EXPO_PUBLIC_BLAND_AI_API_KEY=your_key
EXPO_PUBLIC_ELEVEN_LABS_API_KEY=your_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
```

## Build

```bash
eas build --profile development --platform android
```

## Team

Built at Canada Hacks 2026 🇨🇦
