import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GlassCard } from '@/components/ui/GlassCard';

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

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-naploo-dark text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-sm text-violet-400 mb-6">
            Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Redefining Rest
            <br />
            <span className="gradient-text">For Modern Travelers</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
            Born from a simple idea: everyone deserves a comfortable place to rest, 
            anywhere, anytime. Naploo is transforming how India travels and rests.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-sm text-primary-400 mb-6">
                Our Mission
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Making Rest <span className="gradient-text">Accessible</span> to Everyone
              </h2>
              <p className="text-lg text-white/60 mb-8">
                We believe that quality rest should not be a luxury. Our mission is to provide 
                affordable, comfortable, and hygienic sleeping pods across India - at airports, 
                hotels, train stations, and beyond.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <GlassCard key={index} className="p-4 text-center">
                    <p className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</p>
                    <p className="text-sm text-white/60">{stat.label}</p>
                  </GlassCard>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden border border-white/10">
                <Image
                  src="/Pods_Images/For Website main images/Main Pods Image.png"
                  alt="Naploo Pod Interior"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-2xl overflow-hidden border border-white/10">
                <Image
                  src="/Pods_Images/For Website main images/Main Pod Image2.png"
                  alt="Naploo Pod Detail"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/10 to-transparent" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-sm text-cyan-400 mb-6">
              Our Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Building the <span className="gradient-text">Future of Rest</span>
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
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-primary-500 to-violet-500 rounded-full ring-4 ring-naploo-dark" />
                  
                  {/* Content */}
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <GlassCard className="p-6">
                      <span className="text-primary-400 font-mono text-sm">{milestone.year}</span>
                      <h3 className="text-xl font-bold text-white mt-1">{milestone.title}</h3>
                      <p className="text-white/60 mt-2">{milestone.desc}</p>
                    </GlassCard>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-sm text-violet-400 mb-6">
              Our Values
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              What Drives <span className="gradient-text">Us Forward</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <GlassCard key={index} className="p-6 text-center group hover:border-primary-500/50 transition-all">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold gradient-text">{index + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                <p className="text-sm text-white/60">{value.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pod Gallery */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-sm text-primary-400 mb-6">
              Our Pods
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Experience <span className="gradient-text">Premium Design</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <div className="aspect-[3/4] relative">
                <Image
                  src="/Pods_Images/ABS Flagship Series/ABS Single Vertical.png"
                  alt="ABS Flagship Pod"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-naploo-dark via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-semibold">ABS Flagship Series</p>
                  <p className="text-white/60 text-sm">Premium build quality</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <div className="aspect-[3/4] relative">
                <Image
                  src="/Pods_Images/For Website main images/Pods Hall looks.jpg"
                  alt="Space Series Pod"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-naploo-dark via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-semibold">Space Series</p>
                  <p className="text-white/60 text-sm">Futuristic design</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <div className="aspect-[3/4] relative">
                <Image
                  src="/Pods_Images/For Website main images/Reception.png"
                  alt="Cosmos Series Pod"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-naploo-dark via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-semibold">Cosmos Series</p>
                  <p className="text-white/60 text-sm">Modern elegance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BIDUA Section */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GlassCard className="p-12">
            <p className="text-primary-400 text-sm font-medium mb-4">A Product By</p>
            <h2 className="text-4xl font-bold text-white mb-4">
              BIDUA Industries
            </h2>
            <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto">
              BIDUA Industries is a forward-thinking company focused on creating innovative 
              products that improve everyday life. From sleeping pods to smart home solutions, 
              we&apos;re building the future, one product at a time.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="https://biduapods.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
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
          </GlassCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-naploo-primary/20 via-naploo-violet/20 to-naploo-accent/20" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Join the Naploo Family
          </h2>
          <p className="text-lg text-white/60 max-w-xl mx-auto mb-10">
            Whether you&apos;re a traveler, hotel partner, or investor - there&apos;s a place for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pods"
              className="px-8 py-4 bg-gradient-to-r from-naploo-primary to-naploo-violet text-white font-semibold rounded-xl hover:shadow-glow transition-all"
            >
              Book a Pod
            </Link>
            <Link
              href="/partner"
              className="px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
            >
              Become a Partner
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
