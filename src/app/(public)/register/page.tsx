'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Image from "next/image";
import { Turnstile } from '@marsidev/react-turnstile';


export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    libraryName: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    maxCapacity: '',
  });
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!form.libraryName || !form.ownerName || !form.email || !form.password || !form.phone || !form.address || !form.maxCapacity) {
      setError('Please fill in all fields.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
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
      setTurnstileToken('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#4CAF50] flex items-center justify-center p-4 py-10">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-36 -translate-x-36" />

      <div className="w-full max-w-5xl relative z-10 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Info Panel */}
          <div className="hidden lg:flex flex-col justify-center text-white p-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                  <Image 
                    src="/logo.png" 
                    alt="Ligital Logo" 
                    width={48} 
                    height={48} 
                    className="object-contain p-1"
                  />
                </div>
                <span className="text-2xl font-bold">Ligital</span>
              </div>
              <h2 className="text-3xl font-bold mb-4 leading-tight">
                Start managing your library the smart way
              </h2>
              <p className="text-white/70 text-lg leading-relaxed">
                Join hundreds of library owners who have modernized their operations with Ligital.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: '/trial.png', text: '14-day free trial, no credit card required' },
                { icon: '/dashboard.png', text: 'Complete dashboard with real-time analytics' },
                { icon: '/seat.png', text: 'Visual seat management system' },
                { icon: '/mobile.png', text: 'Mobile-friendly interface' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <Image src={item.icon} alt="Feature Icon" width={20} height={20} className="object-contain" />
                  <span className="text-white/90 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Registration Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6">
              <div className="inline-flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E8F5E9] rounded-xl flex items-center justify-center text-xl">
                  📚
                </div>
                <span className="text-xl font-bold text-[#1B5E20]">Ligital</span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-1">Create your account</h2>
            <p className="text-sm text-gray-400 mb-6">Start your 14-day free trial</p>

            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
                <span>✅</span>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="register-library-name"
                  label="Library Name"
                  name="libraryName"
                  placeholder="My Study Library"
                  value={form.libraryName}
                  onChange={handleChange}
                />
                <Input
                  id="register-owner-name"
                  label="Owner Name"
                  name="ownerName"
                  placeholder="John Doe"
                  value={form.ownerName}
                  onChange={handleChange}
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
              />

              <Input
                id="register-password"
                label="Password"
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="register-phone"
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={handleChange}
                />
                <Input
                  id="register-max-capacity"
                  label="Max Seat Capacity"
                  name="maxCapacity"
                  type="number"
                  placeholder="e.g. 50"
                  value={form.maxCapacity}
                  onChange={handleChange}
                />
              </div>

              <Input
                id="register-address"
                label="Library Address"
                name="address"
                placeholder="Full address"
                value={form.address}
                onChange={handleChange}
              />

              {/* CAPTCHA */}
              <div className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 min-h-[50px] flex items-center mb-4">
                <Turnstile 
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} 
                  onSuccess={(token) => setTurnstileToken(token)}
                  options={{ theme: 'light', size: 'flexible' }}
                />
              </div>

              <Button
                id="register-submit"
                type="submit"
                fullWidth
                loading={loading}
                size="lg"
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-[#1B5E20] hover:text-[#2E7D32] transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
