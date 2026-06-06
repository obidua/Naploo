import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Careers at Naploo | Join Our Team",
  description: "Build the future of rest with Naploo. Explore exciting career opportunities in technology, operations, marketing & more. Remote-friendly culture.",
  keywords: "naploo careers, naploo jobs, work at naploo, startup jobs India, hospitality careers",
  openGraph: {
    title: "Careers at Naploo | Join Our Team",
    description: "Build the future of rest with Naploo. Explore exciting career opportunities in technology, operations, marketing & more. Remote-friendly culture.",
    url: "https://naploo.com/careers",
    siteName: "Naploo",
    type: "website",
  },
  alternates: { canonical: "https://naploo.com/careers" },

};

import React from 'react';
import Link from 'next/link';
import { Briefcase, MapPin, Clock, Heart, Zap, Users, Code, Paintbrush, TrendingUp, Headphones, ArrowRight } from 'lucide-react';
import { EMAILS } from '@/data/company';

const benefits = [
  { icon: Heart, title: 'Health & Wellness', desc: 'Free gym membership, mental health support, and wellness programs' },
  { icon: Zap, title: 'Learning Budget', desc: '₹50,000 annual budget for courses, conferences, and certifications' },
  { icon: Users, title: 'Remote Friendly', desc: 'Flexible work from home policy with occasional office days' },
  { icon: Clock, title: 'Unlimited PTO', desc: 'Take time off when you need it, no questions asked' },
];

const openings = [
  {
    id: 1,
    title: 'Senior Full Stack Developer',
    department: 'Engineering',
    location: 'Bangalore / Remote',
    type: 'Full-time',
    experience: '4-7 years',
    icon: Code,
    description: 'Build and scale our booking platform using Next.js, Node.js, and PostgreSQL.',
  },
  {
    id: 2,
    title: 'Product Designer',
    department: 'Design',
    location: 'Mumbai / Remote',
    type: 'Full-time',
    experience: '3-5 years',
    icon: Paintbrush,
    description: 'Design delightful user experiences for our mobile and web applications.',
  },
  {
    id: 3,
    title: 'Growth Marketing Manager',
    department: 'Marketing',
    location: 'Delhi NCR',
    type: 'Full-time',
    experience: '5-8 years',
    icon: TrendingUp,
    description: 'Drive user acquisition and retention through data-driven marketing strategies.',
  },
  {
    id: 4,
    title: 'Customer Success Lead',
    department: 'Operations',
    location: 'Bangalore',
    type: 'Full-time',
    experience: '3-5 years',
    icon: Headphones,
    description: 'Lead our customer support team and ensure exceptional guest experiences.',
  },
  {
    id: 5,
    title: 'Business Development Manager',
    department: 'Partnerships',
    location: 'Mumbai / Delhi',
    type: 'Full-time',
    experience: '4-6 years',
    icon: Briefcase,
    description: 'Expand our partner network by onboarding hotels, airports, and corporate clients.',
  },
];

const values = [
  { title: 'Move Fast', desc: 'We ship quickly, learn from mistakes, and iterate constantly.' },
  { title: 'Customer First', desc: 'Every decision starts with "How does this help our customers?"' },
  { title: 'Think Big', desc: 'We are building the future of rest. Dream without limits.' },
  { title: 'Stay Humble', desc: 'The best ideas can come from anywhere. Listen and learn.' },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm text-white mb-6">
            <Briefcase className="w-4 h-4 inline mr-2" />
            Join Our Team
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Build the Future of
            <br />
            <span className="gradient-text">Rest & Hospitality</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
            Join a passionate team revolutionizing how India rests. We&apos;re hiring dreamers, doers, and builders.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Why Join Naploo?</h2>
            <p className="text-slate-500">Perks that make work feel less like work</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center">
                <benefit.icon className="w-10 h-10 text-primary-600 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-800 mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-500">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-16 bg-violet-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Our Values</h2>
            <p className="text-slate-500">The principles that guide everything we do</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <div key={value.title} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <span className="text-4xl font-bold text-primary-200 mb-4 block">0{i + 1}</span>
                <h3 className="font-semibold text-slate-800 mb-2">{value.title}</h3>
                <p className="text-sm text-slate-500">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Open Positions</h2>
            <p className="text-slate-500">Find your next adventure</p>
          </div>

          <div className="space-y-4">
            {openings.map((job) => (
              <div key={job.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:ring-2 hover:ring-primary-500/50 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-50 to-violet-50 flex items-center justify-center flex-shrink-0">
                    <job.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 group-hover:text-primary-600 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-sm text-slate-400">{job.department}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-slate-500 text-sm mt-2 mb-4">{job.description}</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Briefcase className="w-4 h-4" />
                        {job.experience}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-500 mb-4">Don&apos;t see a role that fits?</p>
            <Link
              href={`mailto:${EMAILS.careers}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 hover:bg-gray-100 transition-colors"
            >
              Send Us Your Resume
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Make an Impact?
          </h2>
          <p className="text-lg text-white/70 max-w-xl mx-auto mb-10">
            Join us in building India&apos;s largest sleeping pod network.
          </p>
          <a
            href={`mailto:${EMAILS.careers}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-glow-lg transition-all"
          >
            Apply Now
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
