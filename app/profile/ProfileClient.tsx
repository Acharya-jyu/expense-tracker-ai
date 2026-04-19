'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCustomCategories } from '@/context/CustomCategoriesContext';
import { setUserProfile } from '@/lib/firestore';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getCategoryColor, BUILTIN_CATEGORIES } from '@/types/expense';
import { User, Layers, Plus, X, Check, LogOut, Pencil } from 'lucide-react';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { customCategories, addCategory, removeCategory } = useCustomCategories();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.displayName ?? '');
  const [nameSaving, setNameSaving] = useState(false);

  const [newCategory, setNewCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const categoryInputRef = useRef<HTMLInputElement>(null);

  const initials = (user?.displayName ?? user?.email ?? '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  async function saveName() {
    if (!nameValue.trim() || !user) return;
    setNameSaving(true);
    await updateProfile(auth.currentUser!, { displayName: nameValue.trim() });
    await setUserProfile(user.uid, { displayName: nameValue.trim() });
    setNameSaving(false);
    setEditingName(false);
  }

  async function handleAddCategory() {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (BUILTIN_CATEGORIES.map((c) => c.toLowerCase()).includes(trimmed.toLowerCase())) {
      setCategoryError('That name matches a built-in category.');
      return;
    }
    if (customCategories.map((c) => c.toLowerCase()).includes(trimmed.toLowerCase())) {
      setCategoryError('Category already exists.');
      return;
    }
    if (trimmed.length > 30) {
      setCategoryError('Max 30 characters.');
      return;
    }
    setCategoryError('');
    await addCategory(trimmed);
    setNewCategory('');
    categoryInputRef.current?.focus();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="animate-reveal-up" style={{ animationDelay: '0ms' }}>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and custom categories</p>
      </div>

      {/* Account card */}
      <div
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 animate-reveal-up"
        style={{ animationDelay: '80ms' }}
      >
        <div className="flex items-center gap-2 mb-5">
          <User size={15} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Account</h2>
        </div>

        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
            {user?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-lg">{initials}</span>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            {/* Name */}
            <div>
              <p className="text-xs text-gray-400 mb-1">Display name</p>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                    className="flex-1 text-sm border border-indigo-400 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button
                    onClick={saveName}
                    disabled={nameSaving}
                    className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setNameValue(user?.displayName ?? ''); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">
                    {user?.displayName || <span className="text-gray-400 italic">Not set</span>}
                  </span>
                  <button
                    onClick={() => setEditingName(true)}
                    className="p-1 rounded-md text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Pencil size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <p className="text-xs text-gray-400 mb-1">Email</p>
              <p className="text-sm text-gray-700">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom categories card */}
      <div
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 animate-reveal-up"
        style={{ animationDelay: '160ms' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Layers size={15} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Custom Categories</h2>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          Add your own categories beyond the six built-in ones. They appear alongside the defaults when adding expenses.
        </p>

        {/* Built-in categories (read-only reference) */}
        <div className="mb-5">
          <p className="text-xs font-medium text-gray-500 mb-2">Built-in</p>
          <div className="flex flex-wrap gap-2">
            {BUILTIN_CATEGORIES.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 bg-gray-50 text-gray-500"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Add custom category */}
        <div className="flex gap-2 mb-4">
          <input
            ref={categoryInputRef}
            type="text"
            value={newCategory}
            onChange={(e) => { setNewCategory(e.target.value); setCategoryError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); }}
            placeholder="e.g. Vacation, Medical, Gym…"
            maxLength={30}
            className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
          />
          <button
            onClick={handleAddCategory}
            disabled={!newCategory.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={15} />
            Add
          </button>
        </div>

        {categoryError && (
          <p className="text-xs text-red-500 mb-3 -mt-2">{categoryError}</p>
        )}

        {/* Custom category pills */}
        {customCategories.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6 border border-dashed border-gray-200 rounded-xl">
            No custom categories yet. Add your first one above.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {customCategories.map((cat) => {
              const color = getCategoryColor(cat);
              return (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border group"
                  style={{ backgroundColor: `${color}18`, borderColor: `${color}40`, color }}
                >
                  {cat}
                  <button
                    onClick={() => removeCategory(cat)}
                    className="opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color }}
                  >
                    <X size={11} />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Sign out */}
      <div
        className="animate-reveal-up"
        style={{ animationDelay: '240ms' }}
      >
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );
}
