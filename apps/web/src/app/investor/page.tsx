'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { TrendingUp, Shield, BarChart, Clock, CheckCircle, Info, Building, Users, MapPin, FileText, Calculator, Minus, Plus, ShoppingBag, ExternalLink } from 'lucide-react';

export default function BuyPodsPage() {
  const [podSets, setPodSets] = useState(1);
  const [occupancyHours, setOccupancyHours] = useState(18);
  const [hourlyRate, setHourlyRate] = useState(150);
  const [revenueShare, setRevenueShare] = useState(50); // 35% to 60% variable (lease mode)
  // Operator mode: 'self' = user buys pod and operates at own location (100% revenue)
  //                'lease' = lease to Naploo pool (35-60% share) — Coming Soon
  const [mode, setMode] = useState<'self' | 'lease'>('self');

  const POD_SET_COST = 600000; // 6 Lakh per pod set
  const MIN_SHARE = 35;
  const MAX_SHARE = 60;
  const GUARANTEED_MULTIPLIER = 3; // 3x guarantee (lease mode only)
  const TENURE_YEARS = 3;

  const effectiveShare = mode === 'self' ? 100 : revenueShare;

  const calculations = useMemo(() => {
    const buyerShare = effectiveShare / 100;
    const totalInvestment = podSets * POD_SET_COST;
    const dailyGrossRevenue = podSets * 2 * occupancyHours * hourlyRate; // 2 pods per set
    const dailyBuyerEarnings = dailyGrossRevenue * buyerShare;
    const monthlyBuyerEarnings = dailyBuyerEarnings * 30;
    const yearlyBuyerEarnings = dailyBuyerEarnings * 365;
    const threeYearEarnings = yearlyBuyerEarnings * TENURE_YEARS;
    const guaranteedReturn = totalInvestment * GUARANTEED_MULTIPLIER;
    const roi = (threeYearEarnings / totalInvestment) * 100;
    const breakEvenDays = Math.ceil(totalInvestment / dailyBuyerEarnings);
    const breakEvenMonths = (breakEvenDays / 30).toFixed(1);

    return {
      totalInvestment,
      dailyGrossRevenue,
      dailyBuyerEarnings,
      monthlyBuyerEarnings,
      yearlyBuyerEarnings,
      threeYearEarnings,
      guaranteedReturn,
      roi,
      breakEvenDays,
      breakEvenMonths,
      achieves3x: threeYearEarnings >= guaranteedReturn
    };
  }, [podSets, occupancyHours, hourlyRate, effectiveShare]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return String.fromCharCode(8377) + (amount / 10000000).toFixed(2) + ' Cr';
    } else if (amount >= 100000) {
      return String.fromCharCode(8377) + (amount / 100000).toFixed(2) + ' Lakh';
    }
    return String.fromCharCode(8377) + amount.toLocaleString('en-IN');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center bg-green-400/20 text-green-300 px-4 py-2 rounded-full text-sm mb-6">
              <TrendingUp className="w-4 h-4 mr-2" />
              Buy Pods · Self-Operate (100%) or Lease to Naploo (3x Guarantee)
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              Buy Premium Pods, <br />
              <span className="text-primary-200">Earn Either Way</span>
            </h1>
            <p className="text-white/80 text-lg">
              Purchase BIDUA sleeping pods and choose your path: <span className="text-green-300 font-semibold">self-operate at your own location and keep 100%</span>, or <span className="text-cyan-200 font-semibold">lease to Naploo</span> for 35–60% revenue share with a guaranteed 3x return as per our lease &amp; scrap policy.
            </p>
            <div className="mt-5 inline-flex items-center bg-green-400/15 border border-green-300/30 text-green-200 px-3 py-1.5 rounded-full text-xs">
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              Investor onboarding is now open
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simple Steps */}
      <section className="pb-16 border-t border-gray-100 pt-16 bg-violet-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-12">How Pod Ownership Works</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center">
              <div className="w-14 h-14 bg-primary-50 border border-primary-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-7 h-7 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-primary-600 mb-2">1</div>
              <h3 className="font-semibold text-slate-800 mb-2">Buy Pod Sets</h3>
              <p className="text-slate-500 text-sm">Purchase pod sets at Rs.6 Lakh each. Each set contains 2 premium sleeping pods.</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center">
              <div className="w-14 h-14 bg-violet-50 border border-violet-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-violet-600" />
              </div>
              <div className="text-3xl font-bold text-violet-600 mb-2">2</div>
              <h3 className="font-semibold text-slate-800 mb-2">We Deploy Pods</h3>
              <p className="text-slate-500 text-sm">Naploo finds prime locations (hotels, airports, malls) and deploys your pods on your behalf.</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center">
              <div className="w-14 h-14 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">3</div>
              <h3 className="font-semibold text-slate-800 mb-2">Earn 35–60% Revenue</h3>
              <p className="text-slate-500 text-sm">Travelers book your pods. You receive 35–60% of booking revenue based on location — or self-operate and keep 100%.</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center">
              <div className="w-14 h-14 bg-cyan-50 border border-cyan-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-cyan-600" />
              </div>
              <div className="text-3xl font-bold text-cyan-600 mb-2">4</div>
              <h3 className="font-semibold text-slate-800 mb-2">Get 3x Guaranteed</h3>
              <p className="text-slate-500 text-sm">Minimum 3x return guaranteed. If not achieved in 3 years, tenure extends until 3x.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Calculator */}
      <section className="py-6 sm:py-8 border-t border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">Calculate Your Earnings</h2>
            <p className="text-[11px] sm:text-xs text-slate-500">Adjust the sliders to see your potential returns</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-3 lg:gap-4">
            {/* Calculator Controls */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-2.5 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-primary-600" />
                Configure Your Purchase
              </h3>

              {/* Operator Mode Tabs */}
              <div className="grid grid-cols-2 gap-1.5 mb-3 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setMode('self')}
                  className={`px-2 py-1.5 rounded-md text-[11px] font-semibold transition ${
                    mode === 'self'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Self-Operate · 100%
                </button>
                <button
                  type="button"
                  onClick={() => setMode('lease')}
                  className={`px-2 py-1.5 rounded-md text-[11px] font-semibold transition flex items-center justify-center gap-1 ${
                    mode === 'lease'
                      ? 'bg-white text-green-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Lease to Naploo
                  <span className="text-[8px] bg-green-100 text-green-700 border border-green-200 px-1 py-0.5 rounded-full font-semibold uppercase tracking-wide">Live</span>
                </button>
              </div>

              {mode === 'self' ? (
                <div className="mb-2.5 p-2 bg-green-50 border border-green-100 rounded-md flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] text-green-700 leading-tight">
                    You buy pods from BIDUA Pods and run them at your own location — <strong>keep 100% of revenue</strong>.
                  </span>
                </div>
              ) : (
                <div className="mb-2.5 p-2 bg-cyan-50 border border-cyan-100 rounded-md flex items-start gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] text-cyan-700 leading-tight">
                    You buy pods and lease them to Naploo. Earn <strong>35–60% revenue share</strong> with a <strong>3x return guarantee</strong> as per lease &amp; scrap policy.
                  </span>
                </div>
              )}

              {/* Pod Sets Selector */}
              <div className="mb-2.5">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-600 font-medium">Pod Sets <span className="text-slate-400">· {podSets * 2} pods</span></label>
                  <span className="text-sm font-bold text-primary-600">{podSets}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPodSets(Math.max(1, podSets - 1))}
                    className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-slate-700 hover:bg-gray-200 transition"
                    aria-label="Decrease pod sets"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={podSets}
                    onChange={(e) => setPodSets(parseInt(e.target.value))}
                    className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                  <button
                    onClick={() => setPodSets(Math.min(20, podSets + 1))}
                    className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-slate-700 hover:bg-gray-200 transition"
                    aria-label="Increase pod sets"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Revenue Share Slider — only in Lease mode */}
              {mode === 'lease' && (
                <div className="mb-2.5">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-slate-600 font-medium" title="Varies by location, city, and operational costs">
                      Revenue Share <Info className="inline w-2.5 h-2.5 text-yellow-600 align-baseline" />
                    </label>
                    <span className="text-sm font-bold text-green-600">{revenueShare}%</span>
                  </div>
                  <input
                    type="range"
                    min="35"
                    max="60"
                    value={revenueShare}
                    onChange={(e) => setRevenueShare(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>35%</span><span>47%</span><span>60%</span>
                  </div>
                </div>
              )}

              {/* Occupancy Slider */}
              <div className="mb-2.5">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-600 font-medium">Daily Occupancy</label>
                  <span className="text-sm font-bold text-violet-600">{occupancyHours}h</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="22"
                  value={occupancyHours}
                  onChange={(e) => setOccupancyHours(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                  <span>8h</span><span>15h</span><span>22h</span>
                </div>
              </div>

              {/* Hourly Rate Slider */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-600 font-medium">Hourly Rate</label>
                  <span className="text-sm font-bold text-cyan-600">₹{hourlyRate}</span>
                </div>
                <input
                  type="range"
                  min="99"
                  max="299"
                  step="10"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                  <span>₹99</span><span>₹150</span><span>₹299</span>
                </div>
              </div>

              {/* Total Investment + CTA */}
              <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="leading-tight">
                    <span className="text-[11px] text-slate-600 block">Total Purchase Cost</span>
                    <span className="text-[10px] text-slate-400">{podSets} × ₹6,00,000</span>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-slate-800">{formatCurrency(calculations.totalInvestment)}</span>
                </div>
                <a
                  href="https://biduapods.com/products"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary-600 to-violet-600 text-white px-3 py-2 rounded-md text-xs font-semibold hover:from-primary-700 hover:to-violet-700 transition shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Buy Pods on BIDUA Pods
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              </div>
            </div>

            {/* Results Display */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-2.5 flex items-center gap-1.5">
                <BarChart className="w-4 h-4 text-green-600" />
                Your Projected Earnings
                <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide ${
                  mode === 'self'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                }`}>
                  {mode === 'self' ? '100% You' : `${revenueShare}% Lease`}
                </span>
              </h3>

              {/* Top 4 metric pills - 2x2 grid */}
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                <div className="bg-gray-50 rounded-md p-2 border border-gray-100">
                  <span className="text-[10px] text-slate-500 block leading-tight">Daily Gross</span>
                  <span className="text-sm font-semibold text-slate-800">{formatCurrency(calculations.dailyGrossRevenue)}</span>
                </div>
                <div className="bg-green-50 rounded-md p-2 border border-green-100">
                  <span className="text-[10px] text-slate-500 block leading-tight">Daily ({effectiveShare}%)</span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(calculations.dailyBuyerEarnings)}</span>
                </div>
                <div className="bg-green-50 rounded-md p-2 border border-green-100">
                  <span className="text-[10px] text-slate-500 block leading-tight">Monthly</span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(calculations.monthlyBuyerEarnings)}</span>
                </div>
                <div className="bg-green-50 rounded-md p-2 border border-green-100">
                  <span className="text-[10px] text-slate-500 block leading-tight">Yearly</span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(calculations.yearlyBuyerEarnings)}</span>
                </div>
              </div>

              {/* 3-Year hero */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-md p-2 mb-2 flex justify-between items-center">
                <span className="text-[11px] text-white/90 font-medium">3-Year Total</span>
                <span className="text-base sm:text-lg font-bold text-white">{formatCurrency(calculations.threeYearEarnings)}</span>
              </div>

              {/* Break-Even + ROI side-by-side */}
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-md p-2 border border-cyan-100">
                  <span className="text-[10px] text-slate-600 font-medium block leading-tight">Break-Even</span>
                  <span className="text-sm font-bold text-cyan-600">{calculations.breakEvenMonths} mo</span>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-violet-50 rounded-md p-2 border border-primary-100">
                  <span className="text-[10px] text-slate-600 font-medium block leading-tight">Total ROI</span>
                  <span className="text-sm font-bold text-primary-600">{calculations.roi.toFixed(0)}%</span>
                </div>
              </div>

              {mode === 'self' ? (
                <div className="bg-green-50 rounded-md px-2 py-1.5 flex items-center gap-1.5 border border-green-200">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                  <span className="text-[11px] text-green-700 font-medium leading-tight">
                    Self-Operated · 100% revenue · You own &amp; run the pods at your location
                  </span>
                </div>
              ) : calculations.achieves3x ? (
                <div className="bg-green-50 rounded-md px-2 py-1.5 flex items-center gap-1.5 border border-green-200">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                  <span className="text-[11px] text-green-700 font-medium leading-tight">
                    3x Guarantee Achieved · target {formatCurrency(calculations.guaranteedReturn)}
                  </span>
                </div>
              ) : (
                <div className="bg-yellow-50 rounded-md px-2 py-1.5 flex items-center gap-1.5 border border-yellow-200">
                  <Info className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0" />
                  <span className="text-[11px] text-yellow-700 font-medium leading-tight">
                    Tenure auto-extends until 3x ({formatCurrency(calculations.guaranteedReturn)}) is reached
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Split Explanation */}
      <section className="py-16 border-t border-gray-100 bg-violet-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 lg:p-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Revenue Sharing Model</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">35-60%</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">Pod Owner (You)</h3>
                    <p className="text-slate-500">Your share of every booking</p>
                  </div>
                </div>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Direct revenue from pod bookings</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Weekly payouts to your bank</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Real-time earnings dashboard</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Transparent booking records</li>
                </ul>
              </div>
              
              <div className="bg-violet-50 rounded-2xl p-6 border border-violet-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-16 bg-violet-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-violet-600">40-65%</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">Naploo Operations</h3>
                    <p className="text-slate-500">Platform and maintenance costs</p>
                  </div>
                </div>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-violet-600" /> Location rental and utilities</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-violet-600" /> Pod maintenance and cleaning</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-violet-600" /> Customer support 24/7</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-violet-600" /> Marketing and platform tech</li>
                </ul>
              </div>
            </div>
            
            {/* Why Revenue Share Varies */}
            <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-yellow-600" />
                Why Revenue Share Varies (35% to 60%)
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <h4 className="text-slate-800 font-medium mb-2">Location Type</h4>
                  <p className="text-slate-500">Airport locations have higher rent and operational costs compared to hotels or tech parks.</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <h4 className="text-slate-800 font-medium mb-2">City Tier</h4>
                  <p className="text-slate-500">Metro cities like Mumbai and Delhi have higher costs than Tier-2 or Tier-3 cities.</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <h4 className="text-slate-800 font-medium mb-2">Property Deal</h4>
                  <p className="text-slate-500">Each property owner has different rent and revenue sharing requirements.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms and Conditions Summary */}
      <section className="py-16 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Lease Agreement Terms</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="w-12 h-12 bg-primary-50 border border-primary-200 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">3-Year Base Tenure</h3>
              <p className="text-slate-500 text-sm">
                Standard lease agreement is for 3 years. During this period, you earn your agreed revenue share (35-60%).
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="w-12 h-12 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">3x Return Guarantee</h3>
              <p className="text-slate-500 text-sm">
                We guarantee minimum 3x returns. If not achieved in 3 years, your tenure <strong className="text-green-600">automatically extends</strong> until you reach 3x.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="w-12 h-12 bg-violet-50 border border-violet-200 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Scrap Policy</h3>
              <p className="text-slate-500 text-sm">
                After tenure completion (3 years or 3x achieved), pods become property of BIDUA Industries as per agreed scrap policy in the lease agreement.
              </p>
            </div>
          </div>
          
          <div className="mt-8 bg-gradient-to-r from-primary-50 to-violet-50 border border-primary-100 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              Key Agreement Points
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-600">Legal lease agreement signed before pod purchase</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-600">Pods remain your asset during the lease tenure</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-600">Insurance coverage included for damage/theft</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-600">Exit clause available with 90-day notice</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-600">Monthly detailed revenue reports provided</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-600">Revenue share finalized based on deployment location</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pool Announcement Section */}
      <section className="py-16 border-t border-gray-100 bg-violet-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-cyan-50 to-primary-50 border border-cyan-100 rounded-3xl p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center bg-cyan-50 border border-cyan-200 text-cyan-700 px-4 py-2 rounded-full text-sm mb-4">
                  <Building className="w-4 h-4 mr-2" />
                  Location Pool System
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">How We Find Locations</h2>
                <p className="text-slate-600 mb-6">
                  Naploo continuously scouts and secures premium locations across India. When a new opportunity is found,
                  we announce it in our Pod Pool for pod owners to participate — governed by our lease &amp; scrap policy with a 3x return guarantee.
                </p>
                <ol className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">1</span>
                    <span className="text-slate-600">Naploo identifies high-traffic location (hotel, airport, mall, etc.)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">2</span>
                    <span className="text-slate-600">Location details announced in the Pod Pool with revenue share %</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">3</span>
                    <span className="text-slate-600">Pod owners buy and lease pods for that specific location</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">4</span>
                    <span className="text-slate-600">Lease agreement signed, pods deployed, revenue starts flowing</span>
                  </li>
                </ol>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4">Current Pool Opportunities</h3>
                <div className="space-y-3">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-slate-800 font-medium">Mumbai Airport T2</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Filling Fast</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-1">10 pod sets required · 6 remaining</p>
                    <p className="text-sm text-yellow-600">Revenue Share: 38% (High Op Cost)</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '40%'}}></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-slate-800 font-medium">Bangalore Tech Park</span>
                      <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">Open</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-1">8 pod sets · All available</p>
                    <p className="text-sm text-green-600">Revenue Share: 55% (Low Op Cost)</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-slate-800 font-medium">Delhi Aerocity Hotel</span>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Upcoming</span>
                    </div>
                    <p className="text-sm text-slate-500">12 pod sets · Opening Aug 2026</p>
                    <p className="text-sm text-yellow-600">Revenue Share: 42% (Est.)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 border-t border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-slate-800 font-semibold mb-2">Why does revenue share vary from 35% to 60%?</h3>
              <p className="text-slate-500 text-sm">The revenue share depends on location type, city tier, property rental costs, and operational expenses. Airport locations in metro cities have higher costs (35-40% share), while tech parks in Tier-2 cities may offer 55-60% share.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-slate-800 font-semibold mb-2">What happens if my pods do not generate enough revenue?</h3>
              <p className="text-slate-500 text-sm">Your 3x return is guaranteed. If 3x is not achieved in the standard 3-year tenure, the lease automatically extends (at no extra cost to you) until you reach 3x returns.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-slate-800 font-semibold mb-2">Can I choose which location my pods go to?</h3>
              <p className="text-slate-500 text-sm">Yes, you can participate in specific pool opportunities. Each pool announcement shows the location details and revenue share percentage before you commit.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-slate-800 font-semibold mb-2">What is the scrap policy?</h3>
              <p className="text-slate-500 text-sm">After the lease tenure ends (either 3 years or when 3x is achieved), the physical pods become property of BIDUA Industries. This is factored into the business model and your guaranteed returns.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-slate-800 font-semibold mb-2">How are payouts processed?</h3>
              <p className="text-slate-500 text-sm">Payouts are processed weekly directly to your registered bank account. You can also track pending and completed payouts in your dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-gray-100 bg-violet-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-primary-600 to-violet-700 rounded-3xl p-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">Ready to Own Pods?</h2>
            <p className="text-white/80 text-lg mb-8">
              Join our growing network of pod owners earning passive income. 
              Starting at Rs.6 Lakh per pod set with guaranteed 3x returns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://biduapods.com/products"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white text-primary-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition shadow-lg"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Buy Pods Now
                <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
              </a>
              <Link href="/contact" className="inline-flex items-center justify-center border border-white/30 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-white/10 transition">
                Talk to Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
