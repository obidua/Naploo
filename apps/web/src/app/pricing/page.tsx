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
    <div className="min-h-screen bg-white text-slate-800">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-white/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-white/20 border border-white/30 rounded-full text-sm text-white mb-6">
            <Sparkles className="w-4 h-4 inline mr-2" />
            Simple & Transparent Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Pay Only For
            <br />
            <span className="text-violet-200">What You Use</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            No hidden fees. No minimum night stays. Just comfortable rest at prices that make sense.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white border border-gray-200 rounded-2xl shadow-sm p-8 ${
                  plan.popular ? 'ring-2 ring-primary-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-primary-500 to-violet-600 rounded-full text-sm font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r ${plan.color} rounded-full text-xs font-semibold text-white mb-4`}>
                  {plan.series}
                </div>

                <h3 className="text-2xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                <p className="text-slate-500 text-sm mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-800">₹{plan.pricePerHour}</span>
                  <span className="text-slate-500">/hour</span>
                  <p className="text-sm text-slate-400 mt-1">Min {plan.minHours} hour(s)</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/pods"
                  className={`block w-full py-3 rounded-xl font-semibold text-center transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary-500 to-violet-600 text-white hover:shadow-glow'
                      : 'bg-gray-50 border border-gray-200 text-slate-700 hover:bg-gray-100'
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
      <section className="relative py-16 bg-violet-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Optional Add-ons</h2>
            <p className="text-slate-500">Enhance your stay with these extras</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon) => (
              <div key={addon.name} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center">
                <addon.icon className="w-8 h-8 text-primary-600 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-800 mb-1">{addon.name}</h3>
                <p className="text-sm text-slate-400 mb-3">{addon.desc}</p>
                <span className="text-lg font-bold text-slate-800">+₹{addon.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="relative py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Why Choose Naploo?</h2>
            <p className="text-slate-500">Compare with traditional accommodation options</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 text-slate-500 font-medium">Feature</th>
                  <th className="text-center p-4 text-primary-600 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Zap className="w-5 h-5" />
                      Naploo
                    </div>
                  </th>
                  <th className="text-center p-4 text-slate-500 font-medium">Hotels</th>
                  <th className="text-center p-4 text-slate-500 font-medium">Hostels</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="p-4 text-slate-600">{row.feature}</td>
                    <td className="p-4 text-center text-emerald-600 font-medium">{row.naploo}</td>
                    <td className="p-4 text-center text-slate-400">{row.hotel}</td>
                    <td className="p-4 text-center text-slate-400">{row.hostel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-16 bg-violet-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Pricing FAQs</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: 'Are there any hidden charges?', a: 'No hidden charges! The price you see is what you pay. Taxes are included in all displayed prices.' },
              { q: 'Can I extend my booking?', a: 'Yes! You can extend your stay through the app at the same hourly rate, subject to availability.' },
              { q: 'What payment methods do you accept?', a: 'We accept UPI, credit/debit cards, net banking, and popular wallets like Paytm and PhonePe.' },
              { q: 'Is there a refund policy?', a: 'Full refund if cancelled 2 hours before booking. 50% refund for later cancellations. No-shows are non-refundable.' },
              { q: 'Are corporate/bulk discounts available?', a: 'Yes! Contact our sales team for corporate packages with up to 30% discount on regular prices.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{faq.q}</h3>
                <p className="text-slate-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience Naploo?
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-10">
            Book your first pod today. Cancel anytime, no questions asked.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pods"
              className="px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
            >
              Find Pods Near You
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
