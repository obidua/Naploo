import { properties } from './properties';

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  category: 'standard' | 'deluxe' | 'premium' | 'suite' | 'family';
  pricePerNight: number;
  originalPrice?: number;
  capacity: { adults: number; children: number };
  bedConfig: string;
  sizeSqFt: number;
  amenities: string[];
  image: string;
  available: number; // count available
  refundable: boolean;
  breakfast: boolean;
}

// Reusable room images by property type
const HOTEL_ROOM_IMAGES = [
  '/Pods_Images/For Website main images/Main Pods Image.png',
  '/Pods_Images/For Website main images/Main Pod Image2.png',
  '/Pods_Images/For Website main images/Pods Hall looks.jpg',
];
const HOMESTAY_ROOM_IMAGES = [
  '/Pods_Images/wooden series/"wooden"series -Horizontal single bed:Vertical single bed main.png',
  '/Pods_Images/EXPLORETHE WORLD series/"EXPLORETHE WORLD"series -Horizontal single:double bed main.png',
];

function makeRooms(propertyId: string, type: 'hotel' | 'homestay', basePrice: number): Room[] {
  const images = type === 'hotel' ? HOTEL_ROOM_IMAGES : HOMESTAY_ROOM_IMAGES;
  const img = (i: number) => images[i % images.length];

  if (type === 'homestay') {
    return [
      {
        id: `${propertyId}-room-standard`,
        propertyId,
        name: 'Cozy Standard Room',
        category: 'standard',
        pricePerNight: basePrice,
        originalPrice: Math.round(basePrice * 1.2),
        capacity: { adults: 2, children: 1 },
        bedConfig: '1 Queen Bed',
        sizeSqFt: 200,
        amenities: ['WiFi', 'AC', 'Home Cooked Food', 'Hot Water'],
        image: img(0),
        available: 3,
        refundable: true,
        breakfast: true,
      },
      {
        id: `${propertyId}-room-premium`,
        propertyId,
        name: 'Premium View Room',
        category: 'premium',
        pricePerNight: Math.round(basePrice * 1.5),
        originalPrice: Math.round(basePrice * 1.8),
        capacity: { adults: 2, children: 2 },
        bedConfig: '1 King Bed',
        sizeSqFt: 320,
        amenities: ['WiFi', 'AC', 'Balcony', 'Premium View', 'Breakfast'],
        image: img(1),
        available: 2,
        refundable: true,
        breakfast: true,
      },
    ];
  }

  return [
    {
      id: `${propertyId}-room-standard`,
      propertyId,
      name: 'Standard Room',
      category: 'standard',
      pricePerNight: basePrice,
      originalPrice: Math.round(basePrice * 1.15),
      capacity: { adults: 2, children: 1 },
      bedConfig: '1 Double Bed',
      sizeSqFt: 220,
      amenities: ['WiFi', 'AC', 'TV', 'Hot Water'],
      image: img(0),
      available: 5,
      refundable: true,
      breakfast: false,
    },
    {
      id: `${propertyId}-room-deluxe`,
      propertyId,
      name: 'Deluxe Room',
      category: 'deluxe',
      pricePerNight: Math.round(basePrice * 1.4),
      originalPrice: Math.round(basePrice * 1.7),
      capacity: { adults: 2, children: 1 },
      bedConfig: '1 King Bed',
      sizeSqFt: 280,
      amenities: ['WiFi', 'AC', 'TV', 'Mini Fridge', 'Tea/Coffee Kit'],
      image: img(1),
      available: 4,
      refundable: true,
      breakfast: true,
    },
    {
      id: `${propertyId}-room-premium`,
      propertyId,
      name: 'Premium Suite',
      category: 'premium',
      pricePerNight: Math.round(basePrice * 2.0),
      originalPrice: Math.round(basePrice * 2.4),
      capacity: { adults: 3, children: 2 },
      bedConfig: '1 King Bed + Sofa',
      sizeSqFt: 420,
      amenities: ['WiFi', 'AC', 'Smart TV', 'Mini Bar', 'Work Desk', 'Bathtub'],
      image: img(2),
      available: 2,
      refundable: true,
      breakfast: true,
    },
  ];
}

// Build inventory for every property
export const rooms: Room[] = properties.flatMap((p) =>
  p.roomsCount > 0 ? makeRooms(p.id, p.type, p.roomStartPrice) : []
);

export const getRoomsByPropertyId = (propertyId: string): Room[] =>
  rooms.filter((r) => r.propertyId === propertyId);

export const getRoomById = (id: string): Room | undefined =>
  rooms.find((r) => r.id === id);
