'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import Image from 'next/image';


const menuItems = [
  {
    section: 'MENU',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: '/main_dashboard.png' },
      { label: 'Students', href: '/students', icon: '/student.png' },
      { label: 'Add Student', href: '/students/add', icon: '/x.png' },
      { label: 'Plans', href: '/plans', icon: '/add_plans.png' },
      { label: 'Seats', href: '/seats', icon: '/seat_n.png' },
      { label: 'Reports', href: '/reports', icon: '/stats.png' },
    ],
  },
  {
    section: 'GENERAL',
    items: [
      { label: 'Settings', href: '/settings', icon: '/setting_nav.png' },
      { label: 'Billing', href: '/billing', icon: '/subs.png' },
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
      "fixed left-0 top-0 bottom-0 w-[260px] bg-[#1B5E20] text-white flex flex-col z-40 transform transition-transform duration-300 ease-in-out",
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
            <h1 className="text-xl font-bold tracking-tight">Ligital</h1>
            <p className="text-xs text-[#81C784] font-medium">Library Manager</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {menuItems.map((section) => (
          <div key={section.section} className="mb-6">
            <p className="px-3 mb-2 text-[10px] font-bold tracking-widest text-[#81C784] uppercase">
              {section.section}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    id={`sidebar-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive(item.href)
                        ? 'bg-[#2E7D32] text-white shadow-md'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <Image alt={item.label} className="object-contain" height={20} src={item.icon} width={20}/>
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
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Section - Mobile App Promo */}
      <div className="px-4 pb-4">
        <div className="bg-[#2E7D32] rounded-xl p-4">
          <div className="text-center mb-2">
            <Image alt="Mobile App" className="mx-auto object-contain" height={24} src="/mobile_dashboard.png" width={24}/>
          </div>
          <p className="text-xs text-center text-white/90 font-medium mb-2">
            Get the mobile app for easier management
          </p>
          <div className="text-center">
            <span className="text-[10px] text-[#81C784] font-semibold">Coming Soon</span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-3 pb-4">
        <button
          id="sidebar-logout"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-red-500/20 hover:text-white transition-all duration-200 cursor-pointer"
        >
          <Image alt="Logout" className="object-contain" height={20} src="/logout.png" width={20}/>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
