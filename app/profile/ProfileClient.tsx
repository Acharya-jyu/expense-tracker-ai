'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLabels } from '@/context/LabelsContext';
import { setUserProfile } from '@/lib/firestore';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User, Tag, Plus, X, Check, LogOut, Pencil } from 'lucide-react';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { labels, addLabel, removeLabel } = useLabels();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.displayName ?? '');
  const [nameSaving, setNameSaving] = useState(false);

  const [newLabel, setNewLabel] = useState('');
  const [labelError, setLabelError] = useState('');
  const labelInputRef = useRef<HTMLInputElement>(null);

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

  async function handleAddLabel() {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    if (labels.includes(trimmed)) {
      setLabelError('Label already exists.');
      return;
    }
    if (trimmed.length > 30) {
      setLabelError('Max 30 characters.');
      return;
    }
    setLabelError('');
    await addLabel(trimmed);
    setNewLabel('');
    labelInputRef.current?.focus();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="animate-reveal-up" style={{ animationDelay: '0ms' }}>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and custom labels</p>
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

      {/* Custom labels card */}
      <div
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 animate-reveal-up"
        style={{ animationDelay: '160ms' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Tag size={15} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Custom Labels</h2>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          Create your own labels to tag expenses beyond the default categories.
        </p>

        {/* Add label */}
        <div className="flex gap-2 mb-4">
          <input
            ref={labelInputRef}
            type="text"
            value={newLabel}
            onChange={(e) => { setNewLabel(e.target.value); setLabelError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddLabel(); }}
            placeholder="e.g. Vacation, Medical, Side project…"
            maxLength={30}
            className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
          />
          <button
            onClick={handleAddLabel}
            disabled={!newLabel.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={15} />
            Add
          </button>
        </div>

        {labelError && (
          <p className="text-xs text-red-500 mb-3 -mt-2">{labelError}</p>
        )}

        {/* Label pills */}
        {labels.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6 border border-dashed border-gray-200 rounded-xl">
            No labels yet. Add your first one above.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-100 group"
              >
                {label}
                <button
                  onClick={() => removeLabel(label)}
                  className="text-indigo-400 hover:text-indigo-700 transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
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
