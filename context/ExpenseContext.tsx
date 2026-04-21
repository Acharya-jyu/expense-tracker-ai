'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Expense } from '@/types/expense';
import { useAuth } from './AuthContext';
import {
  loadUserExpenses,
  addUserExpense,
  updateUserExpense,
  deleteUserExpense,
} from '@/lib/firestore';

interface ExpenseContextValue {
  expenses: Expense[];
  isLoaded: boolean;
  error: string | null;
  add: (e: Expense) => Promise<void>;
  update: (e: Expense) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setIsLoaded(false);
      setError(null);
      return;
    }
    setIsLoaded(false);
    setError(null);
    loadUserExpenses(user.uid)
      .then((data) => {
        setExpenses(data);
        setIsLoaded(true);
      })
      .catch((err: Error) => {
        setError(err.message);
        setIsLoaded(true);
      });
  }, [user]);

  async function add(expense: Expense) {
    if (!user) return;
    setExpenses((prev) => [expense, ...prev]);
    try {
      await addUserExpense(user.uid, expense);
    } catch (err) {
      setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
      setError((err as Error).message);
    }
  }

  async function update(expense: Expense) {
    if (!user) return;
    const previous = expenses.find((e) => e.id === expense.id);
    setExpenses((prev) => prev.map((e) => (e.id === expense.id ? expense : e)));
    try {
      await updateUserExpense(user.uid, expense);
    } catch (err) {
      if (previous) setExpenses((prev) => prev.map((e) => (e.id === expense.id ? previous : e)));
      setError((err as Error).message);
    }
  }

  async function remove(id: string) {
    if (!user) return;
    const previous = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteUserExpense(user.uid, id);
    } catch (err) {
      if (previous) setExpenses((prev) => [previous, ...prev]);
      setError((err as Error).message);
    }
  }

  return (
    <ExpenseContext.Provider value={{ expenses, isLoaded, error, add, update, remove }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses must be used inside ExpenseProvider');
  return ctx;
}
