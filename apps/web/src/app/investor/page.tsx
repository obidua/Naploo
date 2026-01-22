import Link from 'next/link';
import { Bed, TrendingUp, Shield, BarChart, Users, Clock, ChevronRight, CheckCircle } from 'lucide-react';

export default function InvestorPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-naploo-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <Bed className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Naploo</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/investor/login" className="text-gray-300 hover:text-white">Login</Link>
              <Link href="/investor/register" className="bg-primary-600 px-4 py-2 rounded-lg hover:bg-primary-700">
                Start Investing
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-naploo-dark to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm mb-6">
                <TrendingUp className="w-4 h-4 mr-2" />
                Guaranteed 3x Returns
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Invest in India's
                <br />
                <span className="text-primary-400">Pod Revolution</span>
              </h1>
              <p className="text-gray-300 text-lg mb-8 max-w-lg">
                Join our investor pool and earn guaranteed returns on every booking. 
                Your investment powers the future of hourly accommodations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/investor/register" className="inline-flex items-center justify-center bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition">
                  Start Investing
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
                <Link href="#how-it-works" className="inline-flex items-center justify-center border border-gray-600 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition">
                  How It Works
                </Link>
              </div>
            </div>
            
            {/* Investment Calculator Preview */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-6">Investment Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/20">
                  <span className="text-gray-300">Pod Set Investment</span>
                  <span className="text-2xl font-bold">₹5,00,000</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/20">
                  <span className="text-gray-300">Your Share</span>
                  <span className="text-xl font-semibold text-green-400">60%</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/20">
                  <span className="text-gray-300">Daily Earnings (Avg)</span>
                  <span className="text-xl font-semibold text-green-400">₹3,240</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/20">
                  <span className="text-gray-300">Monthly Earnings</span>
                  <span className="text-xl font-semibold text-green-400">₹97,200</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/20">
                  <span className="text-gray-300">3-Year Total</span>
                  <span className="text-xl font-semibold text-green-400">₹35,47,800</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-300">ROI</span>
                  <span className="text-3xl font-bold text-green-400">~7x</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Invest With Naploo?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A transparent, technology-driven investment opportunity in India's growing travel sector.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Guaranteed Returns</h3>
              <p className="text-gray-600">
                Minimum 3x return guarantee backed by our business model. Your investment grows with every booking.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <BarChart className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Dashboard</h3>
              <p className="text-gray-600">
                Track your pod's performance, bookings, and earnings in real-time through your investor dashboard.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Break-Even</h3>
              <p className="text-gray-600">
                Average break-even in just 5 months. Start earning pure profit after recovering your initial investment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Naploo Investment Works</h2>
            <p className="text-gray-600">Simple, transparent, and profitable</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Invest ₹5 Lakh</h3>
              <p className="text-gray-600 text-sm">Purchase a pod set (2 pods) that gets deployed at partner hotels.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Pods Get Booked</h3>
              <p className="text-gray-600 text-sm">Travelers book your pods hourly. Average 18 hours/day utilization.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Earn 60% Revenue</h3>
              <p className="text-gray-600 text-sm">You receive 60% of all booking revenue. Naploo takes 40% for operations.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get 3x Returns</h3>
              <p className="text-gray-600 text-sm">Guaranteed minimum 3x return over 3 years. That's ₹15 Lakh from ₹5 Lakh.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Breakdown */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-naploo-dark rounded-3xl p-8 lg:p-12 text-white">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Detailed Revenue Calculation</h2>
                <p className="text-gray-300 mb-8">
                  Based on conservative estimates of 18 hours average daily occupancy at ₹150/hour.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <span>₹5,400 daily gross revenue per pod set</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <span>₹3,240 daily investor earnings (60%)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <span>₹11,82,600 annual investor earnings</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <span>₹35,47,800 total earnings over 3 years</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 text-gray-300">Period</th>
                      <th className="text-right py-3 text-gray-300">Gross Revenue</th>
                      <th className="text-right py-3 text-gray-300">Your Share (60%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/10">
                      <td className="py-3">Daily</td>
                      <td className="text-right">₹5,400</td>
                      <td className="text-right text-green-400">₹3,240</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-3">Monthly</td>
                      <td className="text-right">₹1,62,000</td>
                      <td className="text-right text-green-400">₹97,200</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-3">Yearly</td>
                      <td className="text-right">₹19,71,000</td>
                      <td className="text-right text-green-400">₹11,82,600</td>
                    </tr>
                    <tr className="font-bold">
                      <td className="py-3">3 Years</td>
                      <td className="text-right">₹59,13,000</td>
                      <td className="text-right text-green-400">₹35,47,800</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to Start Investing?</h2>
          <p className="text-primary-100 text-lg mb-8">
            Join hundreds of investors earning passive income through Naploo pods.
            Start with just ₹5 Lakh and watch your investment grow.
          </p>
          <Link href="/investor/register" className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition">
            Become an Investor
            <ChevronRight className="w-6 h-6 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Bed className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Naploo</span>
            </div>
            <p className="text-sm">© 2026 BIDUA Industries Pvt Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
