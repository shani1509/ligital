'use client';

import { useState, useEffect, useCallback } from 'react';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import StudentAvatar from '@/components/ui/StudentAvatar';
import { Search, Filter, Plus, Users, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in pb-16 font-sans">
      
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            Students Database
            <span className="bg-emerald-100 text-emerald-800 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider translate-y-[-2px] shadow-sm">
              {total} Total
            </span>
          </h1>
          <p className="mt-3 text-base md:text-lg text-gray-500 max-w-xl">Search, filter, and manage your entire student directory.</p>
        </div>
        <Link
          href="/students/add"
          id="btn-add-student"
          className="bg-[#1B5E20] hover:bg-[#124116] shadow-lg shadow-green-900/20 hover:-translate-y-0.5 transition-all px-6 py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Student
        </Link>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="search-students"
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-gray-900 font-medium placeholder-gray-400 transition-all focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>
        <div className="sm:w-64">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-10 text-gray-900 font-medium transition-all focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active Subscriptions</option>
              <option value="EXPIRED">Expired Subscriptions</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Data Table */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 overflow-hidden relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"/>
            <p className="text-gray-500 font-medium animate-pulse">Loading database records...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 shadow-inner">
              {search || statusFilter ? <Search className="h-10 w-10" /> : <Inbox className="h-10 w-10" />}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              {search || statusFilter ? 'No matching records found' : 'Database is empty'}
            </h3>
            <p className="mt-2 text-base text-gray-500 max-w-sm mx-auto">
              {search || statusFilter 
                ? 'Try adjusting your search terms or filters to find what you are looking for.' 
                : 'Get started by adding your first student to the library system.'}
            </p>
            {!(search || statusFilter) && (
              <Link 
                href="/students/add" 
                className="mt-8 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 px-8 py-3 rounded-xl font-bold text-white transition-all"
              >
                Add Student
              </Link>
            )}
          </div>
        ) : (
          <div className="w-full overflow-x-auto pb-4">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b-2 border-gray-100 bg-gray-50/80">
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Student Profile</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Contact</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Seat</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Status</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Active Plan</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => {
                  const latestSub = student.subscriptions?.[0];
                  return (
                    <tr 
                      key={student.id} 
                      onClick={() => router.push(`/students/${student.id}`)}
                      className="transition-colors cursor-pointer hover:bg-emerald-50/40 group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <StudentAvatar name={student.name} photoUrl={student.photoUrl} size="md" />
                          <div>
                            <p className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{student.name}</p>
                            {student.email && <p className="text-xs font-medium text-gray-500">{student.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-gray-600">{student.phone}</td>
                      <td className="px-6 py-5">
                        {student.seat ? (
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-gray-100 text-gray-700 font-bold text-sm border border-gray-200">
                            #{student.seat.seatNumber}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-medium text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <Badge variant={statusBadgeVariant(student.status)} className="shadow-sm">
                          {student.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        {latestSub?.plan?.name ? (
                          <span className="text-sm font-bold text-gray-700">{latestSub.plan.name}</span>
                        ) : (
                          <span className="text-gray-400 font-medium text-sm">—</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">
                        {latestSub ? formatDate(latestSub.endDate) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 bg-gray-50/50 px-8 py-4 gap-4">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Showing Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
