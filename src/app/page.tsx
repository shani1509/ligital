'use client';

import React from 'react';
import Link from 'next/link';

const features = [
  {
    icon: '🎓',
    title: 'Student Management',
    description: 'Register students, track subscriptions, and manage their seat assignments effortlessly.',
  },
  {
    icon: '💺',
    title: 'Seat Management',
    description: 'Visual seat grid to assign, release, and monitor occupancy in real-time.',
  },
  {
    icon: '📋',
    title: 'Flexible Plans',
    description: 'Create custom subscription plans with flexible durations and pricing.',
  },
  {
    icon: '📊',
    title: 'Analytics & Reports',
    description: 'Revenue charts, subscription analytics, and occupancy reports at a glance.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#4CAF50] text-white">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-36 -translate-x-36" />

        {/* Navbar */}
        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
              📚
            </div>
            <span className="text-xl font-bold tracking-tight">Ligital</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-semibold text-white/90 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 bg-white text-[#1B5E20] text-sm font-semibold rounded-xl hover:bg-[#E8F5E9] transition-colors shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32 text-center">
          <div className="animate-fade-in">
            <span className="inline-block px-4 py-1.5 bg-white/15 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              ✨ The Smart Library Platform
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
              Ligital — Smart
              <br />
              <span className="text-[#C8E6C9]">Library Management</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/80 mb-10 leading-relaxed">
              The all-in-one platform for study library owners. Manage students, seats, subscriptions, and billing — all from one beautiful dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                id="hero-get-started"
                className="px-8 py-3.5 bg-white text-[#1B5E20] font-bold rounded-xl hover:bg-[#E8F5E9] transition-all shadow-xl text-base hover:scale-105 transform"
              >
                Get Started Free →
              </Link>
              <Link
                href="/login"
                id="hero-login"
                className="px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-base"
              >
                Login to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#F3F4F6"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-[#F3F4F6]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-bold text-[#4CAF50] tracking-widest uppercase">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-3 mb-4">
              Everything you need to run your library
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              From student registration to revenue analytics, Ligital handles it all so you can focus on what matters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-14 h-14 bg-[#E8F5E9] rounded-xl flex items-center justify-center text-2xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Ready to digitize your library?
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Start your free trial today. No credit card required.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3.5 bg-[#1B5E20] text-white font-bold rounded-xl hover:bg-[#2E7D32] transition-all shadow-lg text-base hover:scale-105 transform"
          >
            Start Free Trial →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">📚</span>
              <span className="font-bold text-lg">Ligital</span>
            </div>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Ligital. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/register" className="text-sm text-gray-400 hover:text-white transition-colors">
                Register
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
