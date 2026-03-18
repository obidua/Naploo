'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Ticket, Plus, Search, Filter, Clock, CheckCircle, AlertCircle,
  MessageSquare, ChevronRight, ArrowLeft, Send, Paperclip, X,
  CreditCard, MapPin, Settings, Shield, HelpCircle, Headphones
} from 'lucide-react';

type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

interface TicketType {
  id: string;
  subject: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  messages: number;
  lastMessage: string;
}

const categories = [
  { icon: CreditCard, label: 'Booking & Payment', value: 'booking' },
  { icon: MapPin, label: 'Pod Issues', value: 'pod' },
  { icon: Settings, label: 'Account & Settings', value: 'account' },
  { icon: Shield, label: 'Safety Concern', value: 'safety' },
  { icon: HelpCircle, label: 'General Enquiry', value: 'general' },
  { icon: Headphones, label: 'Technical Issue', value: 'technical' },
];

const priorityColors: Record<TicketPriority, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusConfig: Record<TicketStatus, { color: string; icon: React.ElementType; label: string }> = {
  open: { color: 'bg-blue-100 text-blue-700', icon: AlertCircle, label: 'Open' },
  'in-progress': { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'In Progress' },
  resolved: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Resolved' },
  closed: { color: 'bg-slate-100 text-slate-500', icon: CheckCircle, label: 'Closed' },
};

// Sample tickets
const sampleTickets: TicketType[] = [
  {
    id: 'TK-1001',
    subject: 'Unable to extend booking at Mumbai Airport pod',
    category: 'booking',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-03-15T10:30:00',
    updatedAt: '2026-03-16T14:20:00',
    messages: 4,
    lastMessage: 'Our team is looking into this. We\'ll update you shortly.',
  },
  {
    id: 'TK-1002',
    subject: 'Refund not received for cancelled booking BK-2934',
    category: 'booking',
    status: 'open',
    priority: 'medium',
    createdAt: '2026-03-14T08:15:00',
    updatedAt: '2026-03-14T08:15:00',
    messages: 1,
    lastMessage: 'I cancelled my booking 3 days ago but haven\'t received my refund.',
  },
  {
    id: 'TK-1003',
    subject: 'AC not working in Pod #45, Delhi Station',
    category: 'pod',
    status: 'resolved',
    priority: 'urgent',
    createdAt: '2026-03-10T22:00:00',
    updatedAt: '2026-03-11T06:30:00',
    messages: 6,
    lastMessage: 'Issue has been fixed. Thank you for reporting.',
  },
  {
    id: 'TK-1004',
    subject: 'How to change my registered phone number?',
    category: 'account',
    status: 'closed',
    priority: 'low',
    createdAt: '2026-03-08T12:00:00',
    updatedAt: '2026-03-09T09:00:00',
    messages: 3,
    lastMessage: 'Your phone number has been updated successfully.',
  },
];

export default function TicketsPage() {
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Create ticket form
  const [newTicket, setNewTicket] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'medium' as TicketPriority,
    bookingId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const filteredTickets = sampleTickets.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchQuery && !t.subject.toLowerCase().includes(searchQuery.toLowerCase()) && !t.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // === CREATE TICKET VIEW ===
  if (view === 'create') {
    if (submitted) {
      return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Ticket Created Successfully!</h2>
              <p className="text-slate-500 mb-2">Your ticket ID is <span className="font-semibold text-primary-600">TK-1005</span></p>
              <p className="text-slate-400 text-sm mb-8">Our support team will respond within 2-4 hours.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setSubmitted(false); setView('list'); setNewTicket({ category: '', subject: '', description: '', priority: 'medium', bookingId: '' }); }} className="px-6 py-3 bg-gradient-to-r from-primary-500 to-violet-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-violet-700 transition-all">
                  View My Tickets
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Tickets
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Create Support Ticket</h1>
            <p className="text-slate-400 mb-8">Describe your issue and we&apos;ll get back to you as soon as possible.</p>

            <form onSubmit={handleCreateTicket} className="space-y-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Category</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setNewTicket({ ...newTicket, category: cat.value })}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        newTicket.category === cat.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 text-slate-600'
                      }`}
                    >
                      <cat.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              {/* Booking ID (optional) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Booking ID <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={newTicket.bookingId}
                  onChange={(e) => setNewTicket({ ...newTicket, bookingId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                  placeholder="e.g. BK-xxxx"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Priority</label>
                <div className="flex gap-3">
                  {(['low', 'medium', 'high', 'urgent'] as TicketPriority[]).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTicket({ ...newTicket, priority: p })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                        newTicket.priority === p
                          ? priorityColors[p] + ' ring-2 ring-offset-1 ring-current'
                          : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  rows={5}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition resize-none"
                  placeholder="Provide details about your issue. Include any relevant booking IDs, dates, or screenshots information."
                  required
                />
              </div>

              {/* Attachment hint */}
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Paperclip className="w-4 h-4" />
                <span>You can attach files after creating the ticket</span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !newTicket.category || !newTicket.subject}
                className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-violet-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Ticket...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Ticket
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // === TICKET DETAIL VIEW ===
  if (view === 'detail' && selectedTicket) {
    const st = statusConfig[selectedTicket.status];
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <button onClick={() => { setView('list'); setSelectedTicket(null); }} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Tickets
          </button>

          {/* Ticket Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">{selectedTicket.id}</p>
                <h1 className="text-xl font-bold text-slate-800">{selectedTicket.subject}</h1>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${st.color}`}>
                <st.icon className="w-3.5 h-3.5" />
                {st.label}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              <span>Category: <span className="text-slate-600 capitalize">{selectedTicket.category}</span></span>
              <span>Priority: <span className={`capitalize font-medium ${selectedTicket.priority === 'urgent' ? 'text-red-600' : selectedTicket.priority === 'high' ? 'text-amber-600' : 'text-slate-600'}`}>{selectedTicket.priority}</span></span>
              <span>Created: {new Date(selectedTicket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-4 mb-4">
            {/* User message */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">U</div>
                <div>
                  <p className="text-sm font-medium text-slate-800">You</p>
                  <p className="text-xs text-slate-400">{new Date(selectedTicket.createdAt).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">I&apos;m facing an issue with my booking. {selectedTicket.subject.toLowerCase()}. Please help me resolve this as soon as possible.</p>
            </div>

            {/* Support message */}
            {selectedTicket.messages > 1 && (
              <div className="bg-violet-50/50 rounded-2xl border border-violet-100 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">N</div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Naploo Support</p>
                    <p className="text-xs text-slate-400">{new Date(selectedTicket.updatedAt).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{selectedTicket.lastMessage}</p>
              </div>
            )}
          </div>

          {/* Reply box */}
          {selectedTicket.status !== 'closed' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <textarea
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition resize-none mb-3"
                placeholder="Type your reply..."
              />
              <div className="flex items-center justify-between">
                <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors">
                  <Paperclip className="w-4 h-4" /> Attach File
                </button>
                <button className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-violet-600 text-white rounded-xl text-sm font-medium hover:from-primary-600 hover:to-violet-700 transition-all flex items-center gap-2">
                  <Send className="w-4 h-4" /> Send Reply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === TICKET LIST VIEW ===
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Support Tickets</h1>
            <p className="text-slate-400 mt-1">Track and manage your support requests</p>
          </div>
          <button
            onClick={() => setView('create')}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-500 to-violet-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-violet-700 transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', count: sampleTickets.length, color: 'from-slate-500 to-slate-600' },
            { label: 'Open', count: sampleTickets.filter(t => t.status === 'open').length, color: 'from-blue-500 to-cyan-500' },
            { label: 'In Progress', count: sampleTickets.filter(t => t.status === 'in-progress').length, color: 'from-amber-500 to-orange-500' },
            { label: 'Resolved', count: sampleTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length, color: 'from-green-500 to-emerald-500' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
              placeholder="Search by ticket ID or subject..."
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-slate-600 hover:border-gray-300 transition">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Filter pills */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'open', 'in-progress', 'resolved', 'closed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  filterStatus === status
                    ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                    : 'bg-white text-slate-500 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {status === 'all' ? 'All Tickets' : status.replace('-', ' ')}
              </button>
            ))}
          </div>
        )}

        {/* Ticket List */}
        <div className="space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No tickets found</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredTickets.map(ticket => {
              const st = statusConfig[ticket.status];
              return (
                <button
                  key={ticket.id}
                  onClick={() => { setSelectedTicket(ticket); setView('detail'); }}
                  className="w-full bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200 text-left group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-mono text-slate-400">{ticket.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <h3 className="text-slate-800 font-semibold group-hover:text-primary-600 transition-colors truncate">{ticket.subject}</h3>
                      <p className="text-slate-400 text-sm mt-1 line-clamp-1">{ticket.lastMessage}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>
                        <st.icon className="w-3 h-3" />
                        {st.label}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{ticket.messages}</span>
                        <span>{formatDate(ticket.updatedAt)}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Help CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary-500/10 to-violet-500/10 rounded-2xl p-8 text-center border border-primary-200/50">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Need Immediate Help?</h3>
          <p className="text-slate-500 text-sm mb-4">For urgent issues, reach us directly</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="tel:+919876543210" className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-sm font-medium text-slate-700 border border-gray-200 hover:border-primary-300 transition">
              📞 Call Us
            </a>
            <Link href="/help" className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-sm font-medium text-slate-700 border border-gray-200 hover:border-primary-300 transition">
              📖 Help Center
            </Link>
            <Link href="/contact" className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-sm font-medium text-slate-700 border border-gray-200 hover:border-primary-300 transition">
              ✉️ Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
