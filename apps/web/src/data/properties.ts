import { Property } from '@/components/pods/PropertyCard';
import { Pod } from '@/components/pods/PodCard';

// All Partner Properties (Hotels & Homestays)
export const properties: Property[] = [
  {
    id: 'hotel-sapphire-jaipur',
    name: 'Hotel Sapphire',
    type: 'hotel',
    city: 'Jaipur',
    address: 'MI Road, Near Panch Batti, Jaipur, Rajasthan',
    rating: 4.8,
    reviews: 324,
    description: 'Luxury boutique hotel in the heart of Pink City with modern amenities and traditional Rajasthani hospitality.',
    images: [
      '/Pods_Images/ABS Flagship Series/ABS Single Vertical.png',
      '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
      '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png',
      '/Pods_Images/Space Series/"SPACE"series -Horizontal single:double bed.png',
      '/Pods_Images/BACK TO FUTURE 2047 series/"BACK TO FUTURE 2047"series -Horizontal:Verticalsingle bed main.png'
    ],
    amenities: ['WiFi', 'AC', 'Restaurant', 'Parking', 'Room Service', '24/7 Reception'],
    podsCount: 8,
    roomsCount: 24,
    podStartPrice: 199,
    roomStartPrice: 2500
  },
  {
    id: 'cozy-corner-homestay-udaipur',
    name: 'Cozy Corner Homestay',
    type: 'homestay',
    city: 'Udaipur',
    address: 'Lake Pichola Road, Old City, Udaipur',
    rating: 4.9,
    reviews: 156,
    description: 'Charming lakeside homestay with stunning views of Lake Pichola and personalized home-cooked meals.',
    images: [
      '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png',
      '/Pods_Images/Space Series/"SPACE"series -Horizontal single:double bed.png',
      '/Pods_Images/ABS Flagship Series/ABS Single Vertical.png',
      '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
      '/Pods_Images/BACK TO FUTURE 2047 series/"BACK TO FUTURE 2047"series -Horizontal:Verticalsingle bed main.png'
    ],
    amenities: ['Lake View', 'Home Cooked Food', 'WiFi', 'AC', 'Rooftop'],
    podsCount: 4,
    roomsCount: 6,
    podStartPrice: 149,
    roomStartPrice: 1800
  },
  {
    id: 'the-grand-palace-jodhpur',
    name: 'The Grand Palace',
    type: 'hotel',
    city: 'Jodhpur',
    address: 'Near Mehrangarh Fort, Jodhpur, Rajasthan',
    rating: 4.7,
    reviews: 289,
    description: 'Heritage hotel offering a royal experience with fort views and traditional Marwari architecture.',
    images: [
      '/Pods_Images/BACK TO FUTURE 2047 series/"BACK TO FUTURE 2047"series -Horizontal:Verticalsingle bed main.png',
      '/Pods_Images/E-sports series/"E-sports"series -Horizontal single bed main.png',
      '/Pods_Images/ABS Flagship Series/ABS Single Vertical.png',
      '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
      '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png'
    ],
    amenities: ['Fort View', 'Pool', 'Spa', 'Restaurant', 'WiFi', 'AC'],
    podsCount: 12,
    roomsCount: 35,
    podStartPrice: 249,
    roomStartPrice: 3500
  },
  {
    id: 'mountain-view-retreat-mount-abu',
    name: 'Mountain View Retreat',
    type: 'homestay',
    city: 'Mount Abu',
    address: 'Nakki Lake Road, Mount Abu, Rajasthan',
    rating: 4.6,
    reviews: 98,
    description: 'Peaceful mountain retreat with panoramic views of Aravalli hills and nature trails.',
    images: [
      '/Pods_Images/EXPLORETHE WORLD series/"EXPLORETHE WORLD"series -Horizontal single:double bed main.png',
      '/Pods_Images/wooden series/"wooden"series -Horizontal single bed:Vertical single bed main.png',
      '/Pods_Images/ABS Flagship Series/ABS Single Vertical.png',
      '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
      '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png'
    ],
    amenities: ['Mountain View', 'Trekking', 'Bonfire', 'WiFi', 'Organic Food'],
    podsCount: 3,
    roomsCount: 8,
    podStartPrice: 179,
    roomStartPrice: 2200
  },
  {
    id: 'desert-pearl-jaisalmer',
    name: 'Desert Pearl',
    type: 'hotel',
    city: 'Jaisalmer',
    address: 'Sam Road, Near Sonar Kila, Jaisalmer',
    rating: 4.8,
    reviews: 412,
    description: 'Desert luxury hotel with camel safari experiences and traditional Rajasthani cultural programs.',
    images: [
      '/Pods_Images/Made in India T1/Main.jpg',
      '/Pods_Images/Online Red Studio : Small Room Lounge/Online Red Studio : Small Room Lounge main.png',
      '/Pods_Images/ABS Flagship Series/ABS Single Vertical.png',
      '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
      '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png'
    ],
    amenities: ['Desert Safari', 'Pool', 'Cultural Shows', 'Restaurant', 'AC', 'WiFi'],
    podsCount: 10,
    roomsCount: 28,
    podStartPrice: 299,
    roomStartPrice: 4000
  },
  {
    id: 'heritage-haveli-pushkar',
    name: 'Heritage Haveli',
    type: 'homestay',
    city: 'Pushkar',
    address: 'Near Brahma Temple, Pushkar, Rajasthan',
    rating: 4.5,
    reviews: 187,
    description: 'Traditional haveli homestay with spiritual vibes and authentic vegetarian cuisine near the holy lake.',
    images: [
      '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
      '/Pods_Images/ABS Flagship Series/ABS Single Vertical.png',
      '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png',
      '/Pods_Images/Space Series/"SPACE"series -Horizontal single:double bed.png',
      '/Pods_Images/BACK TO FUTURE 2047 series/"BACK TO FUTURE 2047"series -Horizontal:Verticalsingle bed main.png'
    ],
    amenities: ['Lake View', 'Yoga', 'Veg Food', 'WiFi', 'Temple Tours'],
    podsCount: 5,
    roomsCount: 10,
    podStartPrice: 129,
    roomStartPrice: 1500
  },
  {
    id: 'city-star-hotel-delhi',
    name: 'City Star Hotel',
    type: 'hotel',
    city: 'Delhi',
    address: 'Connaught Place, New Delhi',
    rating: 4.6,
    reviews: 523,
    description: 'Modern city hotel in the heart of Delhi with excellent connectivity to metro and business district.',
    images: [
      '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png',
      '/Pods_Images/Space Series/"SPACE"series -Horizontal single:double bed.png',
      '/Pods_Images/ABS Flagship Series/ABS Single Vertical.png',
      '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
      '/Pods_Images/BACK TO FUTURE 2047 series/"BACK TO FUTURE 2047"series -Horizontal:Verticalsingle bed main.png'
    ],
    amenities: ['Metro Access', 'Restaurant', 'Business Center', 'WiFi', 'AC', 'Gym'],
    podsCount: 15,
    roomsCount: 45,
    podStartPrice: 349,
    roomStartPrice: 4500
  },
  {
    id: 'lake-house-bhimtal',
    name: 'Lake House',
    type: 'homestay',
    city: 'Bhimtal',
    address: 'Bhimtal Lake, Nainital District, Uttarakhand',
    rating: 4.7,
    reviews: 134,
    description: 'Scenic lakeside homestay offering boating, fishing, and peaceful getaway from city life.',
    images: [
      '/Pods_Images/wooden series/"wooden"series -Horizontal single bed:Vertical single bed main.png',
      '/Pods_Images/EXPLORETHE WORLD series/"EXPLORETHE WORLD"series -Horizontal single:double bed main.png',
      '/Pods_Images/ABS Flagship Series/ABS Single Vertical.png',
      '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
      '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png'
    ],
    amenities: ['Lake View', 'Boating', 'Fishing', 'WiFi', 'Home Food', 'Parking'],
    podsCount: 4,
    roomsCount: 8,
    podStartPrice: 159,
    roomStartPrice: 2000
  }
];

// All Pods Data
export const pods: Pod[] = [
  // Hotel Sapphire - Jaipur
  {
    id: 'pod-1',
    name: 'Galaxy Single Lounge Pod',
    series: 'Galaxy Series',
    hotelId: 'hotel-sapphire-jaipur',
    hotelName: 'Hotel Sapphire',
    hotelType: 'hotel',
    location: 'MI Road, Jaipur',
    city: 'Jaipur',
    price: 199,
    rating: 4.8,
    reviews: 124,
    image: '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
    amenities: ['WiFi', 'AC', 'USB Charging', 'Reading Light'],
    available: true
  },
  {
    id: 'pod-2',
    name: 'Flagship Sleep Pod',
    series: 'ABS Flagship',
    hotelId: 'hotel-sapphire-jaipur',
    hotelName: 'Hotel Sapphire',
    hotelType: 'hotel',
    location: 'MI Road, Jaipur',
    city: 'Jaipur',
    price: 249,
    rating: 4.9,
    reviews: 89,
    image: '/Pods_Images/ABS Flagship Series/ABS Single Vertical.png',
    amenities: ['WiFi', 'AC', 'Smart TV', 'Premium Bedding'],
    available: true
  },
  // Cozy Corner Homestay - Udaipur
  {
    id: 'pod-3',
    name: 'Cosmos Double Pod',
    series: 'Cosmos Series',
    hotelId: 'cozy-corner-homestay-udaipur',
    hotelName: 'Cozy Corner Homestay',
    hotelType: 'homestay',
    location: 'Lake Pichola, Udaipur',
    city: 'Udaipur',
    price: 179,
    rating: 4.7,
    reviews: 67,
    image: '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png',
    amenities: ['Lake View', 'WiFi', 'AC', 'Breakfast'],
    available: true
  },
  {
    id: 'pod-4',
    name: 'Space Pod Original',
    series: 'Space Series',
    hotelId: 'cozy-corner-homestay-udaipur',
    hotelName: 'Cozy Corner Homestay',
    hotelType: 'homestay',
    location: 'Lake Pichola, Udaipur',
    city: 'Udaipur',
    price: 149,
    rating: 4.6,
    reviews: 54,
    image: '/Pods_Images/Space Series/"SPACE"series -Horizontal single:double bed.png',
    amenities: ['WiFi', 'AC', 'Compact', 'Budget Friendly'],
    available: false
  },
  // The Grand Palace - Jodhpur
  {
    id: 'pod-5',
    name: 'BTF 2047 Double Pod',
    series: 'Back to Future 2047',
    hotelId: 'the-grand-palace-jodhpur',
    hotelName: 'The Grand Palace',
    hotelType: 'hotel',
    location: 'Mehrangarh Fort, Jodhpur',
    city: 'Jodhpur',
    price: 299,
    rating: 4.9,
    reviews: 112,
    image: '/Pods_Images/BACK TO FUTURE 2047 series/"BACK TO FUTURE 2047"series -Horizontal:Verticalsingle bed main.png',
    amenities: ['Fort View', 'AC', 'Smart Controls', 'Premium'],
    available: true
  },
  {
    id: 'pod-6',
    name: 'E-Sports Gaming Pod',
    series: 'E-Sports Series',
    hotelId: 'the-grand-palace-jodhpur',
    hotelName: 'The Grand Palace',
    hotelType: 'hotel',
    location: 'Mehrangarh Fort, Jodhpur',
    city: 'Jodhpur',
    price: 349,
    rating: 4.8,
    reviews: 78,
    image: '/Pods_Images/E-sports series/"E-sports"series -Horizontal single bed main.png',
    amenities: ['Gaming PC', 'WiFi', 'AC', 'RGB Lights'],
    available: true
  },
  // Mountain View Retreat - Mount Abu
  {
    id: 'pod-7',
    name: 'Explore The World Pod',
    series: 'ETW Series',
    hotelId: 'mountain-view-retreat-mount-abu',
    hotelName: 'Mountain View Retreat',
    hotelType: 'homestay',
    location: 'Nakki Lake, Mount Abu',
    city: 'Mount Abu',
    price: 199,
    rating: 4.6,
    reviews: 45,
    image: '/Pods_Images/EXPLORETHE WORLD series/"EXPLORETHE WORLD"series -Horizontal single:double bed main.png',
    amenities: ['Mountain View', 'WiFi', 'AC', 'Nature'],
    available: true
  },
  {
    id: 'pod-8',
    name: 'Wooden Classic Pod',
    series: 'Wooden Series',
    hotelId: 'mountain-view-retreat-mount-abu',
    hotelName: 'Mountain View Retreat',
    hotelType: 'homestay',
    location: 'Nakki Lake, Mount Abu',
    city: 'Mount Abu',
    price: 179,
    rating: 4.5,
    reviews: 38,
    image: '/Pods_Images/wooden series/"wooden"series -Horizontal single bed:Vertical single bed main.png',
    amenities: ['Eco Friendly', 'WiFi', 'Natural', 'Cozy'],
    available: true
  },
  // Desert Pearl - Jaisalmer
  {
    id: 'pod-9',
    name: 'Made in India T1 Pod',
    series: 'Made in India',
    hotelId: 'desert-pearl-jaisalmer',
    hotelName: 'Desert Pearl',
    hotelType: 'hotel',
    location: 'Sam Road, Jaisalmer',
    city: 'Jaisalmer',
    price: 299,
    rating: 4.8,
    reviews: 156,
    image: '/Pods_Images/Made in India T1/Main.jpg',
    amenities: ['Desert View', 'AC', 'WiFi', 'Premium'],
    available: true
  },
  {
    id: 'pod-10',
    name: 'Private Office Lounge Pod',
    series: 'Red Studio',
    hotelId: 'desert-pearl-jaisalmer',
    hotelName: 'Desert Pearl',
    hotelType: 'hotel',
    location: 'Sam Road, Jaisalmer',
    city: 'Jaisalmer',
    price: 399,
    rating: 4.9,
    reviews: 89,
    image: '/Pods_Images/Online Red Studio : Small Room Lounge/Online Red Studio : Small Room Lounge main.png',
    amenities: ['Work Desk', 'AC', 'WiFi', 'Meeting Ready'],
    available: false
  },
  // Heritage Haveli - Pushkar
  {
    id: 'pod-11',
    name: 'Galaxy White Pod',
    series: 'Galaxy Series',
    hotelId: 'heritage-haveli-pushkar',
    hotelName: 'Heritage Haveli',
    hotelType: 'homestay',
    location: 'Brahma Temple, Pushkar',
    city: 'Pushkar',
    price: 149,
    rating: 4.5,
    reviews: 67,
    image: '/Pods_Images/Galaxy Series/"GALAXY"series -Horizontal single:double bed more images4.png',
    amenities: ['Temple View', 'WiFi', 'AC', 'Peaceful'],
    available: true
  },
  // City Star Hotel - Delhi
  {
    id: 'pod-12',
    name: 'Cosmos Executive Pod',
    series: 'Cosmos Series',
    hotelId: 'city-star-hotel-delhi',
    hotelName: 'City Star Hotel',
    hotelType: 'hotel',
    location: 'Connaught Place, Delhi',
    city: 'Delhi',
    price: 349,
    rating: 4.7,
    reviews: 234,
    image: '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed more1.png',
    amenities: ['Metro Access', 'WiFi', 'AC', 'Business'],
    available: true
  },
  {
    id: 'pod-13',
    name: 'Space Pod Compact',
    series: 'Space Series',
    hotelId: 'city-star-hotel-delhi',
    hotelName: 'City Star Hotel',
    hotelType: 'hotel',
    location: 'Connaught Place, Delhi',
    city: 'Delhi',
    price: 299,
    rating: 4.6,
    reviews: 178,
    image: '/Pods_Images/Space Series/"SPACE"series -Horizontal single:double bed more images.png',
    amenities: ['WiFi', 'AC', 'Charging', 'Quick Rest'],
    available: true
  },
  // Lake House - Bhimtal
  {
    id: 'pod-14',
    name: 'Wooden Lake View Pod',
    series: 'Wooden Series',
    hotelId: 'lake-house-bhimtal',
    hotelName: 'Lake House',
    hotelType: 'homestay',
    location: 'Bhimtal Lake, Bhimtal',
    city: 'Bhimtal',
    price: 179,
    rating: 4.7,
    reviews: 56,
    image: '/Pods_Images/wooden series/"wooden"series -Horizontal single bed:Vertical single bed more1.png',
    amenities: ['Lake View', 'WiFi', 'Natural', 'Peaceful'],
    available: true
  },
  {
    id: 'pod-15',
    name: 'ETW Adventure Pod',
    series: 'ETW Series',
    hotelId: 'lake-house-bhimtal',
    hotelName: 'Lake House',
    hotelType: 'homestay',
    location: 'Bhimtal Lake, Bhimtal',
    city: 'Bhimtal',
    price: 159,
    rating: 4.5,
    reviews: 43,
    image: '/Pods_Images/EXPLORETHE WORLD series/"EXPLORETHE WORLD"series -Horizontal single:double bed more1.png',
    amenities: ['Lake View', 'WiFi', 'AC', 'Boating'],
    available: true
  }
];

// Helper functions
export const getAllCities = (): string[] => {
  const cities = new Set(properties.map(p => p.city));
  return Array.from(cities).sort();
};

export const getAllPropertyTypes = (): string[] => ['hotel', 'homestay'];

export const getAllPodSeries = (): string[] => {
  const series = new Set(pods.map(p => p.series));
  return Array.from(series).sort();
};

export const getPropertyById = (id: string): Property | undefined => {
  return properties.find(p => p.id === id);
};

export const getPodsByPropertyId = (propertyId: string): Pod[] => {
  return pods.filter(p => p.hotelId === propertyId);
};

export const getPodsCount = (): number => pods.length;
export const getPropertiesCount = (): number => properties.length;
