import React from 'react';
import Link from 'next/link';
import { Search, MessageCircle, Phone, Mail, Book, ChevronRight, HelpCircle, CreditCard, MapPin, Clock, Shield, Settings } from 'lucide-react';

const helpCategories = [
  {
    icon: Book,
    title: 'Getting Started',
    desc: 'New to Naploo? Learn the basics',
    articles: ['How to create an account', 'Booking your first pod', 'Payment methods', 'App download links'],
  },
  {
    icon: MapPin,
    title: 'Bookings & Check-in',
    desc: 'Everything about your stay',
    articles: ['How to book a pod', 'Modifying your booking', 'Check-in process', 'Extending your stay'],
  },
  {
    icon: CreditCard,
    title: 'Payments & Refunds',
    desc: 'Billing and transaction help',
    articles: ['Payment options', 'Invoice download', 'Refund policy', 'Failed transaction help'],
  },
  {
    icon: Shield,
    title: 'Safety & Security',
    desc: 'Your safety is our priority',
    articles: ['Pod safety features', 'Emergency contacts', 'Lost items', 'Reporting issues'],
  },
  {
    icon: Settings,
    title: 'Account & Settings',
    desc: 'Manage your profile',
    articles: ['Update profile', 'Change password', 'Notification settings', 'Delete account'],
  },
  {
    icon: HelpCircle,
    title: 'Troubleshooting',
    desc: 'Common issues solved',
    articles: ['OTP not received', 'Can\'t unlock pod', 'App not working', 'Connectivity issues'],
  },
];

const popularArticles = [
  { title: 'How do I book a sleeping pod?', views: '15.2K' },
  { title: 'What is the cancellation policy?', views: '12.8K' },
  { title: 'How does the OTP lock work?', views: '10.5K' },
  { title: 'Can I extend my booking?', views: '9.3K' },
  { title: 'What amenities are included?', views: '8.7K' },
];

export default function HelpPage() {
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
            <HelpCircle className="w-4 h-4 inline mr-2" />
            Help Center
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            How Can We
            <br />
            <span className="gradient-text">Help You?</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-8">
            Find answers to common questions or get in touch with our support team.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search for help..."
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary-500/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact */}
      <section className="relative py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6">
            <a href="tel:+919876543210" className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <Phone className="w-5 h-5 text-primary-400" />
              <span>+91 98765 43210</span>
            </a>
            <a href="mailto:support@naploo.com" className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <Mail className="w-5 h-5 text-primary-400" />
              <span>support@naploo.com</span>
            </a>
            <button className="flex items-center gap-3 px-6 py-3 bg-primary-500/20 text-primary-400 rounded-xl hover:bg-primary-500/30 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span>Live Chat</span>
            </button>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8">Browse by Topic</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category) => (
              <div key={category.title} className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-violet-500/20 flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{category.title}</h3>
                    <p className="text-sm text-white/50">{category.desc}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {category.articles.map((article) => (
                    <li key={article}>
                      <Link
                        href="#"
                        className="flex items-center gap-2 text-sm text-white/60 hover:text-primary-400 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                        {article}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="relative py-16 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8">Popular Articles</h2>
          <div className="space-y-3">
            {popularArticles.map((article) => (
              <Link
                key={article.title}
                href="#"
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
              >
                <span className="text-white group-hover:text-primary-400 transition-colors">{article.title}</span>
                <span className="text-sm text-white/40">{article.views} views</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-violet-600/20 to-cyan-600/20" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still Need Help?
          </h2>
          <p className="text-lg text-white/60 max-w-xl mx-auto mb-8">
            Our support team is available 24/7 to assist you.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-glow-lg transition-all"
          >
            Contact Support
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
