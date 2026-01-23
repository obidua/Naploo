'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Star, Zap, Shield, Clock, Wifi, Tv, Wind, Coffee, Lock, Sparkles } from 'lucide-react';

const pricingPlans = [
  {
    name: 'Standard Pod',
    series: 'Made in India T1',
    description: 'Perfect for quick naps and budget travelers',
    pricePerHour: 99,
    minHours: 1,
    features: [
      'Single comfortable bed',
      'Climate control (AC)',
      'USB charging ports',
      'Reading light',
      'Fresh linens',
      'Secure lock',
    ],
    popular: false,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Premium Pod',
    series: 'Space Series',
    description: 'Enhanced comfort with smart features',
    pricePerHour: 149,
    minHours: 1,
    features: [
      'Premium memory foam bed',
      'Smart climate control',
      'High-speed WiFi',
      'HD Smart TV',
      'Multiple USB-C ports',
      'Ambient lighting',
      'Fresh linens & towel',
      'Bluetooth speaker',
    ],
    popular: true,
    color: 'from-primary-500 to-violet-600',
  },
  {
    name: 'Luxury Pod',
    series: 'Galaxy Series',
    description: 'Ultimate comfort for discerning travelers',
    pricePerHour: 249,
    minHours: 2,
    features: [
      'King-size premium bed',
      'Advanced climate control',
      'Ultra-fast WiFi',
      '4K Smart TV with Netflix',
      '65W fast charging',
      'Customizable RGB lighting',
      'Premium linens & amenities',
      'Noise cancellation',
      'Mini refrigerator',
      'Room service access',
    ],
    popular: false,
    color: 'from-amber-500 to-orange-600',
  },
];

const addOns = [
  { name: 'Meal Package', price: 149, icon: Coffee, desc: 'Breakfast/Snack combo' },
  { name: 'Late Checkout', price: 99, icon: Clock, desc: 'Extra 30 mins grace' },
  { name: 'Premium WiFi', price: 49, icon: Wifi, desc: '100 Mbps dedicated' },
  { name: 'Entertainment Pack', price: 79, icon: Tv, desc: 'Premium streaming access' },
];

const comparisons = [
  { feature: 'Privacy', naploo: '100% Private Pod', hotel: 'Shared walls', hostel: 'Shared dorm' },
  { feature: 'Min Stay', naploo: '1 Hour', hotel: '24 Hours', hostel: '1 Night' },
  { feature: 'Check-in', naploo: 'Instant OTP', hotel: 'Front desk queue', hostel: 'Front desk' },
  { feature: 'Cost for 4 hrs', naploo: '₹396-996', hotel: '₹2000-5000', hostel: '₹500-800' },
  { feature: 'Cleanliness', naploo: 'UV Sanitized', hotel: 'Varies', hostel: 'Basic' },
  { feature: 'Technology', naploo: 'Smart Controls', hotel: 'Basic', hostel: 'None' },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-naploo-dark text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-400 mb-6">
            <Sparkles className="w-4 h-4 inline mr-2" />
            Simple & Transparent Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Pay Only For
            <br />
            <span className="gradient-text">What You Use</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
            No hidden fees. No minimum night stays. Just comfortable rest at prices that make sense.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative glass-card rounded-2xl p-8 ${
                  plan.popular ? 'ring-2 ring-primary-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-primary-500 to-violet-600 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r ${plan.color} rounded-full text-xs font-semibold mb-4`}>
                  {plan.series}
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-white/60 text-sm mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">₹{plan.pricePerHour}</span>
                  <span className="text-white/60">/hour</span>
                  <p className="text-sm text-white/40 mt-1">Min {plan.minHours} hour(s)</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-white/70 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/pods"
                  className={`block w-full py-3 rounded-xl font-semibold text-center transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary-500 to-violet-600 text-white hover:shadow-glow'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Book Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="relative py-16 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Optional Add-ons</h2>
            <p className="text-white/60">Enhance your stay with these extras</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon) => (
              <div key={addon.name} className="glass-card rounded-xl p-6 text-center">
                <addon.icon className="w-8 h-8 text-primary-400 mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-1">{addon.name}</h3>
                <p className="text-sm text-white/50 mb-3">{addon.desc}</p>
                <span className="text-lg font-bold text-white">+₹{addon.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="relative py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose Naploo?</h2>
            <p className="text-white/60">Compare with traditional accommodation options</p>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/60 font-medium">Feature</th>
                  <th className="text-center p-4 text-primary-400 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Zap className="w-5 h-5" />
                      Naploo
                    </div>
                  </th>
                  <th className="text-center p-4 text-white/60 font-medium">Hotels</th>
                  <th className="text-center p-4 text-white/60 font-medium">Hostels</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                    <td className="p-4 text-white/70">{row.feature}</td>
                    <td className="p-4 text-center text-emerald-400 font-medium">{row.naploo}</td>
                    <td className="p-4 text-center text-white/50">{row.hotel}</td>
                    <td className="p-4 text-center text-white/50">{row.hostel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-16 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Pricing FAQs</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: 'Are there any hidden charges?', a: 'No hidden charges! The price you see is what you pay. Taxes are included in all displayed prices.' },
              { q: 'Can I extend my booking?', a: 'Yes! You can extend your stay through the app at the same hourly rate, subject to availability.' },
              { q: 'What payment methods do you accept?', a: 'We accept UPI, credit/debit cards, net banking, and popular wallets like Paytm and PhonePe.' },
              { q: 'Is there a refund policy?', a: 'Full refund if cancelled 2 hours before booking. 50% refund for later cancellations. No-shows are non-refundable.' },
              { q: 'Are corporate/bulk discounts available?', a: 'Yes! Contact our sales team for corporate packages with up to 30% discount on regular prices.' },
            ].map((faq, i) => (
              <div key={i} className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-white/60">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-violet-600/20 to-cyan-600/20" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience Naploo?
          </h2>
          <p className="text-lg text-white/60 max-w-xl mx-auto mb-10">
            Book your first pod today. Cancel anytime, no questions asked.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pods"
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-glow-lg transition-all"
            >
              Find Pods Near You
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
