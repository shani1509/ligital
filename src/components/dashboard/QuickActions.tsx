'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Card from '@/components/ui/Card';

const actions = [
  {
    title: 'Add Student',
    description: 'Register a new student',
    icon: '/ad_std.png',
    href: '/students/add',
    color: 'bg-[#E8F5E9]',
  },
  {
    title: 'Create Plan',
    description: 'Set up a subscription plan',
    icon: '/plans.png',
    href: '/plans',
    color: 'bg-blue-50',
  },
  {
    title: 'View Reports',
    description: 'Analyze your library data',
    icon: '/report.png',
    href: '/reports',
    color: 'bg-purple-50',
  },
  {
    title: 'Manage Seats',
    description: 'Assign and release seats',
    icon: '/seat.png',
    href: '/seats',
    color: 'bg-yellow-50',
  },
];

export default function QuickActions() {
  return (
    <Card className="animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            id={`quick-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
            className="p-3 rounded-xl border border-gray-100 hover:border-[#C8E6C9] hover:shadow-md transition-all duration-200 group"
          >
            <div
              className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform`}
            >
              <Image alt={action.title} className="object-contain" height={24} src={action.icon} width={24}/>
            </div>
            <p className="text-sm font-semibold text-gray-800">{action.title}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{action.description}</p>
          </Link>
        ))}
      </div>
    </Card>
  );
}
