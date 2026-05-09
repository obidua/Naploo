import type { Property, Pod, City, PodLayout, PodSlot, PodRow, PodSeries, PodAmenity, PodFeatures } from '@/types';

// Image CDN served from the public web host.
const IMG = process.env.EXPO_PUBLIC_IMAGE_BASE_URL || 'https://naploo.com';

export const cities: City[] = [
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400', propertyCount: 2, podCount: 20, isPopular: true },
  { id: 'udaipur', name: 'Udaipur', state: 'Rajasthan', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400', propertyCount: 1, podCount: 8, isPopular: true },
  { id: 'jodhpur', name: 'Jodhpur', state: 'Rajasthan', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', propertyCount: 1, podCount: 12, isPopular: true },
  { id: 'delhi', name: 'Delhi', state: 'Delhi', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400', propertyCount: 1, podCount: 24, isPopular: true },
  { id: 'goa', name: 'Goa', state: 'Goa', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400', propertyCount: 1, podCount: 16, isPopular: true },
  { id: 'jaisalmer', name: 'Jaisalmer', state: 'Rajasthan', image: 'https://images.unsplash.com/photo-1624806992066-5ffcf7ca186b?w=400', propertyCount: 1, podCount: 10, isPopular: false },
  { id: 'pushkar', name: 'Pushkar', state: 'Rajasthan', image: 'https://images.unsplash.com/photo-1609766857041-ed5765d7c55c?w=400', propertyCount: 1, podCount: 5, isPopular: false },
  { id: 'mount-abu', name: 'Mount Abu', state: 'Rajasthan', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400', propertyCount: 1, podCount: 6, isPopular: false },
];

export const properties: Property[] = [
  {
    id: 'hotel-sapphire',
    name: 'Hotel Sapphire',
    type: 'hotel',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: 'MI Road, C-Scheme, Jaipur',
    latitude: 26.9124,
    longitude: 75.7873,
    rating: 4.5,
    reviewsCount: 342,
    description: 'Premium hotel in the heart of Jaipur with modern sleeping pods and luxury rooms. Experience the perfect blend of comfort and technology.',
    images: [
      `${IMG}/pods/For%20Website%20main%20images/Pods%20Hall%20looks.jpg`,
      `${IMG}/pods/ABS%20Flagship%20Series/Pod%20real%20view.jpeg`,
      `${IMG}/pods/For%20Website%20main%20images/Reception.png`,
    ],
    amenities: ['WiFi', 'AC', 'Parking', 'Restaurant', '24/7 Reception', 'Room Service', 'Laundry'],
    podsCount: 8,
    roomsCount: 24,
    podStartPrice: 199,
    roomStartPrice: 1499,
    isVerified: true,
    checkInTime: '12:00 PM',
    checkOutTime: '11:00 AM',
    policies: ['No smoking', 'Government ID required', 'Pets not allowed'],
  },
  {
    id: 'cozy-corner',
    name: 'Cozy Corner Homestay',
    type: 'homestay',
    city: 'Udaipur',
    state: 'Rajasthan',
    address: 'Lake Pichola Rd, Old City, Udaipur',
    latitude: 24.5764,
    longitude: 73.6839,
    rating: 4.7,
    reviewsCount: 189,
    description: 'Charming lakeside homestay with pod accommodation. Wake up to stunning views of Lake Pichola.',
    images: [
      `${IMG}/pods/For%20Website%20main%20images/Main%20Pods%20Image.png`,
      `${IMG}/pods/For%20Website%20main%20images/interior%20looks.png`,
    ],
    amenities: ['WiFi', 'AC', 'Lake View', 'Garden', 'Breakfast', 'Tour Desk'],
    podsCount: 4,
    roomsCount: 6,
    podStartPrice: 149,
    roomStartPrice: 1199,
    isVerified: true,
    checkInTime: '1:00 PM',
    checkOutTime: '10:00 AM',
    policies: ['No smoking', 'Government ID required'],
  },
  {
    id: 'grand-palace',
    name: 'The Grand Palace',
    type: 'hotel',
    city: 'Jodhpur',
    state: 'Rajasthan',
    address: 'Station Road, Jodhpur',
    latitude: 26.2389,
    longitude: 73.0243,
    rating: 4.3,
    reviewsCount: 456,
    description: 'Majestic heritage hotel near Mehrangarh Fort with premium pod suites and royal rooms.',
    images: [
      `${IMG}/pods/For%20Website%20main%20images/Pods%20looks.jpg`,
      `${IMG}/pods/ABS%20Flagship%20Series/Pod%20inner%20view.jpeg`,
    ],
    amenities: ['WiFi', 'AC', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Gym', 'Parking'],
    podsCount: 12,
    roomsCount: 35,
    podStartPrice: 249,
    roomStartPrice: 2499,
    isVerified: true,
    checkInTime: '2:00 PM',
    checkOutTime: '12:00 PM',
    policies: ['No smoking', 'Government ID required', 'Couples welcome'],
  },
  {
    id: 'desert-pearl',
    name: 'Desert Pearl',
    type: 'hotel',
    city: 'Jaisalmer',
    state: 'Rajasthan',
    address: 'Sam Road, Jaisalmer',
    latitude: 26.9157,
    longitude: 70.9083,
    rating: 4.6,
    reviewsCount: 278,
    description: 'Luxury desert resort with futuristic pods. Sleep under the stars in the golden city.',
    images: [
      `${IMG}/pods/Home%20Page%20Images/IMG_1645.JPG`,
      `${IMG}/pods/For%20Website%20main%20images/pod%20view.png`,
    ],
    amenities: ['WiFi', 'AC', 'Desert Safari', 'Pool', 'Restaurant', 'Cultural Events'],
    podsCount: 10,
    roomsCount: 28,
    podStartPrice: 299,
    roomStartPrice: 2999,
    isVerified: true,
    checkInTime: '2:00 PM',
    checkOutTime: '11:00 AM',
    policies: ['No smoking', 'Government ID required'],
  },
  {
    id: 'city-star',
    name: 'City Star Hotel',
    type: 'hotel',
    city: 'Delhi',
    state: 'Delhi',
    address: 'Connaught Place, New Delhi',
    latitude: 28.6315,
    longitude: 77.2167,
    rating: 4.4,
    reviewsCount: 567,
    description: 'Modern business hotel in the heart of Delhi with express pod check-in. Perfect for transit travelers.',
    images: [
      `${IMG}/pods/For%20Website%20main%20images/inside%202.png`,
      `${IMG}/pods/Made%20in%20India%20T1/Internal%20view.jpeg`,
    ],
    amenities: ['WiFi', 'AC', 'Metro Access', 'Business Center', '24/7 Reception', 'Restaurant', 'Gym'],
    podsCount: 24,
    roomsCount: 45,
    podStartPrice: 179,
    roomStartPrice: 1799,
    isVerified: true,
    checkInTime: '12:00 PM',
    checkOutTime: '11:00 AM',
    policies: ['No smoking', 'Government ID required', 'Couples welcome'],
  },
  {
    id: 'beach-bliss',
    name: 'Beach Bliss Resort',
    type: 'hotel',
    city: 'Goa',
    state: 'Goa',
    address: 'Calangute Beach Road, North Goa',
    latitude: 15.5449,
    longitude: 73.7556,
    rating: 4.8,
    reviewsCount: 723,
    description: 'Beachfront resort with eco-friendly sleep pods. The ultimate coastal getaway.',
    images: [
      `${IMG}/pods/ABS%20Flagship%20Series/Sleeping%20pod%20outer%20view.jpeg`,
      `${IMG}/pods/For%20Website%20main%20images/Pods%20Hall%20looks.jpg`,
    ],
    amenities: ['WiFi', 'AC', 'Beach Access', 'Pool', 'Bar', 'Water Sports', 'Spa', 'Restaurant'],
    podsCount: 16,
    roomsCount: 20,
    podStartPrice: 199,
    roomStartPrice: 2199,
    isVerified: true,
    checkInTime: '2:00 PM',
    checkOutTime: '11:00 AM',
    policies: ['No smoking in rooms', 'Government ID required'],
  },
  {
    id: 'heritage-haveli',
    name: 'Heritage Haveli',
    type: 'homestay',
    city: 'Pushkar',
    state: 'Rajasthan',
    address: 'Pushkar Lake Road, Pushkar',
    latitude: 26.4897,
    longitude: 74.5511,
    rating: 4.2,
    reviewsCount: 156,
    description: 'Authentic Rajasthani haveli with modern pod rooms. Experience heritage living.',
    images: [
      `${IMG}/pods/Home%20Page%20Images/IMG_1642.JPG`,
    ],
    amenities: ['WiFi', 'Terrace', 'Breakfast', 'Lake View', 'Cultural Tours'],
    podsCount: 5,
    roomsCount: 10,
    podStartPrice: 129,
    roomStartPrice: 999,
    isVerified: true,
    checkInTime: '1:00 PM',
    checkOutTime: '10:00 AM',
    policies: ['No smoking', 'Vegetarian property'],
  },
  {
    id: 'mountain-view',
    name: 'Mountain View Retreat',
    type: 'homestay',
    city: 'Mount Abu',
    state: 'Rajasthan',
    address: 'Nakki Lake Road, Mount Abu',
    latitude: 24.5925,
    longitude: 72.7156,
    rating: 4.5,
    reviewsCount: 98,
    description: 'Hill station retreat with panoramic mountain views and cozy pod rooms.',
    images: [
      `${IMG}/pods/Made%20in%20India%20T1/outer%20view.jpeg`,
    ],
    amenities: ['WiFi', 'Heater', 'Mountain View', 'Garden', 'Bonfire', 'Trekking'],
    podsCount: 3,
    roomsCount: 8,
    podStartPrice: 179,
    roomStartPrice: 1399,
    isVerified: true,
    checkInTime: '12:00 PM',
    checkOutTime: '10:00 AM',
    policies: ['No smoking', 'Government ID required'],
  },
];

export const pods: Pod[] = [
  {
    id: 'pod-1',
    propertyId: 'hotel-sapphire',
    propertyName: 'Hotel Sapphire',
    name: 'Space Pod Alpha',
    series: 'Space Series',
    position: 'lower',
    type: 'single',
    hourlyRate: 199,
    image: `${IMG}/pods/ABS%20Flagship%20Series/Pod%20real%20view.jpeg`,
    amenities: ['AC', 'TV', 'WiFi', 'Charger', 'Light', 'Locker'],
    features: { ac: true, tv: true, charger: true, light: true, ventilation: true, wifi: true, locker: true, mirror: true },
    status: 'available',
    city: 'Jaipur',
    rating: 4.5,
    reviewsCount: 67,
  },
  {
    id: 'pod-2',
    propertyId: 'hotel-sapphire',
    propertyName: 'Hotel Sapphire',
    name: 'Galaxy Pod Beta',
    series: 'Galaxy Series',
    position: 'upper',
    type: 'single',
    hourlyRate: 249,
    image: `${IMG}/pods/ABS%20Flagship%20Series/Pod%20inner%20view.jpeg`,
    amenities: ['AC', 'TV', 'WiFi', 'Charger', 'Light', 'Ventilation', 'Locker', 'Mirror'],
    features: { ac: true, tv: true, charger: true, light: true, ventilation: true, wifi: true, locker: true, mirror: true },
    status: 'available',
    city: 'Jaipur',
    rating: 4.7,
    reviewsCount: 45,
  },
  {
    id: 'pod-3',
    propertyId: 'cozy-corner',
    propertyName: 'Cozy Corner Homestay',
    name: 'Cosmos Pod',
    series: 'Cosmos Series',
    position: 'lower',
    type: 'double',
    hourlyRate: 149,
    image: `${IMG}/pods/For%20Website%20main%20images/pod%20view.png`,
    amenities: ['AC', 'WiFi', 'Charger', 'Light'],
    features: { ac: true, tv: false, charger: true, light: true, ventilation: true, wifi: true, locker: false, mirror: false },
    status: 'available',
    city: 'Udaipur',
    rating: 4.6,
    reviewsCount: 33,
  },
  {
    id: 'pod-4',
    propertyId: 'grand-palace',
    propertyName: 'The Grand Palace',
    name: 'Flagship Pod',
    series: 'ABS Flagship',
    position: 'lower',
    type: 'single',
    hourlyRate: 249,
    image: `${IMG}/pods/ABS%20Flagship%20Series/Sleeping%20pod%20outer%20view.jpeg`,
    amenities: ['AC', 'TV', 'WiFi', 'Charger', 'Light', 'Ventilation', 'Locker', 'Mirror', 'USB Port'],
    features: { ac: true, tv: true, charger: true, light: true, ventilation: true, wifi: true, locker: true, mirror: true },
    status: 'available',
    city: 'Jodhpur',
    rating: 4.3,
    reviewsCount: 89,
  },
  {
    id: 'pod-5',
    propertyId: 'city-star',
    propertyName: 'City Star Hotel',
    name: 'Express Pod',
    series: 'Made in India T1',
    position: 'lower',
    type: 'single',
    hourlyRate: 179,
    image: `${IMG}/pods/Made%20in%20India%20T1/Main.jpg`,
    amenities: ['AC', 'WiFi', 'Charger', 'Light', 'USB Port'],
    features: { ac: true, tv: false, charger: true, light: true, ventilation: true, wifi: true, locker: true, mirror: false },
    status: 'available',
    city: 'Delhi',
    rating: 4.4,
    reviewsCount: 112,
  },
  {
    id: 'pod-6',
    propertyId: 'beach-bliss',
    propertyName: 'Beach Bliss Resort',
    name: 'Eco Beach Pod',
    series: 'Wooden Series',
    position: 'lower',
    type: 'double',
    hourlyRate: 199,
    image: `${IMG}/pods/For%20Website%20main%20images/inside%202.png`,
    amenities: ['AC', 'WiFi', 'Charger', 'Light', 'Ventilation'],
    features: { ac: true, tv: false, charger: true, light: true, ventilation: true, wifi: true, locker: false, mirror: false },
    status: 'available',
    city: 'Goa',
    rating: 4.8,
    reviewsCount: 76,
  },
  {
    id: 'pod-7',
    propertyId: 'desert-pearl',
    propertyName: 'Desert Pearl',
    name: 'Desert Star Pod',
    series: 'Galaxy Series',
    position: 'upper',
    type: 'single',
    hourlyRate: 299,
    image: `${IMG}/pods/For%20Website%20main%20images/interior%20looks.png`,
    amenities: ['AC', 'TV', 'WiFi', 'Charger', 'Light', 'Ventilation', 'Locker', 'Mirror'],
    features: { ac: true, tv: true, charger: true, light: true, ventilation: true, wifi: true, locker: true, mirror: true },
    status: 'available',
    city: 'Jaisalmer',
    rating: 4.6,
    reviewsCount: 54,
  },
];

export const deals = [
  { id: '1', title: 'First Pod Free!', subtitle: 'Book your first pod stay & get ₹199 off', code: 'FIRSTPOD', discount: 199, image: `${IMG}/pods/For%20Website%20main%20images/Main%20Pods%20Image.png`, color: '#7c3aed' },
  { id: '2', title: 'Weekend Getaway', subtitle: 'Flat 30% off on weekend hotel bookings', code: 'WEEKEND30', discount: 30, image: `${IMG}/pods/For%20Website%20main%20images/Pods%20Hall%20looks.jpg`, color: '#8b5cf6' },
  { id: '3', title: 'Goa Special', subtitle: 'Pods starting at just ₹149/hr in Goa', code: 'GOAVIBES', discount: 50, image: `${IMG}/pods/ABS%20Flagship%20Series/Pod%20real%20view.jpeg`, color: '#06b6d4' },
  { id: '4', title: 'Couple Pod Pack', subtitle: 'Double pod + breakfast at ₹499', code: 'COUPLE499', discount: 100, image: `${IMG}/pods/For%20Website%20main%20images/interior%20looks2.png`, color: '#10b981' },
];

// Helper functions
export function getPropertyById(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
}

export function getPodsByProperty(propertyId: string): Pod[] {
  return pods.filter((p) => p.propertyId === propertyId);
}

export function getPropertiesByCity(city: string): Property[] {
  return properties.filter((p) => p.city.toLowerCase() === city.toLowerCase());
}

export function getPopularCities(): City[] {
  return cities.filter((c) => c.isPopular);
}

export function searchProperties(query: string): Property[] {
  const q = query.toLowerCase();
  return properties.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
  );
}

// ─── Pod Layout Generator ───
function generatePodLayout(
  propertyId: string,
  rows: number,
  cols: number,
  series: PodSeries,
  hourlyRate: number,
  amenities: PodAmenity[],
  occupiedSlots: string[] = [],
): PodLayout {
  const layout: PodRow[] = [];
  let totalPods = 0;
  let availablePods = 0;
  const rowLabels = 'ABCDEFGHIJ';

  for (let r = 0; r < rows; r++) {
    const rowLabel = rowLabels[r] || `R${r + 1}`;
    const slots: PodSlot[] = [];
    for (let c = 0; c < cols; c++) {
      for (const pos of ['lower', 'upper'] as const) {
        const label = `${rowLabel}${c + 1}-${pos === 'lower' ? 'L' : 'U'}`;
        const slotId = `${propertyId}-${label}`;
        const isOccupied = occupiedSlots.includes(label);
        const isMaintenance = label.endsWith('-U') && c === cols - 1 && r === rows - 1;
        const status = isMaintenance ? 'maintenance' : isOccupied ? 'occupied' : 'available';
        slots.push({
          id: slotId,
          label,
          row: r,
          col: c,
          position: pos,
          type: 'single',
          series,
          hourlyRate: pos === 'upper' ? hourlyRate + 50 : hourlyRate,
          status,
          amenities,
          features: { ac: true, tv: amenities.includes('TV'), charger: true, light: true, ventilation: true, wifi: true, locker: amenities.includes('Locker'), mirror: amenities.includes('Mirror') },
        });
        totalPods++;
        if (status === 'available') availablePods++;
      }
    }
    layout.push({ rowIndex: r, label: `Row ${rowLabel}`, slots });
  }

  return { propertyId, rows, cols, layout, totalPods, availablePods };
}

export const podLayouts: Record<string, PodLayout> = {
  'hotel-sapphire': generatePodLayout('hotel-sapphire', 2, 4, 'Space Series', 199, ['AC', 'TV', 'WiFi', 'Charger', 'Light', 'Locker'], ['A2-L', 'A3-U', 'B1-L']),
  'cozy-corner': generatePodLayout('cozy-corner', 1, 4, 'Cosmos Series', 149, ['AC', 'WiFi', 'Charger', 'Light'], ['A1-U']),
  'grand-palace': generatePodLayout('grand-palace', 3, 4, 'ABS Flagship', 249, ['AC', 'TV', 'WiFi', 'Charger', 'Light', 'Ventilation', 'Locker', 'Mirror'], ['A1-L', 'B2-U', 'C3-L', 'A4-U']),
  'desert-pearl': generatePodLayout('desert-pearl', 2, 5, 'Galaxy Series', 299, ['AC', 'TV', 'WiFi', 'Charger', 'Light', 'Ventilation', 'Locker', 'Mirror'], ['A2-L', 'B4-U']),
  'city-star': generatePodLayout('city-star', 4, 6, 'Made in India T1', 179, ['AC', 'WiFi', 'Charger', 'Light', 'USB Port'], ['A1-L', 'A3-U', 'B2-L', 'C5-U', 'D1-L', 'D3-L']),
  'beach-bliss': generatePodLayout('beach-bliss', 2, 8, 'Wooden Series', 199, ['AC', 'WiFi', 'Charger', 'Light', 'Ventilation'], ['A3-L', 'A5-U', 'B2-L', 'B7-U']),
  'heritage-haveli': generatePodLayout('heritage-haveli', 1, 5, 'Cosmos Series', 129, ['AC', 'WiFi', 'Charger', 'Light'], ['A2-U']),
  'mountain-view': generatePodLayout('mountain-view', 1, 3, 'Space Series', 179, ['AC', 'WiFi', 'Charger', 'Light', 'Ventilation'], []),
};

export function getPodLayout(propertyId: string): PodLayout | undefined {
  return podLayouts[propertyId];
}
