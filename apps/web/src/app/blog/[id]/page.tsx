'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Calendar, Clock, User, ArrowLeft, Share2, Bookmark, Tag } from 'lucide-react';

// Sample blog content - in production, this would come from a CMS or database
const blogContent: Record<string, {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  image: string;
  tags: string[];
}> = {
  'economic-growth-job-creation-sleeping-pod-industry': {
    title: 'Economic Growth & Job Creation: Building India\'s Sleeping Pod Industry',
    excerpt: 'How the sleeping pod industry creates 100,000+ jobs and ₹5,000+ Crores economic opportunity.',
    content: `
      <p>The sleeping pod industry in India represents one of the most exciting opportunities for economic growth and job creation in the hospitality sector. As urban India continues to evolve, the demand for flexible, affordable rest solutions has skyrocketed.</p>
      
      <h2>Market Opportunity</h2>
      <p>India's travel and hospitality market is projected to reach $125 billion by 2030. Within this, the micro-hospitality segment - which includes sleeping pods - is expected to grow at a CAGR of 35% over the next five years.</p>
      
      <h2>Job Creation Potential</h2>
      <p>The sleeping pod industry has the potential to create over 100,000 direct and indirect jobs across various sectors:</p>
      <ul>
        <li><strong>Manufacturing:</strong> 15,000+ jobs in pod production, assembly, and quality control</li>
        <li><strong>Installation & Maintenance:</strong> 20,000+ technicians and service professionals</li>
        <li><strong>Operations:</strong> 40,000+ facility managers, cleaning staff, and customer support</li>
        <li><strong>Technology:</strong> 10,000+ developers, designers, and IT professionals</li>
        <li><strong>Sales & Marketing:</strong> 15,000+ business development and marketing roles</li>
      </ul>
      
      <h2>Economic Impact</h2>
      <p>The industry is projected to contribute ₹5,000+ Crores to India's GDP by 2030 through:</p>
      <ul>
        <li>Direct revenue from pod bookings</li>
        <li>Manufacturing and export opportunities</li>
        <li>Technology licensing and platform fees</li>
        <li>Ancillary services (food, beverages, entertainment)</li>
      </ul>
      
      <h2>Investment Opportunities</h2>
      <p>With low entry barriers and high returns, sleeping pods present attractive investment opportunities for individuals and businesses alike. ROI typically ranges from 25-40% annually, making it one of the most lucrative segments in hospitality.</p>
      
      <h2>Conclusion</h2>
      <p>The sleeping pod industry is not just about providing rest - it's about building a new economic ecosystem that creates jobs, drives innovation, and contributes to India's growth story.</p>
    `,
    category: 'Industry Insights',
    date: 'Feb 16, 2025',
    readTime: '14 min read',
    author: 'Economic Development Team',
    image: '/Pods_Images/For Website main images/Pods Hall looks.jpg',
    tags: ['economics', 'job creation', 'industry growth'],
  },
  'corporate-office-nap-rooms-productivity': {
    title: '🏢 Corporate Office Nap Rooms: Boost Productivity, Reduce Burnout',
    excerpt: 'How sleeping pods in corporate offices are revolutionizing workplace wellness.',
    content: `
      <p>In today's fast-paced corporate environment, employee wellness has become a critical factor for organizational success. Leading companies worldwide are discovering that strategic rest breaks can dramatically improve productivity, creativity, and employee satisfaction.</p>
      
      <h2>The Science of Power Naps</h2>
      <p>Research from NASA, Harvard, and Stanford has consistently shown that short naps of 15-20 minutes can boost alertness by 100% and improve performance by 34%. For knowledge workers, this translates directly to better decision-making and reduced errors.</p>
      
      <h2>ROI of Corporate Nap Rooms</h2>
      <p>Companies investing in sleeping pods for their employees are seeing remarkable returns:</p>
      <ul>
        <li><strong>30% increase</strong> in productivity metrics</li>
        <li><strong>25% reduction</strong> in sick days</li>
        <li><strong>40% decrease</strong> in burnout-related turnover</li>
        <li><strong>400% ROI</strong> within the first year</li>
      </ul>
      
      <h2>Implementation Best Practices</h2>
      <p>Successful corporate nap room implementations follow these principles:</p>
      <ul>
        <li>Location near but separate from work areas</li>
        <li>Booking system to ensure availability</li>
        <li>Proper soundproofing and lighting control</li>
        <li>Clear policies encouraging use without stigma</li>
      </ul>
      
      <h2>Case Study: Tech Company Success</h2>
      <p>A leading Bangalore-based IT company installed 12 Naploo pods and tracked results over 6 months. They found that employees who used the pods regularly showed 35% higher engagement scores and 28% better project completion rates.</p>
    `,
    category: 'Case Studies',
    date: 'Feb 9, 2025',
    readTime: '18 min read',
    author: 'Corporate Wellness Expert',
    image: '/Pods_Images/For Website main images/interior looks.png',
    tags: ['corporate wellness', 'productivity', 'employee wellness'],
  },
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.id as string;
  const post = blogContent[slug];

  if (!post) {
    return (
      <div className="min-h-screen bg-naploo-dark text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-white/60 mb-8">The article you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 rounded-xl text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-naploo-dark text-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-violet-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <span className="inline-block px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm mb-4">
            {post.category}
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-8">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {post.date}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="relative py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <article 
            className="prose prose-invert prose-lg max-w-none
              prose-headings:font-display prose-headings:text-white
              prose-p:text-white/70 prose-p:leading-relaxed
              prose-li:text-white/70
              prose-strong:text-white
              prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3 flex-wrap">
              <Tag className="w-5 h-5 text-white/40" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white/5 rounded-full text-sm text-white/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Experience Naploo?
            </h2>
            <p className="text-white/60 mb-6">
              Book your first pod and discover the future of rest.
            </p>
            <Link
              href="/pods"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-glow-lg transition-all"
            >
              Find Pods Near You
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
