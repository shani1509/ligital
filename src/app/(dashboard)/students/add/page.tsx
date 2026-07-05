'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate, addDays } from '@/lib/utils';
import type { ApiResponse } from '@/types';

interface AvailableSeat {
  id: string;
  seatNumber: number;
  status: string;
}

interface Plan {
  id: string;
  name: string;
  durationDays: number;
  pricePaise: number;
  isActive: boolean;
}

export default function AddStudentPage() {
  const router = useRouter();

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [enrollmentDate, setEnrollmentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [address, setAddress] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [seatNumber, setSeatNumber] = useState('');
  const [planId, setPlanId] = useState('');

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch available seats and plans
  const { data: seatsData } = useFetch<AvailableSeat[]>('/api/seats');
  const { data: plansData } = useFetch<Plan[]>('/api/plans');

  const availableSeats = (seatsData ?? []).filter((s) => s.status === 'AVAILABLE');
  const activePlans = (plansData ?? []).filter((p) => p.isActive);
  const selectedPlan = activePlans.find((p) => p.id === planId);

  // Photo handler
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.jpg') && !fileName.endsWith('.jpeg')) {
      setErrors((prev) => ({ ...prev, photo: 'Only .jpg and .jpeg files are allowed' }));
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.photo;
      return next;
    });
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // Client-side validation
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!phone.trim() || phone.length < 10) newErrors.phone = 'Phone must be at least 10 digits';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address';
    if (aadharNumber && !/^\d{12}$/.test(aadharNumber)) newErrors.aadharNumber = 'Aadhar must be exactly 12 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Open confirmation modal
  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setShowConfirm(true);
  };

  // Actual API submission
  const handleConfirm = async () => {
    setShowConfirm(false);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('phone', phone.trim());
      if (email) formData.append('email', email.trim());
      if (aadharNumber) formData.append('aadharNumber', aadharNumber.trim());
      if (enrollmentDate) formData.append('joinDate', enrollmentDate);
      if (address) formData.append('address', address.trim());
      if (seatNumber) formData.append('seatNumber', seatNumber);
      if (planId) formData.append('planId', planId);
      if (photo) formData.append('photo', photo);

      const res = await fetch('/api/students', { method: 'POST', body: formData });
      const json: ApiResponse = await res.json();

      if (json.success) {
        router.refresh();
        router.push('/students');
      } else {
        setServerError(json.message || 'Failed to add student');
      }
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get seat label for confirmation modal
  const getSeatLabel = () => {
    if (!seatNumber) return 'Auto-assign';
    return `Seat #${seatNumber}`;
  };

  // Get plan label for confirmation modal
  const getPlanLabel = () => {
    if (!selectedPlan) return 'None';
    return `${selectedPlan.name} — ${formatCurrency(selectedPlan.pricePaise)}`;
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Student</h1>
        <p className="mt-1 text-sm text-gray-500">
          Register a new student in your library.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmitClick} className="space-y-5 p-6">
          {serverError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {serverError}
            </div>
          )}

          {/* Name & Mobile */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              id="student-name"
              label="Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              error={errors.name}
            />
            <Input
              id="student-phone"
              label="Mobile *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              error={errors.phone}
            />
          </div>

          {/* Email & Aadhar */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              id="student-email"
              label="Email (Optional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              error={errors.email}
            />
            <Input
              id="student-aadhar"
              label="Aadhar Number"
              value={aadharNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                setAadharNumber(val);
              }}
              placeholder="123456789012"
              maxLength={12}
              error={errors.aadharNumber}
            />
          </div>

          {/* Enrollment Date & Address */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="student-enrollment-date" className="mb-1.5 block text-sm font-medium text-gray-700">
                Enrollment Date
              </label>
              <input
                id="student-enrollment-date"
                type="date"
                value={enrollmentDate}
                onChange={(e) => setEnrollmentDate(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm transition-all outline-none focus:ring-2 focus:ring-[#4CAF50]/20 focus:border-[#4CAF50]"
              />
            </div>
            <div>
              <label htmlFor="student-address" className="mb-1.5 block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                id="student-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address"
                rows={2}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm transition-all outline-none focus:ring-2 focus:ring-[#4CAF50]/20 focus:border-[#4CAF50] resize-none"
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label htmlFor="student-photo" className="mb-1.5 block text-sm font-medium text-gray-700">
              Photo (Optional)
            </label>
            <div className="flex items-center gap-4">
              {photoPreview && (
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#C8E6C9]">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <input
                  id="student-photo"
                  type="file"
                  accept=".jpg,.jpeg"
                  onChange={handlePhotoChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#E8F5E9] file:text-[#1B5E20] hover:file:bg-[#C8E6C9] file:cursor-pointer file:transition-colors"
                />
                <p className="mt-1 text-xs text-gray-400">Only .jpg and .jpeg files accepted</p>
              </div>
            </div>
            {errors.photo && <p className="mt-1 text-xs text-red-500">{errors.photo}</p>}
          </div>

          {/* Seat Selection */}
          <div>
            <label htmlFor="seat-select" className="mb-1.5 block text-sm font-medium text-gray-700">
              Assign Seat
            </label>
            <select
              id="seat-select"
              value={seatNumber}
              onChange={(e) => setSeatNumber(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm transition-all outline-none focus:ring-2 focus:ring-[#4CAF50]/20 focus:border-[#4CAF50] bg-white"
            >
              <option value="">Auto-assign first available</option>
              {availableSeats.map((seat) => (
                <option key={seat.id} value={seat.seatNumber}>
                  Seat #{seat.seatNumber}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              {availableSeats.length} seats available
            </p>
          </div>

          {/* Plan Selection */}
          <div>
            <label htmlFor="plan-select" className="mb-1.5 block text-sm font-medium text-gray-700">
              Subscription Plan (Optional)
            </label>
            <select
              id="plan-select"
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm transition-all outline-none focus:ring-2 focus:ring-[#4CAF50]/20 focus:border-[#4CAF50] bg-white"
            >
              <option value="">No plan (status will be Expired)</option>
              {activePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — {formatCurrency(plan.pricePaise)} / {plan.durationDays} days
                </option>
              ))}
            </select>
          </div>

          {/* Plan Preview */}
          {selectedPlan && (
            <div className="rounded-xl border border-[#C8E6C9] bg-[#E8F5E9] p-4">
              <h4 className="text-sm font-semibold text-[#1B5E20]">Plan Details</h4>
              <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Price</p>
                  <p className="font-medium text-gray-900">{formatCurrency(selectedPlan.pricePaise)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">{selectedPlan.durationDays} days</p>
                </div>
                <div>
                  <p className="text-gray-500">Expires On</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(addDays(new Date(), selectedPlan.durationDays))}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/students')}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading} id="btn-submit-student">
              Add Student
            </Button>
          </div>
        </form>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Student Details"
        size="md"
      >
        <p className="text-sm text-gray-500 mb-4">
          Are you sure you want to add this student? Please review the details below.
        </p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="text-gray-500">Name</div>
            <div className="font-medium text-gray-900">{name}</div>

            <div className="text-gray-500">Mobile</div>
            <div className="font-medium text-gray-900">{phone}</div>

            {email && (
              <>
                <div className="text-gray-500">Email</div>
                <div className="font-medium text-gray-900">{email}</div>
              </>
            )}

            {aadharNumber && (
              <>
                <div className="text-gray-500">Aadhar</div>
                <div className="font-medium text-gray-900">
                  {'XXXX-XXXX-' + aadharNumber.slice(-4)}
                </div>
              </>
            )}

            <div className="text-gray-500">Enrollment Date</div>
            <div className="font-medium text-gray-900">
              {enrollmentDate ? formatDate(enrollmentDate) : '—'}
            </div>

            {address && (
              <>
                <div className="text-gray-500">Address</div>
                <div className="font-medium text-gray-900">{address}</div>
              </>
            )}

            <div className="text-gray-500">Seat</div>
            <div className="font-medium text-gray-900">{getSeatLabel()}</div>

            <div className="text-gray-500">Plan</div>
            <div className="font-medium text-gray-900">{getPlanLabel()}</div>

            {photo && (
              <>
                <div className="text-gray-500">Photo</div>
                <div className="font-medium text-gray-900">{photo.name}</div>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Go Back
          </Button>
          <Button onClick={handleConfirm} loading={loading}>
            Confirm & Add
          </Button>
        </div>
      </Modal>
    </div>
  );
}
