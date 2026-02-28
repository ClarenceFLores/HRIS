/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Mail, Lock, Shield, Users, Calculator, FileCheck, AlertCircle, CheckCircle2, CheckCircle, Clock, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAppStore } from '@/stores/useAppStore';

// Helper to get dashboard path based on role
const getDashboardPath = (role?: string) => {
  if (role === 'system_owner') return '/app/owner-dashboard';
  return '/app/dashboard';
};

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingMessage, setPendingMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { login, isAuthenticated, user } = useAuthStore();
  const { darkMode, toggleDarkMode } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Animation on mount
  useEffect(() => {
    setMounted(true);
    
    // Load remembered email if "Remember Me" was previously checked
    const rememberPref = localStorage.getItem('sahod-remember');
    if (rememberPref === 'true') {
      const rememberedEmail = localStorage.getItem('sahod-remembered-email');
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  // Check for registration success
  useEffect(() => {
    if (location.state?.registered) {
      if (location.state?.pendingApproval) {
        setPendingMessage('Your account has been submitted for review. Our team will review your registration and you will receive an email once approved. Your 30-day trial will begin after approval.');
      } else {
        setSuccessMessage('Your account has been created successfully! Please login with your credentials.');
      }
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDashboardPath(user.role));
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password, rememberMe);
      // Persist email for next visit when remember me is checked
      if (rememberMe) {
        localStorage.setItem('sahod-remembered-email', email);
      } else {
        localStorage.removeItem('sahod-remembered-email');
      }
      // Get the updated user from the store after login
      const currentUser = useAuthStore.getState().user;
      navigate(getDashboardPath(currentUser?.role));
    } catch (err: any) {
      const msg: string = err?.message || '';
      if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('offline')) {
        setError('Unable to connect. Please check your internet connection and try again.');
      } else if (msg.toLowerCase().includes('disabled')) {
        setError('This account has been disabled. Please contact support.');
      } else if (msg.toLowerCase().includes('too-many') || msg.toLowerCase().includes('too many')) {
        setError('Too many failed attempts. Please wait a moment and try again.');
      } else {
        setError('The email or password you entered is incorrect. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Users, title: 'Employee Management', desc: 'Complete 201 file system with document tracking' },
    { icon: Calculator, title: 'Automated Payroll', desc: 'Philippine tax & contributions auto-computed' },
    { icon: Shield, title: 'Leave Management', desc: 'Track VL, SL, and other leave types' },
    { icon: FileCheck, title: 'Compliance Ready', desc: 'SSS, PhilHealth, Pag-IBIG, BIR reports' },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-slate-950 dark:to-slate-900 transition-colors">
      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-neutral-500" />}
      </button>
      {/* Left side - Form */}
      <div className={`flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 transition-all duration-700 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="/logo.png" 
                alt="SAHOD" 
                className="w-14 h-14 rounded-2xl object-contain shadow-lg transform hover:scale-105 transition-transform"
              />
              <div>
                <span className="font-heading font-bold text-2xl text-neutral-800 dark:text-white block">SAHOD</span>
                <span className="text-xs text-neutral-500 dark:text-slate-400 uppercase tracking-wider">Smart Automation Human Operation Data</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-neutral-900 dark:text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-neutral-500 mt-2 text-base">
              Sign in to your account to continue managing your HR operations
            </p>
          </div>

          {/* Success Alert */}
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 animate-in">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-emerald-700">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Pending Approval Alert */}
          {pendingMessage && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 animate-in">
              <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 font-medium text-sm">Account Pending Approval</p>
                <p className="text-sm text-amber-700 mt-1">{pendingMessage}</p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-medium text-sm">Authentication Failed</p>
                <p className="text-red-600 text-sm mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="label flex items-center gap-2">
                <Mail size={14} className="text-neutral-400" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-11 h-12 text-base"
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="label flex items-center gap-2">
                <Lock size={14} className="text-neutral-400" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-11 pr-12 h-12 text-base"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox"
                    id="remember-me"
                    name="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 rounded-md border-2 border-neutral-300 peer-checked:border-primary-500 peer-checked:bg-primary-500 transition-all flex items-center justify-center">
                    {rememberMe && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
                <span className="text-sm text-neutral-600 group-hover:text-neutral-800 transition-colors">Remember me</span>
              </label>
              <button 
                type="button"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline transition-all"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full h-12 text-base font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-all">
              Create Account
            </Link>
          </p>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-neutral-400">
            © 2026 DevSpot. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side - Image/Branding */}
      <div className={`hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-12 items-center justify-center relative overflow-hidden transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="max-w-lg text-center relative z-10">
          <div className="mb-10">
            <h2 className="text-4xl font-heading font-bold text-white mb-4 leading-tight">
              SAHOD<br />
              <span className="text-2xl font-normal text-primary-200">Smart Automation Human Operations Data</span>
            </h2>
            <p className="text-primary-100 text-lg leading-relaxed max-w-md mx-auto">
              Your all-in-one HR platform built for Philippine businesses. 
              Automate payroll, manage employees, and stay compliant effortlessly.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-left">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all duration-300 cursor-default group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <feature.icon className="w-5 h-5 text-primary-200 group-hover:text-white transition-colors" />
                  <div className="text-lg font-bold text-white">{feature.title}</div>
                </div>
                <div className="text-primary-200 text-sm group-hover:text-primary-100 transition-colors">{feature.desc}</div>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="mt-10 flex items-center justify-center gap-6 text-primary-200">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">DOLE Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
