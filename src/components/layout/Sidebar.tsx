'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Package, 
  CreditCard, 
  BarChart, 
  LayoutGrid, 
  Library, 
  Settings, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';

const menuItems = [
  {
    section: 'MENU',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Students', href: '/students', icon: Users },
      { label: 'Add Student', href: '/students/add', icon: UserPlus },
      { label: 'Subscription Plans', href: '/plans', icon: Package },
      { label: 'Billing', href: '/billing', icon: CreditCard },
      { label: 'Reports & Analytics', href: '/reports', icon: BarChart },
      { label: 'Seats Management', href: '/seats', icon: LayoutGrid },
    ],
  },
  {
    section: 'GENERAL',
    items: [
      { label: 'My Library', href: '/settings/library', icon: Library },
      { label: 'Settings', href: '/settings', icon: Settings },
      { label: 'Help', href: '/help', icon: HelpCircle },
    ],
  },
];

export default function Sidebar({ isOpen }: { isOpen?: boolean }) {
  const pathname = usePathname();
  const { user, logout, isExpired } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 bottom-0 w-[260px] bg-[#0B3D1B] text-white flex flex-col z-40 transform transition-transform duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
            <Image 
              src="/logo.png" 
              alt="Ligital Logo" 
              width={40} 
              height={40} 
              className="object-contain p-1"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Ligital</h1>
            <p className="text-xs text-gray-300 font-medium">Library Manager</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 overflow-y-auto hide-scrollbar flex flex-col">
        {menuItems.map((section) => (
          <div key={section.section} className="mb-2">
            <p className="text-xs font-semibold text-gray-300 tracking-wider mb-3 mt-6">
              {section.section}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      id={`sidebar-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                        active
                          ? 'bg-[#1B5E20] text-white shadow-sm'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <Icon className={cn("w-5 h-5", active ? "text-white" : "text-gray-400 group-hover:text-white")} />
                      <span>{item.label}</span>
                      
                      {/* Billing indicator */}
                      {item.label === 'Billing' && isExpired && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-red-400 animate-pulse-green" />
                      )}
                      {item.label === 'Billing' && user?.library.status === 'TRIAL' && (
                        <span className="ml-auto text-[10px] bg-yellow-500 text-yellow-900 px-1.5 py-0.5 rounded-full font-bold">
                          TRIAL
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Logout at bottom */}
        <div className="mt-auto pt-6 pb-4">
          <button
            id="sidebar-logout"
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-500/20 hover:text-red-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-300" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
