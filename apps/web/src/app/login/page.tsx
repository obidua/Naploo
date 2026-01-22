'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { 
  Phone, ArrowRight, Shield, Sparkles, 
  CheckCircle, Eye, EyeOff, Loader2
} from 'lucide-react';

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'otp' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setShowResend(true);
    }
  }, [step, countdown]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        setStep('otp');
        setCountdown(30);
        setShowResend(false);
      }, 1500);
    }
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
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-naploo-primary/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 max-w-md mx-auto w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-naploo-primary to-naploo-violet rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">N</span>
            </div>
            <span className="text-2xl font-bold gradient-text">Naploo</span>
          </Link>

          {step === 'phone' ? (
            <>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-white/60 mb-8">
                Enter your phone number to continue
              </p>

              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Phone Number</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-white/50">
                      <Phone className="w-5 h-5" />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-24 pr-4 py-4 text-white text-lg placeholder:text-white/30 focus:outline-none focus:border-naploo-primary/50 transition"
                      placeholder="98765 43210"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={phone.length < 10 || isLoading}
                  className="w-full bg-gradient-to-r from-naploo-primary to-naploo-violet text-white py-4 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('phone')}
                className="text-white/50 hover:text-white mb-8 flex items-center gap-2 transition"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back
              </button>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Verify OTP
              </h1>
              <p className="text-white/60 mb-8">
                Enter the 6-digit code sent to <span className="text-white">+91 {phone}</span>
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
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Login
                      <CheckCircle className="w-5 h-5" />
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

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-white/60">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-naploo-primary hover:text-naploo-violet transition">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-naploo-primary/20 to-naploo-violet/20" />
        <div className="absolute inset-0 grid-pattern opacity-10" />
        
        <Image
          src="/Pods_Images/Made in India T1/Main.jpg"
          alt="Sleep Pod"
          fill
          className="object-cover"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-naploo-dark via-transparent to-transparent" />
        
        {/* Floating Card */}
        <div className="absolute bottom-12 left-12 right-12 glass-card p-6 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-naploo-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-naploo-primary" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Premium Sleep Experience</h3>
              <p className="text-white/60 text-sm">
                Discover private sleep pods with climate control, ambient lighting, and premium amenities across India.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
