'use client';

import React from 'react';
import Link from 'next/link';
import { useFetch } from '@/hooks/useFetch';
import StudentAvatar from '@/components/ui/StudentAvatar';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { Users, ChevronRight, Inbox } from 'lucide-react';

interface RecentStudent {
  id: string;
  name: string;
  joinDate: string;
  photoUrl: string | null;
  status: 'ACTIVE' | 'EXPIRED';
}

export default function RecentStudents() {
  const { data: students, loading } = useFetch<RecentStudent[]>('/api/dashboard/recent-students');

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/30 border border-gray-100 h-full relative overflow-hidden flex flex-col">
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Recent Students</h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">New Enrollments</p>
          </div>
        </div>
        <Link 
          href="/students" 
          className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
          title="View all students"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {!students || students.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Inbox className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-gray-500 font-bold">No students yet</p>
            <p className="text-xs text-gray-400 mt-1">Recent enrollments will appear here.</p>
          </div>
        ) : (
          students.map((student) => (
            <Link
              key={student.id}
              href={`/students/${student.id}`}
              className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-emerald-50/50 hover:border-emerald-100 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <StudentAvatar name={student.name} photoUrl={student.photoUrl} size="sm" />
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{student.name}</p>
                  <p className="text-xs font-medium text-gray-500">Joined {formatDate(student.joinDate)}</p>
                </div>
              </div>
              <Badge variant={student.status === 'ACTIVE' ? 'success' : 'danger'} className="shadow-sm">
                {student.status}
              </Badge>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
