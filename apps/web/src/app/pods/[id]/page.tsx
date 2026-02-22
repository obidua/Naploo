'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { properties, pods, getPropertyById, getPodsByPropertyId } from '@/data/properties';

// Duration options for pod booking
const podDurations = [
  { hours: 1, multiplier: 1, popular: false },
  { hours: 2, multiplier: 1.8, popular: false },
  { hours: 3, multiplier: 2.5, popular: true },
  { hours: 4, multiplier: 3.2, popular: false },
  { hours: 6, multiplier: 4.5, popular: false },
  { hours: 8, multiplier: 5.5, popular: false },
  { hours: 12, multiplier: 7, popular: false },
];

// Room categories mock data (would come from API/database)
const roomCategories = [
  { id: 'deluxe', name: 'Deluxe Room', price: 2500, occupancy: '2 Adults', size: '250 sq ft', amenities: ['King Bed', 'AC', 'WiFi', 'TV', 'Minibar'] },
  { id: 'premium', name: 'Premium Suite', price: 4000, occupancy: '2 Adults + 1 Child', size: '400 sq ft', amenities: ['King Bed', 'AC', 'WiFi', 'TV', 'Minibar', 'Balcony', 'Work Desk'] },
  { id: 'family', name: 'Family Room', price: 5500, occupancy: '4 Adults', size: '500 sq ft', amenities: ['2 Queen Beds', 'AC', 'WiFi', 'TV', 'Minibar', 'Living Area'] },
];

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'pods' | 'rooms'>('pods');
  const [selectedPod, setSelectedPod] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(3);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  const property = getPropertyById(params.id);
  const propertyPods = property ? getPodsByPropertyId(params.id) : [];

  if (!property) {
    notFound();
  }

  const selectedPodData = propertyPods.find(p => p.id === selectedPod);

  return (
    <main className="min-h-screen pt-24 pb-20">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/pods" className="hover:text-slate-800 transition-colors">Explore</Link>
            <span>/</span>
            <span className="text-slate-800">{property.name}</span>
          </div>
        </div>
      </div>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Images & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Image Gallery */}
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-gray-200">
                <Image
                  src={property.images[selectedImage] || property.images[0]}
                  alt={property.name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Type Badge */}
                <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-medium ${
                  property.type === 'hotel' 
                    ? 'bg-gradient-to-r from-primary-500 to-violet-600 text-white' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                }`}>
                  {property.type === 'hotel' ? '🏨 Hotel Partner' : '🏡 Homestay Partner'}
                </div>

                {/* Image Gallery Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {property.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === selectedImage ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Property Info */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                      {property.name}
                    </h1>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>📍</span>
                      <span>{property.address}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-2 bg-amber-50 rounded-xl">
                    <span className="text-amber-400">★</span>
                    <span className="font-semibold text-slate-800">{property.rating}</span>
                    <span className="text-slate-400">({property.reviews})</span>
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed mb-6">{property.description}</p>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {property.amenities.map((amenity) => (
                    <span key={amenity} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-slate-600">
                      {amenity}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <GlassCard className="p-4 text-center">
                    <div className="text-2xl font-bold gradient-text">{property.podsCount}</div>
                    <div className="text-sm text-slate-500">Sleep Pods</div>
                  </GlassCard>
                  <GlassCard className="p-4 text-center">
                    <div className="text-2xl font-bold gradient-text">{property.roomsCount}</div>
                    <div className="text-sm text-slate-500">Rooms</div>
                  </GlassCard>
                  <GlassCard className="p-4 text-center">
                    <div className="text-2xl font-bold gradient-text">₹{property.podStartPrice}</div>
                    <div className="text-sm text-slate-500">Pod/Hour</div>
                  </GlassCard>
                  <GlassCard className="p-4 text-center">
                    <div className="text-2xl font-bold gradient-text">₹{property.roomStartPrice}</div>
                    <div className="text-sm text-slate-500">Room/Night</div>
                  </GlassCard>
                </div>
              </div>

              {/* Booking Tabs */}
              <GlassCard className="p-6">
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setActiveTab('pods')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      activeTab === 'pods'
                        ? 'bg-gradient-to-r from-primary-500 to-violet-600 text-white'
                        : 'bg-gray-100 text-slate-500 hover:bg-gray-200 hover:text-slate-800'
                    }`}
                  >
                    🛸 Book Pods (Hourly)
                  </button>
                  <button
                    onClick={() => setActiveTab('rooms')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      activeTab === 'rooms'
                        ? 'bg-gradient-to-r from-primary-500 to-violet-600 text-white'
                        : 'bg-gray-100 text-slate-500 hover:bg-gray-200 hover:text-slate-800'
                    }`}
                  >
                    🏠 Book Rooms (24hrs)
                  </button>
                </div>

                {/* Pods Tab Content */}
                {activeTab === 'pods' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                      Available Pods ({propertyPods.length})
                    </h3>
                    
                    {propertyPods.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {propertyPods.map((pod) => (
                          <div
                            key={pod.id}
                            onClick={() => setSelectedPod(pod.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                              selectedPod === pod.id
                                ? 'border-primary-500 bg-primary-500/10'
                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex gap-4">
                              <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={pod.image}
                                  alt={pod.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1">
                                  <h4 className="font-medium text-slate-800 truncate">{pod.name}</h4>
                                  <span className={`px-2 py-0.5 rounded text-xs ${
                                    pod.available 
                                      ? 'bg-emerald-50 text-emerald-600' 
                                      : 'bg-red-50 text-red-600'
                                  }`}>
                                    {pod.available ? 'Available' : 'Occupied'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 mb-2">{pod.series}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <span className="text-amber-400 text-sm">★</span>
                                    <span className="text-sm text-slate-800">{pod.rating}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-lg font-bold gradient-text">₹{pod.price}</span>
                                    <span className="text-xs text-slate-500">/hr</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        No pods available at this property
                      </div>
                    )}

                    {/* Duration Selection */}
                    {selectedPod && selectedPodData && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-slate-800 font-medium mb-4">Select Duration</h4>
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                          {podDurations.map((d) => (
                            <button
                              key={d.hours}
                              onClick={() => setSelectedDuration(d.hours)}
                              className={`relative py-3 px-2 rounded-lg text-center transition-all ${
                                selectedDuration === d.hours
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-gray-100 text-slate-500 hover:bg-gray-200 hover:text-slate-800'
                              }`}
                            >
                              {d.popular && (
                                <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-500 text-[10px] text-white rounded-full">
                                  Popular
                                </span>
                              )}
                              <div className="font-bold">{d.hours}h</div>
                              <div className="text-xs">₹{Math.round(selectedPodData.price * d.multiplier)}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Rooms Tab Content */}
                {activeTab === 'rooms' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                      Available Rooms ({property.roomsCount})
                    </h3>
                    
                    <div className="space-y-4">
                      {roomCategories.map((room) => (
                        <div
                          key={room.id}
                          onClick={() => setSelectedRoom(room.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedRoom === room.id
                              ? 'border-primary-500 bg-primary-500/10'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-slate-800">{room.name}</h4>
                              <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                <span>👥 {room.occupancy}</span>
                                <span>📐 {room.size}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-bold gradient-text">₹{room.price}</span>
                              <div className="text-xs text-slate-500">/night</div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {room.amenities.map((amenity) => (
                              <span key={amenity} className="px-2 py-1 bg-gray-100 rounded text-xs text-slate-500">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:sticky lg:top-24 space-y-6 h-fit">
              <GlassCard className="p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6">Complete Your Booking</h3>
                
                {/* Booking Type */}
                <div className="mb-4">
                  <label className="block text-sm text-slate-500 mb-2">Booking Type</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-slate-800">
                    {activeTab === 'pods' ? '🛸 Pod (Hourly Booking)' : '🏠 Room (24hr Booking)'}
                  </div>
                </div>

                {/* Selected Item */}
                <div className="mb-4">
                  <label className="block text-sm text-slate-500 mb-2">
                    {activeTab === 'pods' ? 'Selected Pod' : 'Selected Room'}
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-slate-800">
                    {activeTab === 'pods' 
                      ? (selectedPodData?.name || 'Select a pod above')
                      : (roomCategories.find(r => r.id === selectedRoom)?.name || 'Select a room above')
                    }
                  </div>
                </div>

                {/* Duration (for pods) */}
                {activeTab === 'pods' && selectedPod && (
                  <div className="mb-4">
                    <label className="block text-sm text-slate-500 mb-2">Duration</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-slate-800">
                      {selectedDuration} Hours
                    </div>
                  </div>
                )}

                {/* Date & Time Inputs */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-slate-500 mb-2">Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-2">
                      {activeTab === 'pods' ? 'Start Time' : 'Check-in'}
                    </label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between text-slate-500 mb-2">
                    <span>Base Price</span>
                    <span>
                      {activeTab === 'pods' && selectedPodData
                        ? `₹${Math.round(selectedPodData.price * (podDurations.find(d => d.hours === selectedDuration)?.multiplier || 1))}`
                        : activeTab === 'rooms' && selectedRoom
                          ? `₹${roomCategories.find(r => r.id === selectedRoom)?.price}`
                          : '₹0'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 mb-2">
                    <span>Service Fee</span>
                    <span>₹50</span>
                  </div>
                  <div className="flex justify-between text-slate-500 mb-4">
                    <span>GST (18%)</span>
                    <span>
                      {activeTab === 'pods' && selectedPodData
                        ? `₹${Math.round(selectedPodData.price * (podDurations.find(d => d.hours === selectedDuration)?.multiplier || 1) * 0.18)}`
                        : activeTab === 'rooms' && selectedRoom
                          ? `₹${Math.round((roomCategories.find(r => r.id === selectedRoom)?.price || 0) * 0.18)}`
                          : '₹0'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-slate-800 pt-4 border-t border-gray-200">
                    <span>Total</span>
                    <span className="gradient-text">
                      {activeTab === 'pods' && selectedPodData
                        ? `₹${Math.round(selectedPodData.price * (podDurations.find(d => d.hours === selectedDuration)?.multiplier || 1) * 1.18 + 50)}`
                        : activeTab === 'rooms' && selectedRoom
                          ? `₹${Math.round((roomCategories.find(r => r.id === selectedRoom)?.price || 0) * 1.18 + 50)}`
                          : '₹0'
                      }
                    </span>
                  </div>
                </div>

                {/* Book Button */}
                <button
                  disabled={activeTab === 'pods' ? !selectedPod : !selectedRoom}
                  className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                    (activeTab === 'pods' ? selectedPod : selectedRoom)
                      ? 'bg-gradient-to-r from-primary-500 to-violet-600 hover:from-primary-600 hover:to-violet-700 shadow-glow hover:shadow-glow-lg'
                      : 'bg-gray-200 cursor-not-allowed'
                  }`}
                >
                  {(activeTab === 'pods' ? selectedPod : selectedRoom)
                    ? 'Proceed to Payment'
                    : `Select a ${activeTab === 'pods' ? 'Pod' : 'Room'} to Continue`
                  }
                </button>

                {/* Trust Badges */}
                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400">
                  <span>🔒 Secure Payment</span>
                  <span>✓ Instant Confirmation</span>
                </div>
              </GlassCard>

              {/* Contact Card */}
              <GlassCard className="p-6">
                <h4 className="font-medium text-slate-800 mb-4">Need Help?</h4>
                <div className="space-y-3">
                  <a href="tel:+919876543210" className="flex items-center gap-3 text-slate-600 hover:text-slate-800 transition-colors">
                    <span className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                      📞
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Call Us</p>
                      <p className="text-xs text-slate-500">+91 98765 43210</p>
                    </div>
                  </a>
                  <a href="mailto:support@naploo.com" className="flex items-center gap-3 text-slate-600 hover:text-slate-800 transition-colors">
                    <span className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                      ✉️
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Email</p>
                      <p className="text-xs text-slate-500">support@naploo.com</p>
                    </div>
                  </a>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* More Properties Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">
            Explore More <span className="gradient-text">Properties</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {properties
              .filter(p => p.id !== property.id)
              .slice(0, 3)
              .map((p) => (
                <Link key={p.id} href={`/pods/${p.id}`} className="block">
                  <GlassCard className="overflow-hidden group cursor-pointer">
                    <div className="relative aspect-[16/9]">
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
                        p.type === 'hotel' 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-emerald-500 text-white'
                      }`}>
                        {p.type === 'hotel' ? '🏨 Hotel' : '🏡 Homestay'}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-800 group-hover:text-primary-600 transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-sm text-slate-500">📍 {p.city}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-1">
                          <span className="text-amber-400">★</span>
                          <span className="text-sm text-slate-800">{p.rating}</span>
                        </div>
                        <span className="text-sm text-primary-600">From ₹{p.podStartPrice}/hr</span>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}
