'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2, Users, MapPin, IndianRupee, CheckCircle, ArrowRight,
  Briefcase, Globe, TrendingUp, Clock, FileText, Send, ArrowLeft,
  Star, Shield, ChevronRight, AlertCircle, Eye
} from 'lucide-react';

type AppType = 'partner' | 'investor' | 'franchise';
type AppStatus = 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected';

interface Application {
  id: string;
  type: AppType;
  businessName: string;
  status: AppStatus;
  submittedAt: string;
  updatedAt: string;
  step: string;
}

const appTypes = [
  {
    type: 'partner' as AppType,
    icon: Building2,
    title: 'Become a Partner',
    desc: 'Host Naploo pods at your venue. Hotels, airports, railway stations, malls & more.',
    benefits: ['Revenue sharing model', 'Zero infrastructure cost', 'Full tech support', 'Marketing partnership'],
    color: 'from-primary-500 to-violet-600',
  },
  {
    type: 'investor' as AppType,
    icon: TrendingUp,
    title: 'Invest in Pods',
    desc: 'Own Naploo pods and earn passive income. We handle operations, you earn returns.',
    benefits: ['Up to 25% annual returns', 'Asset-backed investment', 'Monthly payouts', 'Full insurance coverage'],
    color: 'from-emerald-500 to-teal-600',
  },
  {
    type: 'franchise' as AppType,
    icon: Globe,
    title: 'Franchise Partner',
    desc: 'Operate a Naploo franchise in your city. Exclusive territorial rights and support.',
    benefits: ['Exclusive city rights', 'Complete training program', 'Brand & marketing kit', 'Ongoing operational support'],
    color: 'from-amber-500 to-orange-600',
  },
];

const statusConfig: Record<AppStatus, { color: string; label: string }> = {
  draft: { color: 'bg-slate-100 text-slate-600', label: 'Draft' },
  submitted: { color: 'bg-blue-100 text-blue-700', label: 'Submitted' },
  'under-review': { color: 'bg-amber-100 text-amber-700', label: 'Under Review' },
  approved: { color: 'bg-green-100 text-green-700', label: 'Approved' },
  rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected' },
};

// Sample applications
const myApplications: Application[] = [
  {
    id: 'APP-3001',
    type: 'partner',
    businessName: 'Sunrise Hotels Pvt Ltd',
    status: 'under-review',
    submittedAt: '2026-03-10T09:00:00',
    updatedAt: '2026-03-15T14:00:00',
    step: 'Document Verification',
  },
];

const formSteps = ['Type', 'Business Details', 'Location', 'Documents', 'Review'];

export default function ApplyPage() {
  const [view, setView] = useState<'home' | 'form' | 'list' | 'detail'>('home');
  const [selectedType, setSelectedType] = useState<AppType | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    businessType: '',
    gstNumber: '',
    city: '',
    state: '',
    address: '',
    pincode: '',
    venueType: '',
    existingBusiness: '',
    expectedPods: '5-10',
    investmentRange: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  // === APPLICATION FORM ===
  if (view === 'form' && selectedType) {
    const appConfig = appTypes.find(a => a.type === selectedType)!;

    if (submitted) {
      return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Application Submitted!</h2>
              <p className="text-slate-500 mb-2">Application ID: <span className="font-semibold text-primary-600">APP-3002</span></p>
              <p className="text-slate-400 text-sm mb-8">Our partnerships team will review your application and contact you within 3-5 business days.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setView('home'); setSubmitted(false); setCurrentStep(0); }} className="px-6 py-3 bg-gradient-to-r from-primary-500 to-violet-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-violet-700 transition-all">
                  Back to Applications
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
          <button onClick={() => { setView('home'); setCurrentStep(0); }} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {formSteps.map((step, i) => (
              <React.Fragment key={step}>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  i === currentStep ? 'bg-primary-100 text-primary-700' : i < currentStep ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-slate-400'
                }`}>
                  {i < currentStep ? <CheckCircle className="w-3.5 h-3.5" /> : <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px]">{i + 1}</span>}
                  {step}
                </div>
                {i < formSteps.length - 1 && <div className={`w-8 h-0.5 ${i < currentStep ? 'bg-green-300' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${appConfig.color} flex items-center justify-center`}>
                <appConfig.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{appConfig.title}</h1>
                <p className="text-sm text-slate-400">Step {currentStep + 1} of {formSteps.length}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 0: Type confirmed */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <p className="text-slate-600">You&apos;re applying as a <strong className="capitalize">{selectedType}</strong>. Confirm to proceed.</p>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-slate-700 mb-2">What you get:</h3>
                    <ul className="space-y-2">
                      {appConfig.benefits.map(b => (
                        <li key={b} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 1: Business Details */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Business Name *</label>
                      <input type="text" value={form.businessName} onChange={e => setForm({...form, businessName: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 transition" placeholder="Your company name" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Owner / Contact Name *</label>
                      <input type="text" value={form.ownerName} onChange={e => setForm({...form, ownerName: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 transition" placeholder="Full name" required />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                      <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 transition" placeholder="business@example.com" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Phone *</label>
                      <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 transition" placeholder="+91 98765 43210" required />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Business Type</label>
                      <select value={form.businessType} onChange={e => setForm({...form, businessType: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 transition bg-white">
                        <option value="">Select type</option>
                        <option value="hotel">Hotel / Lodge</option>
                        <option value="mall">Shopping Mall</option>
                        <option value="airport">Airport</option>
                        <option value="railway">Railway Station</option>
                        <option value="coworking">Co-working Space</option>
                        <option value="hospital">Hospital</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">GST Number <span className="text-slate-400 font-normal">(optional)</span></label>
                      <input type="text" value={form.gstNumber} onChange={e => setForm({...form, gstNumber: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 transition" placeholder="22AAAAA0000A1Z5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">City *</label>
                      <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 transition" placeholder="Mumbai" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">State *</label>
                      <input type="text" value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 transition" placeholder="Maharashtra" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Address *</label>
                    <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 transition resize-none" placeholder="Complete venue address" required />
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Pincode</label>
                      <input type="text" value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 transition" placeholder="400001" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Expected Number of Pods</label>
                      <select value={form.expectedPods} onChange={e => setForm({...form, expectedPods: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 transition bg-white">
                        <option value="1-5">1 - 5 Pods</option>
                        <option value="5-10">5 - 10 Pods</option>
                        <option value="10-25">10 - 25 Pods</option>
                        <option value="25-50">25 - 50 Pods</option>
                        <option value="50+">50+ Pods</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Documents */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <p className="text-slate-500 text-sm mb-2">Upload supporting documents. You can also upload these later.</p>
                  {['Business Registration Certificate', 'PAN Card / Aadhar', 'Venue Photos (exterior & interior)', 'Floor Plan (if available)'].map(doc => (
                    <div key={doc} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <span className="text-sm text-slate-600">{doc}</span>
                      </div>
                      <button type="button" className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition">
                        Upload
                      </button>
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes</label>
                    <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 transition resize-none" placeholder="Any additional information you'd like to share..." />
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-700">Review Your Application</h3>
                  <div className="divide-y divide-gray-100">
                    {[
                      ['Application Type', selectedType.charAt(0).toUpperCase() + selectedType.slice(1)],
                      ['Business Name', form.businessName || '—'],
                      ['Contact', form.ownerName || '—'],
                      ['Email', form.email || '—'],
                      ['Phone', form.phone || '—'],
                      ['Location', form.city && form.state ? `${form.city}, ${form.state}` : '—'],
                      ['Expected Pods', form.expectedPods],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between py-3">
                        <span className="text-sm text-slate-500">{label}</span>
                        <span className="text-sm font-medium text-slate-700">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700">Please review all details before submitting. You can update documents later from your application dashboard.</p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    currentStep === 0 ? 'invisible' : 'text-slate-600 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Previous
                </button>
                {currentStep < formSteps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-violet-600 rounded-xl hover:from-primary-600 hover:to-violet-700 transition-all flex items-center gap-2"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Submit Application
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // === MY APPLICATIONS VIEW ===
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <button onClick={() => setView('home')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <h1 className="text-3xl font-bold text-slate-800 mb-2">My Applications</h1>
          <p className="text-slate-400 mb-8">Track the status of your submitted applications</p>

          {myApplications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No applications yet</p>
              <p className="text-slate-400 text-sm mt-1">Start by choosing an application type</p>
              <button onClick={() => setView('home')} className="mt-4 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-violet-600 text-white rounded-xl text-sm font-medium">
                Apply Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myApplications.map(app => {
                const sc = statusConfig[app.status];
                const typeConfig = appTypes.find(t => t.type === app.type)!;
                return (
                  <div key={app.id} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeConfig.color} flex items-center justify-center flex-shrink-0`}>
                          <typeConfig.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-mono mb-1">{app.id}</p>
                          <h3 className="font-semibold text-slate-800">{app.businessName}</h3>
                          <p className="text-sm text-slate-500 capitalize">{app.type} Application</p>
                          <p className="text-xs text-slate-400 mt-2">Current Step: <span className="text-slate-600">{app.step}</span></p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${sc.color}`}>{sc.label}</span>
                        <p className="text-xs text-slate-400 mt-2">Updated {new Date(app.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        {['Submitted', 'Review', 'Verification', 'Decision'].map((step, i) => (
                          <React.Fragment key={step}>
                            <div className={`flex-1 h-1.5 rounded-full ${i < 2 ? 'bg-primary-500' : 'bg-gray-200'}`} />
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="flex justify-between mt-1.5">
                        {['Submitted', 'Review', 'Verification', 'Decision'].map((step, i) => (
                          <span key={step} className={`text-[10px] ${i < 2 ? 'text-primary-600 font-medium' : 'text-slate-400'}`}>{step}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // === HOME VIEW ===
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-violet-600 to-purple-700" />
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <span className="inline-block px-4 py-2 bg-white/10 border border-white/20 text-white rounded-full text-sm font-medium mb-6">
            Partner & Investment Applications
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Grow With <span className="text-violet-200">Naploo</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            Join India&apos;s fastest-growing sleep pod network. Whether you want to host pods, invest, or run a franchise — we&apos;ve got you covered.
          </p>
          <button onClick={() => setView('list')} className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all font-medium">
            <Eye className="w-4 h-4" /> Track My Applications
          </button>
        </div>
      </section>

      {/* Application Types */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-12">Choose Your Path</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {appTypes.map(app => (
              <div key={app.type} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-primary-200 transition-all duration-300 group">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <app.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{app.title}</h3>
                <p className="text-slate-500 text-sm mb-5">{app.desc}</p>
                <ul className="space-y-2 mb-6">
                  {app.benefits.map(b => (
                    <li key={b} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> {b}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { setSelectedType(app.type); setView('form'); setCurrentStep(0); }}
                  className={`w-full py-3 text-white bg-gradient-to-r ${app.color} rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2`}
                >
                  Apply Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-12">Application Process</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Apply Online', desc: 'Fill out the application form with your details', icon: FileText },
              { step: '02', title: 'Review', desc: 'Our team reviews your application within 3-5 days', icon: Clock },
              { step: '03', title: 'Verification', desc: 'Document verification and site inspection', icon: Shield },
              { step: '04', title: 'Onboarding', desc: 'Welcome aboard! Setup and training begins', icon: Star },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary-50 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-xs font-bold text-primary-500 mb-1">STEP {item.step}</div>
                <h3 className="font-semibold text-slate-800 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
