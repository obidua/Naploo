import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GlassCard } from '@/components/ui/GlassCard';

// Partner Hotels & Homestays Data
const partnerProperties = [
  {
    id: '1',
    name: 'Hotel Grand Imperial',
    type: 'hotel',
    city: 'New Delhi',
    rating: 4.5,
    pods: 12,
    rooms: 14,
    podPrice: 149,
    roomPrice: 1698,
    images: [
      '/Pods_Images/For Website main images/Main Pods Image.png',
      '/Pods_Images/ABS Flagship Series/ABS Single Vertical.png',
    ],
  },
  {
    id: '2',
    name: 'Budget Stay Express',
    type: 'hotel',
    city: 'New Delhi',
    rating: 4.2,
    pods: 8,
    rooms: 12,
    podPrice: 99,
    roomPrice: 1729,
    images: [
      '/Pods_Images/Space Series/"SPACE"series -Horizontal single:double bed.png',
      '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
    ],
  },
  {
    id: '3',
    name: 'Travel Hub Mumbai',
    type: 'hotel',
    city: 'Mumbai',
    rating: 4.7,
    pods: 16,
    rooms: 8,
    podPrice: 199,
    roomPrice: 1952,
    images: [
      '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
      '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png',
    ],
  },
  {
    id: '4',
    name: 'Urban Rest Co-Living',
    type: 'hotel',
    city: 'Mumbai',
    rating: 4.4,
    pods: 10,
    rooms: 12,
    podPrice: 149,
    roomPrice: 2739,
    images: [
      '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png',
      '/Pods_Images/E-sports series/"E-sports"series -Horizontal single bed main.png',
    ],
  },
  {
    id: '5',
    name: 'Airport Inn Bangalore',
    type: 'hotel',
    city: 'Bangalore',
    rating: 4.6,
    pods: 24,
    rooms: 8,
    podPrice: 199,
    roomPrice: 1556,
    images: [
      '/Pods_Images/E-sports series/"E-sports"series -Horizontal single bed main.png',
      '/Pods_Images/BACK TO FUTURE 2047 series/"BACK TO FUTURE 2047"series -Horizontal:Verticalsingle bed main.png',
    ],
  },
  {
    id: '6',
    name: 'Comfy Home Stay',
    type: 'homestay',
    city: 'Bangalore',
    rating: 4.8,
    pods: 6,
    rooms: 0,
    podPrice: 199,
    roomPrice: 0,
    images: [
      '/Pods_Images/wooden series/"wooden"series -Horizontal single bed:Vertical single bed main.png',
      '/Pods_Images/Made in India T1/Main.jpg',
    ],
  },
  {
    id: '7',
    name: 'Sea View Homestay',
    type: 'homestay',
    city: 'Goa',
    rating: 4.9,
    pods: 4,
    rooms: 0,
    podPrice: 249,
    roomPrice: 0,
    images: [
      '/Pods_Images/BACK TO FUTURE 2047 series/"BACK TO FUTURE 2047"series -Horizontal:Verticalsingle bed main.png',
      '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
    ],
  },
  {
    id: '8',
    name: 'Hill Station Retreat',
    type: 'homestay',
    city: 'Mussoorie',
    rating: 4.7,
    pods: 4,
    rooms: 0,
    podPrice: 299,
    roomPrice: 0,
    images: [
      '/Pods_Images/Made in India T1/Main.jpg',
      '/Pods_Images/wooden series/"wooden"series -Horizontal single bed:Vertical single bed main.png',
    ],
  },
];

// Pod Series Data with actual images
const podSeries = [
  {
    name: 'Space Series',
    tagline: 'Experience Zero Gravity Rest',
    description: 'Futuristic capsule design inspired by space stations. Premium single & double bed options.',
    price: '₹150',
    image: '/Pods_Images/Space Series/"SPACE"series -Horizontal single:double bed.png',
    gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    features: ['Climate Control', 'LED Ambient', 'USB-C Ports', 'Smart Lock'],
  },
  {
    name: 'Galaxy Series',
    tagline: 'Sleep Among the Stars',
    description: 'Elegant horizontal pods with cosmic-inspired interiors. Perfect for travelers.',
    price: '₹180',
    image: '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
    gradient: 'from-violet-600 via-purple-600 to-indigo-600',
    features: ['HD Display', 'WiFi 6', 'Air Purifier', 'Premium Bedding'],
  },
  {
    name: 'Cosmos Series',
    tagline: 'Infinite Comfort Awaits',
    description: 'Modern minimalist design with maximum functionality. Vertical & horizontal options.',
    price: '₹200',
    image: '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png',
    gradient: 'from-cyan-600 via-blue-600 to-indigo-600',
    features: ['Noise Cancelling', 'Aromatherapy', 'Smart Mirror', 'Mini Safe'],
  },
  {
    name: 'Back to Future 2047',
    tagline: 'Tomorrow\'s Rest, Today',
    description: 'Revolutionary pod design from the future. Cutting-edge technology meets comfort.',
    price: '₹250',
    image: '/Pods_Images/BACK TO FUTURE 2047 series/"BACK TO FUTURE 2047"series -Horizontal:Verticalsingle bed main.png',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    features: ['AI Assistant', 'Biometric Lock', '4K Display', 'Massage Mode'],
  },
];

// Featured Locations
const locations = [
  { name: 'Mumbai Airport', city: 'Mumbai', pods: 24, rating: 4.9 },
  { name: 'New Delhi Railway', city: 'Delhi', pods: 18, rating: 4.8 },
  { name: 'Bangalore Tech Park', city: 'Bangalore', pods: 32, rating: 4.9 },
  { name: 'Chennai Central', city: 'Chennai', pods: 15, rating: 4.7 },
  { name: 'Hyderabad Hub', city: 'Hyderabad', pods: 20, rating: 4.8 },
  { name: 'Pune Station', city: 'Pune', pods: 12, rating: 4.6 },
];

// How It Works
const steps = [
  {
    step: '01',
    title: 'Find Your Pod',
    description: 'Search pods near airports, railway stations, or city centers. Filter by amenities and price.',
    icon: '🔍',
  },
  {
    step: '02',
    title: 'Book Instantly',
    description: 'Select your duration - 1 hour to 12 hours. No advance booking needed, book on the go.',
    icon: '📱',
  },
  {
    step: '03',
    title: 'Get Access Code',
    description: 'Receive a unique OTP on your phone. Use it to unlock your private pod.',
    icon: '🔐',
  },
  {
    step: '04',
    title: 'Rest & Recharge',
    description: 'Enjoy premium amenities in your private space. Extend anytime with one tap.',
    icon: '😴',
  },
];

// Stats
const stats = [
  { value: '10,000+', label: 'Happy Guests', icon: '😊' },
  { value: '150+', label: 'Pod Locations', icon: '📍' },
  { value: '25+', label: 'Cities', icon: '🏙️' },
  { value: '4.9★', label: 'Average Rating', icon: '⭐' },
];

// Testimonials
const testimonials = [
  {
    name: 'Vikram Mehta',
    role: 'Business Consultant',
    text: 'The Space Series pod at Mumbai Airport was incredible! Clean, futuristic, and exactly what I needed during my 6-hour layover. Will definitely use again.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Software Engineer',
    text: 'As a frequent traveler, Naploo has become my go-to for quick rest. The Galaxy pods have amazing WiFi and the smart features are next level!',
    rating: 5,
  },
  {
    name: 'Arjun Reddy',
    role: 'Medical Professional',
    text: 'After long hospital shifts, I need quality rest before driving home. The Cosmos pod near my hospital is a lifesaver. So peaceful and private.',
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-naploo-dark-DEFAULT text-white overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-naploo-dark-DEFAULT via-naploo-dark-50 to-naploo-dark-DEFAULT" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl" />
          {/* Grid Pattern */}
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full mb-6 animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm text-white/70">India&apos;s First Smart Sleeping Pod Network</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold leading-[1.1] mb-6">
                <span className="text-white">The Future of</span>
                <br />
                <span className="gradient-text">Rest is Here</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-white/60 max-w-xl mx-auto lg:mx-0 mb-8">
                Premium futuristic sleeping pods at airports, railway stations & hotels. 
                Pay only for the hours you rest. Starting at just <span className="text-white font-semibold">₹150/hour</span>.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                <Link
                  href="/pods"
                  className="group px-8 py-4 bg-gradient-to-r from-primary-500 via-violet-500 to-primary-600 text-white font-semibold rounded-2xl hover:shadow-glow-lg transition-all duration-500 flex items-center justify-center gap-3"
                >
                  <span>Find Pods Near You</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/how-it-works"
                  className="px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Watch How It Works
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                {[
                  { icon: '🛡️', text: 'Sanitized Pods' },
                  { icon: '⚡', text: '24/7 Available' },
                  { icon: '🔒', text: 'Smart Lock' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/50">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative order-1 lg:order-2">
              <div className="relative">
                {/* Main Pod Image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary-500/20 border border-white/10">
                  <div className="aspect-[4/3] relative">
                    <Image
                      src="/Pods_Images/For Website main images/Main Pods Image.png"
                      alt="Naploo Premium Sleeping Pod"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-naploo-dark-DEFAULT/90 via-transparent to-transparent" />
                  </div>
                  {/* Overlay Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Space Series Pod</p>
                        <p className="text-white font-semibold text-lg">Premium Single Capsule</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-sm">Starting from</p>
                        <p className="text-2xl font-bold gradient-text">₹150/hr</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-4 -left-4 glass-card px-4 py-3 rounded-xl animate-float hidden sm:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white">
                      ✓
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Available Now</p>
                      <p className="text-sm font-semibold text-white">156 Pods</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 glass-card px-4 py-3 rounded-xl animate-float-slow hidden sm:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                      ★
                    </div>
                    <div>
                      <p className="text-xs text-white/50">User Rating</p>
                      <p className="text-sm font-semibold text-white">4.9/5.0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden lg:block">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative py-12 border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <p className="text-3xl sm:text-4xl font-display font-bold gradient-text mb-1">{stat.value}</p>
                <p className="text-white/50 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Hotels & Homestays Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-b from-transparent via-primary-500/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-400 mb-4">
                Our Partner Properties
              </span>
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-white">
                Hotels & Homestays
              </h2>
              <p className="text-white/60 mt-2">Book pods hourly or rooms for your stay</p>
            </div>
            <Link
              href="/pods"
              className="text-primary-400 hover:text-primary-300 font-medium flex items-center gap-2 transition-colors"
            >
              View All Properties
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Horizontal Scrolling Properties */}
          <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory">
              {partnerProperties.map((property) => (
                <Link
                  key={property.id}
                  href={`/pods/${property.id}`}
                  className="flex-shrink-0 w-[350px] snap-start"
                >
                  <GlassCard className="overflow-hidden group cursor-pointer h-full">
                    {/* Image with Slider Effect */}
                    <div className="relative h-52 overflow-hidden">
                      <div className="absolute inset-0 flex transition-transform duration-500 group-hover:-translate-x-1/2">
                        <Image
                          src={property.images[0]}
                          alt={property.name}
                          width={350}
                          height={208}
                          className="w-full h-full object-cover flex-shrink-0"
                        />
                        {property.images[1] && (
                          <Image
                            src={property.images[1]}
                            alt={`${property.name} 2`}
                            width={350}
                            height={208}
                            className="w-full h-full object-cover flex-shrink-0"
                          />
                        )}
                      </div>
                      
                      {/* Type Badge */}
                      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-medium ${
                        property.type === 'hotel' 
                          ? 'bg-gradient-to-r from-primary-500 to-violet-600' 
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                      }`}>
                        {property.type === 'hotel' ? '🏨 Hotel' : '🏡 Homestay'}
                      </div>

                      {/* Rating */}
                      <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-black/50 backdrop-blur text-white text-sm flex items-center gap-1">
                        ⭐ {property.rating}
                      </div>

                      {/* Hover Indicator */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                        <div className="w-6 h-1 rounded bg-white/80 group-hover:w-2 transition-all"></div>
                        <div className="w-2 h-1 rounded bg-white/40 group-hover:w-6 transition-all"></div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {property.city}
                      </div>

                      <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-primary-400 transition-colors">
                        {property.name}
                      </h3>

                      {/* Availability Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs font-medium">
                          🛏️ {property.pods} Pods • ₹{property.podPrice}/hr
                        </span>
                        {property.rooms > 0 && (
                          <span className="px-2 py-1 bg-violet-500/20 text-violet-400 rounded text-xs font-medium">
                            🚪 {property.rooms} Rooms • ₹{property.roomPrice}/night
                          </span>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <span className="text-sm text-gray-400">View details</span>
                        <svg className="w-5 h-5 text-primary-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pod Series Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-sm text-primary-400 mb-4">
              Premium Collection
            </span>
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4">
              Choose Your Pod Series
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              From futuristic capsules to elegant lounges, find the perfect pod for your rest.
            </p>
          </div>

          {/* Pod Series Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {podSeries.map((pod, index) => (
              <GlassCard
                key={pod.name}
                className="group overflow-hidden"
                hover
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Image */}
                  <div className="lg:w-1/2 relative">
                    <div className="aspect-[4/3] lg:aspect-auto lg:absolute lg:inset-0">
                      <Image
                        src={pod.image}
                        alt={pod.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-r ${pod.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="lg:w-1/2 p-6 lg:p-8">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-display font-bold text-white mb-1">{pod.name}</h3>
                        <p className="text-sm text-primary-400">{pod.tagline}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{pod.price}</p>
                        <p className="text-xs text-white/50">/hour</p>
                      </div>
                    </div>
                    
                    <p className="text-white/60 text-sm mb-4">{pod.description}</p>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {pod.features.map((feature) => (
                        <span key={feature} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white/70">
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    <Link
                      href={`/pods?series=${pod.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${pod.gradient} text-white font-semibold rounded-xl text-sm hover:shadow-glow transition-all`}
                    >
                      Explore Series
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* View All */}
          <div className="text-center mt-12">
            <Link
              href="/pods"
              className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              View All Pod Collections
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Pod Interior Showcase */}
      <section className="relative py-24 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden border border-white/10">
                  <div className="aspect-[3/4] relative">
                    <Image
                      src="/Pods_Images/For Website main images/inside 2.png"
                      alt="Pod Interior"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10">
                  <div className="aspect-square relative">
                    <Image
                      src="/Pods_Images/For Website main images/interior looks.png"
                      alt="Pod Interior View"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-2xl overflow-hidden border border-white/10">
                  <div className="aspect-square relative">
                    <Image
                      src="/Pods_Images/For Website main images/pod view.png"
                      alt="Pod View"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10">
                  <div className="aspect-[3/4] relative">
                    <Image
                      src="/Pods_Images/For Website main images/interior looks2.png"
                      alt="Pod Interior 2"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <span className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-sm text-cyan-400 mb-4">
                Premium Amenities
              </span>
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
                Every Detail
                <br />
                <span className="gradient-text">Designed for Rest</span>
              </h2>
              <p className="text-lg text-white/60 mb-8">
                Step inside a world of comfort. Our pods feature premium bedding, 
                climate control, ambient lighting, and smart technology - everything 
                you need for the perfect rest.
              </p>

              {/* Amenities List */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: '❄️', name: 'Climate Control', desc: 'Perfect temperature' },
                  { icon: '📺', name: 'Smart Display', desc: 'Entertainment ready' },
                  { icon: '🔌', name: 'USB-C Charging', desc: 'Fast power delivery' },
                  { icon: '🌙', name: 'Ambient Lighting', desc: 'Mood settings' },
                  { icon: '🔇', name: 'Sound Insulated', desc: 'Peaceful quiet' },
                  { icon: '🛏️', name: 'Premium Bedding', desc: 'Fresh linens always' },
                ].map((amenity) => (
                  <div key={amenity.name} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-2xl">{amenity.icon}</span>
                    <div>
                      <p className="font-semibold text-white">{amenity.name}</p>
                      <p className="text-sm text-white/50">{amenity.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/pods"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-glow-cyan transition-all"
              >
                Book Your Pod
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-sm text-violet-400 mb-4">
              Simple Process
            </span>
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4">
              Book in 60 Seconds
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              No queues, no paperwork. Just find, book, and rest.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={step.step} className="relative group">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary-500/50 to-transparent z-0" />
                )}
                
                <GlassCard className="p-6 text-center h-full relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-primary-500 to-violet-500 rounded-full text-xs font-bold text-white">
                    Step {step.step}
                  </div>
                  
                  {/* Icon */}
                  <div className="text-5xl mb-4 mt-4">{step.icon}</div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-display font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-white/50">
                    {step.description}
                  </p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="relative py-24 bg-gradient-to-b from-transparent via-primary-500/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-400 mb-4">
                Nationwide Network
              </span>
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-white">
                Top Locations
              </h2>
            </div>
            <Link
              href="/pods"
              className="text-primary-400 hover:text-primary-300 font-medium flex items-center gap-2 transition-colors"
            >
              View All Locations
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Locations Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location) => (
              <Link
                key={location.name}
                href={`/pods?location=${location.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <GlassCard className="p-6 group cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                        {location.name}
                      </h3>
                      <p className="text-sm text-white/50">{location.city}</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      <span>★</span>
                      <span className="text-white font-medium">{location.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">{location.pods} pods available</span>
                    <svg className="w-5 h-5 text-white/30 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-sm text-amber-400 mb-4">
              Customer Stories
            </span>
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4">
              Loved by Travelers
            </h2>
            <p className="text-lg text-white/60">
              Join thousands who trust Naploo for quality rest
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-8">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="text-amber-400">★</span>
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-white/70 mb-6 leading-relaxed">
                  &quot;{t.text}&quot;
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{t.name}</p>
                    <p className="text-sm text-white/50">{t.role}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-violet-600/20 to-cyan-600/20" />
          <div className="absolute inset-0 mesh-gradient opacity-30" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Ready to Experience
            <br />
            <span className="gradient-text">The Future of Rest?</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10">
            Book your first pod today and discover why thousands of travelers 
            choose Naploo for quality rest.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pods"
              className="px-8 py-4 bg-gradient-to-r from-primary-500 via-violet-500 to-primary-600 text-white font-semibold rounded-2xl hover:shadow-glow-lg transition-all duration-300"
            >
              Find Pods Near You
            </Link>
            <Link
              href="/signup"
              className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all"
            >
              Create Free Account
            </Link>
          </div>

          {/* App Store Badges */}
          <div className="flex flex-wrap gap-4 justify-center mt-10">
            <a href="#" className="flex items-center gap-3 px-5 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
              <span className="text-2xl">🍎</span>
              <div className="text-left">
                <p className="text-xs text-white/50">Download on the</p>
                <p className="text-sm font-semibold text-white">App Store</p>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 px-5 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
              <span className="text-2xl">▶️</span>
              <div className="text-left">
                <p className="text-xs text-white/50">Get it on</p>
                <p className="text-sm font-semibold text-white">Google Play</p>
              </div>
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
