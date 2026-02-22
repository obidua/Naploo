import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy | Naploo",
  description: "Naploo privacy policy. Learn how we collect, use, and protect your personal information.",
  keywords: "naploo privacy policy, data protection, user privacy",
  openGraph: {
    title: "Privacy Policy | Naploo",
    description: "Naploo privacy policy. Learn how we collect, use, and protect your personal information.",
    url: "https://naploo.com/privacy",
    siteName: "Naploo",
    type: "website",
  },
  alternates: { canonical: "https://naploo.com/privacy" },

};

import React from 'react';
import { Shield, Calendar } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-white/20 border border-white/30 rounded-full text-sm text-white mb-6">
            <Shield className="w-4 h-4 inline mr-2" />
            Legal
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Privacy Policy
          </h1>
          <div className="flex items-center justify-center gap-2 text-white/70">
            <Calendar className="w-4 h-4" />
            <span>Last updated: January 15, 2026</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-slate prose-lg max-w-none">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Introduction</h2>
              <p className="text-slate-600">
                Naploo (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
              </p>
            </div>

            <div className="bg-violet-50/50 border border-gray-200 rounded-2xl p-8 shadow-sm mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Information We Collect</h2>
              <p className="text-slate-600 mb-4"><strong className="text-slate-800">Personal Information:</strong></p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 mb-4">
                <li>Name and contact information (phone, email)</li>
                <li>Payment information (processed securely via payment gateways)</li>
                <li>Booking history and preferences</li>
                <li>Device information and IP address</li>
                <li>Location data (with your permission)</li>
              </ul>
              <p className="text-slate-600 mb-4"><strong className="text-slate-800">Usage Information:</strong></p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>App usage patterns and preferences</li>
                <li>Search queries and booking behavior</li>
                <li>Feedback and support interactions</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">How We Use Your Information</h2>
              <p className="text-slate-600 mb-4">We use your information to:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Process your bookings and payments</li>
                <li>Provide customer support</li>
                <li>Send booking confirmations and updates</li>
                <li>Improve our services and user experience</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Ensure safety and security of our platform</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div className="bg-violet-50/50 border border-gray-200 rounded-2xl p-8 shadow-sm mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Information Sharing</h2>
              <p className="text-slate-600 mb-4">We may share your information with:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li><strong className="text-slate-800">Partner Properties:</strong> To facilitate your booking</li>
                <li><strong className="text-slate-800">Service Providers:</strong> Payment processors, analytics, etc.</li>
                <li><strong className="text-slate-800">Legal Authorities:</strong> When required by law</li>
              </ul>
              <p className="text-slate-600 mt-4">
                We do NOT sell your personal information to third parties.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Data Security</h2>
              <p className="text-slate-600">
                We implement industry-standard security measures including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure.
              </p>
            </div>

            <div className="bg-violet-50/50 border border-gray-200 rounded-2xl p-8 shadow-sm mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Your Rights</h2>
              <p className="text-slate-600 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Data Retention</h2>
              <p className="text-slate-600">
                We retain your data for as long as your account is active or as needed to provide services. Booking records are kept for 7 years for legal compliance. You can request deletion at any time.
              </p>
            </div>

            <div className="bg-violet-50/50 border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Contact Us</h2>
              <p className="text-slate-600">
                For privacy-related questions or to exercise your rights, contact us at:<br />
                Email: privacy@naploo.com<br />
                Address: BIDUA Industries Pvt Ltd, Delhi NCR, India
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
