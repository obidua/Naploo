'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

interface FilterSectionProps {
  cities: string[];
  propertyTypes: string[];
  podSeries: string[];
  selectedCity: string;
  selectedType: string;
  selectedSeries: string;
  searchQuery: string;
  priceRange: [number, number];
  viewMode: 'properties' | 'pods';
  onCityChange: (city: string) => void;
  onTypeChange: (type: string) => void;
  onSeriesChange: (series: string) => void;
  onSearchChange: (query: string) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onViewModeChange: (mode: 'properties' | 'pods') => void;
}

export function FilterSection({
  cities,
  propertyTypes,
  podSeries,
  selectedCity,
  selectedType,
  selectedSeries,
  searchQuery,
  priceRange,
  viewMode,
  onCityChange,
  onTypeChange,
  onSeriesChange,
  onSearchChange,
  onPriceRangeChange,
  onViewModeChange,
}: FilterSectionProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <GlassCard className="p-4 lg:p-6">
      {/* Search and View Toggle */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        {/* Search */}
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search hotels, homestays, or pods..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 self-start">
          <button
            onClick={() => onViewModeChange('properties')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'properties'
                ? 'bg-primary-500 text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🏨 Properties
          </button>
          <button
            onClick={() => onViewModeChange('pods')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'pods'
                ? 'bg-primary-500 text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🛸 All Pods
          </button>
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filters
        </button>
      </div>

      {/* Filters Row */}
      <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* City Filter */}
          <div>
            <label className="block text-sm text-slate-500 mb-2">City</label>
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="" className="bg-white">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city} className="bg-white">{city}</option>
              ))}
            </select>
          </div>

          {/* Property Type Filter */}
          <div>
            <label className="block text-sm text-slate-500 mb-2">Property Type</label>
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="" className="bg-white">All Types</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type} className="bg-white capitalize">{type}</option>
              ))}
            </select>
          </div>

          {/* Pod Series Filter - Only show when viewing pods */}
          {viewMode === 'pods' && (
            <div>
              <label className="block text-sm text-slate-500 mb-2">Pod Series</label>
              <select
                value={selectedSeries}
                onChange={(e) => onSeriesChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="" className="bg-white">All Series</option>
                {podSeries.map((series) => (
                  <option key={series} value={series} className="bg-white">{series}</option>
                ))}
              </select>
            </div>
          )}

          {/* Price Range */}
          <div>
            <label className="block text-sm text-slate-500 mb-2">
              Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
            </label>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={priceRange[1]}
              onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value)])}
              className="w-full accent-primary-500"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          <QuickFilterButton
            active={selectedType === 'hotel'}
            onClick={() => onTypeChange(selectedType === 'hotel' ? '' : 'hotel')}
          >
            🏨 Hotels Only
          </QuickFilterButton>
          <QuickFilterButton
            active={selectedType === 'homestay'}
            onClick={() => onTypeChange(selectedType === 'homestay' ? '' : 'homestay')}
          >
            🏡 Homestays Only
          </QuickFilterButton>
          <QuickFilterButton
            active={priceRange[1] <= 200}
            onClick={() => onPriceRangeChange([0, priceRange[1] <= 200 ? 5000 : 200])}
          >
            💰 Budget Friendly
          </QuickFilterButton>
          <QuickFilterButton
            active={priceRange[0] >= 500}
            onClick={() => onPriceRangeChange([priceRange[0] >= 500 ? 0 : 500, 5000])}
          >
            ✨ Premium
          </QuickFilterButton>
        </div>
      </div>
    </GlassCard>
  );
}

function QuickFilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        active
          ? 'bg-primary-500 text-white'
          : 'bg-gray-100 text-slate-600 hover:bg-gray-200 hover:text-slate-800 border border-gray-200'
      }`}
    >
      {children}
    </button>
  );
}
