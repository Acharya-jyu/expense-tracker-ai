'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getUserProfile, setUserProfile } from '@/lib/firestore';

interface LabelsContextValue {
  labels: string[];
  addLabel: (label: string) => Promise<void>;
  removeLabel: (label: string) => Promise<void>;
  isLoaded: boolean;
}

const LabelsContext = createContext<LabelsContextValue | null>(null);

export function LabelsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [labels, setLabels] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setLabels([]);
      setIsLoaded(false);
      return;
    }
    getUserProfile(user.uid).then((profile) => {
      setLabels(profile?.labels ?? []);
      setIsLoaded(true);
    });
  }, [user]);

  async function addLabel(label: string) {
    if (!user) return;
    const trimmed = label.trim();
    if (!trimmed || labels.includes(trimmed)) return;
    const next = [...labels, trimmed];
    setLabels(next);
    await setUserProfile(user.uid, { labels: next });
  }

  async function removeLabel(label: string) {
    if (!user) return;
    const next = labels.filter((l) => l !== label);
    setLabels(next);
    await setUserProfile(user.uid, { labels: next });
  }

  return (
    <LabelsContext.Provider value={{ labels, addLabel, removeLabel, isLoaded }}>
      {children}
    </LabelsContext.Provider>
  );
}

export function useLabels() {
  const ctx = useContext(LabelsContext);
  if (!ctx) throw new Error('useLabels must be used inside LabelsProvider');
  return ctx;
}
