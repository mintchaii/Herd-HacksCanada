import { useRouter } from 'expo-router';
import React from 'react';
import { StatusScreen } from './calling';

export default function UberBookedScreen() {
  const router = useRouter();
  
  const onFinished = () => {
    setTimeout(() => {
      router.push('/');
    }, 3000);
  };

  return (
    <StatusScreen 
      title={`An Uber has been booked!\nSit tight!`} 
      speechText="An Uber has been booked! Sit tight!" 
      onFinished={onFinished} 
    />
  );
}
