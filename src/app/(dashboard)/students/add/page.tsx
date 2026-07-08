'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate, addDays } from '@/lib/utils';
import type { ApiResponse } from '@/types';
import { 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  Calendar, 
  MapPin, 
  Image as ImageIcon, 
  Armchair, 
  ShieldCheck, 
  AlertTriangle,
  X,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    if (!validate()) {
      // Scroll to top to see errors if any
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      setServerError('Network error. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // Get seat label for confirmation modal
  const getSeatLabel = () => {
    if (!seatNumber) return 'Auto-assign First Available';
    return `Seat #${seatNumber}`;
  };

  // Get plan label for confirmation modal
  const getPlanLabel = () => {
    if (!selectedPlan) return 'None Selected (Will be marked Expired)';
    return `${selectedPlan.name}`;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-fade-in pb-20 font-sans">
      {/* 1. Page Header */}
      <div className="pt-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Student Enrollment</h1>
        <p className="mt-3 text-base md:text-lg text-gray-500 max-w-xl">Register a new student, assign their physical seat, and setup their initial subscription.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmitClick} className="divide-y divide-gray-100">
          
          {serverError && (
            <div className="m-8 mb-0 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-100 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              {serverError}
            </div>
          )}

          {/* Section 1: Personal Details */}
          <div className="p-8 md:p-10 space-y-8">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-inner">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Personal Details</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Full Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className={cn(
                      "block w-full rounded-xl border bg-gray-50 pl-11 pr-5 py-3.5 text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-4 transition-all",
                      errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10"
                    )}
                  />
                </div>
                {errors.name && <p className="text-xs font-bold text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Mobile Number *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className={cn(
                      "block w-full rounded-xl border bg-gray-50 pl-11 pr-5 py-3.5 text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-4 transition-all",
                      errors.phone ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10"
                    )}
                  />
                </div>
                {errors.phone && <p className="text-xs font-bold text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Email Address <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className={cn(
                      "block w-full rounded-xl border bg-gray-50 pl-11 pr-5 py-3.5 text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-4 transition-all",
                      errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10"
                    )}
                  />
                </div>
                {errors.email && <p className="text-xs font-bold text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Aadhar Number <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={aadharNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setAadharNumber(val);
                    }}
                    placeholder="1234 5678 9012"
                    maxLength={12}
                    className={cn(
                      "block w-full rounded-xl border bg-gray-50 pl-11 pr-5 py-3.5 text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-4 transition-all",
                      errors.aadharNumber ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10"
                    )}
                  />
                </div>
                {errors.aadharNumber && <p className="text-xs font-bold text-red-500 mt-1">{errors.aadharNumber}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Enrollment Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={enrollmentDate}
                    onChange={(e) => setEnrollmentDate(e.target.value)}
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-5 py-3.5 text-gray-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="block text-sm font-bold text-gray-700">Full Address <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="relative">
                  <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter permanent address..."
                    rows={3}
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-5 py-3.5 text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="space-y-3 sm:col-span-2">
                <label className="block text-sm font-bold text-gray-700">Student Photo <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="flex items-center gap-6 p-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="w-20 h-20 rounded-[1.25rem] overflow-hidden flex-shrink-0 border-2 border-white shadow-md bg-gray-100 flex items-center justify-center">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="photo-upload"
                      accept=".jpg,.jpeg"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <label 
                      htmlFor="photo-upload"
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all"
                    >
                      Choose Image...
                    </label>
                    <p className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-wider">JPG, JPEG ONLY. MAX 5MB.</p>
                  </div>
                </div>
                {errors.photo && <p className="text-xs font-bold text-red-500">{errors.photo}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Library Assignment */}
          <div className="p-8 md:p-10 space-y-8 bg-emerald-50/20">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-inner">
                <Armchair className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Library Assignment</h2>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Assign Seat</label>
                <select
                  value={seatNumber}
                  onChange={(e) => setSeatNumber(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-gray-900 font-medium focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                >
                  <option value="">Auto-assign first available</option>
                  {availableSeats.map((seat) => (
                    <option key={seat.id} value={seat.seatNumber}>
                      Seat #{seat.seatNumber}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs font-bold text-emerald-600 tracking-wider uppercase">
                  {availableSeats.length} seats currently available
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Subscription Tier <span className="text-gray-400 font-normal">(Optional)</span></label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-gray-900 font-medium focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                >
                  <option value="">No Plan (Status will be Expired)</option>
                  {activePlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} — {formatCurrency(plan.pricePaise)} / {plan.durationDays} days
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Premium Plan Receipt Preview */}
            {selectedPlan && (
              <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm relative overflow-hidden">
                {/* Decorative background logo/icon */}
                <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-500/5 rotate-12 pointer-events-none" />
                
                <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-4">Selected Tier Breakdown</h4>
                
                <div className="grid grid-cols-3 gap-4 relative z-10">
                  <div>
                    <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-wider mb-1">Base Price</p>
                    <p className="font-black text-xl text-gray-900">{formatCurrency(selectedPlan.pricePaise)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-wider mb-1">Duration</p>
                    <p className="font-bold text-lg text-gray-900">{selectedPlan.durationDays} days</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-wider mb-1">Estimated Expiry</p>
                    <p className="font-bold text-lg text-gray-900">
                      {formatDate(addDays(new Date(), selectedPlan.durationDays))}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions Footer */}
          <div className="px-8 py-6 bg-gray-50/50 flex flex-col sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/students')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={loading} 
              id="btn-submit-student"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-[#1B5E20] hover:bg-[#124116] shadow-lg shadow-green-900/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              Review Enrollment <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Premium Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-100 animate-scale-in">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-emerald-50/50">
              <h2 className="text-xl font-extrabold text-emerald-900 tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                Final Review
              </h2>
              <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:text-gray-900 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8">
              <p className="text-sm font-medium text-gray-600 mb-6">
                Please verify the enrollment details below before committing them to the database.
              </p>
              
              <div className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
                <div className="grid grid-cols-1 divide-y divide-gray-200">
                  <div className="p-4 grid grid-cols-3 gap-4 items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider col-span-1">Name</span>
                    <span className="font-bold text-gray-900 col-span-2">{name}</span>
                  </div>
                  <div className="p-4 grid grid-cols-3 gap-4 items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider col-span-1">Mobile</span>
                    <span className="font-bold text-gray-900 col-span-2">{phone}</span>
                  </div>
                  <div className="p-4 grid grid-cols-3 gap-4 items-center bg-emerald-50/50">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider col-span-1">Seat</span>
                    <span className="font-black text-emerald-800 col-span-2">{getSeatLabel()}</span>
                  </div>
                  <div className="p-4 grid grid-cols-3 gap-4 items-center bg-emerald-50/50">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider col-span-1">Tier</span>
                    <span className="font-bold text-emerald-800 col-span-2">{getPlanLabel()}</span>
                  </div>
                </div>
              </div>

              {(email || aadharNumber) && (
                <div className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
                  + Additional optional details provided
                </div>
              )}
            </div>
            
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex gap-3 justify-end">
              <Button 
                variant="secondary" 
                onClick={() => setShowConfirm(false)} 
                className="py-3 px-6 rounded-xl font-bold bg-white"
              >
                Go Back
              </Button>
              <Button 
                onClick={handleConfirm} 
                loading={loading} 
                className="py-3 px-6 rounded-xl font-bold bg-[#1B5E20] hover:bg-[#124116] shadow-md shadow-green-900/20"
              >
                Confirm & Enroll
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
