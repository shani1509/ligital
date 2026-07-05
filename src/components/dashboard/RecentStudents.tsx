'use client';

import React from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { useFetch } from '@/hooks/useFetch';
import type { StudentWithSeat } from '@/types';
import StudentAvatar from '@/components/ui/StudentAvatar';

export default function RecentStudents() {
  const { data: students, loading } = useFetch<StudentWithSeat[]>('/api/dashboard/recent-students');

  if (loading) {
    return (
      <Card className="animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Today&apos;s New Admissions</h3>
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

  const list = students ?? [];

  return (
    <Card className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Today&apos;s New Admissions</h3>
        <Link
          href="/students/add"
          id="recent-add-student"
          className="text-xs font-semibold text-[#4CAF50] hover:text-[#1B5E20] transition-colors"
        >
          + Add Student
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-sm text-gray-500">
          No new enrollments today.
        </div>
      ) : (
        <div className="overflow-y-auto max-h-72 -mx-1 px-1">
          {/* Header Row */}
          <div className="flex items-center gap-3 px-2 pb-2 border-b border-gray-100 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            <div className="flex-1 min-w-0">Name / Mobile</div>
            <div className="w-16 text-center flex-shrink-0">Seat</div>
            <div className="w-24 text-right flex-shrink-0">Plan</div>
          </div>

          {/* Student Rows */}
          <ul className="divide-y divide-gray-50">
            {list.map((student) => {
              const seatLabel = student.seat
                ? `#${student.seat.seatNumber}`
                : '—';

              const planName =
                student.subscriptions?.[0]?.plan?.name ?? '—';

              return (
                <li key={student.id}>
                  <Link
                    href={`/students/${student.id}`}
                    className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {/* Avatar + Name/Mobile */}
                    <StudentAvatar name={student.name} photoUrl={student.photoUrl} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-400">{student.phone}</p>
                    </div>

                    {/* Seat */}
                    <div className="w-16 text-center flex-shrink-0">
                      <span className="text-xs font-medium text-gray-600">
                        {seatLabel}
                      </span>
                    </div>

                    {/* Plan */}
                    <div className="w-24 text-right flex-shrink-0">
                      <span className="text-xs font-medium text-gray-600 truncate block">
                        {planName}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
}
