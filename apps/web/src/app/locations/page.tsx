import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Naploo Locations | Find Sleep Pods Near You",
  description: "Find Naploo sleep pods across India. Locations at Delhi, Mumbai, Bangalore airports, railway stations, malls, and hotels. 50+ locations.",
  keywords: "naploo locations, sleep pods Delhi, pods Mumbai, airport pods India, railway station pods, pod locations",
  openGraph: {
    title: "Naploo Locations | Find Sleep Pods Near You",
    description: "Find Naploo sleep pods across India. Locations at Delhi, Mumbai, Bangalore airports, railway stations, malls, and hotels. 50+ locations.",
    url: "https://naploo.com/locations",
    siteName: "Naploo",
    type: "website",
  },
  alternates: { canonical: "https://naploo.com/locations" },

};

import React from 'react';
import Link from 'next/link';
import { MapPin, Navigation, Clock, Star, Search, Filter } from 'lucide-react';

const locations = [
  {
    city: 'New Delhi',
    state: 'Delhi',
    spots: [
      { name: 'IGI Airport T3', type: 'Airport', pods: 24, rating: 4.8, open: '24/7' },
      { name: 'New Delhi Railway Station', type: 'Railway', pods: 16, rating: 4.6, open: '24/7' },
      { name: 'Connaught Place', type: 'City Center', pods: 12, rating: 4.7, open: '6AM-12AM' },
      { name: 'Nehru Place', type: 'Business Hub', pods: 8, rating: 4.5, open: '8AM-10PM' },
    ],
  },
  {
    city: 'Mumbai',
    state: 'Maharashtra',
    spots: [
      { name: 'CSIA Airport T2', type: 'Airport', pods: 32, rating: 4.9, open: '24/7' },
      { name: 'Mumbai Central', type: 'Railway', pods: 20, rating: 4.7, open: '24/7' },
      { name: 'BKC', type: 'Business Hub', pods: 16, rating: 4.8, open: '7AM-11PM' },
      { name: 'Andheri East', type: 'Corporate', pods: 10, rating: 4.6, open: '8AM-10PM' },
    ],
  },
  {
    city: 'Bangalore',
    state: 'Karnataka',
    spots: [
      { name: 'KIA Airport', type: 'Airport', pods: 28, rating: 4.8, open: '24/7' },
      { name: 'Majestic', type: 'Bus Terminal', pods: 14, rating: 4.5, open: '24/7' },
      { name: 'Whitefield', type: 'IT Park', pods: 18, rating: 4.7, open: '6AM-12AM' },
      { name: 'Electronic City', type: 'IT Park', pods: 12, rating: 4.6, open: '7AM-11PM' },
    ],
  },
  {
    city: 'Chennai',
    state: 'Tamil Nadu',
    spots: [
      { name: 'Chennai Airport', type: 'Airport', pods: 20, rating: 4.7, open: '24/7' },
      { name: 'Chennai Central', type: 'Railway', pods: 16, rating: 4.6, open: '24/7' },
      { name: 'OMR', type: 'IT Corridor', pods: 14, rating: 4.5, open: '7AM-11PM' },
    ],
  },
  {
    city: 'Hyderabad',
    state: 'Telangana',
    spots: [
      { name: 'RGIA Airport', type: 'Airport', pods: 22, rating: 4.8, open: '24/7' },
      { name: 'HITEC City', type: 'IT Park', pods: 16, rating: 4.7, open: '6AM-12AM' },
      { name: 'Gachibowli', type: 'Business Hub', pods: 10, rating: 4.6, open: '7AM-11PM' },
    ],
  },
  {
    city: 'Pune',
    state: 'Maharashtra',
    spots: [
      { name: 'Pune Airport', type: 'Airport', pods: 12, rating: 4.6, open: '24/7' },
      { name: 'Hinjewadi', type: 'IT Park', pods: 14, rating: 4.7, open: '6AM-12AM' },
      { name: 'Kharadi', type: 'IT Park', pods: 10, rating: 4.5, open: '7AM-11PM' },
    ],
  },
];

const upcomingCities = ['Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kochi', 'Goa', 'Chandigarh', 'Indore'];

export default function LocationsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-sm text-white mb-6">
            <MapPin className="w-4 h-4 inline mr-2" />
            500+ Pods Across India
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Find a Pod
            <br />
            <span className="gradient-text">Near You</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Rest stations at airports, railway stations, bus terminals, IT parks, and city centers across India.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Search city or location..."
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:border-white/50"
                />
              </div>
              <button className="px-6 py-4 bg-white text-primary-700 rounded-xl hover:bg-gray-100 transition-all">
                <Navigation className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="relative py-16 bg-violet-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {locations.map((location) => (
              <div key={location.city} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{location.city}</h3>
                    <p className="text-sm text-slate-400">{location.state}</p>
                  </div>
                  <span className="ml-auto px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full text-sm">
                    {location.spots.reduce((acc, spot) => acc + spot.pods, 0)} Pods
                  </span>
                </div>

                <div className="space-y-3">
                  {location.spots.map((spot) => (
                    <Link
                      key={spot.name}
                      href="/pods"
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                      <div>
                        <h4 className="font-medium text-slate-800 group-hover:text-primary-600 transition-colors">
                          {spot.name}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                          <span>{spot.type}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {spot.open}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-medium">{spot.rating}</span>
                        </div>
                        <p className="text-sm text-slate-400">{spot.pods} pods</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="relative py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Coming Soon</h2>
          <p className="text-slate-500 mb-8">We&apos;re expanding to these cities in 2026</p>
          <div className="flex flex-wrap justify-center gap-3">
            {upcomingCities.map((city) => (
              <span
                key={city}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-slate-500"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Want Naploo in Your City?
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-10">
            Partner with us to bring premium sleeping pods to your location.
          </p>
          <Link
            href="/partner"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
          >
            Become a Partner
            <Navigation className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
