'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Expense } from '@/types/expense';
import {
  loadExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from '@/lib/storage';

interface ExpenseContextValue {
  expenses: Expense[];
  isLoaded: boolean;
  add: (e: Expense) => void;
  update: (e: Expense) => void;
  remove: (id: string) => void;
}

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setExpenses(loadExpenses());
    setIsLoaded(true);
  }, []);

  function add(expense: Expense) {
    setExpenses((prev) => addExpense(prev, expense));
  }

  function update(expense: Expense) {
    setExpenses((prev) => updateExpense(prev, expense));
  }

  function remove(id: string) {
    setExpenses((prev) => deleteExpense(prev, id));
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
