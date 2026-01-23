import React from 'react';
import { Cookie, Calendar, Settings } from 'lucide-react';

export default function CookiesPage() {
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
            <Cookie className="w-4 h-4 inline mr-2" />
            Legal
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Cookie Policy
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
              <h2 className="text-2xl font-bold text-white mb-4">What Are Cookies?</h2>
              <p className="text-white/70">
                Cookies are small text files stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Types of Cookies We Use</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">🔧 Essential Cookies</h3>
                  <p className="text-white/70">
                    Required for the website to function. They enable basic features like page navigation, secure login, and booking functionality. Cannot be disabled.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">📊 Analytics Cookies</h3>
                  <p className="text-white/70">
                    Help us understand how visitors interact with our website. We use this data to improve our services. Includes Google Analytics.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">⚙️ Functional Cookies</h3>
                  <p className="text-white/70">
                    Remember your preferences (language, currency, recent searches) to provide a personalized experience.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">📢 Marketing Cookies</h3>
                  <p className="text-white/70">
                    Used to deliver relevant ads and track ad campaign performance. You can opt out of these cookies.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Third-Party Cookies</h2>
              <p className="text-white/70 mb-4">We use cookies from these third parties:</p>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li><strong className="text-white">Google Analytics:</strong> Website analytics</li>
                <li><strong className="text-white">Google Ads:</strong> Advertising</li>
                <li><strong className="text-white">Facebook Pixel:</strong> Social media advertising</li>
                <li><strong className="text-white">Razorpay/Stripe:</strong> Payment processing</li>
                <li><strong className="text-white">Intercom:</strong> Customer support chat</li>
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Settings className="w-6 h-6" />
                Managing Cookies
              </h2>
              <p className="text-white/70 mb-4">
                You can control cookies through your browser settings:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li><strong className="text-white">Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                <li><strong className="text-white">Firefox:</strong> Options → Privacy & Security → Cookies</li>
                <li><strong className="text-white">Safari:</strong> Preferences → Privacy → Cookies</li>
                <li><strong className="text-white">Edge:</strong> Settings → Cookies and site permissions</li>
              </ul>
              <p className="text-white/70 mt-4">
                Note: Disabling essential cookies may affect website functionality.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Cookie Duration</h2>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li><strong className="text-white">Session Cookies:</strong> Deleted when you close your browser</li>
                <li><strong className="text-white">Persistent Cookies:</strong> Remain for up to 2 years</li>
                <li><strong className="text-white">Analytics Cookies:</strong> Typically 1-2 years</li>
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <p className="text-white/70">
                For questions about our Cookie Policy, contact us at:<br />
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
