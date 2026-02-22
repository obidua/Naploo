"use client";


import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { 
  Phone, ArrowRight, Shield, Sparkles, 
  CheckCircle, Loader2, ArrowLeft, Moon, Bed
} from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';


export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);
  const { setUser, setTokens } = useAuthStore();

  useEffect(() => {
    if (step === 'otp' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setShowResend(true);
    }
  }, [step, countdown]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (phone.length >= 10) {
      setIsLoading(true);
      try {
        const result = await authApi.sendOtp(phone);
        if (result.data?.success) {
          // In dev mode, the OTP is returned in the response
          if (result.data.otp) {
            setDevOtp(result.data.otp);
          }
          setStep('otp');
          setCountdown(30);
          setShowResend(false);
        } else {
          setError(result.data?.message || result.error || 'Failed to send OTP');
        }
      } catch {
        setError('Network error. Please try again.');
      }
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpInputs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    setError('');
    if (otpValue.length === 6) {
      setIsLoading(true);
      try {
        const result = await authApi.verifyOtp(phone, otpValue);
        if (result.data?.success) {
          // Store auth state in Zustand
          const userData = result.data.user;
          setUser({
            id: userData.id,
            phone: userData.phone,
            firstName: userData.firstName || undefined,
            lastName: userData.lastName || undefined,
            email: userData.email || undefined,
            avatar: userData.avatar || undefined,
            role: userData.role,
            status: userData.status,
          });
          setTokens(result.data.accessToken, result.data.refreshToken);
          
          window.location.href = '/profile';
        } else {
          setError(result.data?.message || result.error || 'Invalid OTP');
        }
      } catch {
        setError('Network error. Please try again.');
      }
      setIsLoading(false);
    }
  };
  
  const handleResendOtp = async () => {
    setShowResend(false);
    setCountdown(30);
    setError('');
    try {
      const result = await authApi.sendOtp(phone);
      if (result.data?.otp) {
        setDevOtp(result.data.otp);
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-violet-50">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 grid-pattern opacity-10" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Form */}
        <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
          {/* Header */}
          <header className="p-4 sm:p-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-violet-600 rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-xl sm:text-2xl font-bold text-white">N</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold gradient-text">Naploo</span>
            </Link>
            <Link 
              href="/" 
              className="flex items-center gap-2 text-slate-400 hover:text-slate-800 transition text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
          </header>

          {/* Form Content */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
              {step === 'phone' ? (
                <div className="space-y-6 sm:space-y-8">
                  <div className="text-center lg:text-left">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-2">
                      Welcome Back
                    </h1>
                    <p className="text-slate-500 text-sm sm:text-base">
                      Enter your phone number to continue
                    </p>
                  </div>

                  <form onSubmit={handlePhoneSubmit} className="space-y-5 sm:space-y-6">
                    <div>
                      <label className="block text-slate-600 text-sm mb-2">Phone Number</label>
                      <div className="relative">
                        <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 sm:gap-2 text-slate-400">
                          <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-sm sm:text-base">+91</span>
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                          className="w-full bg-white border border-gray-200 rounded-xl pl-20 sm:pl-24 pr-4 py-3.5 sm:py-4 text-slate-800 text-base sm:text-lg placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                          placeholder="98765 43210"
                          required
                        />
                      </div>
                      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={phone.length < 10 || isLoading}
                      className="w-full bg-gradient-to-r from-primary-500 to-violet-600 text-white py-3.5 sm:py-4 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center gap-2 text-slate-400 text-xs sm:text-sm">
                    <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Your data is protected with 256-bit encryption</span>
                  </div>

                  {/* Sign Up Link */}
                  <p className="text-center text-slate-500 text-sm sm:text-base">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="text-primary-600 hover:text-primary-500 font-medium transition">
                      Sign Up
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="space-y-6 sm:space-y-8">
                  <button
                    onClick={() => setStep('phone')}
                    className="text-slate-400 hover:text-slate-800 flex items-center gap-2 transition text-sm sm:text-base"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>

                  <div className="text-center lg:text-left">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-2">
                      Verify OTP
                    </h1>
                    <p className="text-slate-500 text-sm sm:text-base">
                      Enter the 6-digit code sent to{' '}
                      <span className="text-slate-800 font-medium">+91 {phone}</span>
                    </p>
                    {devOtp && (
                      <p className="text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs mt-2">
                        Dev Mode OTP: <span className="font-bold font-mono">{devOtp}</span>
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleOtpSubmit} className="space-y-5 sm:space-y-6">
                    <div>
                      <label className="block text-slate-600 text-sm mb-3 sm:mb-4">Enter OTP</label>
                      <div className="flex gap-2 sm:gap-3">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            ref={el => { otpInputs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className="w-full aspect-square max-w-[50px] sm:max-w-[56px] bg-white border border-gray-200 rounded-lg sm:rounded-xl text-slate-800 text-lg sm:text-2xl font-bold text-center focus:outline-none focus:border-primary-500 transition"
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
                          className="text-primary-600 hover:text-primary-500 transition text-sm sm:text-base"
                        >
                          Resend OTP
                        </button>
                      ) : (
                        <p className="text-slate-400 text-sm sm:text-base">
                          Resend OTP in <span className="text-primary-600">{countdown}s</span>
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={otp.join('').length < 6 || isLoading}
                      className="w-full bg-gradient-to-r from-primary-500 to-violet-600 text-white py-3.5 sm:py-4 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify & Login
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        </>
                      )}
                    </button>
                    {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 relative overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/Pods_Images/For Website main images/Main Pods Image.png"
              alt="Naploo Sleep Pod"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-gray-50/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-slate-900/40" />
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col justify-end p-8 xl:p-12">
            {/* Feature Cards */}
            <div className="space-y-4 mb-8">
              <div className="glass-card p-4 rounded-xl flex items-center gap-4 backdrop-blur-xl">
                <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Moon className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">24/7 Availability</p>
                  <p className="text-white/60 text-sm">Book pods anytime, anywhere</p>
                </div>
              </div>
              
              <div className="glass-card p-4 rounded-xl flex items-center gap-4 backdrop-blur-xl">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bed className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">Premium Comfort</p>
                  <p className="text-white/60 text-sm">Climate control & smart amenities</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl xl:text-3xl font-bold gradient-text">150+</p>
                <p className="text-white/50 text-xs xl:text-sm">Locations</p>
              </div>
              <div className="text-center">
                <p className="text-2xl xl:text-3xl font-bold gradient-text">10K+</p>
                <p className="text-white/50 text-xs xl:text-sm">Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl xl:text-3xl font-bold gradient-text">4.9★</p>
                <p className="text-white/50 text-xs xl:text-sm">Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Feature */}
        <div className="lg:hidden p-4 pb-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-6 text-center">
            <div>
              <p className="text-lg font-bold gradient-text">150+</p>
              <p className="text-slate-400 text-xs">Locations</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <p className="text-lg font-bold gradient-text">10K+</p>
              <p className="text-slate-400 text-xs">Users</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <p className="text-lg font-bold gradient-text">4.9★</p>
              <p className="text-slate-400 text-xs">Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
