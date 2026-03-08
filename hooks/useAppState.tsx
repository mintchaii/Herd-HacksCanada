import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppState {
  touchEnabled: boolean;
  setTouchEnabled: (value: boolean) => void;
  isListening: boolean;
  setIsListening: (value: boolean) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [touchEnabled, setTouchEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);

  return (
    <AppStateContext.Provider value={{ touchEnabled, setTouchEnabled, isListening, setIsListening }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
