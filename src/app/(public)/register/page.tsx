'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Image from "next/image";
import { Turnstile } from '@marsidev/react-turnstile';
import { Building2, User, Mail, Lock, Phone, MapPin, Users, Gift, BarChart3, LayoutGrid, Smartphone } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    libraryName: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    maxCapacity: '',
  });
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear specific field error when typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSuccess('');

    // Validation
    if (!form.libraryName || !form.ownerName || !form.email || !form.password || !form.confirmPassword || !form.phone || !form.address || !form.maxCapacity) {
      setError('Please fill in all fields.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!turnstileToken) {
      setError('Please complete the security check.');
      return;
    }

    setLoading(true);
    const result = await register({
      libraryName: form.libraryName,
      ownerName: form.ownerName,
      email: form.email,
      password: form.password,
      phone: form.phone,
      address: form.address,
      maxCapacity: parseInt(form.maxCapacity, 10),
      cfTurnstileToken: turnstileToken,
    });
    setLoading(false);

    if (result.success) {
      setSuccess(result.message || 'Registration successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } else {
      setError(result.message || 'Registration failed. Please try again.');
      if (result.errors) setFieldErrors(result.errors);
      setTurnstileToken('');
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen w-full bg-gradient-to-br from-[#022C16] via-[#064E3B] to-[#047857] flex flex-col items-center justify-center pt-28 pb-12 px-4 md:py-12 selection:bg-emerald-500/30 font-sans">
      
      {/* Decorative Ambient Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-300/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="w-full max-w-[1000px] relative z-10 animate-fade-in">
        <div className="bg-white/10 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-black/50 border border-white/20 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            
            {/* Left: Info Panel */}
            <div className="hidden lg:flex flex-col justify-center text-white p-12 lg:col-span-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />
              <div className="relative z-10">
                {/* <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl mb-8">
                  <Image 
                    src="/logo.png" 
                    alt="Ligital Logo" 
                    width={32} 
                    height={32} 
                    className="object-contain p-1 invert brightness-0"
                  />
                </div> */}
                <h2 className="text-4xl font-black mb-6 leading-[1.1] tracking-tight drop-shadow-md">
                  Start managing<br />the <span className="text-emerald-300">smart</span> way.
                </h2>
                <p className="text-emerald-100/80 text-lg leading-relaxed font-medium mb-10">
                  Join hundreds of library owners who have modernized their operations with Ligital.
                </p>

                <div className="space-y-6">
                  {[
                    { icon: <Gift className="w-5 h-5 text-emerald-100" />, text: '7-day free trial, no credit card required' },
                    { icon: <BarChart3 className="w-5 h-5 text-emerald-100" />, text: 'Real-time analytics and revenue tracking' },
                    { icon: <LayoutGrid className="w-5 h-5 text-emerald-100" />, text: 'Visual seat management system' },
                    { icon: <Smartphone className="w-5 h-5 text-emerald-100" />, text: '100% Mobile-friendly dashboard' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-inner border border-white/10">
                        {item.icon}
                      </div>
                      <span className="text-white/90 font-bold">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Registration Form */}
            <div className="bg-white p-8 md:p-12 lg:col-span-3 relative">
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create your account</h2>
                <p className="text-gray-500 font-medium mt-2">Start your 7-day free trial today.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm font-bold text-red-600 flex items-center gap-3 shadow-sm animate-scale-in">
                  <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-600">⚠️</span>
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-sm font-bold text-emerald-700 flex items-center gap-3 shadow-sm animate-scale-in">
                  <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">✅</span>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    id="register-library-name"
                    label="Library Name"
                    name="libraryName"
                    placeholder="My Study Library"
                    value={form.libraryName}
                    onChange={handleChange}
                    error={fieldErrors.libraryName?.[0]}
                    icon={<Building2 className="w-5 h-5" />}
                  />
                  <Input
                    id="register-owner-name"
                    label="Owner Name"
                    name="ownerName"
                    placeholder="John Doe"
                    value={form.ownerName}
                    onChange={handleChange}
                    error={fieldErrors.ownerName?.[0]}
                    icon={<User className="w-5 h-5" />}
                  />
                </div>

                <Input
                  id="register-email"
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  error={fieldErrors.email?.[0]}
                  icon={<Mail className="w-5 h-5" />}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    id="register-password"
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    value={form.password}
                    onChange={handleChange}
                    error={fieldErrors.password?.[0]}
                    icon={<Lock className="w-5 h-5" />}
                  />
                  <Input
                    id="register-confirm-password"
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    error={fieldErrors.confirmPassword?.[0]}
                    icon={<Lock className="w-5 h-5" />}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    id="register-phone"
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={form.phone}
                    onChange={handleChange}
                    error={fieldErrors.phone?.[0]}
                    icon={<Phone className="w-5 h-5" />}
                  />
                  <Input
                    id="register-max-capacity"
                    label="Max Seat Capacity"
                    name="maxCapacity"
                    type="number"
                    placeholder="e.g. 50"
                    value={form.maxCapacity}
                    onChange={handleChange}
                    error={fieldErrors.maxCapacity?.[0]}
                    icon={<Users className="w-5 h-5" />}
                  />
                </div>

                <Input
                  id="register-address"
                  label="Library Address"
                  name="address"
                  placeholder="Full physical address"
                  value={form.address}
                  onChange={handleChange}
                  error={fieldErrors.address?.[0]}
                  icon={<MapPin className="w-5 h-5" />}
                />

                {/* CAPTCHA */}
                <div className="w-full flex items-center justify-center border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 shadow-inner p-2 mt-2">
                  <div className="w-full [&>div]:w-full [&>div]:max-w-full [&_iframe]:!w-full [&_iframe]:!max-w-full flex justify-center">
                    <Turnstile 
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} 
                      onSuccess={(token) => setTurnstileToken(token)}
                      options={{ theme: 'light', size: 'flexible' }}
                    />
                  </div>
                </div>

                <button
                  id="register-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-2 px-6 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-black rounded-2xl hover:shadow-lg hover:shadow-emerald-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-transparent flex items-center justify-center text-lg"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <div className="mt-8 text-center border-t border-gray-100 pt-6">
                <p className="text-sm font-medium text-gray-500">
                  Already have an account?{' '}
                  <Link href="/login" className="font-black text-emerald-600 hover:text-emerald-800 transition-colors border-b-2 border-transparent hover:border-emerald-600">
                    Sign in securely
                  </Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
