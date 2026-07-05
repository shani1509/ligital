'use client';

import { useState, useEffect, useCallback } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate, formatCurrency } from '@/lib/utils';
import StudentAvatar from '@/components/ui/StudentAvatar';

interface Student {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  photoUrl: string | null;
  status: 'ACTIVE' | 'EXPIRED';
  joinDate: string;
  seat: { seatNumber: number } | null;
  subscriptions: {
    endDate: string;
    status: string;
    plan: { name: string };
  }[];
}

interface StudentsResponse {
  students: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/students?${params}`);
      const json = await res.json();
      if (json.success) {
        const data = json.data as StudentsResponse;
        setStudents(data.students);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const statusBadgeVariant = (s: string) => {
    switch (s) {
      case 'ACTIVE': return 'success' as const;
      case 'EXPIRED': return 'danger' as const;
      default: return 'default' as const;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="mt-1 text-sm text-gray-500">{total} students total</p>
        </div>
        <Link
          href="/students/add"
          id="btn-add-student"
          className="inline-flex items-center gap-2 rounded-lg bg-[#1B5E20] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#2E7D32]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Student
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-xl bg-white p-4 shadow-md">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="search-students"
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#C8E6C9]"
            />
          </div>
        </div>
        <select
          id="filter-status"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-all focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#C8E6C9]"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-md">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C8E6C9] border-t-[#1B5E20]" />
          </div>
        ) : students.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5E9]">
              <svg className="h-8 w-8 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No students found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first student.</p>
            <Link href="/students/add" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1B5E20] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2E7D32]">
              Add Student
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Phone</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Seat</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Plan</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((student) => {
                const latestSub = student.subscriptions?.[0];
                return (
                  <tr 
                    key={student.id} 
                    onClick={() => router.push(`/students/${student.id}`)}
                    className="transition-colors cursor-pointer hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <StudentAvatar name={student.name} photoUrl={student.photoUrl} size="md" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{student.name}</p>
                          {student.email && <p className="text-xs text-gray-400">{student.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.seat ? `#${student.seat.seatNumber}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusBadgeVariant(student.status)}>{student.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{latestSub?.plan?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {latestSub ? formatDate(latestSub.endDate) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
