import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { GlassCard } from '@/components/ui/GlassCard';

const steps = [
  {
    number: '01',
    title: 'Download the App or Visit Website',
    description: 'Get the Naploo app from App Store or Google Play, or simply visit our website. Create your account in seconds with just your phone number.',
    icon: '📱',
    details: [
      'Available on iOS and Android',
      'Quick OTP-based registration',
      'No lengthy forms or documents',
    ],
  },
  {
    number: '02',
    title: 'Search & Find Your Pod',
    description: 'Search for pods near your location - airports, railway stations, bus terminals, or city centers. Filter by amenities, price, and availability.',
    icon: '🔍',
    details: [
      'Real-time availability',
      'Filter by pod series & amenities',
      'View photos and reviews',
    ],
  },
  {
    number: '03',
    title: 'Select Duration & Book',
    description: 'Choose how long you need to rest - from 1 hour to 12 hours. Pay only for the time you use. Book instantly with multiple payment options.',
    icon: '⏱️',
    details: [
      'Flexible 1-12 hour slots',
      'UPI, Cards, Wallets accepted',
      'Instant booking confirmation',
    ],
  },
  {
    number: '04',
    title: 'Get Your Access Code',
    description: 'Receive a unique OTP on your phone and email. This code is your key to unlock your private pod. Valid only for your booking duration.',
    icon: '🔐',
    details: [
      'Secure OTP access',
      'Valid for booking duration',
      'Emergency support available',
    ],
  },
  {
    number: '05',
    title: 'Check In & Enjoy',
    description: 'Head to your pod location, enter the OTP on the keypad, and step into your private space. Control everything from lights to AC with the in-pod panel.',
    icon: '🚪',
    details: [
      'Smart keypad entry',
      'In-pod control panel',
      'Fresh sanitized space',
    ],
  },
  {
    number: '06',
    title: 'Extend or Check Out',
    description: 'Need more time? Extend your stay with one tap in the app. When done, simply leave - the pod auto-locks. Rate your experience!',
    icon: '✨',
    details: [
      'One-tap extension',
      'Auto check-out',
      'Rate & review',
    ],
  },
];

const faqs = [
  {
    question: 'What is a sleeping pod?',
    answer: 'A sleeping pod is a compact, private capsule designed for rest and relaxation. Our pods feature premium bedding, climate control, WiFi, charging ports, and entertainment options - everything you need for quality rest in a small footprint.',
  },
  {
    question: 'How much does it cost?',
    answer: 'Pricing starts at ₹150 per hour, varying by pod series and location. Premium pods with advanced features may cost more. You only pay for the hours you use.',
  },
  {
    question: 'Do I need to book in advance?',
    answer: 'No advance booking is required! You can book on the go based on real-time availability. However, for peak hours at popular locations, we recommend booking a few hours ahead.',
  },
  {
    question: 'Are the pods sanitized?',
    answer: 'Yes! Every pod is thoroughly sanitized after each use with hospital-grade disinfectants. Fresh linens and towels are provided for each guest. UV sanitization is done daily.',
  },
  {
    question: 'What amenities are included?',
    answer: 'Standard amenities include AC/climate control, high-speed WiFi, USB charging, fresh linens, and ambient lighting. Premium pods include smart TV, mini-fridge, noise cancellation, and more.',
  },
  {
    question: 'Can I extend my booking?',
    answer: 'Yes! You can extend your stay with one tap in the app, subject to availability. If the pod is booked after your slot, you\'ll receive a notification 15 minutes before checkout.',
  },
  {
    question: 'Is there luggage storage?',
    answer: 'Most locations have secure luggage storage facilities. Some premium pods come with built-in lockers. Check specific location amenities in the app.',
  },
  {
    question: 'What if I have an issue?',
    answer: 'Our 24/7 support team is always available. Use the in-app chat, call our helpline, or press the help button inside the pod. We typically resolve issues within minutes.',
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-naploo-dark-DEFAULT text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-sm text-primary-400 mb-6">
            Simple & Fast
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            How Naploo Works
          </h1>
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
            Book a premium sleeping pod in under 60 seconds. No queues, no paperwork, 
            no hassle - just rest when you need it.
          </p>
        </div>
      </section>

      {/* Video Section */}
      <section className="relative py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassCard className="overflow-hidden">
            <div className="aspect-video relative bg-gradient-to-br from-primary-500/20 to-violet-500/20 flex items-center justify-center">
              <button className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors group">
                <svg className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <p className="absolute bottom-4 text-white/50 text-sm">Watch: How to book your first pod (2 min)</p>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Steps Section */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 items-center`}
              >
                {/* Visual */}
                <div className="w-full lg:w-1/2">
                  <GlassCard className="p-8 lg:p-12 text-center">
                    <div className="text-8xl mb-6">{step.icon}</div>
                    <div className="inline-block px-4 py-2 bg-gradient-to-r from-primary-500 to-violet-500 rounded-full text-sm font-bold text-white mb-4">
                      Step {step.number}
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white">
                      {step.title}
                    </h3>
                  </GlassCard>
                </div>

                {/* Content */}
                <div className="w-full lg:w-1/2 text-center lg:text-left">
                  <p className="text-lg text-white/70 mb-6">
                    {step.description}
                  </p>
                  <ul className="space-y-3">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-3 justify-center lg:justify-start">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="text-white/60">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pod Experience Section */}
      <section className="relative py-24 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-sm text-cyan-400 mb-4">
              Inside the Pod
            </span>
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4">
              What to Expect
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Step inside a world of comfort and technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🛏️', title: 'Premium Bedding', desc: 'Memory foam mattress with fresh, hotel-quality linens replaced after every use.' },
              { icon: '❄️', title: 'Climate Control', desc: 'Adjust temperature from 18°C to 26°C. Your comfort, your control.' },
              { icon: '📺', title: 'Entertainment', desc: 'HD smart display with streaming apps. Watch, listen, or browse.' },
              { icon: '🔌', title: 'Fast Charging', desc: 'Multiple USB-C and USB-A ports with up to 65W fast charging.' },
              { icon: '💡', title: 'Ambient Lighting', desc: 'Customizable LED lighting with presets for sleep, reading, or work.' },
              { icon: '🔇', title: 'Sound Insulation', desc: 'Noise-cancelling walls ensure peace even in busy locations.' },
            ].map((feature) => (
              <GlassCard key={feature.title} className="p-6 text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/60">{feature.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-sm text-amber-400 mb-4">
              FAQs
            </span>
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4">
              Common Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <GlassCard key={i} className="p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-start gap-3">
                  <span className="text-primary-400">Q:</span>
                  {faq.question}
                </h3>
                <p className="text-white/60 pl-6">{faq.answer}</p>
              </GlassCard>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-white/60 mb-4">Still have questions?</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
            >
              Contact Support
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-violet-600/20 to-cyan-600/20" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
            Ready to Try?
          </h2>
          <p className="text-lg text-white/60 max-w-xl mx-auto mb-10">
            Find your nearest pod and experience the future of rest today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pods"
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-glow-lg transition-all"
            >
              Find Pods Near You
            </Link>
            <Link
              href="/signup"
              className="px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
