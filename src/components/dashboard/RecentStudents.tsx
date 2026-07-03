'use client';

import React from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { StudentWithSeat } from '@/types';

interface RecentStudentsProps {
  students?: StudentWithSeat[];
  loading?: boolean;
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'success' as const;
    case 'EXPIRED':
      return 'danger' as const;
    case 'LEFT':
      return 'default' as const;
    default:
      return 'default' as const;
  }
}

export default function RecentStudents({ students = [], loading }: RecentStudentsProps) {
  if (loading) {
    return (
      <Card className="animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Students</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-2 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Students</h3>
        <Link
          href="/students/add"
          id="recent-add-student"
          className="text-xs font-semibold text-[#4CAF50] hover:text-[#1B5E20] transition-colors"
        >
          + Add Student
        </Link>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-3xl mb-2 block">🎓</span>
          <p className="text-sm text-gray-400">No students yet</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {students.slice(0, 5).map((student) => {
            const initials = student.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <li
                key={student.id}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#E8F5E9] text-[#1B5E20] font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {student.name}
                  </p>
                  <p className="text-xs text-gray-400">{student.phone}</p>
                </div>

                {/* Status + Date */}
                <div className="text-right flex-shrink-0">
                  <Badge variant={getStatusVariant(student.status)} dot>
                    {student.status}
                  </Badge>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {formatDate(student.joinDate)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
