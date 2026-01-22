import { db } from './client';
import { users } from './schema/users';
import { partners } from './schema/partners';
import { podSets, pods } from './schema/pods';
import { rooms } from './schema/rooms';
import { v4 as uuidv4 } from 'uuid';

// Seed data for Naploo ecosystem

async function seed() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminId = uuidv4();
  const [admin] = await db.insert(users).values({
    id: adminId,
    phone: '+919876543210',
    firstName: 'Naploo',
    lastName: 'Admin',
    email: 'admin@naploo.com',
    role: 'admin',
    status: 'active',
  }).returning();
  console.log('✅ Admin user created');

  // Create partner users (hotel/homestay owners)
  const partnerUsers = [
    {
      id: uuidv4(),
      phone: '+919876543211',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      email: 'rajesh@hotelgrand.com',
      role: 'partner' as const,
      status: 'active' as const,
    },
    {
      id: uuidv4(),
      phone: '+919876543212',
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya@budgetstay.com',
      role: 'partner' as const,
      status: 'active' as const,
    },
    {
      id: uuidv4(),
      phone: '+919876543213',
      firstName: 'Amit',
      lastName: 'Patel',
      email: 'amit@travelhub.com',
      role: 'partner' as const,
      status: 'active' as const,
    },
    {
      id: uuidv4(),
      phone: '+919876543214',
      firstName: 'Neha',
      lastName: 'Singh',
      email: 'neha@urbanrest.com',
      role: 'partner' as const,
      status: 'active' as const,
    },
    {
      id: uuidv4(),
      phone: '+919876543215',
      firstName: 'Vikram',
      lastName: 'Mehta',
      email: 'vikram@airportinn.com',
      role: 'partner' as const,
      status: 'active' as const,
    },
    {
      id: uuidv4(),
      phone: '+919876543216',
      firstName: 'Anita',
      lastName: 'Reddy',
      email: 'anita@comfyhome.com',
      role: 'partner' as const,
      status: 'active' as const,
    },
    {
      id: uuidv4(),
      phone: '+919876543217',
      firstName: 'Suresh',
      lastName: 'Nair',
      email: 'suresh@seaview.com',
      role: 'partner' as const,
      status: 'active' as const,
    },
    {
      id: uuidv4(),
      phone: '+919876543218',
      firstName: 'Kavita',
      lastName: 'Joshi',
      email: 'kavita@hillstation.com',
      role: 'partner' as const,
      status: 'active' as const,
    },
  ];

  await db.insert(users).values(partnerUsers);
  console.log(`✅ ${partnerUsers.length} partner users created`);

  // Create regular users (customers)
  const regularUsers = [
    { id: uuidv4(), phone: '+919900001111', firstName: 'Arun', lastName: 'Verma', email: 'arun@gmail.com', role: 'customer' as const, status: 'active' as const },
    { id: uuidv4(), phone: '+919900002222', firstName: 'Sneha', lastName: 'Gupta', email: 'sneha@gmail.com', role: 'customer' as const, status: 'active' as const },
    { id: uuidv4(), phone: '+919900003333', firstName: 'Rahul', lastName: 'Singh', email: 'rahul@gmail.com', role: 'customer' as const, status: 'active' as const },
    { id: uuidv4(), phone: '+919900004444', firstName: 'Pooja', lastName: 'Sharma', email: 'pooja@gmail.com', role: 'customer' as const, status: 'active' as const },
    { id: uuidv4(), phone: '+919900005555', firstName: 'Karan', lastName: 'Malhotra', email: 'karan@gmail.com', role: 'customer' as const, status: 'active' as const },
  ];

  await db.insert(users).values(regularUsers);
  console.log(`✅ ${regularUsers.length} customer users created`);

  // Create Partners (Hotels & Homestays)
  const partnerData = [
    // Delhi NCR Hotels
    {
      id: uuidv4(),
      userId: partnerUsers[0].id,
      businessName: 'Hotel Grand Imperial',
      businessType: 'hotel' as const,
      partnershipModel: 'without_investment' as const,
      address: 'Ashoka Road, Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      latitude: '28.6315',
      longitude: '77.2167',
      contactPerson: 'Rajesh Kumar',
      contactPhone: '+919876543211',
      contactEmail: 'rajesh@hotelgrand.com',
      commissionPercent: '15',
      status: 'active' as const,
      description: 'Luxury hotel in the heart of Delhi with Naploo sleep pods in lobby and rooftop areas. Perfect for transit travelers and business guests.',
      amenities: JSON.stringify(['WiFi', 'AC', 'Restaurant', '24/7 Security', 'Parking', 'Airport Shuttle']),
      images: JSON.stringify(['/pods/For Website main images/mainimage (1).png', '/pods/ABS Flagship Series/showcase.png']),
      rating: '4.5',
      totalReviews: 234,
    },
    {
      id: uuidv4(),
      userId: partnerUsers[1].id,
      businessName: 'Budget Stay Express',
      businessType: 'hotel' as const,
      partnershipModel: 'without_investment' as const,
      address: 'Mahipalpur, Near IGI Airport',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110037',
      latitude: '28.5494',
      longitude: '77.1078',
      contactPerson: 'Priya Sharma',
      contactPhone: '+919876543212',
      contactEmail: 'priya@budgetstay.com',
      commissionPercent: '12',
      status: 'active' as const,
      description: 'Affordable accommodation near Delhi Airport. Sleep pods available for transit passengers and short stays.',
      amenities: JSON.stringify(['WiFi', 'AC', '24/7 Check-in', 'Luggage Storage', 'Airport Transfer']),
      images: JSON.stringify(['/pods/Space Series/SPACE series -Horizontal single:double bed.png']),
      rating: '4.2',
      totalReviews: 567,
    },
    // Mumbai Hotels
    {
      id: uuidv4(),
      userId: partnerUsers[2].id,
      businessName: 'Travel Hub Mumbai',
      businessType: 'hotel' as const,
      partnershipModel: 'with_investment' as const,
      address: 'Andheri East, Near Airport',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400059',
      latitude: '19.1136',
      longitude: '72.8697',
      contactPerson: 'Amit Patel',
      contactPhone: '+919876543213',
      contactEmail: 'amit@travelhub.com',
      commissionPercent: '18',
      status: 'active' as const,
      description: 'Modern pod hotel concept near Mumbai International Airport. Premium sleeping pods with entertainment systems.',
      amenities: JSON.stringify(['WiFi', 'AC', 'Smart TV', 'Premium Bedding', 'Shower Facilities', 'Cafe']),
      images: JSON.stringify(['/pods/Galaxy Series/GALAXY series -Horizontal single bed.png']),
      rating: '4.7',
      totalReviews: 892,
    },
    {
      id: uuidv4(),
      userId: partnerUsers[3].id,
      businessName: 'Urban Rest Co-Living',
      businessType: 'hotel' as const,
      partnershipModel: 'without_investment' as const,
      address: 'Lower Parel, Mumbai Central',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400013',
      latitude: '18.9987',
      longitude: '72.8310',
      contactPerson: 'Neha Singh',
      contactPhone: '+919876543214',
      contactEmail: 'neha@urbanrest.com',
      commissionPercent: '14',
      status: 'active' as const,
      description: 'Co-working space with integrated sleep pods. Perfect for digital nomads and remote workers.',
      amenities: JSON.stringify(['High-Speed WiFi', 'AC', 'Work Desks', 'Meeting Rooms', 'Cafe', '24/7 Access']),
      images: JSON.stringify(['/pods/COSMOS series/COSMOS series -Horizontal:Verticalsingle bed main.png']),
      rating: '4.4',
      totalReviews: 345,
    },
    // Bangalore Hotels
    {
      id: uuidv4(),
      userId: partnerUsers[4].id,
      businessName: 'Airport Inn Bangalore',
      businessType: 'hotel' as const,
      partnershipModel: 'without_investment' as const,
      address: 'Devanahalli, Near KIA',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560300',
      latitude: '13.2040',
      longitude: '77.7066',
      contactPerson: 'Vikram Mehta',
      contactPhone: '+919876543215',
      contactEmail: 'vikram@airportinn.com',
      commissionPercent: '16',
      status: 'active' as const,
      description: 'Premium transit hotel at Bangalore International Airport. Hourly pod bookings for travelers.',
      amenities: JSON.stringify(['WiFi', 'AC', 'Shower', 'Locker', 'Flight Display', '24/7 Service']),
      images: JSON.stringify(['/pods/E-sports series/E-sports series -Horizontal single:double bed.png']),
      rating: '4.6',
      totalReviews: 1234,
    },
    // Homestays
    {
      id: uuidv4(),
      userId: partnerUsers[5].id,
      businessName: 'Comfy Home Stay',
      businessType: 'homestay' as const,
      partnershipModel: 'with_investment' as const,
      address: 'Koramangala 5th Block',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560095',
      latitude: '12.9352',
      longitude: '77.6245',
      contactPerson: 'Anita Reddy',
      contactPhone: '+919876543216',
      contactEmail: 'anita@comfyhome.com',
      commissionPercent: '20',
      status: 'active' as const,
      description: 'Cozy homestay with private pod rooms. Homely atmosphere with modern pod amenities.',
      amenities: JSON.stringify(['WiFi', 'AC', 'Home-cooked Food', 'Garden', 'Parking', 'Pet Friendly']),
      images: JSON.stringify(['/pods/wooden series/wooden series pod.png']),
      rating: '4.8',
      totalReviews: 156,
    },
    {
      id: uuidv4(),
      userId: partnerUsers[6].id,
      businessName: 'Sea View Homestay',
      businessType: 'homestay' as const,
      partnershipModel: 'without_investment' as const,
      address: 'Calangute Beach Road',
      city: 'Goa',
      state: 'Goa',
      pincode: '403516',
      latitude: '15.5449',
      longitude: '73.7550',
      contactPerson: 'Suresh Nair',
      contactPhone: '+919876543217',
      contactEmail: 'suresh@seaview.com',
      commissionPercent: '12',
      status: 'active' as const,
      description: 'Beach-side homestay with futuristic sleeping pods. Wake up to sea views.',
      amenities: JSON.stringify(['WiFi', 'AC', 'Beach Access', 'Breakfast', 'Bikes for Rent', 'BBQ']),
      images: JSON.stringify(['/pods/BACK TO FUTURE 2047 series/BACK TO FUTURE 2047 series -Horizontal single:double bed.png']),
      rating: '4.9',
      totalReviews: 89,
    },
    {
      id: uuidv4(),
      userId: partnerUsers[7].id,
      businessName: 'Hill Station Retreat',
      businessType: 'homestay' as const,
      partnershipModel: 'without_investment' as const,
      address: 'Mall Road, Mussoorie',
      city: 'Mussoorie',
      state: 'Uttarakhand',
      pincode: '248179',
      latitude: '30.4598',
      longitude: '78.0644',
      contactPerson: 'Kavita Joshi',
      contactPhone: '+919876543218',
      contactEmail: 'kavita@hillstation.com',
      commissionPercent: '15',
      status: 'active' as const,
      description: 'Mountain retreat with unique pod experience. Perfect for solo travelers and couples.',
      amenities: JSON.stringify(['WiFi', 'Heating', 'Mountain View', 'Trekking', 'Cafe', 'Bonfire']),
      images: JSON.stringify(['/pods/Made in India T1/Made in India T1 -Horizontal single bed.png']),
      rating: '4.7',
      totalReviews: 67,
    },
  ];

  const createdPartners = await db.insert(partners).values(partnerData).returning();
  console.log(`✅ ${createdPartners.length} partners (hotels/homestays) created`);

  // Create Pod Sets and Pods for each partner
  const allPodSets = [];
  const allPods = [];

  for (const partner of createdPartners) {
    // Each partner gets 2-6 pod sets depending on size
    const numPodSets = Math.floor(Math.random() * 5) + 2;
    
    for (let i = 1; i <= numPodSets; i++) {
      const podSetId = uuidv4();
      const hourlyRates = ['99', '149', '199', '249', '299'];
      const hourlyRate = hourlyRates[Math.floor(Math.random() * hourlyRates.length)];
      
      allPodSets.push({
        id: podSetId,
        partnerId: partner.id,
        ownerId: null, // Naploo owned
        ownership: 'naploo' as const,
        floor: Math.floor(Math.random() * 3) + 1,
        section: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
        setNumber: `SET-${partner.businessName.substring(0, 3).toUpperCase()}-${String(i).padStart(3, '0')}`,
        hourlyRate,
        isActive: true,
        installedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date in last 90 days
      });

      // Each pod set has 2 pods (upper and lower)
      allPods.push({
        id: uuidv4(),
        podSetId,
        podNumber: `POD-${podSetId.substring(0, 4)}-U`,
        position: 'upper',
        podType: 'single' as const,
        status: ['available', 'available', 'available', 'occupied'][Math.floor(Math.random() * 4)] as 'available' | 'occupied',
        hasAC: true,
        hasTV: Math.random() > 0.3,
        hasCharger: true,
        hasLight: true,
        hasVentilation: true,
      });

      allPods.push({
        id: uuidv4(),
        podSetId,
        podNumber: `POD-${podSetId.substring(0, 4)}-L`,
        position: 'lower',
        podType: Math.random() > 0.7 ? 'double' as const : 'single' as const,
        status: ['available', 'available', 'available', 'occupied'][Math.floor(Math.random() * 4)] as 'available' | 'occupied',
        hasAC: true,
        hasTV: Math.random() > 0.3,
        hasCharger: true,
        hasLight: true,
        hasVentilation: true,
      });
    }
  }

  await db.insert(podSets).values(allPodSets);
  console.log(`✅ ${allPodSets.length} pod sets created`);

  await db.insert(pods).values(allPods);
  console.log(`✅ ${allPods.length} individual pods created`);

  // Create Rooms for each hotel partner (normal hotel rooms, not pods)
  const allRooms = [];
  const roomTypes = ['standard', 'deluxe', 'suite', 'family'] as const;
  const bedTypes = ['single', 'double', 'queen', 'king'] as const;
  
  const roomAmenities = {
    standard: ['AC', 'TV', 'WiFi', 'Attached Bathroom', 'Wardrobe'],
    deluxe: ['AC', 'TV', 'WiFi', 'Attached Bathroom', 'Wardrobe', 'Mini Fridge', 'Work Desk', 'Tea/Coffee Maker'],
    suite: ['AC', 'Smart TV', 'High-Speed WiFi', 'Attached Bathroom', 'Wardrobe', 'Mini Fridge', 'Work Desk', 'Tea/Coffee Maker', 'Living Area', 'Bathtub', 'City View'],
    family: ['AC', 'TV', 'WiFi', 'Attached Bathroom', 'Wardrobe', 'Mini Fridge', 'Extra Beds', 'Kids Play Area', 'Connected Rooms'],
  };

  const roomPricing = {
    standard: { daily: 1500, weekly: 9000 },
    deluxe: { daily: 2500, weekly: 15000 },
    suite: { daily: 5000, weekly: 30000 },
    family: { daily: 3500, weekly: 21000 },
  };

  const roomDescriptions = {
    standard: 'Comfortable standard room with essential amenities for a pleasant stay.',
    deluxe: 'Spacious deluxe room with premium amenities and modern decor.',
    suite: 'Luxurious suite with separate living area, premium amenities, and stunning views.',
    family: 'Perfect for families with extra space, connected rooms, and kid-friendly amenities.',
  };

  for (const partner of createdPartners) {
    // Only hotels get normal rooms (not homestays, they focus on pod experience)
    if (partner.businessType === 'hotel') {
      // Each hotel gets 8-15 rooms
      const numRooms = Math.floor(Math.random() * 8) + 8;
      
      for (let i = 1; i <= numRooms; i++) {
        const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
        const bedType = roomType === 'suite' ? 'king' : 
                        roomType === 'family' ? 'double' : 
                        bedTypes[Math.floor(Math.random() * bedTypes.length)];
        const maxGuests = roomType === 'family' ? 4 : roomType === 'suite' ? 3 : roomType === 'deluxe' ? 2 : 2;
        const floor = Math.floor((i - 1) / 5) + 1; // 5 rooms per floor
        
        const roomNames = {
          standard: ['Classic Room', 'Comfort Room', 'Economy Room', 'Value Room'],
          deluxe: ['Executive Room', 'Premium Room', 'Superior Room', 'Elegance Room'],
          suite: ['Royal Suite', 'Presidential Suite', 'Panorama Suite', 'Grand Suite'],
          family: ['Family Haven', 'Family Nest', 'Happy Family Room', 'Family Deluxe'],
        };
        
        const nameOptions = roomNames[roomType];
        const roomName = nameOptions[Math.floor(Math.random() * nameOptions.length)];

        allRooms.push({
          id: uuidv4(),
          partnerId: partner.id,
          roomNumber: `${floor}${String(i % 100).padStart(2, '0')}`,
          name: roomName,
          roomType: roomType,
          floor,
          section: ['East Wing', 'West Wing', 'Main Building', 'Tower'][Math.floor(Math.random() * 4)],
          maxGuests,
          bedType: bedType,
          numBeds: roomType === 'family' ? 2 : 1,
          areaSqFt: roomType === 'standard' ? 200 : roomType === 'deluxe' ? 300 : roomType === 'suite' ? 500 : 400,
          dailyRate: String(roomPricing[roomType].daily + Math.floor(Math.random() * 500)),
          weeklyRate: String(roomPricing[roomType].weekly),
          extraGuestCharge: '500',
          status: ['available', 'available', 'available', 'occupied'][Math.floor(Math.random() * 4)] as 'available' | 'occupied',
          isActive: true,
          amenities: JSON.stringify(roomAmenities[roomType]),
          images: JSON.stringify(['/rooms/default-room.jpg']),
          description: roomDescriptions[roomType],
          checkInTime: '14:00',
          checkOutTime: '11:00',
        });
      }
    }
  }

  if (allRooms.length > 0) {
    await db.insert(rooms).values(allRooms);
    console.log(`✅ ${allRooms.length} hotel rooms created`);
  }

  console.log('');
  console.log('📊 Seed Summary:');
  console.log(`   - 1 Admin user`);
  console.log(`   - ${partnerUsers.length} Partner users`);
  console.log(`   - ${regularUsers.length} Regular users`);
  console.log(`   - ${createdPartners.length} Partner locations (hotels/homestays)`);
  console.log(`   - ${allPodSets.length} Pod sets`);
  console.log(`   - ${allPods.length} Individual pods`);
  console.log(`   - ${allRooms.length} Hotel rooms`);
  console.log('');
  console.log('✨ Database seeded successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
