import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Press & Media | Naploo",
  description: "Naploo in the news. Press releases, media coverage, and brand assets. For press inquiries contact press@naploo.com.",
  keywords: "naploo press, naploo news, naploo media, press release",
  openGraph: {
    title: "Press & Media | Naploo",
    description: "Naploo in the news. Press releases, media coverage, and brand assets. For press inquiries contact press@naploo.com.",
    url: "https://naploo.com/press",
    siteName: "Naploo",
    type: "website",
  },
  alternates: { canonical: "https://naploo.com/press" },

};

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Newspaper, Calendar, Download, ExternalLink, Mail, Camera } from 'lucide-react';

const pressReleases = [
  {
    date: 'January 15, 2026',
    title: 'Naploo Crosses 10,000 Customers Milestone',
    excerpt: 'India\'s leading sleeping pod network celebrates serving 10,000+ happy customers across 25 cities in just 18 months.',
    link: '#',
  },
  {
    date: 'December 5, 2025',
    title: 'Naploo Partners with Indian Railways for Station Pods',
    excerpt: 'Strategic partnership to install 500+ sleeping pods at major railway stations across India by 2027.',
    link: '#',
  },
  {
    date: 'October 20, 2025',
    title: 'Naploo Raises Series A Funding',
    excerpt: 'BIDUA Industries secures funding to expand Naploo network to 50+ cities and launch new premium pod series.',
    link: '#',
  },
  {
    date: 'August 8, 2025',
    title: 'Launch of Galaxy Series Luxury Pods',
    excerpt: 'Naploo unveils its most advanced sleeping pod series with AI-powered comfort features.',
    link: '#',
  },
  {
    date: 'May 15, 2025',
    title: 'Naploo Expands to 10 Major Cities',
    excerpt: 'Rapid expansion brings premium sleeping pods to Bangalore, Hyderabad, Chennai, and more.',
    link: '#',
  },
];

const mediaFeatures = [
  { name: 'Economic Times', logo: '📰' },
  { name: 'YourStory', logo: '📱' },
  { name: 'Inc42', logo: '🚀' },
  { name: 'Hindustan Times', logo: '📰' },
  { name: 'Business Standard', logo: '📈' },
  { name: 'Mint', logo: '💹' },
];

const brandAssets = [
  { name: 'Naploo Logo (PNG)', type: 'Logo', size: '2.4 MB' },
  { name: 'Naploo Logo (SVG)', type: 'Logo', size: '124 KB' },
  { name: 'Brand Guidelines', type: 'PDF', size: '8.2 MB' },
  { name: 'Product Images', type: 'ZIP', size: '45 MB' },
  { name: 'Founder Photos', type: 'ZIP', size: '12 MB' },
];

export default function PressPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm text-white mb-6">
            <Newspaper className="w-4 h-4 inline mr-2" />
            Press & Media
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Naploo in the
            <br />
            <span className="gradient-text">News</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
            Get the latest news, press releases, and media resources about Naploo.
          </p>
        </div>
      </section>

      {/* Media Features */}
      <section className="relative py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-400 mb-8">Featured In</p>
          <div className="flex flex-wrap justify-center gap-8">
            {mediaFeatures.map((media) => (
              <div key={media.name} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors">
                <span className="text-2xl">{media.logo}</span>
                <span className="font-medium">{media.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-12">Press Releases</h2>
          <div className="space-y-6">
            {pressReleases.map((release, index) => (
              <Link
                key={index}
                href={release.link}
                className="block bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:ring-2 hover:ring-primary-500/50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      {release.date}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 group-hover:text-primary-600 transition-colors mb-2">
                      {release.title}
                    </h3>
                    <p className="text-slate-500">{release.excerpt}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-primary-600 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Assets */}
      <section className="relative py-24 bg-violet-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Brand Assets</h2>
              <p className="text-slate-500">Download logos, images, and brand guidelines</p>
            </div>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-slate-800 border border-gray-200 hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Download All
            </button>
          </div>

          <div className="space-y-3">
            {brandAssets.map((asset) => (
              <div
                key={asset.name}
                className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">{asset.name}</h4>
                    <p className="text-sm text-slate-400">{asset.type} • {asset.size}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Press Contact */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Media Inquiries
          </h2>
          <p className="text-lg text-white/70 max-w-xl mx-auto mb-8">
            For press inquiries, interviews, or media requests, please contact our communications team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:press@naploo.com"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-glow-lg transition-all"
            >
              <Mail className="w-5 h-5" />
              press@naploo.com
            </a>
            <a
              href="tel:+919876543210"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
            >
              +91 98765 43210
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
