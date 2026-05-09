import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download Naploo App | Book Sleep Pods on the Go",
  description: "Download the Naploo app for iOS and Android. Book premium sleep pods, manage bookings, and find pods near you — all from your phone.",
  keywords: "naploo app download, sleep pod app, naploo android, naploo ios, pod booking app",
  openGraph: {
    title: "Download the Naploo App",
    description: "Book premium sleep pods on the go. Available for iOS and Android.",
    url: "https://naploo.com/download",
  },
  alternates: { canonical: "https://naploo.com/download" },
};

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const customerApkPath = '/downloads/naploo-customer.apk';
const partnerApkPath = '/downloads/naploo-partner.apk';

const features = [
  {
    icon: '🔍',
    title: 'Find Pods Nearby',
    desc: 'Discover sleep pods at airports, railways, malls, and hotels across India.',
  },
  {
    icon: '⚡',
    title: 'Instant Booking',
    desc: 'Book a pod in seconds. Check-in with a QR code — no waiting.',
  },
  {
    icon: '💳',
    title: 'Pay by Hour',
    desc: 'Only pay for the time you rest. Starting at just ₹99/hour.',
  },
  {
    icon: '🔔',
    title: 'Smart Reminders',
    desc: 'Get alerts for check-in, check-out, and exclusive deals.',
  },
  {
    icon: '⭐',
    title: 'Rate & Review',
    desc: 'Share your experience and help fellow travelers find the best pods.',
  },
  {
    icon: '🎁',
    title: 'Rewards & Offers',
    desc: 'Earn points on every booking and unlock exclusive discounts.',
  },
];

const partnerFeatures = [
  {
    icon: '📊',
    title: 'Real-Time Dashboard',
    desc: 'Track bookings, revenue, and occupancy from anywhere.',
  },
  {
    icon: '🛏️',
    title: 'Pod Management',
    desc: 'Manage inventory, set pricing, and control availability.',
  },
  {
    icon: '💰',
    title: 'Earnings & Payouts',
    desc: 'Monitor earnings and request instant payouts.',
  },
  {
    icon: '📈',
    title: 'Analytics',
    desc: 'Detailed insights on guest patterns and revenue trends.',
  },
];

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8">
            <span>📱</span>
            <span>Available on iOS & Android</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Download the
            <br />
            <span className="bg-gradient-to-r from-primary-400 via-violet-400 to-primary-300 bg-clip-text text-transparent">
              Naploo App
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Book premium sleep pods, manage your stays, and discover pods near you — 
            all from the palm of your hand.
          </p>

          {/* Direct APK Downloads */}
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <a
              href={customerApkPath}
              className="flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-primary-500 to-violet-500 text-white rounded-xl hover:from-primary-600 hover:to-violet-600 transition-all shadow-lg"
            >
              <span className="text-2xl">📥</span>
              <div className="text-left">
                <p className="text-[10px] text-white/70">Download APK</p>
                <p className="text-sm font-bold">Naploo Customer App</p>
              </div>
            </a>
            <a
              href={partnerApkPath}
              className="flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-violet-500 to-primary-500 text-white rounded-xl hover:from-violet-600 hover:to-primary-600 transition-all shadow-lg"
            >
              <span className="text-2xl">📥</span>
              <div className="text-left">
                <p className="text-[10px] text-white/70">Download APK</p>
                <p className="text-sm font-bold">Naploo Partner App</p>
              </div>
            </a>
          </div>

          <p className="text-xs text-white/30 mb-8">Android APK — Install directly on your device</p>

          {/* App Store / Play Store — Coming Soon */}
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <div className="flex items-center gap-3 px-6 py-3.5 bg-white/10 text-white/50 rounded-xl cursor-default">
              <span className="text-2xl">🍎</span>
              <div className="text-left">
                <p className="text-[10px] text-white/30">Coming Soon on</p>
                <p className="text-sm font-bold">App Store</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3.5 bg-white/10 text-white/50 rounded-xl cursor-default">
              <span className="text-2xl">▶️</span>
              <div className="text-left">
                <p className="text-[10px] text-white/30">Coming Soon on</p>
                <p className="text-sm font-bold">Google Play</p>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
              <div className="w-32 h-32 bg-white rounded-xl mx-auto mb-3 flex items-center justify-center">
                <span className="text-5xl">📷</span>
              </div>
              <p className="text-sm text-white/60">Scan to download</p>
              <p className="text-xs text-white/40 mt-1">Customer App</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
              <div className="w-32 h-32 bg-white rounded-xl mx-auto mb-3 flex items-center justify-center">
                <span className="text-5xl">📷</span>
              </div>
              <p className="text-sm text-white/60">Scan to download</p>
              <p className="text-xs text-white/40 mt-1">Partner App</p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer App Features */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
              Naploo for <span className="bg-gradient-to-r from-primary-400 to-violet-400 bg-clip-text text-transparent">Travelers</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Everything you need to find, book, and enjoy premium sleep pods across India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary-500/30 hover:bg-white/[0.08] transition-all duration-300"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/50">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner App Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
              <span>🏢</span>
              <span>For Property Owners</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
              Naploo <span className="bg-gradient-to-r from-violet-400 to-primary-400 bg-clip-text text-transparent">Partner App</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Manage your pods, track bookings, and grow your business with our dedicated partner app.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {partnerFeatures.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-violet-500/30 hover:bg-white/[0.08] transition-all duration-300"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/50">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Partner Download */}
          <div className="flex flex-wrap gap-4 justify-center mt-10">
            <a
              href={partnerApkPath}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-violet-500 to-primary-500 text-white rounded-xl hover:from-violet-600 hover:to-primary-600 transition-all shadow-lg"
            >
              <span className="text-xl">📥</span>
              <div className="text-left">
                <p className="text-[10px] text-white/70">Download APK</p>
                <p className="text-sm font-semibold">Partner App</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            Start Resting Smarter Today
          </h2>
          <p className="text-white/50 mb-8 max-w-lg mx-auto">
            Join thousands of travelers who trust Naploo for quality, affordable rest across India.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pods"
              className="px-8 py-4 bg-gradient-to-r from-primary-500 via-violet-500 to-primary-600 text-white font-semibold rounded-2xl hover:shadow-glow-lg transition-all duration-300"
            >
              Find Pods Near You
            </Link>
            <Link
              href="/partner"
              className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all"
            >
              Become a Partner
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
