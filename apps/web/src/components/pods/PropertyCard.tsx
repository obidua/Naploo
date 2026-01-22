'use client';

import Link from 'next/link';
import Image from 'next/image';
import { GlassCard } from '@/components/ui/GlassCard';

export interface Property {
  id: string;
  name: string;
  type: 'hotel' | 'homestay';
  city: string;
  address: string;
  rating: number;
  reviews: number;
  description: string;
  images: string[];
  amenities: string[];
  podsCount: number;
  roomsCount: number;
  podStartPrice: number;
  roomStartPrice: number;
}

interface PropertyCardProps {
  property: Property;
  variant?: 'grid' | 'horizontal';
}

export function PropertyCard({ property, variant = 'grid' }: PropertyCardProps) {
  if (variant === 'horizontal') {
    return (
      <Link href={`/pods/${property.id}`} className="block">
        <GlassCard className="overflow-hidden group cursor-pointer">
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="md:w-72 relative">
              <div className="aspect-[4/3] md:aspect-auto md:h-full relative">
                <Image
                  src={property.images[0]}
                  alt={property.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-naploo-dark-DEFAULT/80 hidden md:block" />
              </div>
              
              {/* Type Badge */}
              <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
                property.type === 'hotel' 
                  ? 'bg-gradient-to-r from-primary-500 to-violet-600 text-white' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
              }`}>
                {property.type === 'hotel' ? '🏨 Hotel' : '🏡 Homestay'}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                    {property.name}
                  </h3>
                  <p className="text-sm text-white/50 flex items-center gap-1">
                    <span>📍</span> {property.city}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                  <span className="text-amber-400">★</span>
                  <span className="text-white font-medium">{property.rating}</span>
                </div>
              </div>

              <p className="text-sm text-white/60 mb-4 line-clamp-2">{property.description}</p>

              {/* Stats */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 rounded-lg">
                  <span className="text-primary-400">🛏️</span>
                  <span className="text-sm text-white">{property.podsCount} Pods</span>
                  <span className="text-xs text-primary-400">₹{property.podStartPrice}/hr</span>
                </div>
                {property.roomsCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 rounded-lg">
                    <span className="text-violet-400">🚪</span>
                    <span className="text-sm text-white">{property.roomsCount} Rooms</span>
                    <span className="text-xs text-violet-400">₹{property.roomStartPrice}/night</span>
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-2">
                {property.amenities.slice(0, 4).map((amenity) => (
                  <span key={amenity} className="px-2 py-1 bg-white/5 rounded text-xs text-white/60">
                    {amenity}
                  </span>
                ))}
                {property.amenities.length > 4 && (
                  <span className="px-2 py-1 bg-white/5 rounded text-xs text-white/60">
                    +{property.amenities.length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </Link>
    );
  }

  // Grid variant
  return (
    <Link href={`/pods/${property.id}`} className="block h-full">
      <GlassCard className="overflow-hidden group cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3]">
          <Image
            src={property.images[0]}
            alt={property.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-naploo-dark-DEFAULT via-transparent to-transparent" />
          
          {/* Type Badge */}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
            property.type === 'hotel' 
              ? 'bg-gradient-to-r from-primary-500 to-violet-600 text-white' 
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
          }`}>
            {property.type === 'hotel' ? '🏨 Hotel' : '🏡 Homestay'}
          </div>

          {/* Rating */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur px-2 py-1 rounded-full">
            <span className="text-amber-400 text-sm">★</span>
            <span className="text-white text-sm font-medium">{property.rating}</span>
          </div>

          {/* Image slider indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            <div className="w-6 h-1 rounded bg-white/80"></div>
            <div className="w-2 h-1 rounded bg-white/40"></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
            <span>📍</span>
            <span>{property.city}</span>
          </div>

          <h3 className="font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
            {property.name}
          </h3>

          {/* Pods & Rooms Info */}
          <div className="flex flex-wrap gap-2 mb-3 flex-1">
            <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs font-medium">
              🛏️ {property.podsCount} Pods • ₹{property.podStartPrice}/hr
            </span>
            {property.roomsCount > 0 && (
              <span className="px-2 py-1 bg-violet-500/20 text-violet-400 rounded text-xs font-medium">
                🚪 {property.roomsCount} Rooms • ₹{property.roomStartPrice}/night
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
            <span className="text-sm text-white/50">View details</span>
            <svg className="w-5 h-5 text-primary-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
