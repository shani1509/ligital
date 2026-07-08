'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useFetch, useMutation } from '@/hooks/useFetch';
import Modal from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Plan {
  id: string;
  name: string;
  durationDays: number;
  pricePaise: number;
}

interface Seat {
  id: string;
  seatNumber: number;
  status: 'AVAILABLE' | 'OCCUPIED';
  student?: { id: string; name: string };
}

interface Subscription {
  id: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  plan: Plan;
}

interface StudentProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  aadharNumber: string | null;
  photoUrl: string | null;
  status: 'ACTIVE' | 'EXPIRED';
  joinDate: string;
  seat: { seatNumber: number } | null;
  subscriptions: Subscription[];
}

export default function StudentProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const { data: student, loading, error } = useFetch<StudentProfile>(`/api/students/${params.id}`);
  const { mutate, loading: isDeleting } = useMutation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedSeatNumber, setSelectedSeatNumber] = useState('');
  const [assignSeatNumber, setAssignSeatNumber] = useState('');
  const [editForm, setEditForm] = useState({ phone: '', email: '' });

  // Fetch options for the renewal modal
  const { data: plans } = useFetch<Plan[]>('/api/plans');
  const { data: seats } = useFetch<Seat[]>('/api/seats');

  const handleDelete = async () => {
    if (!student) return;
    const result = await mutate(`/api/students/${student.id}`, 'DELETE');
    if (result.success) {
      router.push('/students');
      router.refresh();
    }
  };

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !selectedPlanId) return;

    const result = await mutate(`/api/students/${student.id}/renew`, 'POST', {
      planId: selectedPlanId,
      seatNumber: selectedSeatNumber || undefined,
    });

    if (result.success) {
      setIsRenewModalOpen(false);
      setSelectedPlanId('');
      setSelectedSeatNumber('');
      router.refresh();
    }
  };

  const handleAssignSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !assignSeatNumber) return;

    const result = await mutate(`/api/students/${student.id}/seat`, 'PATCH', {
      newSeatNumber: assignSeatNumber,
    });

    if (result.success) {
      setIsSeatModalOpen(false);
      setAssignSeatNumber('');
      router.refresh();
    }
  };

  const handleOpenEdit = () => {
    if (student) {
      setEditForm({ phone: student.phone, email: student.email || '' });
      setIsEditModalOpen(true);
    }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !editForm.phone) return;

    const result = await mutate(`/api/students/${student.id}`, 'PATCH', {
      phone: editForm.phone,
      email: editForm.email || undefined,
    });

    if (result.success) {
      setIsEditModalOpen(false);
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-red-100 bg-red-50 p-12 text-center text-red-600 shadow-xl shadow-red-100/50">
        <p className="text-xl font-bold">{error || 'Student not found.'}</p>
        <Link href="/students" className="mt-6 inline-block rounded-xl bg-red-600 px-6 py-3 font-bold text-white shadow-md hover:-translate-y-0.5 hover:bg-red-700 transition-all">
          Return to Students Database
        </Link>
      </div>
    );
  }

  const isActive = student.status === 'ACTIVE';

  const details = [
    { label: 'Full Name', value: student.name || 'N/A', icon: <UserIcon className="w-5 h-5" /> },
    { label: 'Phone Number', value: student.phone || 'N/A', icon: <PhoneIcon className="w-5 h-5" /> },
    { label: 'Email Address', value: student.email || 'N/A', icon: <MailIcon className="w-5 h-5" /> },
    { label: 'Enrollment Date', value: student.joinDate ? formatDate(student.joinDate) : 'N/A', icon: <CalendarIcon className="w-5 h-5" /> },
    { label: 'Aadhar Number', value: student.aadharNumber ? formatAadhar(student.aadharNumber) : 'N/A', icon: <IdCardIcon className="w-5 h-5" /> },
    { label: 'Address', value: student.address || 'N/A', icon: <MapPinIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in pb-16 font-sans">

      {/* 1. Page Header & Breadcrumbs */}
      <div>
        <nav className="mb-4 text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Link href="/students" className="hover:text-emerald-600 transition-colors">
            Students Database
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800">Profile</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shadow-inner">
              <UserIcon className="w-8 h-8" />
            </div>
            Student Overview
          </h1>
          <div
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-black tracking-wide border shadow-sm flex items-center gap-2",
              isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
            )}
          >
            <span className={cn("w-2.5 h-2.5 rounded-full", isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]")} />
            {isActive ? 'ACTIVE MEMBER' : 'EXPIRED MEMBER'}
          </div>
        </div>
      </div>

      {/* 2. Top Section: Avatar & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Avatar Badge Card */}
        <div className="lg:col-span-1 bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/30 border border-gray-100 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-transparent opacity-50" />
          
          <div className="relative z-10 w-48 h-48 rounded-full overflow-hidden mb-6 shadow-2xl shadow-gray-200/50 ring-8 ring-white group-hover:ring-emerald-50 transition-all duration-500 border-4 border-gray-50">
            {student.photoUrl ? (
              <Image
                src={student.photoUrl}
                alt={student.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="flex w-full h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-50 text-7xl font-black text-emerald-700">
                {student.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="relative z-10 w-full bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">Current Status</p>
            <p className={cn("text-lg font-black", isActive ? "text-emerald-600" : "text-red-600")}>
              {isActive ? 'Valid Subscription' : 'Requires Renewal'}
            </p>
          </div>
        </div>

        {/* Details Grid Card */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/30 border border-gray-100">
          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-6">Personal Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {details.map((d, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-md hover:border-gray-200 transition-all group">
                <div className="p-2.5 rounded-xl bg-white text-gray-400 border border-gray-100 shadow-sm group-hover:text-emerald-600 group-hover:border-emerald-100 transition-colors">
                  {d.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{d.label}</p>
                  <p className="text-base font-black text-gray-900 leading-snug truncate whitespace-normal">
                    {d.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Middle Card (Membership History) */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50/30 flex items-center gap-4">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-inner">
            <ClockIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Membership History</h2>
            <p className="text-sm font-bold text-gray-400 tracking-wider uppercase">Last 5 records</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-gray-400 font-bold tracking-widest uppercase text-[10px] border-b border-gray-100">
              <tr>
                <th className="px-8 py-5">Plan</th>
                <th className="px-8 py-5">Start Date</th>
                <th className="px-8 py-5">Expiry Date</th>
                <th className="px-8 py-5">Seat No.</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {student.subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-gray-500 font-bold">
                    No membership history found.
                  </td>
                </tr>
              ) : (
                student.subscriptions.slice(0, 5).map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="inline-flex rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-black text-gray-700 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                        {sub.plan.name}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-gray-900 font-bold">{formatDate(sub.startDate)}</td>
                    <td className="px-8 py-5 text-gray-900 font-bold">{formatDate(sub.endDate)}</td>
                    <td className="px-8 py-5 text-gray-500 font-bold">
                      {student.seat ? <span className="text-gray-900">Seat {student.seat.seatNumber}</span> : '—'}
                    </td>
                    <td className="px-8 py-5">
                      {sub.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 border border-emerald-200 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700 border border-red-200 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></span> Expired
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Bottom Action Bar */}
      <div className="flex flex-wrap items-center justify-end gap-4 pt-4">
        {/* Assign New Seat: Only for ACTIVE students */}
        <button
          className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setIsSeatModalOpen(true)}
          disabled={!isActive}
        >
          <ChairIcon className="w-5 h-5 text-gray-400" /> Assign New Seat
        </button>

        {/* Delete Student: Only for EXPIRED students */}
        <button
          className="inline-flex items-center justify-center gap-2 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 px-6 py-3.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setIsDeleteModalOpen(true)}
          disabled={isActive}
        >
          <TrashIcon className="w-5 h-5 text-red-400" /> Delete Profile
        </button>

        {/* Edit Profile: Available for ALL students */}
        <button
          className="inline-flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 px-6 py-3.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all"
          onClick={handleOpenEdit}
        >
          <EditIcon className="w-5 h-5 text-indigo-400" /> Edit Details
        </button>

        {/* Renew Membership: Only for EXPIRED students */}
        <button
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border border-transparent hover:shadow-lg hover:shadow-emerald-900/20 hover:-translate-y-0.5 px-6 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setIsRenewModalOpen(true)}
          disabled={isActive}
        >
          <RefreshIcon className="w-5 h-5" /> Renew Membership
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Profile Permanently"
        >
          <p className="text-sm font-medium text-gray-600 leading-relaxed">
            Are you sure you want to permanently delete this student? This action cannot be undone and will erase all their history, subscriptions, and profile data.
          </p>
          <div className="mt-8 flex justify-end gap-3">
            <button 
              className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="px-6 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Confirm Delete'
              )}
            </button>
          </div>
        </Modal>
      )}

      {/* Renew Membership Modal */}
      {isRenewModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsRenewModalOpen(false)}
          title="Renew Membership"
        >
          <form onSubmit={handleRenew} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold text-gray-500 uppercase tracking-wider">Subscription Plan</label>
              <select
                required
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 font-bold text-gray-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all shadow-inner"
              >
                <option value="" disabled>Select a plan</option>
                {plans?.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.durationDays} days)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-gray-500 uppercase tracking-wider">Assign Seat (Optional)</label>
              <select
                value={selectedSeatNumber}
                onChange={(e) => setSelectedSeatNumber(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 font-bold text-gray-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all shadow-inner"
              >
                <option value="">Auto-assign first available</option>
                {seats?.filter(s => s.status === 'AVAILABLE' || s.student?.id === student.id).map(s => (
                  <option key={s.id} value={s.seatNumber}>
                    Seat #{s.seatNumber} {s.student?.id === student.id ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button"
                className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={() => setIsRenewModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-900/20 hover:-translate-y-0.5 transition-all"
              >
                Confirm Renewal
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assign Seat Modal */}
      {isSeatModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsSeatModalOpen(false)}
          title="Assign New Seat"
        >
          <div className="mb-6 rounded-2xl bg-gray-50/50 p-5 border border-gray-100 text-center">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Assignment</p>
            <p className="text-xl font-black text-gray-900">
              {student.seat ? `#${student.seat.seatNumber}` : 'None Assigned'}
            </p>
          </div>
          <form onSubmit={handleAssignSeat} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold text-gray-500 uppercase tracking-wider">Select New Seat</label>
              <select
                required
                value={assignSeatNumber}
                onChange={(e) => setAssignSeatNumber(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 font-bold text-gray-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all shadow-inner"
              >
                <option value="" disabled>Select a seat</option>
                {seats?.filter(s => s.status === 'AVAILABLE').map(s => (
                  <option key={s.id} value={s.seatNumber}>
                    Seat #{s.seatNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button"
                className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={() => setIsSeatModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-900/20 hover:-translate-y-0.5 transition-all"
              >
                Confirm Assignment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Details"
        >
          <form onSubmit={handleEditProfile} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number *</label>
              <input
                type="tel"
                required
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 font-bold text-gray-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all shadow-inner"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 font-bold text-gray-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button"
                className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-900/20 hover:-translate-y-0.5 transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function formatAadhar(val: string) {
  // Format as XXXX XXXX XXXX
  const cleaned = val.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{4})(\d{4})(\d{4})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  return val;
}

// ─── SVG Icons ───────────────────────────────────────────────────────────

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function IdCardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 10h2" /><path d="M16 14h2" /><path d="M6.17 15a3 3 0 0 1 5.66 0" /><circle cx="9" cy="11" r="2" /><rect x="2" y="5" width="20" height="14" rx="2" />
    </svg>
  );
}

function MapPinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function EditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function ChairIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 10v4" /><path d="M19 10v4" /><path d="M7 14h10" /><path d="M7 18v-4" /><path d="M17 18v-4" /><path d="M15 10V6a2 2 0 0 0-2-2H11a2 2 0 0 0-2 2v4" />
    </svg>
  );
}

function RefreshIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
    </svg>
  );
}
