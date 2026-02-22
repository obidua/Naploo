'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface HeroPodSlide {
  image: string;
  series: string;
  name: string;
  bedType: string;
  price: string;
  amenities: string[];
}

interface HeroPodSliderProps {
  slides: HeroPodSlide[];
  autoPlay?: boolean;
  interval?: number;
}

export default function HeroPodSlider({ 
  slides, 
  autoPlay = true, 
  interval = 4000 
}: HeroPodSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!autoPlay || isPaused || slides.length <= 1) return;
    
    const timer = setInterval(goToNext, interval);
    return () => clearInterval(timer);
  }, [autoPlay, isPaused, interval, goToNext, slides.length]);

  const currentSlide = slides[currentIndex];

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Card */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-primary-500/20 border border-white/10">
        <div className="aspect-[4/3] relative">
          <Image
            src={currentSlide.image}
            alt={currentSlide.name}
            fill
            className="object-cover transition-opacity duration-500"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        </div>
        
        {/* Overlay Content with Amenities */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
          {/* Bed Type Badge */}
          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary-500/20 backdrop-blur-sm border border-primary-500/30 rounded-full mb-2">
            <span className="text-xs">🛏️</span>
            <span className="text-[10px] sm:text-xs text-primary-300 font-medium">{currentSlide.bedType}</span>
          </div>
          
          {/* Amenities Grid */}
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {currentSlide.amenities.map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-white/70">
                <span className="text-emerald-400 text-xs">✓</span>
                <span className="text-[10px] sm:text-xs truncate">{amenity}</span>
              </div>
            ))}
          </div>
          
          {/* Title and Price */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-4">
            <div className="min-w-0">
              <p className="text-white/60 text-xs sm:text-sm truncate">{currentSlide.series}</p>
              <p className="text-white font-semibold text-sm sm:text-base md:text-lg truncate">{currentSlide.name}</p>
            </div>
            <div className="sm:text-right flex-shrink-0">
              <p className="text-white/60 text-xs sm:text-sm">Starting from</p>
              <p className="text-xl sm:text-2xl font-bold gradient-text">{currentSlide.price}<span className="text-sm sm:text-base">/hr</span></p>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 hover:opacity-100"
          style={{ opacity: isPaused ? 1 : 0.5 }}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); goToNext(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 hover:opacity-100"
          style={{ opacity: isPaused ? 1 : 0.5 }}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex 
                  ? 'w-6 bg-primary-500' 
                  : 'w-1.5 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-[10px] sm:text-xs text-white/80">
          {currentIndex + 1} / {slides.length}
        </div>
      </div>

      {/* Floating Cards */}
      <div className="absolute -top-2 -left-2 sm:-top-4 sm:-left-4 bg-slate-900/90 backdrop-blur-xl border border-white/15 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl animate-float hidden sm:block">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-sm sm:text-base">
            ✓
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-white/50">Available Now</p>
            <p className="text-xs sm:text-sm font-semibold text-white">156 Pods</p>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 bg-slate-900/90 backdrop-blur-xl border border-white/15 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl animate-float-slow hidden sm:block">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm sm:text-base">
            ★
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-white/50">User Rating</p>
            <p className="text-xs sm:text-sm font-semibold text-white">4.9/5.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
