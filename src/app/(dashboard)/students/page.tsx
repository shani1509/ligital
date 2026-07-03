'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@/hooks/useFetch';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Student {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'LEFT';
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
  const [deleteModal, setDeleteModal] = useState<Student | null>(null);
  const { mutate, loading: deleting } = useMutation();

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

  const handleDelete = async () => {
    if (!deleteModal) return;
    const result = await mutate(`/api/students/${deleteModal.id}`, 'DELETE');
    if (result.success) {
      setDeleteModal(null);
      fetchStudents();
    }
  };

  const statusBadgeVariant = (s: string) => {
    switch (s) {
      case 'ACTIVE': return 'success' as const;
      case 'EXPIRED': return 'danger' as const;
      case 'LEFT': return 'default' as const;
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
          <option value="LEFT">Left</option>
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
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((student) => {
                const latestSub = student.subscriptions?.[0];
                return (
                  <tr key={student.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F5E9] text-sm font-semibold text-[#1B5E20]">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
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
                    <td className="px-6 py-4 text-right">
                      <button
                        id={`btn-delete-${student.id}`}
                        onClick={() => setDeleteModal(student)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Remove student"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteModal(null)}
          title="Remove Student"
        >
          <p className="text-sm text-gray-600">
            Are you sure you want to remove <strong>{deleteModal.name}</strong>? This will mark them as &quot;Left&quot; and free their seat.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteModal(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Remove Student
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
