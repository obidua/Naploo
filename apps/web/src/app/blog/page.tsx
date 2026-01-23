'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, User, ArrowRight, Search, Tag, TrendingUp, BookOpen, Lightbulb, Building2, Plane, Train, Hospital, Gamepad2, GraduationCap, Leaf } from 'lucide-react';

const categories = [
  { id: 'all', name: 'All Articles', icon: BookOpen },
  { id: 'industry', name: 'Industry Insights', icon: TrendingUp },
  { id: 'guides', name: 'Buyer Guides', icon: Lightbulb },
  { id: 'case-studies', name: 'Case Studies', icon: Building2 },
  { id: 'technology', name: 'Technology', icon: Gamepad2 },
];

const blogPosts = [
  {
    id: 'economic-growth-job-creation-sleeping-pod-industry',
    title: 'Economic Growth & Job Creation: Building India\'s Sleeping Pod Industry',
    excerpt: 'How the sleeping pod industry creates 100,000+ jobs, ₹5,000+ Crores economic opportunity, and drives economic growth across hospitality, manufacturing, technology, and service sectors nationwide.',
    category: 'industry',
    date: 'Feb 16, 2025',
    readTime: '14 min read',
    author: 'Economic Development Team',
    image: '/Pods_Images/For Website main images/Pods Hall looks.jpg',
    featured: true,
    tags: ['economics', 'job creation', 'industry growth'],
  },
  {
    id: 'corporate-office-nap-rooms-productivity',
    title: '🏢 Corporate Office Nap Rooms: Boost Productivity, Reduce Burnout',
    excerpt: 'How sleeping pods in corporate offices are revolutionizing workplace wellness, increasing productivity by 30%, reducing burnout-related turnover, and delivering 400% ROI through healthier, more energized employees.',
    category: 'case-studies',
    date: 'Feb 9, 2025',
    readTime: '18 min read',
    author: 'Corporate Wellness Expert',
    image: '/Pods_Images/For Website main images/interior looks.png',
    featured: true,
    tags: ['corporate wellness', 'productivity', 'employee wellness'],
  },
  {
    id: 'railway-stations-sleeping-pods',
    title: '🚂 Railway Stations with Sleeping Pods: 24/7 Traveler Comfort',
    excerpt: 'How sleeping pods at railway stations are revolutionizing train travel in India, providing comfortable rest between journeys, reducing exhaustion from overnight trains, and generating significant revenue for Indian Railways.',
    category: 'industry',
    date: 'Feb 7, 2025',
    readTime: '21 min read',
    author: 'Railway Solutions Expert',
    image: '/Pods_Images/For Website main images/Pods hall looks 2.png',
    featured: true,
    tags: ['railways', 'trains', 'rest facilities'],
  },
  {
    id: 'smart-technology-iot-sleeping-pods',
    title: '🤖 Smart Technology: IoT & Innovation in Modern Sleeping Pods',
    excerpt: 'How AI, IoT, and smart technologies are transforming sleeping pods with health monitoring, personalized climate control, intelligent booking systems, and data-driven optimization for premium guest experiences.',
    category: 'technology',
    date: 'Feb 15, 2025',
    readTime: '10 min read',
    author: 'Technology Innovation Team',
    image: '/Pods_Images/Space Series/"SPACE"series -Horizontal single:double bed.png',
    featured: false,
    tags: ['technology', 'IoT', 'AI'],
  },
  {
    id: 'environmental-impact-sustainable-hospitality',
    title: '♻️ Environmental Impact: How Sleeping Pods Support Sustainable Hospitality',
    excerpt: 'How sleeping pods represent the future of sustainable hospitality by optimizing space efficiency, reducing resource consumption, supporting eco-tourism, and creating environmentally conscious travel.',
    category: 'industry',
    date: 'Feb 14, 2025',
    readTime: '11 min read',
    author: 'Sustainability Expert',
    image: '/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png',
    featured: false,
    tags: ['sustainability', 'environment', 'eco-friendly'],
  },
  {
    id: 'gaming-esports-rest-facilities',
    title: '🎮 Gaming & E-Sports Centers: Professional Rest Facilities',
    excerpt: 'How sleeping pods at gaming centers and e-sports tournaments improve player focus, enhance performance during marathon sessions, prevent tournament fatigue, and create professional-grade competition environments.',
    category: 'case-studies',
    date: 'Feb 12, 2025',
    readTime: '12 min read',
    author: 'E-Sports Industry Expert',
    image: '/Pods_Images/E-sports series/"E-sports"series -Horizontal single bed main.png',
    featured: false,
    tags: ['gaming', 'esports', 'tournaments'],
  },
  {
    id: 'airport-sleeping-pods-jet-lag',
    title: '✈️ Airport Sleeping Pods: Beat Jet Lag & Maximize Travel Productivity',
    excerpt: 'How sleeping pods at international airports transform traveler experience, enabling jet lag recovery, improving safety on connecting flights, and generating premium airport revenue.',
    category: 'case-studies',
    date: 'Feb 8, 2025',
    readTime: '16 min read',
    author: 'Global Travel Expert',
    image: '/Pods_Images/COSMOS series/"COSMOS"series -Horizontal:Verticalsingle bed main.png',
    featured: false,
    tags: ['airport', 'travel', 'jet lag'],
  },
  {
    id: 'hospital-attendant-rest-facilities',
    title: '🏥 Hospital Attendant Rest Facilities: 24/7 Patient Care Without Burnout',
    excerpt: 'How sleeping pods for hospital attendants are revolutionizing patient care by reducing burnout, enabling 24/7 facility availability, and creating a sustainable healthcare model.',
    category: 'case-studies',
    date: 'Feb 6, 2025',
    readTime: '22 min read',
    author: 'Healthcare Management Expert',
    image: '/Pods_Images/ABS Flagship Series/showcase.png',
    featured: false,
    tags: ['hospital', 'healthcare', 'burnout prevention'],
  },
  {
    id: 'highway-rest-stops-preventing-accidents',
    title: '🛣️ Highway Rest Stops: Preventing Fatal Accidents in India',
    excerpt: 'How hourly sleeping pods at highway rest stops are revolutionizing road safety in India, preventing drowsy driving accidents, and offering 5-star facilities at budget prices.',
    category: 'industry',
    date: 'Feb 5, 2025',
    readTime: '18 min read',
    author: 'Highway Safety Expert',
    image: '/Pods_Images/For Website main images/space series with loacker room .jpg',
    featured: false,
    tags: ['highway safety', 'road accidents', 'rest stops'],
  },
  {
    id: 'university-student-housing',
    title: '🎓 University Student Housing: Affordable Rest Spaces for Academic Success',
    excerpt: 'How sleeping pods on university campuses transform student wellness and academic performance by providing affordable rest facilities, reducing exam stress, and improving sleep quality.',
    category: 'case-studies',
    date: 'Feb 10, 2025',
    readTime: '14 min read',
    author: 'Education Specialist',
    image: '/Pods_Images/wooden series/"wooden"series -Horizontal single bed:Vertical single bed main.png',
    featured: false,
    tags: ['university', 'student wellness', 'academic success'],
  },
  {
    id: 'buy-sleeping-pods-india-guide',
    title: 'How to Buy Sleeping Pods in India: Complete 2025 Buyer\'s Guide',
    excerpt: 'Everything you need to know before buying sleeping pods in India - pricing, specifications, suppliers, installation, ROI calculations, and expert tips.',
    category: 'guides',
    date: 'Jan 28, 2025',
    readTime: '14 min read',
    author: 'Priya Desai',
    image: '/Pods_Images/Made in India T1/Main.jpg',
    featured: false,
    tags: ['buying guide', 'pricing', 'ROI'],
  },
  {
    id: 'sleeping-pods-changing-world',
    title: 'How Sleeping Pods are Changing the World: The Future of Accommodation',
    excerpt: 'Explore how sleeping pods are revolutionizing global accommodation, from highways to hospitals, airports to offices, saving lives and transforming urban living.',
    category: 'industry',
    date: 'Jan 25, 2025',
    readTime: '15 min read',
    author: 'Dr. Anita Sharma',
    image: '/Pods_Images/For Website main images/Main Pods Image.png',
    featured: false,
    tags: ['global trends', 'innovation', 'future'],
  },
  {
    id: 'capsule-beds-hotel-industry-india',
    title: 'How Capsule Beds are Revolutionizing the Hotel Industry in India',
    excerpt: 'Discover how capsule beds and sleeping pods are transforming the Indian hospitality sector, offering space-efficient, profitable, and modern accommodation solutions.',
    category: 'industry',
    date: 'Jan 20, 2025',
    readTime: '12 min read',
    author: 'Rajesh Kumar',
    image: '/Pods_Images/BACK TO FUTURE 2047 series/"BACK TO FUTURE 2047"series -Horizontal:Verticalsingle bed main.png',
    featured: false,
    tags: ['hotel industry', 'capsule beds', 'hospitality'],
  },
  {
    id: 'nap-rooms-it-companies',
    title: 'Nap Rooms in IT Companies: Boosting Productivity with Sleeping Pods',
    excerpt: 'How leading IT companies are using sleeping pods for nap rooms to increase employee productivity by 30%, reduce burnout, and attract top talent.',
    category: 'case-studies',
    date: 'Feb 1, 2025',
    readTime: '16 min read',
    author: 'Vikram Malhotra',
    image: '/Pods_Images/EXPLORETHE WORLD series/"EXPLORETHE WORLD"series -Horizontal single:double bed main.png',
    featured: false,
    tags: ['nap rooms', 'IT companies', 'productivity'],
  },
  {
    id: 'tourism-budget-travel-hostels',
    title: '🌍 Tourism Budget Travel: Hourly Sleeping Pods for Backpackers',
    excerpt: 'How hourly sleeping pods are revolutionizing budget tourism and backpacking in India by offering ultra-affordable rest facilities at ₹50-150/hour.',
    category: 'guides',
    date: 'Feb 11, 2025',
    readTime: '15 min read',
    author: 'Tourism & Travel Expert',
    image: '/Pods_Images/Online Red Studio : Small Room Lounge/Online Red Studio : Small Room Lounge main.png',
    featured: false,
    tags: ['tourism', 'budget travel', 'backpacking'],
  },
  {
    id: 'construction-site-worker-rest-facilities',
    title: '🏗️ Construction Site Rest Facilities: Worker Safety & Wellness On-Site',
    excerpt: 'How on-site sleeping pods for construction workers prevent fatigue-related accidents, improve safety compliance, enhance productivity, and create dignified rest spaces.',
    category: 'case-studies',
    date: 'Feb 13, 2025',
    readTime: '13 min read',
    author: 'Construction Safety Expert',
    image: '/Pods_Images/ABS Flagship Series/inner view.png',
    featured: false,
    tags: ['construction', 'worker safety', 'on-site facilities'],
  },
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const featuredPosts = blogPosts.filter(post => post.featured);
  
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-naploo-dark text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-sm text-primary-400 mb-6">
            <BookOpen className="w-4 h-4 inline mr-2" />
            Naploo Blog
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Industry Insights &
            <br />
            <span className="gradient-text">Expert Advice</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-8">
            Stay updated with the latest trends in sleeping pod technology, hospitality innovations, and business opportunities.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary-500/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {selectedCategory === 'all' && searchTerm === '' && (
        <section className="relative py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-8">Featured Articles</h2>
            <div className="grid lg:grid-cols-3 gap-6">
              {featuredPosts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className={`group glass-card rounded-2xl overflow-hidden hover:ring-2 hover:ring-primary-500/50 transition-all ${
                    index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
                  }`}
                >
                  <div className={`relative ${index === 0 ? 'aspect-[16/9]' : 'aspect-[16/10]'}`}>
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className="inline-block px-3 py-1 bg-primary-500/80 rounded-full text-xs font-medium mb-3">
                        Featured
                      </span>
                      <h3 className={`font-bold text-white mb-2 group-hover:text-primary-400 transition-colors ${
                        index === 0 ? 'text-2xl' : 'text-lg'
                      }`}>
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts Grid */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8">
            {selectedCategory === 'all' ? 'Latest Articles' : categories.find(c => c.id === selectedCategory)?.name}
            <span className="text-white/40 font-normal ml-2">({filteredPosts.length})</span>
          </h2>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white/60">No articles found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="group glass-card rounded-2xl overflow-hidden hover:ring-2 hover:ring-primary-500/50 transition-all"
                >
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium">
                        {categories.find(c => c.id === post.category)?.name}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-white/60 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3 text-white/40">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-violet-600/20 to-cyan-600/20" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-lg text-white/60 max-w-xl mx-auto mb-8">
            Subscribe to our newsletter for the latest industry insights, product updates, and exclusive content.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary-500/50"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-glow transition-all"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
