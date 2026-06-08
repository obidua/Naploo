'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Filter, MapPin, Star, X, Loader2 } from 'lucide-react';
import SearchBar from '@/components/search/SearchBar';
import { type StayMode } from '@/data/search';
import type { Property } from '@/components/pods/PropertyCard';
import { searchHotels } from '@/lib/naploo';
import { cn } from '@/lib/utils';

const AMENITY_CHOICES = ['WiFi', 'AC', 'Parking', 'Restaurant', 'Pool', 'Breakfast', 'Lake View', 'Gym'];

export default function SearchPageClient() {
  const sp = useSearchParams();
  const mode: StayMode = (sp.get('mode') as StayMode) || 'pods';
  const location = sp.get('location') || '';
  const checkIn = sp.get('checkIn') || '';
  const checkOut = sp.get('checkOut') || '';
  const startTime = sp.get('startTime') || '';
  const duration = Number(sp.get('duration') || 3);
  const guests = Number(sp.get('guests') || 1);
  const rooms = Number(sp.get('rooms') || 1);
  const type = (sp.get('type') as 'hotel' | 'homestay' | '') || '';

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(mode === 'rooms' ? 10000 : 1000);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [propType, setPropType] = useState<'hotel' | 'homestay' | ''>(type);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [allResults, setAllResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch from the live API whenever the server-side params change
  useEffect(() => {
    let active = true;
    setLoading(true);
    searchHotels({ location, mode, type: propType, sortBy })
      .then((list) => {
        if (active) {
          setAllResults(list);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setAllResults([]);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [location, mode, propType, sortBy]);

  // Client-side price + amenity filtering and sort (mode-aware)
  const results = useMemo(() => {
    const priceKey = (p: Property) => (mode === 'rooms' ? p.roomStartPrice : p.podStartPrice);
    let r = allResults.filter((p) => {
      const price = priceKey(p);
      return price >= minPrice && (maxPrice <= 0 || price <= maxPrice);
    });
    if (amenities.length) {
      const wants = amenities.map((a) => a.toLowerCase());
      r = r.filter((p) => {
        const have = p.amenities.map((a) => a.toLowerCase());
        return wants.every((w) => have.some((h) => h.includes(w)));
      });
    }
    const sorted = r.slice();
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => priceKey(a) - priceKey(b));
        break;
      case 'price-desc':
        sorted.sort((a, b) => priceKey(b) - priceKey(a));
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        sorted.sort((a, b) => {
          const score = (x: Property) => x.rating * Math.log10(x.reviews + 10);
          return score(b) - score(a);
        });
    }
    return sorted;
  }, [allResults, mode, minPrice, maxPrice, amenities, sortBy]);

  const nights =
    mode === 'rooms' && checkIn && checkOut
      ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
      : 1;

  function toggleAmenity(a: string) {
    setAmenities((curr) => (curr.includes(a) ? curr.filter((x) => x !== a) : [...curr, a]));
  }

  function buildPropertyHref(propertyId: string) {
    const q = new URLSearchParams();
    q.set('mode', mode);
    if (checkIn) q.set('checkIn', checkIn);
    if (mode === 'rooms' && checkOut) q.set('checkOut', checkOut);
    if (mode === 'pods') {
      if (startTime) q.set('startTime', startTime);
      q.set('duration', String(duration));
    }
    q.set('guests', String(guests));
    if (mode === 'rooms') q.set('rooms', String(rooms));
    return `/property/${propertyId}?${q.toString()}`;
  }

  return (
    <main className="min-h-screen pt-24 pb-20 bg-slate-50">
      {/* Search header */}
      <div className="relative lg:sticky lg:top-16 z-30 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 lg:py-3">
          <SearchBar variant="compact" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">
              {loading ? 'Searching…' : `${results.length} ${results.length === 1 ? 'stay' : 'stays'}`}
              {location ? ` in ${location}` : ''}
            </h1>
            <p className="text-sm text-slate-500">
              {mode === 'pods'
                ? `Hourly pod stays • ${duration} hr • ${guests} guest${guests > 1 ? 's' : ''}`
                : `${nights} night${nights > 1 ? 's' : ''} • ${guests} guest${guests > 1 ? 's' : ''} • ${rooms} room${rooms > 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-700"
              aria-label="Sort by"
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-slate-700"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Filters - desktop */}
          <aside className="hidden lg:block">
            <FilterPanel
              mode={mode}
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              amenities={amenities}
              toggleAmenity={toggleAmenity}
              propType={propType}
              setPropType={setPropType}
            />
          </aside>

          {/* Results */}
          <section className="space-y-4">
            {loading && (
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" />
                <p className="text-sm text-slate-500 mt-2">Finding the best stays for you…</p>
              </div>
            )}
            {!loading && results.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                <p className="text-slate-700 font-medium">No stays match your filters</p>
                <p className="text-sm text-slate-500 mt-1">Try widening your price range or removing filters.</p>
              </div>
            )}
            {!loading &&
              results.map((p) => {
                const price = mode === 'rooms' ? p.roomStartPrice : p.podStartPrice;
                const original = mode === 'rooms' ? Math.round(price * 1.25) : Math.round(price * 1.4);
                const totalEstimate = mode === 'rooms' ? price * nights : price * duration;
                return (
                  <Link
                    key={p.id}
                    href={buildPropertyHref(p.id)}
                    className="block bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="relative md:w-80 aspect-[4/3] md:aspect-auto md:h-auto shrink-0">
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                        <div
                          className={cn(
                            'absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium text-white',
                            p.type === 'hotel'
                              ? 'bg-gradient-to-r from-primary-500 to-violet-600'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                          )}
                        >
                          {p.type === 'hotel' ? '🏨 Hotel' : '🏡 Homestay'}
                        </div>
                      </div>

                      <div className="flex-1 p-5 flex flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="text-lg md:text-xl font-semibold text-slate-900 truncate">{p.name}</h2>
                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5" /> {p.address}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-sm">
                              <Star className="w-3.5 h-3.5 fill-current" /> {p.rating}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">{p.reviews} reviews</div>
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">{p.description}</p>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {p.amenities.slice(0, 5).map((a) => (
                            <span key={a} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs">
                              {a}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-end justify-between mt-auto pt-4">
                          <div className="text-xs text-slate-500">
                            {mode === 'pods' ? `${p.podsCount} pods available` : `${p.roomsCount} rooms available`}
                          </div>
                          <div className="text-right">
                            {price > 0 && (
                              <div className="text-xs text-slate-400 line-through">₹{original.toLocaleString('en-IN')}</div>
                            )}
                            <div className="text-xl font-bold text-slate-900">
                              ₹{price.toLocaleString('en-IN')}
                              <span className="text-xs font-normal text-slate-500 ml-1">
                                {mode === 'pods' ? '/hr' : '/night'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">~ ₹{totalEstimate.toLocaleString('en-IN')} total</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </section>
        </div>
      </div>

      {/* Filter sheet - mobile */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 max-h-[85vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Filters</h3>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <FilterPanel
              mode={mode}
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              amenities={amenities}
              toggleAmenity={toggleAmenity}
              propType={propType}
              setPropType={setPropType}
            />
            <button
              onClick={() => setFiltersOpen(false)}
              className="w-full mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold"
            >
              Show {results.length} stays
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function FilterPanel({
  mode,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  amenities,
  toggleAmenity,
  propType,
  setPropType,
}: {
  mode: StayMode;
  minPrice: number;
  maxPrice: number;
  setMinPrice: (v: number) => void;
  setMaxPrice: (v: number) => void;
  amenities: string[];
  toggleAmenity: (a: string) => void;
  propType: 'hotel' | 'homestay' | '';
  setPropType: (v: 'hotel' | 'homestay' | '') => void;
}) {
  const maxAllowed = mode === 'rooms' ? 10000 : 1000;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-slate-800 mb-2">Property Type</h4>
        <div className="grid grid-cols-3 gap-2">
          {(['', 'hotel', 'homestay'] as const).map((t) => (
            <button
              key={t || 'all'}
              onClick={() => setPropType(t)}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-medium border transition-colors',
                propType === t
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-slate-700 border-gray-200 hover:border-primary-300'
              )}
            >
              {t === '' ? 'All' : t === 'hotel' ? 'Hotels' : 'Homestays'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-800 mb-2">
          Price {mode === 'pods' ? '(per hour)' : '(per night)'}
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice}
            min={0}
            max={maxPrice}
            onChange={(e) => setMinPrice(Number(e.target.value || 0))}
            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
            aria-label="Minimum price"
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            value={maxPrice}
            min={minPrice}
            max={maxAllowed}
            onChange={(e) => setMaxPrice(Number(e.target.value || 0))}
            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
            aria-label="Maximum price"
          />
        </div>
        <input
          type="range"
          min={0}
          max={maxAllowed}
          step={mode === 'pods' ? 25 : 250}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full mt-2 accent-primary-600"
          aria-label="Max price slider"
        />
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-800 mb-2">Amenities</h4>
        <div className="flex flex-wrap gap-2">
          {AMENITY_CHOICES.map((a) => {
            const on = amenities.includes(a);
            return (
              <button
                key={a}
                onClick={() => toggleAmenity(a)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  on
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-700 border-gray-200 hover:border-primary-300'
                )}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
