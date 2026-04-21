import { db } from './firebase';
import {
  collection, doc, getDocs, setDoc, updateDoc,
  deleteDoc, getDoc, query, orderBy,
} from 'firebase/firestore';
import { Expense } from '@/types/expense';

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  customCategories: string[];
  createdAt: string;
}

// ── Expenses ──────────────────────────────────────────────
export async function loadUserExpenses(uid: string): Promise<Expense[]> {
  try {
    const q = query(
      collection(db, 'users', uid, 'expenses'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
  } catch (err) {
    throw new Error(`Failed to load expenses: ${(err as Error).message}`);
  }
}

export async function addUserExpense(uid: string, expense: Expense): Promise<void> {
  try {
    const { id, ...data } = expense;
    await setDoc(doc(db, 'users', uid, 'expenses', id), data);
  } catch (err) {
    throw new Error(`Failed to save expense: ${(err as Error).message}`);
  }
}

export async function updateUserExpense(uid: string, expense: Expense): Promise<void> {
  try {
    const { id, ...data } = expense;
    await updateDoc(doc(db, 'users', uid, 'expenses', id), data);
  } catch (err) {
    throw new Error(`Failed to update expense: ${(err as Error).message}`);
  }
}

export async function deleteUserExpense(uid: string, expenseId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', uid, 'expenses', expenseId));
  } catch (err) {
    throw new Error(`Failed to delete expense: ${(err as Error).message}`);
  }
}

// ── User profile ──────────────────────────────────────────
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (err) {
    throw new Error(`Failed to load user profile: ${(err as Error).message}`);
  }
}

export async function setUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  try {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
  } catch (err) {
    throw new Error(`Failed to save user profile: ${(err as Error).message}`);
  }
}
