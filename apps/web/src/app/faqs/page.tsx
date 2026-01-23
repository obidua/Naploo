'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';

const faqCategories = [
  {
    name: 'Booking & Reservations',
    faqs: [
      {
        q: 'How do I book a sleeping pod?',
        a: 'You can book a pod through our website or mobile app. Simply search for pods near your location, select your preferred pod, choose your duration (1-12 hours), and complete the payment. You\'ll receive an OTP for access instantly.',
      },
      {
        q: 'Can I book a pod for someone else?',
        a: 'Yes! During booking, you can enter the guest\'s phone number. The access OTP will be sent to their phone. This is perfect for booking for family members or colleagues.',
      },
      {
        q: 'What is the minimum booking duration?',
        a: 'Our minimum booking duration is 1 hour. You can book for up to 12 hours at a time. Need more time? You can extend your stay through the app.',
      },
      {
        q: 'Can I extend my booking?',
        a: 'Yes, you can extend your stay through the app with just one tap, subject to availability. You\'ll be charged the regular hourly rate for the extension.',
      },
      {
        q: 'How far in advance can I book?',
        a: 'You can book up to 30 days in advance. For instant bookings, simply check real-time availability and book on the go.',
      },
    ],
  },
  {
    name: 'Payments & Pricing',
    faqs: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept UPI (GPay, PhonePe, Paytm), credit/debit cards (Visa, Mastercard, RuPay), net banking, and popular wallets. All payments are securely processed.',
      },
      {
        q: 'Are there any hidden charges?',
        a: 'No hidden charges! The price displayed includes all taxes. What you see is what you pay. Optional add-ons like meals or premium WiFi are clearly marked.',
      },
      {
        q: 'How do I get an invoice?',
        a: 'Invoices are automatically sent to your registered email after checkout. You can also download invoices from the "My Bookings" section in the app.',
      },
      {
        q: 'What is your refund policy?',
        a: 'Full refund for cancellations made 2+ hours before check-in. 50% refund for cancellations within 2 hours. No refund for no-shows or cancellations after check-in time.',
      },
    ],
  },
  {
    name: 'Check-in & Access',
    faqs: [
      {
        q: 'How do I access my pod?',
        a: 'After booking, you\'ll receive a unique OTP on your phone. Enter this code on the pod\'s keypad to unlock. The code is valid only for your booking duration.',
      },
      {
        q: 'What if I don\'t receive my OTP?',
        a: 'Check your SMS and app notifications. If still missing, use the "Resend OTP" option in the app. You can also contact our 24/7 support for immediate assistance.',
      },
      {
        q: 'Can I check in early?',
        a: 'Early check-in depends on availability. If the pod is free before your slot, you can request early access. Additional charges may apply.',
      },
      {
        q: 'What happens if I\'m late?',
        a: 'Your booking remains valid. However, if you\'re more than 30 minutes late without notifying us, the booking may be cancelled with no refund.',
      },
    ],
  },
  {
    name: 'Pod Features & Amenities',
    faqs: [
      {
        q: 'What amenities are included?',
        a: 'All pods include: climate control (AC), USB charging, fresh linens, reading light, and secure lock. Premium pods add WiFi, smart TV, enhanced lighting, and more.',
      },
      {
        q: 'Are the pods cleaned between guests?',
        a: 'Absolutely! Every pod is thoroughly cleaned and sanitized after each guest. We use hospital-grade disinfectants and provide fresh linens for every booking.',
      },
      {
        q: 'Is there WiFi available?',
        a: 'Standard pods have basic WiFi at common areas. Premium and Luxury pods include high-speed in-pod WiFi. You can also add Premium WiFi as an add-on.',
      },
      {
        q: 'Can I store my luggage?',
        a: 'Most locations have secure luggage storage. Some premium pods include built-in lockers. Check specific location amenities during booking.',
      },
    ],
  },
  {
    name: 'Safety & Security',
    faqs: [
      {
        q: 'Are the pods safe?',
        a: 'Yes! Pods feature secure OTP locks, CCTV in common areas (not inside pods), emergency buttons, and 24/7 staff at most locations. Fire safety systems are installed.',
      },
      {
        q: 'What if there\'s an emergency?',
        a: 'Press the emergency button inside the pod or in common areas. Our staff will respond immediately. Emergency exits are clearly marked at all locations.',
      },
      {
        q: 'What about my belongings?',
        a: 'Pods have secure locks. We recommend carrying valuables with you. For luggage, use the secure storage facilities available at most locations.',
      },
      {
        q: 'Is my payment information secure?',
        a: 'We use bank-grade encryption and are PCI-DSS compliant. We never store your full card details. All transactions are processed through secure payment gateways.',
      },
    ],
  },
  {
    name: 'Account & App',
    faqs: [
      {
        q: 'How do I create an account?',
        a: 'Download our app or visit naploo.com. Sign up with your phone number - you\'ll receive an OTP to verify. That\'s it! No lengthy forms required.',
      },
      {
        q: 'Can I use Naploo without an account?',
        a: 'You need an account to book. It takes less than 30 seconds to create one with just your phone number.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Go to Settings > Account > Delete Account in the app. Note: This action is permanent and will remove all your booking history.',
      },
    ],
  },
];

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleFAQ = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-naploo-dark text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-sm text-amber-400 mb-6">
            <HelpCircle className="w-4 h-4 inline mr-2" />
            FAQs
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Frequently Asked
            <br />
            <span className="gradient-text">Questions</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-8">
            Find quick answers to common questions about Naploo.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary-500/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {faqCategories.map((category, catIndex) => (
            <div key={category.name} className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">{category.name}</h2>
              <div className="space-y-3">
                {category.faqs
                  .filter(
                    (faq) =>
                      searchTerm === '' ||
                      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      faq.a.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((faq, faqIndex) => {
                    const id = `${catIndex}-${faqIndex}`;
                    const isOpen = openIndex === id;
                    return (
                      <div key={id} className="glass-card rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleFAQ(id)}
                          className="w-full flex items-center justify-between p-6 text-left"
                        >
                          <span className="font-medium text-white pr-4">{faq.q}</span>
                          <ChevronDown
                            className={`w-5 h-5 text-white/50 flex-shrink-0 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-6">
                            <p className="text-white/60">{faq.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-violet-600/20 to-cyan-600/20" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still Have Questions?
          </h2>
          <p className="text-lg text-white/60 max-w-xl mx-auto mb-8">
            Our support team is available 24/7 to help you.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-glow-lg transition-all"
          >
            Contact Support
          </a>
        </div>
      </section>
    </div>
  );
}
