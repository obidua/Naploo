import React from 'react';
import { FileText, Calendar } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-naploo-dark text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-sm text-primary-400 mb-6">
            <FileText className="w-4 h-4 inline mr-2" />
            Legal
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Terms of Service
          </h1>
          <div className="flex items-center justify-center gap-2 text-white/50">
            <Calendar className="w-4 h-4" />
            <span>Last updated: January 15, 2026</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-white/70 mb-4">
                By accessing or using Naploo&apos;s services, website, or mobile application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
              <p className="text-white/70">
                These terms apply to all users of our platform, including guests, partners, and investors.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
              <p className="text-white/70 mb-4">
                Naploo provides a platform for booking private sleeping pods at various locations across India. Our services include:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>Online booking of sleeping pods</li>
                <li>Secure access via OTP-based entry systems</li>
                <li>In-pod amenities management</li>
                <li>Customer support services</li>
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
              <p className="text-white/70 mb-4">
                To use our services, you must create an account with accurate information. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring your contact information is current</li>
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">4. Booking & Cancellation</h2>
              <p className="text-white/70 mb-4">
                <strong className="text-white">Booking:</strong> All bookings are subject to availability and confirmation. Prices are displayed inclusive of applicable taxes.
              </p>
              <p className="text-white/70 mb-4">
                <strong className="text-white">Cancellation Policy:</strong>
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>Full refund for cancellations 2+ hours before check-in time</li>
                <li>50% refund for cancellations within 2 hours of check-in</li>
                <li>No refund for no-shows or post check-in cancellations</li>
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">5. User Conduct</h2>
              <p className="text-white/70 mb-4">
                When using our pods, you agree to:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>Use the pod only for its intended purpose (rest and relaxation)</li>
                <li>Not engage in any illegal activities</li>
                <li>Not damage or vandalize the pod or its amenities</li>
                <li>Not smoke or consume alcohol/drugs inside the pod</li>
                <li>Not exceed the maximum occupancy (1 person per single pod)</li>
                <li>Vacate the pod at the end of your booking period</li>
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">6. Liability</h2>
              <p className="text-white/70 mb-4">
                Naploo strives to provide safe and comfortable pods. However:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>We are not liable for loss or theft of personal belongings</li>
                <li>Users are responsible for their own health and safety</li>
                <li>We are not liable for technical failures beyond our control</li>
                <li>Maximum liability is limited to the booking amount paid</li>
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property</h2>
              <p className="text-white/70">
                All content, trademarks, and intellectual property on our platform are owned by Naploo (BIDUA Industries Pvt Ltd). Unauthorized use is prohibited.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">8. Governing Law</h2>
              <p className="text-white/70">
                These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Delhi, India.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
              <p className="text-white/70">
                For questions about these Terms of Service, please contact us at:<br />
                Email: legal@naploo.com<br />
                Address: BIDUA Industries Pvt Ltd, Delhi NCR, India
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
