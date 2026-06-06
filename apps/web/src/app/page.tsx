'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GlassCard } from '@/components/ui/GlassCard';
import ImageSlider from '@/components/ui/ImageSlider';
import HeroPodSlider from '@/components/ui/HeroPodSlider';
import SearchBar from '@/components/search/SearchBar';
import { properties } from '@/data/properties';

// Partner Hotels & Homestays Data — derived from canonical /data/properties.ts so
// the IDs here match the IDs the /property/[id] page resolves via getPropertyById.
const partnerProperties = properties.map((p) => ({
  id: p.id,
  name: p.name,
  type: p.type,
  city: p.city,
  rating: p.rating,
  pods: p.podsCount,
  rooms: p.roomsCount,
  podPrice: p.podStartPrice,
  roomPrice: p.roomStartPrice,
  images: p.images,
}));

// Legacy hardcoded list (kept commented for reference) — replaced June 2026
// because IDs '1'..'8' did not exist in /data/properties.ts and clicking
// a card produced a 404 on /property/[id].
const _legacyPartnerProperties = [
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
      '/Pods_Images/Space Series/"SPACE"series -Horizontal single:double bed.png',
      '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
      '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png',
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
      '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png',
      '/Pods_Images/E-sports series/"E-sports"series -Horizontal single bed main.png',
      '/Pods_Images/Made in India T1/Main.jpg',
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
      '/Pods_Images/BACK TO FUTURE 2047 series/"BACK TO FUTURE 2047"series -Horizontal:Verticalsingle bed main.png',
      '/Pods_Images/wooden series/"wooden"series -Horizontal single bed:Vertical single bed main.png',
      '/Pods_Images/For Website main images/Main Pods Image.png',
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
      '/Pods_Images/ABS Flagship Series/ABS Single Vertical.png',
      '/Pods_Images/Space Series/"SPACE"series -Horizontal single:double bed.png',
      '/Pods_Images/Made in India T1/Main.jpg',
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
      '/Pods_Images/wooden series/"wooden"series -Horizontal single bed:Vertical single bed main.png',
      '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
      '/Pods_Images/For Website main images/Main Pods Image.png',
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
      '/Pods_Images/Space Series/"SPACE"series -Horizontal single:double bed.png',
      '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png',
      '/Pods_Images/ABS Flagship Series/ABS Single Vertical.png',
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
      '/Pods_Images/E-sports series/"E-sports"series -Horizontal single bed main.png',
      '/Pods_Images/wooden series/"wooden"series -Horizontal single bed:Vertical single bed main.png',
      '/Pods_Images/For Website main images/Main Pods Image.png',
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
      '/Pods_Images/Space Series/"SPACE"series -Horizontal single:double bed.png',
      '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
      '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png',
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
    images: [
      '/Pods_Images/Space Series/"SPACE"series -Horizontal single:double bed.png',
      '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
      '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png',
      '/Pods_Images/For Website main images/Main Pods Image.png',
    ],
    gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    features: ['Climate Control', 'LED Ambient', 'USB-C Ports', 'Smart Lock'],
  },
  {
    name: 'Galaxy Series',
    tagline: 'Sleep Among the Stars',
    description: 'Elegant horizontal pods with cosmic-inspired interiors. Perfect for travelers.',
    price: '₹180',
    images: [
      '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
      '/Pods_Images/Space Series/"SPACE"series -Horizontal single:double bed.png',
      '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png',
      '/Pods_Images/E-sports series/"E-sports"series -Horizontal single bed main.png',
    ],
    gradient: 'from-violet-600 via-purple-600 to-indigo-600',
    features: ['HD Display', 'WiFi 6', 'Air Purifier', 'Premium Bedding'],
  },
  {
    name: 'Cosmos Series',
    tagline: 'Infinite Comfort Awaits',
    description: 'Modern minimalist design with maximum functionality. Vertical & horizontal options.',
    price: '₹200',
    images: [
      '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png',
      '/Pods_Images/BACK TO FUTURE 2047 series/"BACK TO FUTURE 2047"series -Horizontal:Verticalsingle bed main.png',
      '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
      '/Pods_Images/wooden series/"wooden"series -Horizontal single bed:Vertical single bed main.png',
    ],
    gradient: 'from-cyan-600 via-blue-600 to-indigo-600',
    features: ['Noise Cancelling', 'Aromatherapy', 'Smart Mirror', 'Mini Safe'],
  },
  {
    name: 'Back to Future 2047',
    tagline: 'Tomorrow\'s Rest, Today',
    description: 'Revolutionary pod design from the future. Cutting-edge technology meets comfort.',
    price: '₹250',
    images: [
      '/Pods_Images/BACK TO FUTURE 2047 series/"BACK TO FUTURE 2047"series -Horizontal:Verticalsingle bed main.png',
      '/Pods_Images/E-sports series/"E-sports"series -Horizontal single bed main.png',
      '/Pods_Images/Made in India T1/Main.jpg',
      '/Pods_Images/ABS Flagship Series/ABS Single Vertical.png',
    ],
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
    description: 'Search pods near airports, railway stations, or city centers.',
    icon: '🔍',
  },
  {
    step: '02',
    title: 'Book Instantly',
    description: 'Select your duration - 1 hour to 12 hours. Book on the go.',
    icon: '📱',
  },
  {
    step: '03',
    title: 'Get Access Code',
    description: 'Receive a unique OTP on your phone to unlock your pod.',
    icon: '🔐',
  },
  {
    step: '04',
    title: 'Rest & Recharge',
    description: 'Enjoy premium amenities. Extend anytime with one tap.',
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
    text: 'The Space Series pod at Mumbai Airport was incredible! Clean, futuristic, and exactly what I needed during my 6-hour layover.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Software Engineer',
    text: 'As a frequent traveler, Naploo has become my go-to for quick rest. The Galaxy pods have amazing WiFi and smart features!',
    rating: 5,
  },
  {
    name: 'Arjun Reddy',
    role: 'Medical Professional',
    text: 'After long hospital shifts, I need quality rest before driving home. The Cosmos pod near my hospital is a lifesaver.',
    rating: 5,
  },
];


// Hero Pod Slides - Different bed types with amenities
const heroPodSlides = [
  {
    image: '/Pods_Images/Space Series/"SPACE"series -Horizontal single:double bed.png',
    series: 'Space Series Pod',
    name: 'Premium Single Capsule',
    bedType: 'Single Bed',
    price: '₹150',
    amenities: ['AC Climate Control', 'USB Charging', 'LED Ambient Light', 'Fresh Air Ventilation'],
  },
  {
    image: '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
    series: 'Galaxy Series Pod',
    name: 'Deluxe Double Capsule',
    bedType: 'Double Bed',
    price: '₹250',
    amenities: ['Queen Size Bed', 'Smart TV 24"', 'Bluetooth Speaker', 'Mini Fridge'],
  },
  {
    image: '/Pods_Images/ABS Flagship Series/ABS Single Vertical.png',
    series: 'ABS Flagship Series',
    name: 'Executive Single Pod',
    bedType: 'Single Bed',
    price: '₹199',
    amenities: ['Noise Cancellation', 'WiFi High-Speed', 'Reading Light', 'Luggage Storage'],
  },
  {
    image: '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png',
    series: 'Cosmos Series Pod',
    name: 'Premium Double Suite',
    bedType: 'Double Bed',
    price: '₹299',
    amenities: ['King Size Bed', 'Mirror & Vanity', 'Aromatherapy', 'Premium Bedding'],
  },
  {
    image: '/Pods_Images/For Website main images/Main Pods Image.png',
    series: 'Made in India Series',
    name: 'Comfort Single Capsule',
    bedType: 'Single Bed',
    price: '₹149',
    amenities: ['AC Cooling', 'Phone Charger', 'Privacy Curtain', 'Clean Linens'],
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-800 overflow-x-hidden">

      {/* Hero Section - Dark purple gradient for impact */}
      <section className="relative min-h-screen flex items-center pt-20 bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[1000px] h-[600px] sm:h-[1000px] bg-primary-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-cyan-500/10 rounded-full blur-3xl" />
          {/* Grid Pattern */}
          <div className="absolute inset-0 grid-pattern opacity-20" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full mb-4 sm:mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs sm:text-sm text-white/70">India&apos;s First Smart Sleeping Pod Network</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-display font-bold leading-[1.1] mb-4 sm:mb-6">
                <span className="text-white">The Future of</span>
                <br />
                <span className="gradient-text">Rest is Here</span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg lg:text-xl text-white/60 max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8">
                Premium futuristic sleeping pods at airports, railway stations & hotels. 
                Pay only for the hours you rest. Starting at just <span className="text-white font-semibold">₹150/hour</span>.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-8 sm:mb-10">
                <Link
                  href="/search"
                  className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary-500 via-violet-500 to-primary-600 text-white font-semibold rounded-xl sm:rounded-2xl hover:shadow-glow-lg transition-all duration-500 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                >
                  <span>Find Pods Near You</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/how-it-works"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-white/5 backdrop-blur-xl border border-white/20 text-white font-semibold rounded-xl sm:rounded-2xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How It Works
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6">
                {[
                  { icon: '🛡️', text: 'Sanitized Pods' },
                  { icon: '⚡', text: '24/7 Available' },
                  { icon: '🔒', text: 'Smart Lock' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/50">
                    <span className="text-base sm:text-lg">{item.icon}</span>
                    <span className="text-xs sm:text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Hero Image Slider */}
            <div className="relative order-1 lg:order-2">
              <div className="relative">
                {/* Main Pod Image Slider */}
                <HeroPodSlider slides={heroPodSlides} />


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

      {/* Search Bar - overlapping hero */}
      <section className="relative z-20 -mt-10 sm:-mt-16 px-4 sm:px-6 lg:px-8 pb-2">
        <div className="max-w-5xl mx-auto">
          <Suspense fallback={<div className="h-32 bg-white rounded-3xl shadow-2xl border border-gray-100 animate-pulse" />}>
            <SearchBar variant="hero" />
          </Suspense>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-500">Trending:</span>
            {['Mumbai', 'Delhi', 'Bangalore', 'Jaipur', 'Goa'].map((c) => (
              <Link
                key={c}
                href={`/search?location=${encodeURIComponent(c)}&mode=pods`}
                className="px-3 py-1 rounded-full bg-white border border-gray-200 text-slate-700 hover:border-primary-300 hover:text-primary-700 transition-colors"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative py-8 sm:py-12 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{stat.icon}</div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-display font-bold gradient-text mb-1">{stat.value}</p>
                <p className="text-slate-500 text-xs sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Hotels & Homestays Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden bg-violet-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-50 border border-emerald-200 rounded-full text-xs sm:text-sm text-emerald-600 mb-3 sm:mb-4">
                Our Partner Properties
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-slate-800">
                Hotels & Homestays
              </h2>
              <p className="text-slate-500 mt-2 text-sm sm:text-base">Book pods hourly or rooms for your stay</p>
            </div>
            <Link
              href="/search"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 transition-colors text-sm sm:text-base"
            >
              View All Properties
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Horizontal Scrolling Properties */}
          <div className="relative">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 sm:pb-6 scrollbar-hide snap-x snap-mandatory">
              {partnerProperties.map((property) => (
                <Link
                  key={property.id}
                  href={`/property/${property.id}`}
                  className="flex-shrink-0 w-[280px] sm:w-[350px] snap-start"
                >
                  <GlassCard className="overflow-hidden group cursor-pointer h-full">
                    {/* Image Slider */}
                    <div className="relative h-40 sm:h-52">
                      <ImageSlider
                        images={property.images}
                        alt={property.name}
                        className="h-full rounded-t-xl"
                        autoPlay={true}
                        interval={4000}
                      />
                      
                      {/* Type Badge */}
                      <div className={`absolute top-3 sm:top-4 left-3 sm:left-4 px-2 sm:px-3 py-1 rounded-full text-white text-xs sm:text-sm font-medium ${
                        property.type === 'hotel' 
                          ? 'bg-gradient-to-r from-primary-500 to-violet-600' 
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                      }`}>
                        {property.type === 'hotel' ? '🏨 Hotel' : '🏡 Homestay'}
                      </div>

                      {/* Rating */}
                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 px-2 py-1 rounded-full bg-black/50 backdrop-blur text-white text-xs sm:text-sm flex items-center gap-1">
                        ⭐ {property.rating}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm mb-1">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {property.city}
                      </div>

                      <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-3 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {property.name}
                      </h3>

                      {/* Availability Badges */}
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                        <span className="px-2 py-0.5 sm:py-1 bg-primary-50 text-primary-600 rounded text-[10px] sm:text-xs font-medium">
                          🛏️ {property.pods} Pods • ₹{property.podPrice}/hr
                        </span>
                        {property.rooms > 0 && (
                          <span className="px-2 py-0.5 sm:py-1 bg-violet-50 text-violet-600 rounded text-[10px] sm:text-xs font-medium">
                            🚪 {property.rooms} Rooms
                          </span>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100">
                        <span className="text-xs sm:text-sm text-slate-400">View details</span>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <section className="relative py-16 sm:py-24 overflow-hidden bg-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-50 border border-primary-200 rounded-full text-xs sm:text-sm text-primary-600 mb-3 sm:mb-4">
              Premium Collection
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-slate-800 mb-3 sm:mb-4">
              Choose Your Pod Series
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-500 max-w-2xl mx-auto px-4">
              From futuristic capsules to elegant lounges, find the perfect pod for your rest.
            </p>
          </div>

          {/* Pod Series Grid */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {podSeries.map((pod) => (
              <GlassCard
                key={pod.name}
                className="group overflow-hidden"
                hover
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image Slider */}
                  <div className="sm:w-2/5 lg:w-1/2 relative">
                    <div className="aspect-[16/10] sm:aspect-auto sm:absolute sm:inset-0">
                      <ImageSlider
                        images={pod.images}
                        alt={pod.name}
                        className="h-full w-full"
                        autoPlay={true}
                        interval={5000}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-r ${pod.gradient} opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none`} />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="sm:w-3/5 lg:w-1/2 p-4 sm:p-5 lg:p-6">
                    <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg lg:text-xl font-display font-bold text-slate-800 mb-0.5 sm:mb-1 truncate">{pod.name}</h3>
                        <p className="text-xs sm:text-sm text-primary-600 truncate">{pod.tagline}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">{pod.price}</p>
                        <p className="text-[10px] sm:text-xs text-slate-400">/hour</p>
                      </div>
                    </div>
                    
                    <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{pod.description}</p>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                      {pod.features.slice(0, 3).map((feature) => (
                        <span key={feature} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-50 border border-gray-200 rounded-lg text-[10px] sm:text-xs text-slate-600">
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    <Link
                      href={`/pods?series=${pod.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r ${pod.gradient} text-white font-semibold rounded-lg sm:rounded-xl text-xs sm:text-sm hover:shadow-glow transition-all`}
                    >
                      Explore Series
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* View All */}
          <div className="text-center mt-8 sm:mt-12">
            <Link
              href="/pods"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors text-sm sm:text-base"
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
      <section className="relative py-16 sm:py-24 bg-violet-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                  <div className="aspect-[3/4] relative">
                    <Image
                      src="/Pods_Images/For Website main images/inside 2.png"
                      alt="Pod Interior"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
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
              <div className="space-y-3 sm:space-y-4 pt-6 sm:pt-8">
                <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                  <div className="aspect-square relative">
                    <Image
                      src="/Pods_Images/For Website main images/pod view.png"
                      alt="Pod View"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
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
              <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-cyan-50 border border-cyan-200 rounded-full text-xs sm:text-sm text-cyan-600 mb-3 sm:mb-4">
                Premium Amenities
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-slate-800 mb-4 sm:mb-6">
                Every Detail
                <br />
                <span className="gradient-text">Designed for Rest</span>
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-slate-500 mb-6 sm:mb-8">
                Step inside a world of comfort. Our pods feature premium bedding, 
                climate control, ambient lighting, and smart technology.
              </p>

              {/* Amenities List */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
                {[
                  { icon: '❄️', name: 'Climate Control', desc: 'Perfect temperature' },
                  { icon: '📺', name: 'Smart Display', desc: 'Entertainment ready' },
                  { icon: '🔌', name: 'USB-C Charging', desc: 'Fast power delivery' },
                  { icon: '🌙', name: 'Ambient Lighting', desc: 'Mood settings' },
                  { icon: '🔇', name: 'Sound Insulated', desc: 'Peaceful quiet' },
                  { icon: '🛏️', name: 'Premium Bedding', desc: 'Fresh linens always' },
                ].map((amenity) => (
                  <div key={amenity.name} className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 lg:p-4 bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-lg sm:text-xl lg:text-2xl">{amenity.icon}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-xs sm:text-sm lg:text-base truncate">{amenity.name}</p>
                      <p className="text-[10px] sm:text-xs lg:text-sm text-slate-400 truncate">{amenity.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/pods"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg sm:rounded-xl hover:shadow-glow-cyan transition-all text-sm sm:text-base"
              >
                Book Your Pod
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-violet-50 border border-violet-200 rounded-full text-xs sm:text-sm text-violet-600 mb-3 sm:mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-slate-800 mb-3 sm:mb-4">
              Book in 60 Seconds
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-500 max-w-2xl mx-auto">
              No queues, no paperwork. Just find, book, and rest.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {steps.map((step, index) => (
              <div key={step.step} className="relative group">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary-500/50 to-transparent z-0" />
                )}
                
                <GlassCard className="p-4 sm:p-5 lg:p-6 text-center h-full relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-primary-500 to-violet-500 rounded-full text-[10px] sm:text-xs font-bold text-white">
                    Step {step.step}
                  </div>
                  
                  {/* Icon */}
                  <div className="text-3xl sm:text-4xl lg:text-5xl mb-2 sm:mb-3 lg:mb-4 mt-3 sm:mt-4">{step.icon}</div>
                  
                  {/* Content */}
                  <h3 className="text-sm sm:text-base lg:text-lg font-display font-bold text-slate-800 mb-1 sm:mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs lg:text-sm text-slate-500 leading-relaxed">
                    {step.description}
                  </p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="relative py-16 sm:py-24 bg-violet-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-50 border border-emerald-200 rounded-full text-xs sm:text-sm text-emerald-600 mb-3 sm:mb-4">
                Nationwide Network
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-slate-800">
                Top Locations
              </h2>
            </div>
            <Link
              href="/pods"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 transition-colors text-sm sm:text-base"
            >
              View All Locations
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Locations Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {locations.map((location) => (
              <Link
                key={location.name}
                href={`/pods?location=${location.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <GlassCard className="p-4 sm:p-5 lg:p-6 group cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-2 sm:mb-3 lg:mb-4 gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-800 group-hover:text-primary-600 transition-colors truncate">
                        {location.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400">{location.city}</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 flex-shrink-0">
                      <span className="text-xs sm:text-sm">★</span>
                      <span className="text-slate-700 font-medium text-xs sm:text-sm">{location.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs lg:text-sm text-slate-400">{location.pods} pods available</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <section className="relative py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-50 border border-amber-200 rounded-full text-xs sm:text-sm text-amber-600 mb-3 sm:mb-4">
              Customer Stories
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-slate-800 mb-3 sm:mb-4">
              Loved by Travelers
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-500">
              Join thousands who trust Naploo for quality rest
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-5 sm:p-6 lg:p-8">
                {/* Rating */}
                <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="text-amber-400 text-sm sm:text-base">★</span>
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-slate-600 mb-4 sm:mb-6 leading-relaxed text-xs sm:text-sm lg:text-base">
                  &quot;{t.text}&quot;
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm sm:text-base">{t.name}</p>
                    <p className="text-xs sm:text-sm text-slate-400">{t.role}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 via-violet-600/10 to-cyan-600/10" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-white mb-4 sm:mb-6">
            Ready to Experience
            <br />
            <span className="gradient-text">The Future of Rest?</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-white/60 max-w-2xl mx-auto mb-8 sm:mb-10">
            Book your first pod today and discover why thousands of travelers 
            choose Naploo for quality rest.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/pods"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary-500 via-violet-500 to-primary-600 text-white font-semibold rounded-xl sm:rounded-2xl hover:shadow-glow-lg transition-all duration-300 text-sm sm:text-base"
            >
              Find Pods Near You
            </Link>
            <Link
              href="/signup"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-semibold rounded-xl sm:rounded-2xl hover:bg-white/20 transition-all text-sm sm:text-base"
            >
              Create Free Account
            </Link>
          </div>

          {/* App Download Badges */}
          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mt-8 sm:mt-10">
            <a href="/downloads/naploo-customer.apk" className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-primary-500/20 to-violet-500/20 backdrop-blur-xl border border-primary-500/30 rounded-lg sm:rounded-xl hover:from-primary-500/30 hover:to-violet-500/30 transition-all">
              <span className="text-xl sm:text-2xl">📥</span>
              <div className="text-left">
                <p className="text-[10px] sm:text-xs text-white/50">Download APK</p>
                <p className="text-xs sm:text-sm font-semibold text-white">Customer App</p>
              </div>
            </a>
            <a href="/downloads/naploo-partner.apk" className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-violet-500/20 to-primary-500/20 backdrop-blur-xl border border-violet-500/30 rounded-lg sm:rounded-xl hover:from-violet-500/30 hover:to-primary-500/30 transition-all">
              <span className="text-xl sm:text-2xl">📥</span>
              <div className="text-left">
                <p className="text-[10px] sm:text-xs text-white/50">Download APK</p>
                <p className="text-xs sm:text-sm font-semibold text-white">Partner App</p>
              </div>
            </a>
          </div>
          <p className="text-xs text-white/25 mt-3">Coming soon on App Store & Google Play</p>
        </div>
      </section>

    </main>
  );
}
