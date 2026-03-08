import CallingScreen from './calling';
import { useRouter } from 'expo-router';
import React from 'react';
import { StatusScreen } from './calling';

export default function UberScreen() {
  const router = useRouter();
  
  return <StatusScreen 
    title="Calling an uber..." 
    speechText="Calling an uber" 
    onNext={() => router.push('/uber-booked' as any)} 
  />;
}
