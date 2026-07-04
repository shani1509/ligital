'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Image from "next/image";
import { Turnstile } from '@marsidev/react-turnstile';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!turnstileToken) {
      setError('Please complete the security check.');
      return;
    }

    setLoading(true);
    const result = await login(email, password, turnstileToken);
    setLoading(false);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.message || 'Login failed. Please try again.');
      setTurnstileToken('');
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen w-full bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#4CAF50] flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-36 -translate-x-36" />

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            {/* <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
              <Image 
                src="/logo.png" 
                alt="Ligital Logo" 
                width={48} 
                height={48} 
                className="object-contain p-1"
              />
            </div> */}
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome To Ligital</h1>
          <p className="text-white/70 text-sm mt-1">Sign in to your Ligital account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="login-email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />

            <Input
              id="login-password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <div className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 min-h-[50px] flex items-center mb-4">
              <Turnstile 
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} 
                onSuccess={(token) => setTurnstileToken(token)}
                options={{ theme: 'light' }}
              />
            </div>

            <Button
              id="login-submit"
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-semibold text-[#1B5E20] hover:text-[#2E7D32] transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
