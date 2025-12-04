'use client';

import { createContext, useContext, ReactNode } from 'react';
import { PersistenceService } from './types';
import { localStorageService } from './local-storage';

const PersistenceContext = createContext<PersistenceService | null>(null);

interface PersistenceProviderProps {
  children: ReactNode;
  service?: PersistenceService;
}

export function PersistenceProvider({
  children,
  service = localStorageService,
}: PersistenceProviderProps) {
  return <PersistenceContext.Provider value={service}>{children}</PersistenceContext.Provider>;
}

export function usePersistence() {
  const context = useContext(PersistenceContext);
  if (!context) {
    throw new Error('usePersistence must be used within a PersistenceProvider');
  }
  return context;
}
