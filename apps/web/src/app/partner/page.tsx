'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ImageSlider from '@/components/ui/ImageSlider';
import { useState } from 'react';
import { 
  Building2, TrendingUp, Users, Clock, Settings, ChevronRight, 
  CheckCircle, MapPin, Zap, Shield, Wallet, BarChart3, 
  Phone, Mail, ArrowRight, Sparkles, Hotel, Home, Store
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
  { value: '500+', label: 'Partner Properties' },
  { value: '₹2Cr+', label: 'Partner Earnings' },
  { value: '40%', label: 'Revenue Share' },
  { value: '14 Days', label: 'Setup Time' }
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyType: '',
    city: '',
    spaceSize: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
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
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-full text-white mb-6">
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-medium">Partnership Program</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Turn Your Space Into
                <span className="block gradient-text">Revenue Machine</span>
              </h1>

              <p className="text-lg text-white/80 mb-8 max-w-lg">
                Partner with Naploo and earn passive income from your unused spaces. 
                Zero investment, full support, and guaranteed monthly payouts.
              </p>

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
                  Become a Partner
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
      <section className="py-20 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary-50 border border-primary-200 text-primary-600 rounded-full text-sm font-medium mb-4">
              Why Partner With Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Benefits of <span className="gradient-text">Partnership</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Join 500+ property owners who are earning passive income with zero investment
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-primary-50 border border-primary-200 text-primary-600 rounded-full text-sm font-medium mb-4">
                Get Started
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Ready to <span className="gradient-text">Partner</span> With Us?
              </h2>
              <p className="text-slate-500 mb-8">
                Fill out the form and our partnership team will reach out to you within 24 hours.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-50 border border-primary-200 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Call Us</p>
                    <p className="text-slate-800 font-semibold">+91 98765 43210</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-50 border border-violet-200 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Email Us</p>
                    <p className="text-slate-800 font-semibold">partners@naploo.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-50 border border-violet-200 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Visit Us</p>
                    <p className="text-slate-800 font-semibold">Delhi NCR, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-600 text-sm mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-sm mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 text-sm mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-600 text-sm mb-2">Property Type</label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-primary-500 transition"
                      required
                    >
                      <option value="" className="bg-white">Select Type</option>
                      <option value="hotel" className="bg-white">Hotel</option>
                      <option value="homestay" className="bg-white">Homestay</option>
                      <option value="hostel" className="bg-white">Hostel</option>
                      <option value="mall" className="bg-white">Mall / Shopping Center</option>
                      <option value="airport" className="bg-white">Airport</option>
                      <option value="coworking" className="bg-white">Co-working Space</option>
                      <option value="other" className="bg-white">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 text-sm mb-2">City</label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-primary-500 transition"
                      required
                    >
                      <option value="" className="bg-white">Select City</option>
                      <option value="delhi" className="bg-white">Delhi NCR</option>
                      <option value="mumbai" className="bg-white">Mumbai</option>
                      <option value="bangalore" className="bg-white">Bangalore</option>
                      <option value="hyderabad" className="bg-white">Hyderabad</option>
                      <option value="chennai" className="bg-white">Chennai</option>
                      <option value="kolkata" className="bg-white">Kolkata</option>
                      <option value="pune" className="bg-white">Pune</option>
                      <option value="other" className="bg-white">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 text-sm mb-2">Available Space (sq ft)</label>
                  <input
                    type="text"
                    value={formData.spaceSize}
                    onChange={(e) => setFormData({...formData, spaceSize: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                    placeholder="e.g., 500 sq ft"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-sm mb-2">Message (Optional)</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={4}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition resize-none"
                    placeholder="Tell us about your property..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-500 to-violet-600 text-white py-4 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Submit Application
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-slate-400 text-xs text-center">
                  By submitting, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
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
                a: 'Zero! Naploo provides the pods, handles installation, maintenance, and customer service. You just provide the space.'
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
