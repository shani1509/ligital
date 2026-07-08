'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Library, Settings, LogOut, CheckCircle2 } from 'lucide-react';

interface ProfileDropdownProps {
  onClose: () => void;
}

export default function ProfileDropdown({ onClose }: ProfileDropdownProps) {
  const { user, logout } = useAuth();

  return (
    <div className="absolute right-0 top-[calc(100%+1rem)] w-[320px] bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-2 animate-scale-in z-50 transform origin-top-right">
      {/* User Info Header */}
      <div className="px-4 pt-4 pb-5 border-b border-gray-100/80 mb-2 relative overflow-hidden rounded-t-[1.5rem]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-50" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-base font-black text-gray-900 tracking-tight truncate">{user?.name}</p>
            <p className="text-xs font-bold text-gray-500 truncate mt-0.5">{user?.email}</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        </div>
      </div>

      {/* Links */}
      <div className="px-2 py-1 space-y-1">
        <Link
          href="/settings/library"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-2xl transition-all cursor-pointer group border border-transparent hover:border-gray-100"
        >
          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
            <Library className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </div>
          <span>My Library</span>
        </Link>
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-2xl transition-all cursor-pointer group border border-transparent hover:border-gray-100"
        >
          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
            <Settings className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </div>
          <span>Account Settings</span>
        </Link>
      </div>

      {/* Logout */}
      <div className="border-t border-gray-100/80 mt-2 p-2">
        <button
          id="dropdown-logout"
          onClick={() => {
            onClose();
            logout();
          }}
          className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-all cursor-pointer group border border-transparent hover:border-red-100"
        >
          <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </div>
          <span>Secure Logout</span>
        </button>
      </div>
    </div>
  );
}
