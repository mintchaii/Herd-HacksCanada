import React, { useState } from 'react';
import VoiceMenu from '@/components/VoiceMenu';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onDone={() => setIsLoading(false)} />;
  }

  return <VoiceMenu />;
}
