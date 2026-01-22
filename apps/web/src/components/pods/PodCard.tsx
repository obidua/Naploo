'use client';

import Link from 'next/link';
import Image from 'next/image';
import { GlassCard } from '@/components/ui/GlassCard';

export interface Pod {
  id: string;
  name: string;
  series: string;
  hotelId: string;
  hotelName: string;
  hotelType: 'hotel' | 'homestay';
  location: string;
  city: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  amenities: string[];
  available: boolean;
}

interface PodCardProps {
  pod: Pod;
}

export function PodCard({ pod }: PodCardProps) {
  return (
    <Link href={`/pods/${pod.hotelId}?pod=${pod.id}`} className="block h-full">
      <GlassCard className="overflow-hidden group cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3]">
          <Image
            src={pod.image}
            alt={pod.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-naploo-dark-DEFAULT via-transparent to-transparent" />
          
          {/* Status Badge */}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
            pod.available 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {pod.available ? 'Available' : 'Occupied'}
          </div>

          {/* Series Badge */}
          <div className="absolute top-3 right-3 px-3 py-1 bg-white/10 backdrop-blur-xl rounded-full text-xs text-white">
            {pod.series}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Hotel Badge */}
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2 w-fit ${
            pod.hotelType === 'hotel' 
              ? 'bg-primary-500/20 text-primary-400' 
              : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {pod.hotelType === 'hotel' ? '🏨' : '🏡'} {pod.hotelName}
          </div>

          <h3 className="font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">
            {pod.name}
          </h3>
          <p className="text-sm text-white/50 mb-3 line-clamp-1">
            📍 {pod.location}
          </p>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1 mb-3 flex-1">
            {pod.amenities.slice(0, 3).map((amenity) => (
              <span key={amenity} className="px-2 py-0.5 bg-white/5 rounded text-xs text-white/60">
                {amenity}
              </span>
            ))}
            {pod.amenities.length > 3 && (
              <span className="px-2 py-0.5 bg-white/5 rounded text-xs text-white/60">
                +{pod.amenities.length - 3}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
            <div className="flex items-center gap-1">
              <span className="text-amber-400">★</span>
              <span className="text-sm text-white font-medium">{pod.rating}</span>
              <span className="text-sm text-white/40">({pod.reviews})</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold gradient-text">₹{pod.price}</span>
              <span className="text-xs text-white/50">/hr</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
