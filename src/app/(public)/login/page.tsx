'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Image from "next/image";
import { Turnstile } from '@marsidev/react-turnstile';
import { Mail, Lock } from 'lucide-react';

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
    <div className="relative overflow-hidden min-h-screen w-full bg-gradient-to-br from-[#022C16] via-[#064E3B] to-[#047857] flex flex-col items-center justify-center pt-28 pb-4 px-4 md:p-4 selection:bg-emerald-500/30 font-sans">
      
      {/* Decorative Ambient Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-300/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10 animate-fade-in">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl mb-6">
            <Image 
              src="/logo.png" 
              alt="Ligital Logo" 
              width={40} 
              height={40} 
              className="object-contain p-1 invert brightness-0"
            />
          </div> */}
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">Welcome Back</h1>
          <p className="text-emerald-100/70 text-sm mt-3 font-medium tracking-wide">Sign in to your Ligital dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/40 p-8 md:p-10 border border-white/20 backdrop-blur-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm font-bold text-red-600 flex items-center gap-3 shadow-sm animate-scale-in">
              <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-600">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                id="login-email"
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-5 h-5" />}
              />

              <div className="relative">
                <div className="flex justify-between items-end mb-1">
                  <label htmlFor="login-password" className="block text-sm font-bold text-gray-700">
                    Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-emerald-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3.5 pl-12 pr-4 text-sm font-medium text-gray-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="w-full flex items-center justify-center border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 shadow-inner p-2">
              <div className="w-full [&>div]:w-full [&>div]:max-w-full [&_iframe]:!w-full [&_iframe]:!max-w-full flex justify-center">
                <Turnstile 
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} 
                  onSuccess={(token) => setTurnstileToken(token)}
                  options={{ theme: 'light', size: 'flexible' }}
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-black rounded-2xl hover:shadow-lg hover:shadow-emerald-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-transparent flex items-center justify-center text-lg"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign In securely'
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-sm font-medium text-gray-500">
              New to Ligital?{' '}
              <Link href="/register" className="font-black text-emerald-600 hover:text-emerald-800 transition-colors border-b-2 border-transparent hover:border-emerald-600">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
