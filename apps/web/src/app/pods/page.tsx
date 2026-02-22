'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { PropertyCard } from '@/components/pods/PropertyCard';
import { PodCard } from '@/components/pods/PodCard';
import { FilterSection } from '@/components/pods/FilterSection';
import { 
  properties, 
  pods, 
  getAllCities, 
  getAllPropertyTypes, 
  getAllPodSeries,
  getPodsCount,
  getPropertiesCount
} from '@/data/properties';

export default function ExplorePage() {
  // Filter states
  const [viewMode, setViewMode] = useState<'properties' | 'pods'>('properties');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);

  // Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = searchQuery === '' || 
        property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCity = selectedCity === '' || property.city === selectedCity;
      const matchesType = selectedType === '' || property.type === selectedType;
      const matchesPrice = property.podStartPrice >= priceRange[0] && property.podStartPrice <= priceRange[1];

      return matchesSearch && matchesCity && matchesType && matchesPrice;
    });
  }, [searchQuery, selectedCity, selectedType, priceRange]);

  // Filter pods
  const filteredPods = useMemo(() => {
    return pods.filter(pod => {
      const matchesSearch = searchQuery === '' || 
        pod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pod.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pod.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pod.series.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCity = selectedCity === '' || pod.city === selectedCity;
      const matchesType = selectedType === '' || pod.hotelType === selectedType;
      const matchesSeries = selectedSeries === '' || pod.series === selectedSeries;
      const matchesPrice = pod.price >= priceRange[0] && pod.price <= priceRange[1];

      return matchesSearch && matchesCity && matchesType && matchesSeries && matchesPrice;
    });
  }, [searchQuery, selectedCity, selectedType, selectedSeries, priceRange]);

  return (
    <main className="min-h-screen pt-24 pb-20 bg-white">
      {/* Hero Section */}
      <section className="relative py-12 lg:py-20 overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-sm text-white/80 mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              {getPropertiesCount()} Partner Properties • {getPodsCount()} Pods Available
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Explore <span className="gradient-text">Naploo Stays</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Discover hotels, homestays, and futuristic sleep pods across India. 
              Book hourly pods or traditional rooms - your choice!
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{getPropertiesCount()}</div>
              <div className="text-sm text-white/70">Partner Properties</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{getPodsCount()}</div>
              <div className="text-sm text-white/70">Sleep Pods</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{getAllCities().length}</div>
              <div className="text-sm text-white/70">Cities</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-white/70">Availability</div>
            </div>
          </div>

          {/* Filter Section */}
          <FilterSection
            cities={getAllCities()}
            propertyTypes={getAllPropertyTypes()}
            podSeries={getAllPodSeries()}
            selectedCity={selectedCity}
            selectedType={selectedType}
            selectedSeries={selectedSeries}
            searchQuery={searchQuery}
            priceRange={priceRange}
            viewMode={viewMode}
            onCityChange={setSelectedCity}
            onTypeChange={setSelectedType}
            onSeriesChange={setSelectedSeries}
            onSearchChange={setSearchQuery}
            onPriceRangeChange={setPriceRange}
            onViewModeChange={setViewMode}
          />
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">
              {viewMode === 'properties' ? (
                <>
                  {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} Found
                </>
              ) : (
                <>
                  {filteredPods.length} {filteredPods.length === 1 ? 'Pod' : 'Pods'} Found
                </>
              )}
            </h2>
            
            {/* Clear Filters */}
            {(searchQuery || selectedCity || selectedType || selectedSeries || priceRange[1] < 5000) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCity('');
                  setSelectedType('');
                  setSelectedSeries('');
                  setPriceRange([0, 5000]);
                }}
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Properties View */}
          {viewMode === 'properties' && (
            <>
              {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  title="No properties found"
                  description="Try adjusting your filters or search query"
                />
              )}
            </>
          )}

          {/* Pods View */}
          {viewMode === 'pods' && (
            <>
              {filteredPods.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPods.map((pod) => (
                    <PodCard key={pod.id} pod={pod} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  title="No pods found"
                  description="Try adjusting your filters or search query"
                />
              )}
            </>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-violet-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-12">
            How Naploo <span className="gradient-text">Works</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-primary-50 border border-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">1. Browse & Select</h3>
              <p className="text-slate-500 text-sm">
                Explore hotels, homestays, and pods. Filter by city, price, or pod series.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-violet-50 border border-violet-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">2. Book Instantly</h3>
              <p className="text-slate-500 text-sm">
                Book pods hourly or rooms for full day. Instant confirmation via app.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛏️</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">3. Rest & Relax</h3>
              <p className="text-slate-500 text-sm">
                Check-in with QR code. Enjoy your private space with premium amenities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary-600 to-violet-700 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Own a Hotel or Homestay?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Partner with Naploo to install futuristic sleep pods and increase your revenue. 
                We provide the pods, you provide the space!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/partner"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg"
                >
                  Become a Partner
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500">{description}</p>
    </div>
  );
}
