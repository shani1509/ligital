'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProfileDropdown from './ProfileDropdown';
import { Bell, Search, Menu, X } from 'lucide-react';

export default function Navbar({ 
  onToggleSidebar, 
  isSidebarOpen 
}: { 
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}) {
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
    <header className="sticky top-0 z-30 h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)] flex items-center justify-between px-4 md:px-8 transition-all">
      {/* Left: Hamburger + Search */}
      <div className="flex items-center flex-1 gap-3 md:gap-6 max-w-xl">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-emerald-100 shadow-sm"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            id="navbar-search"
            type="text"
            placeholder="Search students, plans, or invoices..."
            className="w-full pl-11 pr-24 py-3 text-sm font-medium bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 focus:bg-white transition-all shadow-inner placeholder:text-gray-400"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-gray-400 bg-white rounded-lg border border-gray-200 shadow-sm uppercase tracking-widest pointer-events-none">
            Ctrl+F
          </div>
        </div>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-4 md:gap-6 pl-4">
        {/* Notifications */}
        <button
          id="navbar-notifications"
          className="relative p-2.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-[1.25rem] transition-all cursor-pointer border border-gray-100 shadow-sm hover:shadow-md bg-gray-50 group"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse" />
        </button>

        <div className="h-8 w-px bg-gray-200 hidden md:block" />

        {/* Library Info & Profile Avatar */}
        <div className="relative flex items-center gap-4" ref={profileRef}>
          {/* Library Name */}
          <div className="hidden md:flex flex-col items-end">
            <p className="text-sm font-extrabold text-gray-900 tracking-tight truncate max-w-[160px]">
              {user?.library.name || 'My Library'}
            </p>
            <p className="text-[10px] font-bold text-emerald-600/80 tracking-widest uppercase">
              {user?.role || 'Owner'}
            </p>
          </div>

          <button
            id="navbar-profile"
            onClick={() => setShowProfile(!showProfile)}
            className="w-11 h-11 rounded-[1.25rem] bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-black text-sm flex items-center justify-center hover:shadow-lg hover:shadow-emerald-900/20 hover:-translate-y-0.5 border-2 border-white transition-all cursor-pointer shadow-md"
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
