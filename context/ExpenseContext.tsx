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
  add: (e: Expense) => void;
  update: (e: Expense) => void;
  remove: (id: string) => void;
}

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setIsLoaded(false);
      return;
    }
    setIsLoaded(false);
    loadUserExpenses(user.uid).then((data) => {
      setExpenses(data);
      setIsLoaded(true);
    });
  }, [user]);

  function add(expense: Expense) {
    if (!user) return;
    setExpenses((prev) => [expense, ...prev]);
    addUserExpense(user.uid, expense);
  }

  function update(expense: Expense) {
    if (!user) return;
    setExpenses((prev) => prev.map((e) => (e.id === expense.id ? expense : e)));
    updateUserExpense(user.uid, expense);
  }

  function remove(id: string) {
    if (!user) return;
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    deleteUserExpense(user.uid, id);
  }

  return (
    <ExpenseContext.Provider value={{ expenses, isLoaded, add, update, remove }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses must be used inside ExpenseProvider');
  return ctx;
}
