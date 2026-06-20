'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ImageSlider from '@/components/ui/ImageSlider';
import { useState } from 'react';
import { 
  Building2, TrendingUp, Settings, 
  CheckCircle, Zap, Shield, Wallet, BarChart3, 
  Mail, ArrowRight, Sparkles, Hotel, Home, Store
} from 'lucide-react';

const benefits = [
  {
    icon: Wallet,
    title: 'Zero Investment',
    description: 'We provide the pods, installation, and maintenance. You just provide the space.',
    highlight: '₹0 upfront cost'
  },
  {
    icon: TrendingUp,
    title: 'Revenue Share',
    description: 'Earn up to 40% of every booking made at your property. Monthly payouts guaranteed.',
    highlight: 'Up to 40% share'
  },
  {
    icon: Settings,
    title: 'Full Support',
    description: 'We handle everything - installation, maintenance, customer service, and cleaning.',
    highlight: '24/7 support'
  },
  {
    icon: BarChart3,
    title: 'Smart Dashboard',
    description: 'Track earnings, bookings, and performance in real-time with our partner app.',
    highlight: 'Real-time analytics'
  },
  {
    icon: Shield,
    title: 'Insurance Covered',
    description: 'All pods are fully insured. We cover any damages or maintenance costs.',
    highlight: 'Full coverage'
  },
  {
    icon: Zap,
    title: 'Quick Setup',
    description: 'From application to first guest in just 2 weeks. Fast and hassle-free.',
    highlight: '14-day setup'
  }
];

const partnerTypes = [
  {
    icon: Hotel,
    title: 'Hotels',
    description: 'Add pods to your lobby, rooftop, or unused spaces to serve transit guests.',
    image: '/Pods_Images/For Website main images/Main Pods Image.png',
    benefits: ['Serve airport transit guests', 'Maximize unused spaces', 'Additional revenue stream']
  },
  {
    icon: Home,
    title: 'Homestays',
    description: 'Install pods in your property for additional guest accommodation options.',
    image: '/Pods_Images/For Website main images/Main Pod Image2.png',
    benefits: ['Flexible installation', 'Budget travelers market', 'Higher occupancy']
  },
  {
    icon: Store,
    title: 'Commercial Spaces',
    description: 'Malls, airports, co-working spaces - turn foot traffic into revenue.',
    image: '/Pods_Images/For Website main images/Pods Hall looks.jpg',
    benefits: ['High foot traffic areas', 'Premium pricing', 'Unique offering']
  }
];

const steps = [
  {
    step: '01',
    title: 'Submit Application',
    description: 'Fill out the partner form with your property details and available space.'
  },
  {
    step: '02',
    title: 'Site Assessment',
    description: 'Our team visits your property to assess the best pod placement options.'
  },
  {
    step: '03',
    title: 'Agreement & Setup',
    description: 'Sign the partnership agreement and we install the pods within 2 weeks.'
  },
  {
    step: '04',
    title: 'Go Live',
    description: 'Your pods go live on our platform and you start earning from day one.'
  }
];

const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Hotel Owner, Delhi',
    image: '/Pods_Images/ABS Flagship Series/ABS Single Vertical.png',
    quote: 'Added 6 pods in our lobby area. Now earning ₹80,000 extra per month with zero effort.',
    rating: 5
  },
  {
    name: 'Priya Sharma',
    role: 'Homestay Owner, Bangalore',
    image: '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
    quote: 'Perfect solution for my property. The installation was quick and support is excellent.',
    rating: 5
  },
  {
    name: 'Amit Patel',
    role: 'Co-working Space, Mumbai',
    image: '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png',
    quote: 'Our members love having rest pods available. Great addition to our amenities.',
    rating: 5
  }
];

const stats = [
  { value: 'Up to 40%', label: 'Revenue Share' },
  { value: '₹0', label: 'Upfront for Partner' },
  { value: '14 Days', label: 'Avg. Setup Time' },
  { value: '48 hrs', label: 'Application Response' }
];

// Hero images for slider
const heroImages = [
  '/Pods_Images/For Website main images/Main Pods Image.png',
  '/Pods_Images/For Website main images/Main Pod Image2.png',
  '/Pods_Images/ABS Flagship Series/ABS Single Vertical.png',
  '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
  '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png',
];

export default function PartnerPage() {
  const initialForm = {
    // Contact
    fullName: '',
    email: '',
    phone: '',
    whatsapp: '',
    // Property
    propertyName: '',
    propertyType: '',
    ownershipStatus: '',
    yearEstablished: '',
    totalRooms: '',
    starRating: '',
    // Location
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    googleMapsUrl: '',
    // Space
    availableSpaceSqft: '',
    spaceLocation: '',
    estimatedPods: '',
    powerBackup: '',
    hasWifi: false,
    hasAc: false,
    hasWashroom: false,
    hasParking: false,
    has24x7Access: false,
    hasSecurity: false,
    // Footfall
    monthlyFootfall: '',
    primaryGuestType: '',
    peakSeason: '',
    nearbyTransit: '',
    // Commercial
    preferredModel: '',
    expectedRevenueShare: '',
    gstNumber: '',
    panNumber: '',
    // Misc
    message: '',
    howDidYouHear: '',
    consent: false,
  };

  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<
    { ok: true; applicationNumber: string } | { ok: false; error: string } | null
  >(null);

  const update = <K extends keyof typeof initialForm>(key: K, value: (typeof initialForm)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setResult(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/partner-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        setResult({ ok: true, applicationNumber: data.applicationNumber });
        setFormData(initialForm);
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: document.getElementById('partner-form')?.offsetTop ?? 0, behavior: 'smooth' });
        }
      } else {
        setResult({ ok: false, error: data?.error || 'Submission failed. Please try again.' });
      }
    } catch {
      setResult({ ok: false, error: 'Network error. Please check your connection and retry.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700">
        {/* Background Effects */}
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-300/20 backdrop-blur-sm border border-green-200/40 px-4 py-2 rounded-full text-green-100 mb-6">
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-medium">Partnership Program · Now Live</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Turn Your Space Into a
                <span className="block gradient-text">Revenue Machine</span>
              </h1>

              <p className="text-lg text-white/80 mb-8 max-w-lg">
                Partner with Naploo and earn passive income from unused spaces in your hotel, hostel, homestay or commercial property. We install premium sleeping pods, you keep a share of every booking.
              </p>

              <div className="mb-6 bg-white/10 border border-white/20 rounded-xl p-3 text-sm text-white/80">
                Submit your property details below — our partnerships team will review and reach out within <strong className="text-white">48 hours</strong>. Prefer to own the pods yourself? <a href="https://biduapods.com/products" target="_blank" rel="noopener noreferrer" className="text-yellow-200 underline">Buy from BIDUA Pods</a> and keep 100%.
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="#partner-form" 
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg"
                >
                  Submit Property Details
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a 
                  href="#how-it-works" 
                  className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 px-8 py-4 rounded-xl text-white font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  How It Works
                </a>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-white/5 rounded-3xl blur-3xl" />
                <div className="relative bg-white/10 border border-white/20 rounded-3xl overflow-hidden">
                  <div className="aspect-[4/3] relative">
                    <ImageSlider
                      images={heroImages}
                      alt="Partner with Naploo"
                      className="h-full w-full"
                      autoPlay={true}
                      interval={4000}
                    />
                  </div>
                  {/* Floating Stats Card */}
                  <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">Monthly Earnings</p>
                        <p className="text-2xl font-bold text-white">₹80,000+</p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Types Section */}
      <section className="py-20 relative bg-violet-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-violet-50 border border-violet-200 text-violet-600 rounded-full text-sm font-medium mb-4">
              Partner Types
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Who Can <span className="gradient-text">Partner</span> With Us?
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Whether you own a hotel, homestay, or commercial space, we have partnership options tailored for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {partnerTypes.map((type, index) => (
              <div key={index} className="group">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:border-primary-500/50 transition-all duration-300">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={type.image}
                      alt={type.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <type.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{type.title}</h3>
                    <p className="text-slate-500 text-sm mb-4">{type.description}</p>
                    
                    <ul className="space-y-2">
                      {type.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary-50 border border-primary-200 text-primary-600 rounded-full text-sm font-medium mb-4">
              Why Partner With Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Benefits of <span className="gradient-text">Partnership</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Why hotels, hostels and homestays across India are partnering with Naploo
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:border-primary-500/50 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-violet-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <benefit.icon className="w-7 h-7 text-primary-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-primary-600 mb-1">{benefit.highlight}</div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{benefit.title}</h3>
                    <p className="text-slate-500 text-sm">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 relative bg-violet-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-violet-50 border border-violet-200 text-violet-600 rounded-full text-sm font-medium mb-4">
              Partnership Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Get started in 4 simple steps and start earning within 2 weeks
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-px bg-gradient-to-r from-primary-300 to-violet-300" />
                )}
                
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center relative z-10">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-violet-600 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-violet-50 border border-violet-200 text-violet-600 rounded-full text-sm font-medium mb-4">
              Partner Stories
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              What Our <span className="gradient-text">Partners</span> Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-slate-800 font-semibold">{testimonial.name}</h4>
                    <p className="text-slate-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Sparkles key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                
                <p className="text-slate-600 italic">&quot;{testimonial.quote}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Form Section */}
      <section id="partner-form" className="py-20 relative bg-violet-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <span className="inline-block px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm font-medium mb-4">
                Submit Property Details
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Ready to <span className="gradient-text">Partner</span> With Us?
              </h2>
              <p className="text-slate-500 mb-8">
                Fill out the form with your property details. Our partnerships team reviews every submission and reaches out within 48 hours with the best-fit revenue model.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-slate-800 font-semibold text-sm">Zero upfront for partners</p>
                    <p className="text-slate-500 text-xs">We provide pods, installation, maintenance & support.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-50 border border-primary-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-slate-800 font-semibold text-sm">Up to 40% revenue share</p>
                    <p className="text-slate-500 text-xs">Monthly payouts directly to your bank account.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-violet-50 border border-violet-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-slate-800 font-semibold text-sm">Live within 14 days</p>
                    <p className="text-slate-500 text-xs">From site survey to first booking, fast & hassle-free.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Questions?</p>
                    <Link href="/contact" className="text-slate-800 font-semibold text-sm hover:text-primary-600">Contact our team</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Form */}
            <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
              {result?.ok ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-50 border border-green-200 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Application Received!</h3>
                  <p className="text-slate-500 mb-4">
                    Thank you. Your application has been submitted successfully.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-xl px-4 py-2 mb-6">
                    <span className="text-xs text-slate-500">Reference</span>
                    <span className="font-mono font-semibold text-primary-700 text-sm">{result.applicationNumber}</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-6">
                    Our partnerships team will review your details and reach out within <strong>48 hours</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                  >
                    Submit Another Property
                  </button>
                </div>
              ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {result && !result.ok && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                    {result.error}
                  </div>
                )}

                {/* Section 1: Contact */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">1</div>
                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Owner / Contact</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Full Name <span className="text-red-500">*</span></label>
                      <input
                        type="text" required value={formData.fullName}
                        onChange={(e) => update('fullName', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="Rajesh Kumar"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Phone <span className="text-red-500">*</span></label>
                      <input
                        type="tel" required value={formData.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Email <span className="text-red-500">*</span></label>
                      <input
                        type="email" required value={formData.email}
                        onChange={(e) => update('email', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="owner@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">WhatsApp (optional)</label>
                      <input
                        type="tel" value={formData.whatsapp}
                        onChange={(e) => update('whatsapp', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="Same as phone if blank"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Property */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center">2</div>
                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Property Information</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-slate-600 text-xs mb-1.5">Property / Business Name <span className="text-red-500">*</span></label>
                      <input
                        type="text" required value={formData.propertyName}
                        onChange={(e) => update('propertyName', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="Hotel Sunrise / Sharma Homestay"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Property Type <span className="text-red-500">*</span></label>
                      <select required value={formData.propertyType}
                        onChange={(e) => update('propertyType', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-primary-500 transition">
                        <option value="">Select Type</option>
                        <option value="hotel">Hotel</option>
                        <option value="homestay">Homestay</option>
                        <option value="hostel">Hostel / Backpackers</option>
                        <option value="resort">Resort</option>
                        <option value="guesthouse">Guest House</option>
                        <option value="mall">Mall / Shopping Center</option>
                        <option value="airport">Airport</option>
                        <option value="railway">Railway Station</option>
                        <option value="bus-terminal">Bus Terminal</option>
                        <option value="coworking">Co-working Space</option>
                        <option value="hospital">Hospital</option>
                        <option value="commercial">Commercial Building</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Ownership Status <span className="text-red-500">*</span></label>
                      <select required value={formData.ownershipStatus}
                        onChange={(e) => update('ownershipStatus', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-primary-500 transition">
                        <option value="">Select</option>
                        <option value="owner">Owner</option>
                        <option value="long-lease">Long-term Lease</option>
                        <option value="manager">Manager / Operator</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Year Established</label>
                      <input
                        type="text" value={formData.yearEstablished}
                        onChange={(e) => update('yearEstablished', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="2018"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Total Existing Rooms / Units</label>
                      <input
                        type="text" value={formData.totalRooms}
                        onChange={(e) => update('totalRooms', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="e.g., 24"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Star Rating (if any)</label>
                      <select value={formData.starRating}
                        onChange={(e) => update('starRating', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-primary-500 transition">
                        <option value="">Not applicable</option>
                        <option value="budget">Budget / Unrated</option>
                        <option value="2">2 Star</option>
                        <option value="3">3 Star</option>
                        <option value="4">4 Star</option>
                        <option value="5">5 Star</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Location */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 text-xs font-bold flex items-center justify-center">3</div>
                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Location</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-slate-600 text-xs mb-1.5">Address Line 1 <span className="text-red-500">*</span></label>
                      <input
                        type="text" required value={formData.addressLine1}
                        onChange={(e) => update('addressLine1', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="Building / Plot, Street"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-slate-600 text-xs mb-1.5">Address Line 2</label>
                      <input
                        type="text" value={formData.addressLine2}
                        onChange={(e) => update('addressLine2', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="Area / Sector"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">City <span className="text-red-500">*</span></label>
                      <input
                        type="text" required value={formData.city}
                        onChange={(e) => update('city', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="Mumbai"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">State <span className="text-red-500">*</span></label>
                      <input
                        type="text" required value={formData.state}
                        onChange={(e) => update('state', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Pincode <span className="text-red-500">*</span></label>
                      <input
                        type="text" required value={formData.pincode}
                        onChange={(e) => update('pincode', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="400001"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Nearest Landmark</label>
                      <input
                        type="text" value={formData.landmark}
                        onChange={(e) => update('landmark', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="Near Airport Metro"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-slate-600 text-xs">Google Maps URL (optional)</label>
                        <a
                          href="https://www.google.com/maps"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-primary-600 hover:text-primary-700 hover:underline"
                          title="Open Google Maps, find your property, tap Share → Copy link, paste it here"
                        >
                          Pin on Maps →
                        </a>
                      </div>
                      <input
                        type="url" value={formData.googleMapsUrl}
                        onChange={(e) => update('googleMapsUrl', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="https://maps.app.goo.gl/... or https://maps.google.com/?q=..."
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Open Google Maps → search your property → tap <strong>Share</strong> → <strong>Copy link</strong> → paste here. Helps our team verify location instantly.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 4: Space & Amenities */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">4</div>
                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Space &amp; Amenities</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Available Space (sq ft) <span className="text-red-500">*</span></label>
                      <input
                        type="text" required value={formData.availableSpaceSqft}
                        onChange={(e) => update('availableSpaceSqft', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="e.g., 500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Space Location <span className="text-red-500">*</span></label>
                      <select required value={formData.spaceLocation}
                        onChange={(e) => update('spaceLocation', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-primary-500 transition">
                        <option value="">Select</option>
                        <option value="lobby">Lobby</option>
                        <option value="rooftop">Rooftop</option>
                        <option value="basement">Basement</option>
                        <option value="floor">Dedicated Floor</option>
                        <option value="annexe">Annexe / Separate Block</option>
                        <option value="garage">Garage / Parking</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Estimated Pods You Can Host</label>
                      <input
                        type="text" value={formData.estimatedPods}
                        onChange={(e) => update('estimatedPods', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="e.g., 6 pods"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Power Backup</label>
                      <select value={formData.powerBackup}
                        onChange={(e) => update('powerBackup', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-primary-500 transition">
                        <option value="">Select</option>
                        <option value="none">None</option>
                        <option value="inverter">Inverter</option>
                        <option value="generator">Generator (Full)</option>
                        <option value="partial">Partial Backup</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">Tick all amenities available at the proposed space:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      ['hasWifi', 'High-speed Wi-Fi'],
                      ['hasAc', 'Air Conditioning'],
                      ['hasWashroom', 'Washroom Access'],
                      ['hasParking', 'Parking'],
                      ['has24x7Access', '24×7 Access'],
                      ['hasSecurity', 'Security / CCTV'],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:border-primary-300 transition">
                        <input
                          type="checkbox"
                          checked={Boolean(formData[key as keyof typeof formData])}
                          onChange={(e) => update(key as keyof typeof initialForm, e.target.checked as never)}
                          className="accent-primary-600 w-4 h-4"
                        />
                        <span className="text-xs text-slate-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Section 5: Footfall & Operations */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">5</div>
                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Footfall &amp; Operations</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Approx Monthly Footfall</label>
                      <select value={formData.monthlyFootfall}
                        onChange={(e) => update('monthlyFootfall', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-primary-500 transition">
                        <option value="">Select range</option>
                        <option value="<500">Less than 500</option>
                        <option value="500-2000">500 – 2,000</option>
                        <option value="2000-5000">2,000 – 5,000</option>
                        <option value="5000-15000">5,000 – 15,000</option>
                        <option value="15000+">15,000+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Primary Guest Type</label>
                      <select value={formData.primaryGuestType}
                        onChange={(e) => update('primaryGuestType', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-primary-500 transition">
                        <option value="">Select</option>
                        <option value="business">Business Travellers</option>
                        <option value="leisure">Leisure / Tourists</option>
                        <option value="transit">Transit / Layover</option>
                        <option value="medical">Medical Travellers</option>
                        <option value="students">Students / Backpackers</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Peak Season</label>
                      <input
                        type="text" value={formData.peakSeason}
                        onChange={(e) => update('peakSeason', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="e.g., Oct–Feb"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Nearby Transit Hubs</label>
                      <input
                        type="text" value={formData.nearbyTransit}
                        onChange={(e) => update('nearbyTransit', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="Airport 2km, Metro 500m"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 6: Commercial */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center">6</div>
                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Commercial Preferences</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Preferred Model</label>
                      <select value={formData.preferredModel}
                        onChange={(e) => update('preferredModel', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-primary-500 transition">
                        <option value="">Select</option>
                        <option value="naploo-deploys">Naploo deploys pods (revenue share)</option>
                        <option value="self-buy">I buy pods, Naploo manages (lease)</option>
                        <option value="self-operate">I buy &amp; operate myself (100% revenue)</option>
                        <option value="unsure">Not sure — recommend best fit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Expected Revenue Share (%)</label>
                      <input
                        type="text" value={formData.expectedRevenueShare}
                        onChange={(e) => update('expectedRevenueShare', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="e.g., 30%"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">GST Number (optional)</label>
                      <input
                        type="text" value={formData.gstNumber}
                        onChange={(e) => update('gstNumber', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="22AAAAA0000A1Z5"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">PAN (optional)</label>
                      <input
                        type="text" value={formData.panNumber}
                        onChange={(e) => update('panNumber', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="ABCDE1234F"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 7: Misc */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">7</div>
                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Additional Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">Anything else about your property / vision</label>
                      <textarea
                        rows={4} value={formData.message}
                        onChange={(e) => update('message', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition resize-none"
                        placeholder="Tell us about your property, goals, timelines, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1.5">How did you hear about Naploo?</label>
                      <select value={formData.howDidYouHear}
                        onChange={(e) => update('howDidYouHear', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-primary-500 transition">
                        <option value="">Select</option>
                        <option value="google">Google Search</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="referral">Referral</option>
                        <option value="news">News / Media</option>
                        <option value="event">Event / Conference</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <label className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 cursor-pointer">
                      <input
                        type="checkbox" required checked={formData.consent}
                        onChange={(e) => update('consent', e.target.checked)}
                        className="accent-primary-600 w-4 h-4 mt-0.5"
                      />
                      <span className="text-xs text-slate-600">
                        I authorise Naploo to contact me regarding this application and agree to the <Link href="/terms" className="text-primary-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-primary-500 to-violet-600 text-white py-4 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting…' : 'Submit Property Details'}
                  {!submitting && <ArrowRight className="w-5 h-5" />}
                </button>

                <p className="text-slate-400 text-xs text-center">
                  Our partnerships team typically responds within 48 hours.
                </p>
              </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 relative bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary-50 border border-primary-200 text-primary-600 rounded-full text-sm font-medium mb-4">
              FAQs
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How much space do I need to host pods?',
                a: 'Minimum 100 sq ft is required for a single pod. The more space you have, the more pods we can install, increasing your earning potential.'
              },
              {
                q: 'What are the costs involved for partners?',
                a: 'Zero. Naploo provides the pods, handles installation, maintenance, and customer service. You just provide the space. If you prefer to own the pods outright, you can also buy them directly from BIDUA Pods and run them yourself to earn 100% revenue.'
              },
              {
                q: 'How do I receive my earnings?',
                a: 'Earnings are transferred to your bank account on the 1st of every month. You can track real-time earnings on the partner dashboard.'
              },
              {
                q: 'What if a pod gets damaged?',
                a: 'All pods are fully insured. We cover any damages or maintenance costs. You don\'t have to worry about anything.'
              },
              {
                q: 'Can I exit the partnership?',
                a: 'Yes, with a 30-day notice period. We will remove the pods at no cost to you.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{faq.q}</h3>
                <p className="text-slate-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
