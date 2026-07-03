'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFetch, useMutation } from '@/hooks/useFetch';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { formatCurrency, formatDate, addDays } from '@/lib/utils';

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
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [planId, setPlanId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  const { data: seatsData } = useFetch<AvailableSeat[]>('/api/seats');
  const { data: plansData } = useFetch<Plan[]>('/api/plans');
  const { mutate, loading } = useMutation();

  const availableSeats = (seatsData ?? []).filter((s) => s.status === 'AVAILABLE');
  const activePlans = (plansData ?? []).filter((p) => p.isActive);
  const selectedPlan = activePlans.find((p) => p.id === planId);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!phone.trim() || phone.length < 10) newErrors.phone = 'Phone must be at least 10 digits';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    const body: Record<string, unknown> = { name: name.trim(), phone: phone.trim() };
    if (email) body.email = email.trim();
    if (address) body.address = address.trim();
    if (seatNumber) body.seatNumber = parseInt(seatNumber);
    if (planId) body.planId = planId;

    const result = await mutate('/api/students', 'POST', body);
    if (result.success) {
      router.push('/students');
    } else {
      setServerError(result.message || 'Failed to add student');
    }
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
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {serverError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {serverError}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              id="student-name"
              label="Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              error={errors.name}
            />
            <Input
              id="student-phone"
              label="Phone Number *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              error={errors.phone}
            />
          </div>

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
              id="student-address"
              label="Address (Optional)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main Street"
            />
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
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-all focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#C8E6C9]"
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
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-all focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#C8E6C9]"
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
            <div className="rounded-lg border border-[#C8E6C9] bg-[#E8F5E9] p-4">
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
    </div>
  );
}
