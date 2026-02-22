'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { TrendingUp, Shield, BarChart, Clock, ChevronRight, CheckCircle, Info, Building, Users, MapPin, FileText, Calculator, Minus, Plus } from 'lucide-react';

export default function BuyPodsPage() {
  const [podSets, setPodSets] = useState(1);
  const [occupancyHours, setOccupancyHours] = useState(18);
  const [hourlyRate, setHourlyRate] = useState(150);
  const [revenueShare, setRevenueShare] = useState(50); // 35% to 60% variable
  
  const POD_SET_COST = 600000; // 6 Lakh per pod set
  const MIN_SHARE = 35;
  const MAX_SHARE = 60;
  const GUARANTEED_MULTIPLIER = 3; // 3x guarantee
  const TENURE_YEARS = 3;
  
  const calculations = useMemo(() => {
    const buyerShare = revenueShare / 100;
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
  }, [podSets, occupancyHours, hourlyRate, revenueShare]);

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
              Guaranteed 3x Returns - Secure Asset Ownership
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              Buy Premium Pods and<br />
              <span className="text-primary-200">Lease to Naploo</span>
            </h1>
            <p className="text-white/80 text-lg">
              Own physical sleeping pod assets, lease them to Naploo network, and earn <span className="text-green-300 font-semibold">35% to 60%</span> of booking revenue based on location and operation costs. We guarantee minimum 3x returns on your purchase.
            </p>
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
              <p className="text-slate-500 text-sm">Naploo finds prime locations (hotels, airports, malls) and deploys your pods.</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center">
              <div className="w-14 h-14 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">3</div>
              <h3 className="font-semibold text-slate-800 mb-2">Earn 35-60% Revenue</h3>
              <p className="text-slate-500 text-sm">Travelers book your pods. You receive 35% to 60% of booking revenue based on location.</p>
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
      <section className="py-16 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Calculate Your Earnings</h2>
            <p className="text-slate-500">Adjust the sliders to see your potential returns</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calculator Controls */}
            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary-600" />
                Configure Your Purchase
              </h3>
              
              {/* Pod Sets Selector */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-slate-600 font-medium">Number of Pod Sets</label>
                  <span className="text-2xl font-bold text-primary-600">{podSets}</span>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setPodSets(Math.max(1, podSets - 1))}
                    className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-slate-700 hover:bg-gray-200 transition"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={podSets}
                    onChange={(e) => setPodSets(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                  <button 
                    onClick={() => setPodSets(Math.min(20, podSets + 1))}
                    className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-slate-700 hover:bg-gray-200 transition"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-slate-500 mt-2">Each pod set = 2 pods - Total: {podSets * 2} pods</p>
              </div>
              
              {/* Revenue Share Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-slate-600 font-medium">Your Revenue Share</label>
                  <span className="text-2xl font-bold text-green-600">{revenueShare}%</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="60"
                  value={revenueShare}
                  onChange={(e) => setRevenueShare(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>35% (High Op Cost)</span>
                  <span>47% (Average)</span>
                  <span>60% (Low Op Cost)</span>
                </div>
                <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Revenue share varies by location, city, and operational costs
                </p>
              </div>
              
              {/* Occupancy Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-slate-600 font-medium">Daily Occupancy (hours)</label>
                  <span className="text-2xl font-bold text-violet-600">{occupancyHours}h</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="22"
                  value={occupancyHours}
                  onChange={(e) => setOccupancyHours(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>8h (Low)</span>
                  <span>15h (Avg)</span>
                  <span>22h (High)</span>
                </div>
              </div>
              
              {/* Hourly Rate Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-slate-600 font-medium">Hourly Rate</label>
                  <span className="text-2xl font-bold text-cyan-600">Rs.{hourlyRate}</span>
                </div>
                <input
                  type="range"
                  min="99"
                  max="299"
                  step="10"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>Rs.99 (Budget)</span>
                  <span>Rs.150 (Standard)</span>
                  <span>Rs.299 (Premium)</span>
                </div>
              </div>
              
              {/* Total Investment */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Purchase Cost</span>
                  <span className="text-3xl font-bold text-slate-800">{formatCurrency(calculations.totalInvestment)}</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  {podSets} pod set{podSets > 1 ? 's' : ''} x Rs.6,00,000 each
                </p>
              </div>
            </div>
            
            {/* Results Display */}
            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-green-600" />
                Your Projected Earnings
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-slate-500">Daily Gross Revenue</span>
                  <span className="text-lg font-semibold text-slate-800">{formatCurrency(calculations.dailyGrossRevenue)}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <div>
                    <span className="text-slate-500">Your Daily Earnings</span>
                    <span className="ml-2 text-xs bg-green-50 border border-green-200 text-green-600 px-2 py-0.5 rounded-full">{revenueShare}%</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">{formatCurrency(calculations.dailyBuyerEarnings)}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-slate-500">Monthly Earnings</span>
                  <span className="text-xl font-bold text-green-600">{formatCurrency(calculations.monthlyBuyerEarnings)}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-slate-500">Yearly Earnings</span>
                  <span className="text-xl font-bold text-green-600">{formatCurrency(calculations.yearlyBuyerEarnings)}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-slate-500">3-Year Total Earnings</span>
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(calculations.threeYearEarnings)}</span>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-cyan-50 rounded-2xl p-4 mt-4 border border-green-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-slate-800 font-medium">Break-Even Point</span>
                      <p className="text-sm text-slate-500">When you recover your purchase cost</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-cyan-600">{calculations.breakEvenMonths} months</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-primary-50 to-violet-50 rounded-2xl p-4 border border-primary-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-slate-800 font-medium">Total ROI</span>
                      <p className="text-sm text-slate-500">Return on Investment</p>
                    </div>
                    <span className="text-3xl font-bold text-primary-600">{calculations.roi.toFixed(0)}%</span>
                  </div>
                </div>
                
                {calculations.achieves3x ? (
                  <div className="bg-green-50 rounded-2xl p-4 flex items-start gap-3 border border-green-200">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-green-700 font-medium">3x Guarantee Achieved at {revenueShare}% share</span>
                      <p className="text-sm text-slate-500">
                        At this rate, you will earn {formatCurrency(calculations.threeYearEarnings)} in 3 years, 
                        exceeding the guaranteed {formatCurrency(calculations.guaranteedReturn)}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 rounded-2xl p-4 flex items-start gap-3 border border-yellow-200">
                    <Info className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-yellow-700 font-medium">Tenure Extension Protection</span>
                      <p className="text-sm text-slate-500">
                        If 3x ({formatCurrency(calculations.guaranteedReturn)}) is not achieved in 3 years, 
                        the lease tenure automatically extends until you reach 3x returns.
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
                  we announce it in our Pod Pool for pod owners to participate.
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
                    <p className="text-sm text-slate-500 mb-1">10 pod sets required - 6 remaining</p>
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
                    <p className="text-sm text-slate-500 mb-1">8 pod sets - All available</p>
                    <p className="text-sm text-green-600">Revenue Share: 55% (Low Op Cost)</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-slate-800 font-medium">Delhi Aerocity Hotel</span>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Coming Soon</span>
                    </div>
                    <p className="text-sm text-slate-500">12 pod sets - Opening Feb 2026</p>
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
              <Link href="/investor" className="inline-flex items-center justify-center bg-white text-primary-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition shadow-lg">
                Buy Pods Now
                <ChevronRight className="w-6 h-6 ml-2" />
              </Link>
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
