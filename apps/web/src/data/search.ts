import { properties } from './properties';
import type { Property } from '@/components/pods/PropertyCard';
import { pods } from './properties';
import type { Pod } from '@/components/pods/PodCard';

export type StayMode = 'pods' | 'rooms';

export interface SearchParams {
  location?: string;
  checkIn?: string; // YYYY-MM-DD
  checkOut?: string; // YYYY-MM-DD (rooms)
  startTime?: string; // HH:mm (pods)
  duration?: number; // hours (pods)
  guests?: number;
  rooms?: number;
  mode?: StayMode;
  type?: 'hotel' | 'homestay' | '';
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  sortBy?: 'recommended' | 'price-asc' | 'price-desc' | 'rating';
}

function normalize(s?: string) {
  return (s || '').trim().toLowerCase();
}

export function searchProperties(params: SearchParams): Property[] {
  const loc = normalize(params.location);
  const mode = params.mode || 'pods';

  let results = properties.slice();

  if (loc) {
    results = results.filter(
      (p) =>
        p.city.toLowerCase().includes(loc) ||
        p.name.toLowerCase().includes(loc) ||
        p.address.toLowerCase().includes(loc)
    );
  }

  if (params.type) {
    results = results.filter((p) => p.type === params.type);
  }

  if (mode === 'rooms') {
    results = results.filter((p) => p.roomsCount > 0);
  } else {
    results = results.filter((p) => p.podsCount > 0);
  }

  const min = params.minPrice ?? 0;
  const max = params.maxPrice ?? Number.POSITIVE_INFINITY;
  const priceKey = (p: Property) => (mode === 'rooms' ? p.roomStartPrice : p.podStartPrice);
  results = results.filter((p) => {
    const price = priceKey(p);
    return price >= min && price <= max;
  });

  if (params.amenities && params.amenities.length) {
    const wants = params.amenities.map(normalize);
    results = results.filter((p) => {
      const have = p.amenities.map((a) => a.toLowerCase());
      return wants.every((w) => have.some((h) => h.includes(w)));
    });
  }

  switch (params.sortBy) {
    case 'price-asc':
      results.sort((a, b) => priceKey(a) - priceKey(b));
      break;
    case 'price-desc':
      results.sort((a, b) => priceKey(b) - priceKey(a));
      break;
    case 'rating':
      results.sort((a, b) => b.rating - a.rating);
      break;
    default:
      // recommended = rating * log(reviews+1)
      results.sort((a, b) => {
        const score = (x: Property) => x.rating * Math.log10(x.reviews + 10);
        return score(b) - score(a);
      });
  }

  return results;
}

export function searchPods(params: SearchParams): Pod[] {
  const loc = normalize(params.location);
  let results = pods.slice();

  if (loc) {
    results = results.filter(
      (p) =>
        p.city.toLowerCase().includes(loc) ||
        p.location.toLowerCase().includes(loc) ||
        p.hotelName.toLowerCase().includes(loc) ||
        p.series.toLowerCase().includes(loc)
    );
  }

  if (params.type) {
    results = results.filter((p) => p.hotelType === params.type);
  }

  const min = params.minPrice ?? 0;
  const max = params.maxPrice ?? Number.POSITIVE_INFINITY;
  results = results.filter((p) => p.price >= min && p.price <= max);

  switch (params.sortBy) {
    case 'price-asc':
      results.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      results.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      results.sort((a, b) => b.rating - a.rating);
      break;
    default:
      results.sort((a, b) => {
        const score = (x: Pod) => x.rating * Math.log10(x.reviews + 10);
        return score(b) - score(a);
      });
  }

  return results;
}

export const POPULAR_CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Jaipur',
  'Goa',
  'Udaipur',
  'Mussoorie',
];

// Build a flat list of suggestion entries (cities + properties)
export function getSuggestions(query: string): { type: 'city' | 'property'; label: string; sub?: string; id?: string }[] {
  const q = normalize(query);
  const out: { type: 'city' | 'property'; label: string; sub?: string; id?: string }[] = [];
  if (!q) {
    POPULAR_CITIES.slice(0, 6).forEach((c) =>
      out.push({ type: 'city', label: c, sub: 'Popular city' })
    );
    return out;
  }
  const cities = new Set(properties.map((p) => p.city));
  Array.from(cities)
    .filter((c) => c.toLowerCase().includes(q))
    .slice(0, 5)
    .forEach((c) => out.push({ type: 'city', label: c, sub: 'City in India' }));
  properties
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
    )
    .slice(0, 6)
    .forEach((p) =>
      out.push({ type: 'property', label: p.name, sub: `${p.city} • ${p.type}`, id: p.id })
    );
  return out;
}
