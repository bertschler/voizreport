'use client';

import { Provider } from 'jotai';
import { ReactNode } from 'react';
import { getAppStore } from '../services/jotaiStore';

interface JotaiProviderProps {
  children: ReactNode;
}

export default function JotaiProvider({ children }: JotaiProviderProps) {
  const store = getAppStore();
  return <Provider store={store}>{children}</Provider>;
} 