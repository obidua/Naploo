import React from 'react';
import Link from 'next/link';
import { RefreshCcw, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-naploo-dark text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-400 mb-6">
            <RefreshCcw className="w-4 h-4 inline mr-2" />
            Legal
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Refund Policy
          </h1>
          <div className="flex items-center justify-center gap-2 text-white/50">
            <Calendar className="w-4 h-4" />
            <span>Last updated: January 15, 2026</span>
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="relative py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-6 text-center border-2 border-emerald-500/30">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-1">Full Refund</h3>
              <p className="text-sm text-white/60">Cancel 2+ hours before check-in</p>
            </div>
            <div className="glass-card rounded-xl p-6 text-center border-2 border-amber-500/30">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-1">50% Refund</h3>
              <p className="text-sm text-white/60">Cancel within 2 hours of check-in</p>
            </div>
            <div className="glass-card rounded-xl p-6 text-center border-2 border-red-500/30">
              <XCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-1">No Refund</h3>
              <p className="text-sm text-white/60">No-shows or post check-in</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Cancellation Refunds</h2>
              <p className="text-white/70 mb-4">
                Our refund policy is designed to be fair to both guests and our partner properties:
              </p>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 text-white/60">Cancellation Time</th>
                    <th className="py-3 text-white/60">Refund Amount</th>
                  </tr>
                </thead>
                <tbody className="text-white/70">
                  <tr className="border-b border-white/10">
                    <td className="py-3">More than 2 hours before check-in</td>
                    <td className="py-3 text-emerald-400">100% refund</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3">Within 2 hours of check-in</td>
                    <td className="py-3 text-amber-400">50% refund</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3">No-show (did not arrive)</td>
                    <td className="py-3 text-red-400">No refund</td>
                  </tr>
                  <tr>
                    <td className="py-3">After check-in</td>
                    <td className="py-3 text-red-400">No refund</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">How to Cancel</h2>
              <ol className="list-decimal list-inside text-white/70 space-y-3">
                <li>Open the Naploo app or website</li>
                <li>Go to &quot;My Bookings&quot;</li>
                <li>Select the booking you want to cancel</li>
                <li>Click &quot;Cancel Booking&quot;</li>
                <li>Confirm the cancellation</li>
              </ol>
              <p className="text-white/70 mt-4">
                You&apos;ll receive a confirmation email with refund details (if applicable).
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Refund Processing Time</h2>
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-primary-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white/70 mb-4">
                    Refunds are processed within <strong className="text-white">3-5 business days</strong>. The amount will be credited to your original payment method:
                  </p>
                  <ul className="list-disc list-inside text-white/70 space-y-2">
                    <li><strong className="text-white">UPI:</strong> 24-48 hours</li>
                    <li><strong className="text-white">Credit/Debit Card:</strong> 5-7 business days</li>
                    <li><strong className="text-white">Net Banking:</strong> 3-5 business days</li>
                    <li><strong className="text-white">Wallets:</strong> 24-48 hours</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Special Circumstances</h2>
              <p className="text-white/70 mb-4">
                Full refunds may be issued regardless of timing for:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>Technical issues preventing access to your pod</li>
                <li>Pod not matching the description or unavailable</li>
                <li>Safety or hygiene concerns verified by our team</li>
                <li>Natural disasters or government-mandated restrictions</li>
              </ul>
              <p className="text-white/70 mt-4">
                Contact support within 24 hours of the incident with documentation.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Non-Refundable Items</h2>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>Service fees (if applicable)</li>
                <li>Add-ons consumed or used</li>
                <li>Extended stay charges after check-in</li>
                <li>Damage charges (if any)</li>
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Disputes</h2>
              <p className="text-white/70">
                If you believe your refund was processed incorrectly, contact our support team within 30 days. Provide your booking ID, payment receipt, and details of your concern. We&apos;ll review and respond within 48 hours.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <p className="text-white/70">
                For refund-related queries, contact us at:<br />
                Email: refunds@naploo.com<br />
                Phone: +91 98765 43210 (Mon-Sat, 9AM-6PM IST)<br />
                Live Chat: Available 24/7 in the app
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/60 mb-4">Need help with a refund?</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-glow-lg transition-all"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  );
}
