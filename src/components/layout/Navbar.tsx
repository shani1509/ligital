'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar() {
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left: Search */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            id="navbar-search"
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-20 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 rounded-md border border-gray-200">
            Ctrl+F
          </kbd>
        </div>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          id="navbar-notifications"
          className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <span className="text-xl">🔔</span>
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
            3
          </span>
        </button>

        {/* Library Name */}
        <div className="hidden md:block text-right">
          <p className="text-sm font-semibold text-gray-800 truncate max-w-[150px]">
            {user?.library.name || 'My Library'}
          </p>
          <p className="text-xs text-gray-400">{user?.role || 'Owner'}</p>
        </div>

        {/* Profile Avatar */}
        <div className="relative" ref={profileRef}>
          <button
            id="navbar-profile"
            onClick={() => setShowProfile(!showProfile)}
            className="w-10 h-10 rounded-full bg-[#1B5E20] text-white font-bold text-sm flex items-center justify-center hover:bg-[#2E7D32] transition-colors cursor-pointer"
            aria-label="User menu"
          >
            {initials}
          </button>
          {showProfile && (
            <ProfileDropdown onClose={() => setShowProfile(false)} />
          )}
        </div>
      </div>
    </header>
  );
}
