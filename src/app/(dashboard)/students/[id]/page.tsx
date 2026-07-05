'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useFetch, useMutation } from '@/hooks/useFetch';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1B5E20] border-t-transparent" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
        <p>{error || 'Student not found.'}</p>
        <Link href="/students" className="mt-4 inline-block font-semibold underline">
          Return to Students List
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
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">

      {/* 1. Page Header & Breadcrumbs */}
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/students" className="hover:text-gray-900 transition-colors">
            Students
          </Link>{' '}
          <span className="mx-2">&gt;</span>{' '}
          <span className="font-semibold text-[#1B5E20]">Student Profile</span>
        </nav>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <UserIcon className="w-7 h-7 text-gray-700" /> Student Profile
          </h1>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium border ${isActive
                ? 'bg-green-100 text-green-700 border-green-200'
                : 'bg-red-100 text-red-700 border-red-200'
              }`}
          >
            ● {student.status.charAt(0) + student.status.slice(1).toLowerCase()}
          </span>
        </div>
      </div>

      {/* 2. Top Card (Profile Information) */}
      <Card className="flex flex-col md:flex-row overflow-hidden border border-gray-200 shadow-sm">

        {/* Left Column (Avatar) */}
        <div className="flex w-full md:w-[320px] flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/30">
          <div className="relative w-40 h-40 rounded-full overflow-hidden mb-6 shadow-sm ring-4 ring-green-50">
            {student.photoUrl ? (
              <Image
                src={student.photoUrl}
                alt={student.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex w-full h-full items-center justify-center bg-[#E8F5E9] text-6xl font-bold text-[#1B5E20]">
                {student.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <span
            className={`rounded-full px-4 py-1.5 text-sm font-semibold border ${isActive
                ? 'bg-[#E8F5E9] text-[#1B5E20] border-green-200'
                : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}
          >
            ● {isActive ? 'Active Member' : 'Inactive Member'}
          </span>
        </div>

        {/* Right Column (Details Grid) */}
        <div className="flex-1 w-full bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            {details.map((d, i) => (
              <div
                key={i}
                className={`p-6 flex items-start gap-4 ${i % 2 === 0 ? 'md:border-r border-gray-100' : ''
                  } ${i < 4 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="mt-0.5 text-gray-400">
                  {d.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">{d.label}</p>
                  <p className="text-sm font-semibold text-gray-900 leading-snug truncate whitespace-normal">
                    {d.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 3. Middle Card (Membership History) */}
      <Card className="overflow-hidden border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100 bg-white">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-gray-600" /> Membership History (Last 5)
          </h2>
        </div>

        <div className="overflow-x-auto bg-white">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F4FBF4] text-gray-700 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4">Seat No.</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {student.subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No membership history found.
                  </td>
                </tr>
              ) : (
                student.subscriptions.slice(0, 5).map((sub, idx) => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-md bg-green-50 px-3 py-1.5 text-xs font-semibold text-[#1B5E20] border border-green-100">
                        {sub.plan.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">{formatDate(sub.startDate)}</td>
                    <td className="px-6 py-4 text-gray-700 font-medium">{formatDate(sub.endDate)}</td>
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      {student.seat ? `Seat ${student.seat.seatNumber}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {sub.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 border border-green-200">
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-600"></span> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 border border-red-200">
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-600"></span> Expired
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 4. Bottom Action Bar */}
      <div className="flex flex-wrap items-center justify-end gap-4 pt-4 pb-12">

        {/* Assign New Seat: Only for ACTIVE students */}
        <Button
          variant="primary"
          className="px-5 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setIsSeatModalOpen(true)}
          disabled={!isActive}
        >
          <ChairIcon className="w-4 h-4 mr-2" /> Assign New Seat
        </Button>

        {/* Delete Student: Only for EXPIRED students */}
        <Button
          variant="ghost"
          className="bg-red-50 text-red-600 hover:bg-red-100 font-medium px-5 py-2.5 rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setIsDeleteModalOpen(true)}
          disabled={isActive}
        >
          <TrashIcon className="w-4 h-4 mr-2" /> Delete Student
        </Button>

        {/* Edit Profile: Available for ALL students */}
        <Button
          variant="ghost"
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-5 py-2.5 rounded-xl shadow-sm transition-colors"
          onClick={handleOpenEdit}
        >
          <EditIcon className="w-4 h-4 mr-2" /> Edit Profile
        </Button>

        {/* Renew Membership: Only for EXPIRED students */}
        <Button
          variant="primary"
          className="px-5 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setIsRenewModalOpen(true)}
          disabled={isActive}
        >
          <RefreshIcon className="w-4 h-4 mr-2" /> Renew Membership
        </Button>

      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Student Permanently"
        >
          <p className="text-sm text-gray-600">
            Are you sure you want to permanently delete this student? This action cannot be undone and will erase all their history and subscriptions.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={isDeleting}>
              Confirm Delete
            </Button>
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
          <form onSubmit={handleRenew} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Subscription Plan</label>
              <select
                required
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-[#4CAF50]"
              >
                <option value="" disabled>Select a plan</option>
                {plans?.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.durationDays} days)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Assign Seat</label>
              <select
                value={selectedSeatNumber}
                onChange={(e) => setSelectedSeatNumber(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-[#4CAF50]"
              >
                <option value="">Auto-assign first available</option>
                {seats?.filter(s => s.status === 'AVAILABLE' || s.student?.id === student.id).map(s => (
                  <option key={s.id} value={s.seatNumber}>
                    Seat #{s.seatNumber} {s.student?.id === student.id ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsRenewModalOpen(false)} type="button">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#1B5E20] text-white hover:bg-[#124116]">
                Confirm Renewal
              </Button>
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
          <div className="mb-4 rounded-lg bg-gray-50 p-4 border border-gray-100">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Current Seat:</span> {student.seat ? `#${student.seat.seatNumber}` : 'None Assigned'}
            </p>
          </div>
          <form onSubmit={handleAssignSeat} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Select New Seat</label>
              <select
                required
                value={assignSeatNumber}
                onChange={(e) => setAssignSeatNumber(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-[#4CAF50]"
              >
                <option value="" disabled>Select a seat</option>
                {seats?.filter(s => s.status === 'AVAILABLE').map(s => (
                  <option key={s.id} value={s.seatNumber}>
                    Seat #{s.seatNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsSeatModalOpen(false)} type="button">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#1B5E20] text-white hover:bg-[#124116]">
                Confirm Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Profile"
        >
          <form onSubmit={handleEditProfile} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number *</label>
              <input
                type="tel"
                required
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-[#4CAF50]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-[#4CAF50]"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)} type="button">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#1B5E20] text-white hover:bg-[#124116]">
                Save Changes
              </Button>
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
