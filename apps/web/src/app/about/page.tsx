import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Naploo | India's Leading Sleep Pod Company",
  description: "Learn about Naploo's mission to revolutionize rest in India. Our futuristic sleep pods offer affordable, hygienic, and comfortable hourly stays at prime locations across India.",
  keywords: "about naploo, sleep pod company India, pod hotel startup, naploo story, rest revolution India",
  openGraph: {
    title: "About Naploo - Revolutionizing Rest in India",
    description: "Learn about our mission to bring premium sleep pods to every corner of India.",
    url: "https://naploo.com/about",
  },
  alternates: { canonical: "https://naploo.com/about" },
};

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ImageSlider from '@/components/ui/ImageSlider';

const milestones = [
  { year: '2024', title: 'Founded', desc: 'BIDUA Industries launches Naploo with a vision to revolutionize rest' },
  { year: '2024', title: 'First Pod', desc: 'Installed first Space Series pod at Mumbai Airport' },
  { year: '2025', title: 'Expansion', desc: 'Expanded to 10 major cities with 100+ pods' },
  { year: '2025', title: 'Investment', desc: 'Launched investor program for pod ownership' },
  { year: '2026', title: 'Milestone', desc: '10,000+ happy customers across 25+ cities' },
];

const values = [
  { title: 'Innovation', desc: 'Constantly pushing boundaries in pod technology and design' },
  { title: 'Comfort', desc: 'Every pod designed for maximum rest and relaxation' },
  { title: 'Accessibility', desc: 'Premium rest experience at affordable prices' },
  { title: 'Sustainability', desc: 'Eco-friendly materials and energy-efficient pods' },
];

const stats = [
  { value: '10,000+', label: 'Happy Customers' },
  { value: '500+', label: 'Active Pods' },
  { value: '25+', label: 'Cities' },
  { value: '4.8/5', label: 'Rating' },
];

const team = [
  { name: 'Founder & CEO', role: 'Vision & Strategy', initial: 'F' },
  { name: 'CTO', role: 'Technology & Innovation', initial: 'T' },
  { name: 'COO', role: 'Operations & Growth', initial: 'O' },
  { name: 'Head of Design', role: 'Product Design', initial: 'D' },
];


// Pod images for sliders
const podImages = [
  '/Pods_Images/For Website main images/Main Pods Image.png',
  '/Pods_Images/For Website main images/Main Pod Image2.png',
  '/Pods_Images/ABS Flagship Series/ABS Single Vertical.png',
  '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
  '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png',
];

const facilityImages = [
  '/Pods_Images/ABS Flagship Series/ABS Single Vertical.png',
  '/Pods_Images/For Website main images/Pods Hall looks.jpg',
  '/Pods_Images/For Website main images/Reception.png',
  '/Pods_Images/Space Series/"SPACE"series -Horizontal single:double bed.png',
  '/Pods_Images/E-sports series/"E-sports"series -Horizontal single bed main.png',
];

export default function AboutPage() {
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
            Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Redefining Rest
            <br />
            <span className="text-violet-200">For Modern Travelers</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            Born from a simple idea: everyone deserves a comfortable place to rest, 
            anywhere, anytime. Naploo is transforming how India travels and rests.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-primary-50 border border-primary-200 rounded-full text-sm text-primary-600 mb-6">
                Our Mission
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">
                Making Rest <span className="text-primary-600">Accessible</span> to Everyone
              </h2>
              <p className="text-lg text-slate-500 mb-8">
                We believe that quality rest should not be a luxury. Our mission is to provide 
                affordable, comfortable, and hygienic sleeping pods across India - at airports, 
                hotels, train stations, and beyond.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-primary-600">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden border border-gray-200">
                <ImageSlider
                  images={podImages}
                  alt="Naploo Pod Interior"
                  className="h-full w-full"
                  autoPlay={true}
                  interval={4000}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="relative py-24 overflow-hidden bg-violet-50/50">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-cyan-50 border border-cyan-200 rounded-full text-sm text-cyan-600 mb-6">
              Our Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
              Building the <span className="text-primary-600">Future of Rest</span>
            </h2>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary-500 via-violet-500 to-cyan-500" />
            
            {/* Timeline Items */}
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-primary-500 to-violet-500 rounded-full ring-4 ring-violet-50" />
                  
                  {/* Content */}
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                      <span className="text-primary-600 font-mono text-sm">{milestone.year}</span>
                      <h3 className="text-xl font-bold text-slate-800 mt-1">{milestone.title}</h3>
                      <p className="text-slate-500 mt-2">{milestone.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-violet-50 border border-violet-200 rounded-full text-sm text-violet-600 mb-6">
              Our Values
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
              What Drives <span className="text-primary-600">Us Forward</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center group hover:border-primary-500/50 transition-all">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-50 to-violet-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-primary-600">{index + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{value.title}</h3>
                <p className="text-sm text-slate-500">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pod Gallery */}
      <section className="relative py-24 overflow-hidden bg-violet-50/50">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary-50 border border-primary-200 rounded-full text-sm text-primary-600 mb-6">
              Our Pods
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
              Experience <span className="text-primary-600">Premium Design</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <div className="aspect-[3/4] relative">
                <Image
                  src="/Pods_Images/ABS Flagship Series/ABS Single Vertical.png"
                  alt="ABS Flagship Pod"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-semibold">ABS Flagship Series</p>
                  <p className="text-white/70 text-sm">Premium build quality</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <div className="aspect-[3/4] relative">
                <Image
                  src="/Pods_Images/For Website main images/Pods Hall looks.jpg"
                  alt="Space Series Pod"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-semibold">Space Series</p>
                  <p className="text-white/70 text-sm">Futuristic design</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <div className="aspect-[3/4] relative">
                <Image
                  src="/Pods_Images/For Website main images/Reception.png"
                  alt="Cosmos Series Pod"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-semibold">Cosmos Series</p>
                  <p className="text-white/70 text-sm">Modern elegance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BIDUA Section */}
      <section className="relative py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12">
            <p className="text-primary-600 text-sm font-medium mb-4">A Product By</p>
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              BIDUA Industries
            </h2>
            <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto">
              BIDUA Industries is a forward-thinking company focused on creating innovative 
              products that improve everyday life. From sleeping pods to smart home solutions, 
              we&apos;re building the future, one product at a time.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="https://biduapods.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700 hover:bg-gray-100 transition-colors"
              >
                Visit BIDUA Pods
              </a>
              <Link
                href="/partner"
                className="px-6 py-3 bg-gradient-to-r from-naploo-primary to-naploo-violet rounded-xl text-white hover:shadow-glow transition-all"
              >
                Partner With Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Join the Naploo Family
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-10">
            Whether you&apos;re a traveler, hotel partner, or investor - there&apos;s a place for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pods"
              className="px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
            >
              Book a Pod
            </Link>
            <Link
              href="/partner"
              className="px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
            >
              Become a Partner
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
