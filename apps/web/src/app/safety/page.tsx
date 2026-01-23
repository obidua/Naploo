import React from 'react';
import Link from 'next/link';
import { Shield, AlertTriangle, Phone, Camera, Lock, Users, Heart, CheckCircle } from 'lucide-react';

const safetyFeatures = [
  {
    icon: Lock,
    title: 'Secure OTP Access',
    desc: 'Each pod has a unique OTP lock system. Only you can access your pod with the code sent to your phone.',
  },
  {
    icon: Camera,
    title: 'CCTV Monitoring',
    desc: 'All common areas are monitored 24/7 by CCTV cameras. Privacy is maintained - no cameras inside pods.',
  },
  {
    icon: Users,
    title: 'On-site Staff',
    desc: 'Trained staff available at all locations to assist you and ensure a safe environment.',
  },
  {
    icon: AlertTriangle,
    title: 'Emergency Systems',
    desc: 'Emergency buttons in every pod and common area. Fire alarms and extinguishers installed.',
  },
  {
    icon: Shield,
    title: 'Background Verified',
    desc: 'All staff members undergo thorough background verification before joining.',
  },
  {
    icon: Heart,
    title: 'First Aid Ready',
    desc: 'First aid kits available at all locations. Staff trained in basic emergency response.',
  },
];

const safetyTips = [
  'Always use the OTP provided - never share it with anyone',
  'Lock your pod from inside when resting',
  'Keep valuables in the secure locker or with you',
  'Report any suspicious activity to staff immediately',
  'Familiarize yourself with emergency exits upon arrival',
  'Contact support if you face any issues during your stay',
];

const emergencyContacts = [
  { label: 'Naploo 24/7 Helpline', number: '+91 98765 43210' },
  { label: 'Police Emergency', number: '100' },
  { label: 'Ambulance', number: '102' },
  { label: 'Fire Emergency', number: '101' },
  { label: 'Women Helpline', number: '181' },
];

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-naploo-dark text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-400 mb-6">
            <Shield className="w-4 h-4 inline mr-2" />
            Your Safety First
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Rest Easy,
            <br />
            <span className="gradient-text">We&apos;ve Got You</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
            Your safety and comfort are our top priorities. Learn about the measures we take to ensure a secure experience.
          </p>
        </div>
      </section>

      {/* Safety Features */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Safety Features</h2>
            <p className="text-white/60">Built-in security at every level</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {safetyFeatures.map((feature) => (
              <div key={feature.title} className="glass-card rounded-xl p-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="relative py-16 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Safety Tips</h2>
            <p className="text-white/60">Follow these guidelines for a safe stay</p>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <ul className="space-y-4">
              {safetyTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Emergency Contacts</h2>
            <p className="text-white/60">Save these numbers for emergencies</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {emergencyContacts.map((contact) => (
              <a
                key={contact.label}
                href={`tel:${contact.number}`}
                className="glass-card rounded-xl p-6 flex items-center justify-between hover:ring-2 hover:ring-emerald-500/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="font-medium text-white">{contact.label}</span>
                </div>
                <span className="text-emerald-400 font-mono">{contact.number}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-primary-600/20 to-violet-600/20" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Have a Safety Concern?
          </h2>
          <p className="text-lg text-white/60 max-w-xl mx-auto mb-8">
            Our team is available 24/7 to address any safety-related issues.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-primary-600 text-white font-semibold rounded-xl hover:shadow-glow-lg transition-all"
          >
            Report an Issue
            <Shield className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
