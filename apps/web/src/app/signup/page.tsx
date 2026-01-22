'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { 
  Phone, ArrowRight, Shield, User, Mail,
  CheckCircle, Loader2, Sparkles, Gift
} from 'lucide-react';

export default function SignupPage() {
  const [step, setStep] = useState<'details' | 'phone' | 'otp'>('details');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    referralCode: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'otp' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setShowResend(true);
    }
  }, [step, countdown]);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone.length >= 10 && agreedToTerms) {
      setStep('phone');
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setCountdown(30);
      setShowResend(false);
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length === 6) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        // Redirect to dashboard or home
        window.location.href = '/';
      }, 1500);
    }
  };

  const handleResendOtp = () => {
    setShowResend(false);
    setCountdown(30);
    // Simulate resend API call
  };

  return (
    <div className="min-h-screen bg-naploo-dark flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-naploo-primary/20 to-naploo-violet/20" />
        <div className="absolute inset-0 grid-pattern opacity-10" />
        
        <Image
          src="/Pods_Images/Galaxy Series/Galaxy Series Horizontal single:double bed.png"
          alt="Sleep Pod"
          fill
          className="object-cover"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-naploo-dark via-transparent to-transparent" />
        
        {/* Feature Cards */}
        <div className="absolute bottom-12 left-12 right-12 space-y-4">
          <div className="glass-card p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white font-medium">Instant Bookings</p>
              <p className="text-white/50 text-sm">Book a pod in under 60 seconds</p>
            </div>
          </div>
          
          <div className="glass-card p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 bg-naploo-primary/20 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-naploo-primary" />
            </div>
            <div>
              <p className="text-white font-medium">Welcome Bonus</p>
              <p className="text-white/50 text-sm">Get ₹100 off on your first booking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-naploo-accent/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 max-w-md mx-auto w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-naploo-primary to-naploo-violet rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">N</span>
            </div>
            <span className="text-2xl font-bold gradient-text">Naploo</span>
          </Link>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {['details', 'phone', 'otp'].map((s, index) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition ${
                  step === s 
                    ? 'bg-gradient-to-r from-naploo-primary to-naploo-violet text-white' 
                    : index < ['details', 'phone', 'otp'].indexOf(step)
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/10 text-white/50'
                }`}>
                  {index < ['details', 'phone', 'otp'].indexOf(step) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 2 && (
                  <div className={`w-8 h-px ${
                    index < ['details', 'phone', 'otp'].indexOf(step)
                      ? 'bg-green-500'
                      : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {step === 'details' && (
            <>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Create Account
              </h1>
              <p className="text-white/60 mb-8">
                Join thousands of happy nappers
              </p>

              <form onSubmit={handleDetailsSubmit} className="space-y-5">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-naploo-primary/50 transition"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Email (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-naploo-primary/50 transition"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Phone Number</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-white/50">
                      <Phone className="w-5 h-5" />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-24 pr-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-naploo-primary/50 transition"
                      placeholder="98765 43210"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Referral Code <span className="text-white/40">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Gift className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="text"
                      value={formData.referralCode}
                      onChange={(e) => setFormData({...formData, referralCode: e.target.value.toUpperCase()})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-naploo-primary/50 transition uppercase"
                      placeholder="NAPLOO100"
                    />
                  </div>
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded border-white/20 bg-white/5 text-naploo-primary focus:ring-naploo-primary/50"
                  />
                  <span className="text-white/60 text-sm">
                    I agree to the{' '}
                    <Link href="/terms" className="text-naploo-primary hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-naploo-primary hover:underline">Privacy Policy</Link>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={!formData.name || formData.phone.length < 10 || !agreedToTerms}
                  className="w-full bg-gradient-to-r from-naploo-primary to-naploo-violet text-white py-4 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </>
          )}

          {step === 'phone' && (
            <>
              <button
                onClick={() => setStep('details')}
                className="text-white/50 hover:text-white mb-8 flex items-center gap-2 transition"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back
              </button>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Verify Phone
              </h1>
              <p className="text-white/60 mb-8">
                We&apos;ll send an OTP to <span className="text-white">+91 {formData.phone}</span>
              </p>

              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div className="glass-card p-4 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-naploo-primary/20 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-naploo-primary" />
                    </div>
                    <div>
                      <p className="text-white font-medium">+91 {formData.phone}</p>
                      <p className="text-white/50 text-sm">Mobile Number</p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-naploo-primary to-naploo-violet text-white py-4 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {step === 'otp' && (
            <>
              <button
                onClick={() => setStep('phone')}
                className="text-white/50 hover:text-white mb-8 flex items-center gap-2 transition"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back
              </button>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Enter OTP
              </h1>
              <p className="text-white/60 mb-8">
                Enter the 6-digit code sent to <span className="text-white">+91 {formData.phone}</span>
              </p>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <label className="block text-white/70 text-sm mb-4">Enter OTP</label>
                  <div className="flex gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => { otpInputs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-full aspect-square bg-white/5 border border-white/10 rounded-xl text-white text-2xl font-bold text-center focus:outline-none focus:border-naploo-primary/50 transition"
                        maxLength={1}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  {showResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-naploo-primary hover:text-naploo-violet transition"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <p className="text-white/50">
                      Resend OTP in <span className="text-naploo-primary">{countdown}s</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={otp.join('').length < 6 || isLoading}
                  className="w-full bg-gradient-to-r from-naploo-primary to-naploo-violet text-white py-4 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Security Badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-white/40 text-sm">
            <Shield className="w-4 h-4" />
            <span>Your data is protected with 256-bit encryption</span>
          </div>

          {/* Login Link */}
          <p className="mt-8 text-center text-white/60">
            Already have an account?{' '}
            <Link href="/login" className="text-naploo-primary hover:text-naploo-violet transition">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
