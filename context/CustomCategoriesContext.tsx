'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getUserProfile, setUserProfile } from '@/lib/firestore';
import { CATEGORIES } from '@/types/expense';

interface CustomCategoriesContextValue {
  customCategories: string[];
  allCategories: string[];
  addCategory: (name: string) => Promise<void>;
  removeCategory: (name: string) => Promise<void>;
  isLoaded: boolean;
}

const CustomCategoriesContext = createContext<CustomCategoriesContextValue | null>(null);

export function CustomCategoriesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setCustomCategories([]);
      setIsLoaded(false);
      return;
    }
    getUserProfile(user.uid).then((profile) => {
      setCustomCategories(profile?.customCategories ?? []);
      setIsLoaded(true);
    });
  }, [user]);

  const allCategories = [...CATEGORIES, ...customCategories];

  async function addCategory(name: string) {
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed || allCategories.map((c) => c.toLowerCase()).includes(trimmed.toLowerCase())) return;
    const next = [...customCategories, trimmed];
    setCustomCategories(next);
    await setUserProfile(user.uid, { customCategories: next });
  }

  async function removeCategory(name: string) {
    if (!user) return;
    const next = customCategories.filter((c) => c !== name);
    setCustomCategories(next);
    await setUserProfile(user.uid, { customCategories: next });
  }

  return (
    <CustomCategoriesContext.Provider value={{ customCategories, allCategories, addCategory, removeCategory, isLoaded }}>
      {children}
    </CustomCategoriesContext.Provider>
  );
}

export function useCustomCategories() {
  const ctx = useContext(CustomCategoriesContext);
  if (!ctx) throw new Error('useCustomCategories must be used inside CustomCategoriesProvider');
  return ctx;
}
