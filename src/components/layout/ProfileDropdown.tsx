'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Library, Settings, LogOut } from 'lucide-react';

interface ProfileDropdownProps {
  onClose: () => void;
}

export default function ProfileDropdown({ onClose }: ProfileDropdownProps) {
  const { user, logout } = useAuth();

  return (
    <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 animate-scale-in z-50">
      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-100 pb-2 mb-2">
        <p className="text-sm font-semibold text-gray-700 truncate">{user?.name}</p>
        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
      </div>

      {/* Links */}
      <div className="py-1">
        <Link
          href="/settings/library"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <Library className="w-5 h-5" />
          <span>My Library</span>
        </Link>
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </div>

      {/* Logout */}
      <div className="border-t border-gray-100 mt-2 py-1">
        <button
          id="dropdown-logout"
          onClick={() => {
            onClose();
            logout();
          }}
          className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-red-600" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
