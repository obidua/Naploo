"use client";


import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { 
  Phone, ArrowRight, Shield, User, Mail, 
  CheckCircle, Loader2, ArrowLeft, Moon, Bed, Check
} from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

type Step = 'details' | 'phone' | 'otp';

export default function SignupPage() {
  const { setUser, setTokens } = useAuthStore();
  const [step, setStep] = useState<Step>('details');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');
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
    if (formData.name && formData.email && agreedToTerms) {
      setStep('phone');
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length >= 10) {
      setIsLoading(true);
      setError('');
      try {
        const res = await authApi.sendOtp(formData.phone);
        if (res.data?.success) {
          if (res.data.otp) setDevOtp(res.data.otp);
          setStep('otp');
          setCountdown(30);
          setShowResend(false);
        } else {
          setError(res.data?.message || res.error || 'Failed to send OTP');
        }
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResendOtp = async () => {
    setShowResend(false);
    setCountdown(30);
    setError('');
    try {
      const res = await authApi.sendOtp(formData.phone);
      if (res.data?.otp) setDevOtp(res.data.otp);
    } catch {}
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
    if (otp.join('').length === 6) {
      setIsLoading(true);
      setError('');
      try {
        const res = await authApi.verifyOtp(formData.phone, otp.join(''), formData.name, formData.email);
        if (res.data?.success) {
          const userData = res.data.user;
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
          setTokens(res.data.accessToken, res.data.refreshToken);
          window.location.href = '/';
        } else {
          setError(res.data?.message || res.error || 'Invalid OTP');
        }
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStepNumber = () => {
    switch (step) {
      case 'details': return 1;
      case 'phone': return 2;
      case 'otp': return 3;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-violet-50">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-primary-500/5 rounded-full blur-3xl" />
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

          {/* Progress Indicator */}
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto lg:mx-0">
              <div className="flex items-center justify-between mb-2">
                {['Details', 'Phone', 'Verify'].map((label, index) => (
                  <div key={label} className="flex items-center">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all ${
                      getStepNumber() > index + 1 
                        ? 'bg-green-500 text-white' 
                        : getStepNumber() === index + 1 
                          ? 'bg-gradient-to-r from-primary-500 to-violet-600 text-white' 
                          : 'bg-gray-200 text-slate-400'
                    }`}>
                      {getStepNumber() > index + 1 ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : index + 1}
                    </div>
                    {index < 2 && (
                      <div className={`w-12 sm:w-16 lg:w-20 h-0.5 mx-1 sm:mx-2 transition-all ${
                        getStepNumber() > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] sm:text-xs text-slate-400">
                <span>Details</span>
                <span className="ml-2 sm:ml-4">Phone</span>
                <span>Verify</span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
              {step === 'details' && (
                <div className="space-y-5 sm:space-y-6">
                  <div className="text-center lg:text-left">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-2">
                      Create Account
                    </h1>
                    <p className="text-slate-500 text-sm sm:text-base">
                      Join Naploo for premium rest experience
                    </p>
                  </div>

                  <form onSubmit={handleDetailsSubmit} className="space-y-4 sm:space-y-5">
                    <div>
                      <label className="block text-slate-600 text-sm mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-xl pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition text-sm sm:text-base"
                          placeholder="Enter your name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 text-sm mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-xl pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition text-sm sm:text-base"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <div className="relative mt-0.5">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          agreedToTerms 
                            ? 'bg-primary-500 border-primary-500' 
                            : 'border-gray-300 bg-transparent'
                        }`}>
                          {agreedToTerms && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      <span className="text-slate-500 text-xs sm:text-sm">
                        I agree to the{' '}
                        <Link href="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={!formData.name || !formData.email || !agreedToTerms}
                      className="w-full bg-gradient-to-r from-primary-500 to-violet-600 text-white py-3 sm:py-3.5 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </form>

                  <p className="text-center text-slate-500 text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary-600 hover:text-primary-500 font-medium transition">
                      Login
                    </Link>
                  </p>
                </div>
              )}

              {step === 'phone' && (
                <div className="space-y-5 sm:space-y-6">
                  <button
                    onClick={() => setStep('details')}
                    className="text-slate-400 hover:text-slate-800 flex items-center gap-2 transition text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>

                  <div className="text-center lg:text-left">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-2">
                      Phone Number
                    </h1>
                    <p className="text-slate-500 text-sm sm:text-base">
                      We&apos;ll send you a verification code
                    </p>
                  </div>

                  <form onSubmit={handlePhoneSubmit} className="space-y-4 sm:space-y-5">
                    <div>
                      <label className="block text-slate-600 text-sm mb-2">Phone Number</label>
                      <div className="relative">
                        <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 sm:gap-2 text-slate-400">
                          <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-sm">+91</span>
                        </div>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          className="w-full bg-white border border-gray-200 rounded-xl pl-20 sm:pl-24 pr-4 py-3 sm:py-3.5 text-slate-800 text-base sm:text-lg placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition"
                          placeholder="98765 43210"
                          required
                        />
                      </div>
                      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={formData.phone.length < 10 || isLoading}
                      className="w-full bg-gradient-to-r from-primary-500 to-violet-600 text-white py-3 sm:py-3.5 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          Send OTP
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {step === 'otp' && (
                <div className="space-y-5 sm:space-y-6">
                  <button
                    onClick={() => setStep('phone')}
                    className="text-slate-400 hover:text-slate-800 flex items-center gap-2 transition text-sm"
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
                      <span className="text-slate-800 font-medium">+91 {formData.phone}</span>
                    </p>
                    {devOtp && (
                      <p className="text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs mt-2">
                        Dev Mode OTP: <span className="font-bold font-mono">{devOtp}</span>
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleOtpSubmit} className="space-y-4 sm:space-y-5">
                    <div>
                      <label className="block text-slate-600 text-sm mb-3">Enter OTP</label>
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
                            className="w-full aspect-square max-w-[46px] sm:max-w-[52px] bg-white border border-gray-200 rounded-lg sm:rounded-xl text-slate-800 text-lg sm:text-2xl font-bold text-center focus:outline-none focus:border-primary-500 transition"
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
                          className="text-primary-600 hover:text-primary-500 transition text-sm"
                        >
                          Resend OTP
                        </button>
                      ) : (
                        <p className="text-slate-400 text-sm">
                          Resend OTP in <span className="text-primary-600">{countdown}s</span>
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={otp.join('').length < 6 || isLoading}
                      className="w-full bg-gradient-to-r from-primary-500 to-violet-600 text-white py-3 sm:py-3.5 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
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
            {/* Benefits */}
            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Why Join Naploo?</h3>
              {[
                { icon: Moon, title: 'Instant Booking', desc: 'Book pods in seconds' },
                { icon: Bed, title: 'Premium Comfort', desc: 'Climate-controlled pods' },
                { icon: Shield, title: 'Safe & Secure', desc: 'Your privacy matters' },
              ].map((item, i) => (
                <div key={i} className="glass-card p-4 rounded-xl flex items-center gap-4 backdrop-blur-xl">
                  <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-white/60 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
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
                <p className="text-2xl xl:text-3xl font-bold gradient-text">4.9</p>
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
              <p className="text-lg font-bold gradient-text">4.9</p>
              <p className="text-slate-400 text-xs">Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
