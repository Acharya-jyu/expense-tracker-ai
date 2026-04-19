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
  const q = query(
    collection(db, 'users', uid, 'expenses'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
}

export async function addUserExpense(uid: string, expense: Expense): Promise<void> {
  const { id, ...data } = expense;
  await setDoc(doc(db, 'users', uid, 'expenses', id), data);
}

export async function updateUserExpense(uid: string, expense: Expense): Promise<void> {
  const { id, ...data } = expense;
  await updateDoc(doc(db, 'users', uid, 'expenses', id), data);
}

export async function deleteUserExpense(uid: string, expenseId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'expenses', expenseId));
}

// ── User profile ──────────────────────────────────────────
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function setUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
}
