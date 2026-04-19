'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { getUserProfile, setUserProfile } from '@/lib/firestore';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Handle result when browser returns from Google redirect sign-in
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          const profile = await getUserProfile(result.user.uid);
          if (!profile) {
            await setUserProfile(result.user.uid, {
              displayName: result.user.displayName ?? '',
              email: result.user.email ?? '',
              photoURL: result.user.photoURL ?? undefined,
              customCategories: [],
              createdAt: new Date().toISOString(),
            });
          }
        }
      })
      .catch(() => {
        // redirect result errors are non-fatal; auth state still resolves below
      });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signUp(email: string, password: string, displayName: string) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
    await setUserProfile(user.uid, {
      displayName,
      email,
      customCategories: [],
      createdAt: new Date().toISOString(),
    });
  }

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await getUserProfile(result.user.uid);
      if (!profile) {
        await setUserProfile(result.user.uid, {
          displayName: result.user.displayName ?? '',
          email: result.user.email ?? '',
          photoURL: result.user.photoURL ?? undefined,
          customCategories: [],
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      // Fall back to redirect when the browser blocks the popup
      if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      throw err;
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
