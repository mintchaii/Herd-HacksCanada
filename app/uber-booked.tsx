import { useRouter } from 'expo-router';
import React from 'react';
import { StatusScreen } from './calling';

export default function UberBookedScreen() {
  const router = useRouter();
  
  return (
    <StatusScreen 
      title={`An Uber has been booked!\n\nSit tight!`} 
      speechText="An Uber has been booked! Sit tight!" 
      onNext={() => router.push('/')} 
    />
  );
}
