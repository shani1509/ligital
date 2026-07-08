'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const features = [
  {
    icon: '/managment.png',
    title: 'Student Management',
    description: 'Register students, track subscriptions, and manage their seat assignments effortlessly with zero paperwork.',
  },
  {
    icon: '/seat.png',
    title: 'Seat Management',
    description: 'Beautiful visual seat grids to assign, release, and monitor occupancy in real-time across your library.',
  },
  {
    icon: '/plans.png',
    title: 'Flexible Plans',
    description: 'Create custom subscription tiers with flexible durations, pricing, and automated renewal reminders.',
  },
  {
    icon: '/report.png',
    title: 'Analytics & Reports',
    description: 'Deep dive into revenue charts, active subscriptions, and long-term occupancy trends at a single glance.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen font-sans bg-[#FAFAFA] selection:bg-emerald-500/30">
      
      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#022C16] via-[#064E3B] to-[#047857] text-white pt-6 pb-32 md:pb-48">
        
        {/* Decorative Blur Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-300/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />

        {/* Frosted Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-20">
          <nav className="flex items-center justify-between px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-lg shadow-black/20">
                <Image 
                  src="/logo.png" 
                  alt="Ligital Logo" 
                  width={48} 
                  height={48} 
                  className="object-contain p-1.5"
                />
              </div>
              <span className="text-2xl font-black tracking-tight text-white drop-shadow-md">Ligital</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/login"
                className="hidden sm:inline-block px-6 py-2.5 text-sm font-bold text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-white text-emerald-950 text-sm font-black tracking-wide rounded-xl hover:bg-emerald-50 hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 md:pt-36 text-center">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-sm font-bold text-emerald-100 mb-8 backdrop-blur-md shadow-inner tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              The Smart Library Platform
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-black leading-[1.1] mb-8 tracking-tighter drop-shadow-2xl">
              Ligital — Smart
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-emerald-100 to-white">
                Library Management
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-xl md:text-2xl text-emerald-100/80 mb-12 leading-relaxed font-medium">
              The all-in-one operating system for modern study libraries. Manage students, track live seat occupancy, and automate subscriptions from one stunning dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link
                href="/register"
                id="hero-get-started"
                className="w-full sm:w-auto px-10 py-4 bg-white text-emerald-900 font-black rounded-2xl hover:bg-emerald-50 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all shadow-2xl text-lg hover:-translate-y-1 transform border border-white"
              >
                Start Free Trial →
              </Link>
              <Link
                href="/login"
                id="hero-login"
                className="w-full sm:w-auto px-10 py-4 bg-emerald-900/30 border-2 border-emerald-400/30 text-white font-bold rounded-2xl hover:bg-emerald-800/40 hover:border-emerald-300/50 transition-all text-lg backdrop-blur-md hover:-translate-y-1 transform"
              >
                Enter Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Soft Slant Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#FAFAFA]" />
      </section>

      {/* ─── Features Section ─────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-[#FAFAFA] relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-sm font-black text-emerald-600 tracking-[0.2em] uppercase mb-4 block">Platform Features</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight drop-shadow-sm">
              Everything you need to run your library.
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
              From automated student onboarding to deep revenue analytics, Ligital handles the heavy lifting so you can focus on growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-2 transition-all duration-300 border border-gray-100 group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner border border-emerald-100/50">
                  <Image src={feature.icon} alt={feature.title} width={40} height={40} className="object-contain drop-shadow-sm" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight group-hover:text-emerald-700 transition-colors">{feature.title}</h3>
                <p className="text-base text-gray-500 leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Massive CTA Section ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 rounded-[3rem] p-12 md:p-20 text-center shadow-2xl shadow-emerald-900/30 relative overflow-hidden">
          {/* Inner Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-lg">
              Ready to digitize your library?
            </h2>
            <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto font-medium">
              Join dozens of library owners who have completely transformed their operations. Start your free trial today. No credit card required.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-10 py-5 bg-white text-emerald-900 font-black rounded-2xl hover:bg-emerald-50 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all shadow-xl text-xl hover:-translate-y-1 transform border border-white"
            >
              Get Started for Free →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-white pt-20 pb-10 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                <Image 
                  src="/logo.png" 
                  alt="Ligital Logo" 
                  width={36} 
                  height={36} 
                  className="object-contain p-1"
                />
              </div>
              <span className="font-black text-2xl tracking-tight">Ligital</span>
            </div>
            
            <div className="flex items-center gap-8">
              <Link href="/login" className="text-sm font-bold tracking-wide text-gray-400 hover:text-white transition-colors uppercase">
                Login
              </Link>
              <Link href="/register" className="text-sm font-bold tracking-wide text-gray-400 hover:text-white transition-colors uppercase">
                Register
              </Link>
              <Link href="#" className="text-sm font-bold tracking-wide text-gray-400 hover:text-white transition-colors uppercase">
                Privacy
              </Link>
              <Link href="#" className="text-sm font-bold tracking-wide text-gray-400 hover:text-white transition-colors uppercase">
                Terms
              </Link>
            </div>
          </div>
          
          <div className="text-center md:text-left pt-8 border-t border-gray-800/50">
            <p className="text-sm font-medium text-gray-600 tracking-wide">
              © {new Date().getFullYear()} Ligital Inc. All rights reserved. Designed for library owners.
            </p>
          </div>
        </div>
      </footer>
      
    </div>
  );
}
