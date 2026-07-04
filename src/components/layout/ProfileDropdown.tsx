'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

interface ProfileDropdownProps {
  onClose: () => void;
}

export default function ProfileDropdown({ onClose }: ProfileDropdownProps) {
  const { user, logout } = useAuth();

  return (
    <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 animate-scale-in z-50">
      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
      </div>

      {/* Links */}
      <div className="py-1">
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Image alt="Settings" className="object-contain" height={20} src="/setting_profile.png" width={20}/>
          <span>Settings</span>
        </Link>
        <Link
          href="/billing"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Image alt="Billing" className="object-contain" height={20} src="/billing_profile.png" width={20}/>
          <span>Billing</span>
        </Link>
      </div>

      {/* Logout */}
      <div className="border-t border-gray-100 py-1">
        <button
          id="dropdown-logout"
          onClick={() => {
            onClose();
            logout();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <Image alt="Logout" className="object-contain" height={20} src="/logout_profile.png" width={20}/>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
