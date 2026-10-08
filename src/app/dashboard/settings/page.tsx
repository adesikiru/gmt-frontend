'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [nin, setNin] = useState('');
  const [isVoter, setIsVoter] = useState(false);
  const [vin, setVin] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Account Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your personal details, National Identity Number (NIN), voter credentials, and security.
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center space-x-2">
          <span>✓</span>
          <span>Your settings have been successfully updated.</span>
        </div>
      )}

      {/* Profile & National Identity */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
          Personal Information & NIN
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              National Identification Number (NIN)
            </label>
            <p className="text-xs text-gray-400 mb-2">Enter your 11-digit Nigerian National Identity Number.</p>
            <input
              type="text"
              maxLength={11}
              value={nin}
              onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 12345678901"
              className="w-full md:w-80 px-4 py-2.5 text-sm border border-gray-200 rounded-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Voter Status & Credentials</h3>
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 mb-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVoter}
                  onChange={(e) => setIsVoter(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded-md border-gray-300 focus:ring-emerald-500"
                />
                <span className="text-sm font-bold text-gray-800">
                  I am a registered voter in Nigeria
                </span>
              </label>

              {isVoter && (
                <div className="mt-4 pt-4 border-t border-emerald-200/60">
                  <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">
                    Voter Identification Number (VIN)
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    placeholder="Enter your 20-character VIN"
                    className="w-full md:w-80 px-4 py-2.5 text-sm border border-emerald-300 rounded-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <p className="text-[11px] text-emerald-700 mt-1">{vin.length}/20 characters</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-sm"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Security / Password */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
          Account Security & Password
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
