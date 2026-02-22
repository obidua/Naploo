'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Phone, Mail, MapPin, Clock, Send, MessageSquare,
  Twitter, Instagram, Linkedin, Youtube, ArrowRight
} from 'lucide-react';

const contactMethods = [
  {
    icon: Phone,
    title: 'Phone',
    description: 'Mon-Sat, 9am-6pm IST',
    value: '+91 98765 43210',
    action: 'tel:+919876543210'
  },
  {
    icon: Mail,
    title: 'Email',
    description: 'We reply within 24 hours',
    value: 'hello@naploo.com',
    action: 'mailto:hello@naploo.com'
  },
  {
    icon: MapPin,
    title: 'Office',
    description: 'Visit us at our headquarters',
    value: 'Delhi NCR, India',
    action: '#'
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Available 24/7',
    value: 'Start a conversation',
    action: '#'
  }
];

const offices = [
  {
    city: 'Delhi NCR',
    address: 'Tower A, Cyber City, Sector 24, Gurugram, Haryana 122002',
    phone: '+91 98765 43210',
    isPrimary: true
  },
  {
    city: 'Mumbai',
    address: 'Level 5, One BKC, Bandra Kurla Complex, Mumbai 400051',
    phone: '+91 98765 43211',
    isPrimary: false
  },
  {
    city: 'Bangalore',
    address: 'WeWork, Embassy Tech Village, Outer Ring Road, Bangalore 560103',
    phone: '+91 98765 43212',
    isPrimary: false
  }
];

const faqs = [
  {
    q: 'How do I book a pod?',
    a: 'Download the Naploo app, sign up with your phone number, select a location, choose your pod, and book instantly. Payment can be made via UPI, cards, or wallet.'
  },
  {
    q: 'What is the cancellation policy?',
    a: 'Free cancellation up to 2 hours before check-in. After that, 50% of the booking amount will be charged.'
  },
  {
    q: 'Are the pods safe and hygienic?',
    a: 'Absolutely! All pods are sanitized after each guest. We follow strict hygiene protocols and each pod has individual climate control.'
  },
  {
    q: 'Can I extend my booking?',
    a: 'Yes, you can extend your booking through the app if the pod is available. Extensions are charged at the regular hourly rate.'
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    
    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-violet-50/30 text-slate-800">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-primary-600 via-primary-700 to-violet-700">
        {/* Background Effects */}
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium mb-6">
            Get In Touch
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            We&apos;d Love to
            <span className="block gradient-text">Hear From You</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Have a question, feedback, or need support? Our team is here to help you 24/7.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.action}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-primary-300 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-violet-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <method.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{method.title}</h3>
                <p className="text-slate-400 text-sm mb-2">{method.description}</p>
                <p className="text-primary-600 font-medium">{method.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + Map */}
      <section className="py-20 relative">
        <div className="absolute inset-0 dot-pattern opacity-5" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <span className="inline-block px-4 py-2 bg-violet-50 text-violet-600 border border-violet-200 rounded-full text-sm font-medium mb-4">
                Send Message
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Drop Us a <span className="gradient-text">Message</span>
              </h2>
              <p className="text-slate-500 mb-8">
                Fill out the form below and we&apos;ll get back to you within 24 hours.
              </p>

              {isSubmitted ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
                    <Send className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Message Sent!</h3>
                  <p className="text-slate-500">
                    Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-600 text-sm mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-sm mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 text-sm mb-2">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-sm mb-2">Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-slate-800 focus:outline-none focus:border-primary-500 transition"
                      required
                    >
                      <option value="" className="bg-white">Select a topic</option>
                      <option value="booking" className="bg-white">Booking Help</option>
                      <option value="partnership" className="bg-white">Partnership Inquiry</option>
                      <option value="feedback" className="bg-white">Feedback</option>
                      <option value="complaint" className="bg-white">Complaint</option>
                      <option value="other" className="bg-white">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 text-sm mb-2">Message</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      rows={5}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition resize-none"
                      placeholder="How can we help you?"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary-500 to-violet-600 text-white py-4 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Office Locations */}
            <div>
              <span className="inline-block px-4 py-2 bg-violet-50 text-violet-600 border border-violet-200 rounded-full text-sm font-medium mb-4">
                Our Offices
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8">
                Visit Our <span className="gradient-text">Locations</span>
              </h2>

              <div className="space-y-4">
                {offices.map((office, index) => (
                  <div key={index} className={`bg-white rounded-2xl shadow-sm border p-6 ${office.isPrimary ? 'border-primary-200' : 'border-gray-100'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        office.isPrimary 
                          ? 'bg-gradient-to-br from-primary-500 to-violet-600' 
                          : 'bg-gray-100'
                      }`}>
                        <MapPin className={`w-6 h-6 ${office.isPrimary ? 'text-white' : 'text-slate-500'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-slate-800">{office.city}</h3>
                          {office.isPrimary && (
                            <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
                              HQ
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-sm mb-2">{office.address}</p>
                        <a href={`tel:${office.phone}`} className="text-primary-600 text-sm hover:underline">
                          {office.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-slate-800 font-semibold mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  {[
                    { icon: Twitter, href: '#' },
                    { icon: Instagram, href: '#' },
                    { icon: Linkedin, href: '#' },
                    { icon: Youtube, href: '#' }
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-primary-50 hover:text-primary-600 transition-all duration-300 text-slate-400"
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary-50 text-primary-600 border border-primary-200 rounded-full text-sm font-medium mb-4">
              FAQs
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{faq.q}</h3>
                <p className="text-slate-500">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-500 mb-4">Can&apos;t find what you&apos;re looking for?</p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-violet-600 transition"
            >
              Visit our Help Center
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
