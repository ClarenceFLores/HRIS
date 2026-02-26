/**
 * SAHOD - Human Resource Information System
 * Â© 2026 DevSpot. All rights reserved.
 */

import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  Users, Calculator, Shield, FileCheck, CheckCircle, ArrowRight, 
  Clock, Calendar, Wallet, FileText, BarChart3, Building2,
  Zap, Lock, Globe, Smartphone, ChevronRight, Star, Check, Menu, X,
  Sun, Moon
} from 'lucide-react';
import { usePlanStore } from '@/stores/usePlanStore';
import { useAppStore } from '@/stores/useAppStore';

// Import the SAHOD logo
const sahodLogo = '/logo.png';

export function LandingPage() {
  const location = useLocation();
  const [logoutMessage, setLogoutMessage] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingYearly, setBillingYearly] = useState(false);
  const { plan } = usePlanStore();
  const { darkMode, toggleDarkMode } = useAppStore();

  // Check for logout message
  useEffect(() => {
    if (location.state?.loggedOut) {
      setLogoutMessage('You have successfully logged out.');
      const timer = setTimeout(() => setLogoutMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const features = [
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Complete 201 file management with digital document storage, employee profiles, and organizational charts.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Calculator,
      title: 'Automated Payroll',
      description: 'Automatic computation of SSS, PhilHealth, Pag-IBIG contributions and BIR tax withholding.',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: Clock,
      title: 'Time & Attendance',
      description: 'Track employee attendance, overtime, tardiness, and undertime with detailed reports.',
      color: 'from-amber-500 to-amber-600'
    },
    {
      icon: Calendar,
      title: 'Leave Management',
      description: 'Manage vacation leaves, sick leaves, and other leave types with approval workflows.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: FileText,
      title: 'Government Reports',
      description: 'Generate SSS R-3, PhilHealth RF-1, and Pag-IBIG reports automatically.',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Real-time dashboards and reports to help you make data-driven HR decisions.',
      color: 'from-cyan-500 to-cyan-600'
    },
  ];

  const benefits = [
    { icon: Zap, text: 'Save 80% of manual HR tasks' },
    { icon: Lock, text: '100% Philippine labor law compliant' },
    { icon: Globe, text: 'Access anywhere, anytime' },
    { icon: Smartphone, text: 'Mobile-friendly interface' },
  ];

  const testimonials = [
    {
      name: 'Maria Santos',
      role: 'HR Manager',
      company: 'TechCorp PH',
      text: 'SAHOD transformed our HR operations. Payroll that used to take 3 days now takes 3 hours.',
      rating: 5
    },
    {
      name: 'Juan dela Cruz',
      role: 'Business Owner',
      company: 'JDC Enterprises',
      text: 'Finally, an HRIS that understands Philippine compliance requirements. Highly recommended!',
      rating: 5
    },
    {
      name: 'Anna Reyes',
      role: 'Finance Director',
      company: 'Reyes Group',
      text: 'The automated government reports alone saved us countless hours every month.',
      rating: 5
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      {/* Logout Success Message */}
      {logoutMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle size={20} />
          {logoutMessage}
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/90 backdrop-blur-lg border-b border-neutral-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img 
                src={sahodLogo} 
                alt="SAHOD Logo" 
                className="h-10 w-auto"
              />
              <span className="font-heading font-bold text-xl text-neutral-800 dark:text-white">SAHOD</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-neutral-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">Home</a>
              <a href="#features" className="text-neutral-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-neutral-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">Pricing</a>
              <a href="#about" className="text-neutral-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">About</a>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-full bg-neutral-100 dark:bg-slate-700 hover:bg-neutral-200 dark:hover:bg-slate-600 transition-all hover:scale-105"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-neutral-500" />}
              </button>
              <Link 
                to="/login" 
                className="btn btn-secondary"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="btn btn-primary shadow-lg shadow-primary-500/25"
              >
                Create Account
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-neutral-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
              <div className="flex flex-col gap-4">
                <a href="#home" className="text-neutral-600 dark:text-slate-300 hover:text-primary-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Home</a>
                <a href="#features" className="text-neutral-600 dark:text-slate-300 hover:text-primary-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#pricing" className="text-neutral-600 dark:text-slate-300 hover:text-primary-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                <a href="#about" className="text-neutral-600 dark:text-slate-300 hover:text-primary-600 font-medium" onClick={() => setMobileMenuOpen(false)}>About</a>
                <div className="pt-4 border-t border-neutral-100 dark:border-slate-800 flex flex-col gap-3">
                  <Link to="/login" className="btn btn-secondary w-full justify-center">Login</Link>
                  <Link to="/register" className="btn btn-primary w-full justify-center">Create Account</Link>
                  <button onClick={toggleDarkMode} className="flex items-center gap-2 text-neutral-600 dark:text-slate-300 font-medium">
                    {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary-50/50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
                <Zap size={16} />
                Built for Philippine Businesses
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold text-neutral-900 leading-tight mb-4">
                <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-orange-500 bg-clip-text text-transparent">SAHOD</span>
              </h1>
              <p className="text-xl sm:text-2xl font-medium text-neutral-700 mb-6">
                Smart Automation Human Operations Data
              </p>
              <p className="text-lg text-neutral-600 mb-8 max-w-lg">
                The all-in-one HRIS platform designed for Philippine businesses. Automate payroll, 
                manage employees, and stay compliant with government requirements—effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/register" 
                  className="btn btn-primary btn-lg shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/30 hover:-translate-y-1 transition-all"
                >
                  Start Free Trial
                  <ArrowRight size={20} />
                </Link>
                <Link 
                  to="/login" 
                  className="btn btn-secondary btn-lg"
                >
                  Login to Dashboard
                </Link>
              </div>
              
              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-neutral-500">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <benefit.icon size={18} className="text-primary-500" />
                    <span>{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Hero Image/Graphic */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-8 shadow-2xl shadow-primary-500/25">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">Dashboard Overview</p>
                      <p className="text-sm text-neutral-500">Real-time HR metrics</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-2xl font-bold text-blue-600">156</p>
                      <p className="text-sm text-blue-600/70">Employees</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <p className="text-2xl font-bold text-emerald-600">₱2.1M</p>
                      <p className="text-sm text-emerald-600/70">Monthly Payroll</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl">
                      <p className="text-2xl font-bold text-amber-600">98%</p>
                      <p className="text-sm text-amber-600/70">Attendance</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <p className="text-2xl font-bold text-purple-600">12</p>
                      <p className="text-sm text-purple-600/70">Pending Leaves</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-neutral-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium text-neutral-700">SSS Computed</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-2xl shadow-xl border border-neutral-100">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-500" />
                  <span className="font-medium text-neutral-700">DOLE Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-neutral-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              From employee onboarding to payroll processing, SAHOD handles all your HR needs 
              with Philippine labor law compliance built-in.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 bg-white rounded-2xl border border-neutral-100 hover:border-primary-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-neutral-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-neutral-900 mb-6">
                Philippine Compliance Made Simple
              </h2>
              <p className="text-lg text-neutral-600 mb-8">
                Stop worrying about government reporting deadlines. SAHOD automatically computes 
                and generates all required reports.
              </p>
              
              <div className="space-y-4">
                {[
                  { title: 'SSS Contributions', desc: 'Auto-computed based on latest SSS contribution table' },
                  { title: 'PhilHealth Premium', desc: 'Accurate computation following PhilHealth guidelines' },
                  { title: 'Pag-IBIG Fund', desc: 'Automatic HDMF contribution calculation' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-neutral-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900">{item.title}</h4>
                      <p className="text-sm text-neutral-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Why Choose SAHOD?</h3>
              <div className="space-y-6">
                {[
                  { value: '80%', label: 'Reduction in HR administrative tasks' },
                  { value: '100%', label: 'Compliance with Philippine labor laws' },
                  { value: '3x', label: 'Faster payroll processing' },
                  { value: '24/7', label: 'Access to your HR data' },
                ].map((stat, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-white">{stat.value}</div>
                    <div className="text-primary-100">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== PRICING SECTION ===================== */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-semibold mb-5 border border-emerald-200 dark:border-emerald-800">
              <Check size={14} />
              Simple, Transparent Pricing
            </div>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-neutral-900 dark:text-white mb-4">
              One Plan.<br className="hidden sm:block" /> Everything Included.
            </h2>
            <p className="text-lg text-neutral-500 dark:text-slate-400 max-w-xl mx-auto">
              No per-module fees. No hidden charges. One complete HRIS built specifically for Philippine businesses.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-1 mt-10 p-1.5 bg-neutral-100 dark:bg-slate-800 rounded-xl w-fit mx-auto">
              <button
                onClick={() => setBillingYearly(false)}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  !billingYearly
                    ? 'bg-white dark:bg-slate-700 text-neutral-900 dark:text-white shadow-md'
                    : 'text-neutral-500 dark:text-slate-400 hover:text-neutral-700 dark:hover:text-slate-300'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingYearly(true)}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                  billingYearly
                    ? 'bg-white dark:bg-slate-700 text-neutral-900 dark:text-white shadow-md'
                    : 'text-neutral-500 dark:text-slate-400 hover:text-neutral-700 dark:hover:text-slate-300'
                }`}
              >
                Yearly
                <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                  Save {Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100)}%
                </span>
              </button>
            </div>
          </div>

          {/* Main Price Card */}
          <div className="relative max-w-2xl mx-auto mb-14">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-3xl opacity-20 blur-xl" />

            <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-neutral-200 dark:border-slate-700 shadow-2xl overflow-hidden">
              {/* Trial badge strip */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 py-3 px-6 flex items-center justify-center gap-2">
                <span className="text-white font-semibold text-sm tracking-wide">🎉 30-Day Free Trial — No Credit Card Required</span>
              </div>

              <div className="p-8 sm:p-10">
                {/* Plan header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <img src={sahodLogo} alt="SAHOD" className="w-9 h-9 object-contain" />
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{plan.name}</h3>
                    </div>
                    <p className="text-neutral-500 dark:text-slate-400 text-sm">{plan.description}</p>
                  </div>
                  <span className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-bold rounded-full border border-primary-200 dark:border-primary-800 uppercase tracking-wide">
                    All Features
                  </span>
                </div>

                {/* Price */}
                <div className="mb-8 pb-8 border-b border-neutral-100 dark:border-slate-800">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-bold text-neutral-900 dark:text-white">
                        ₱{(billingYearly
                          ? Math.round(plan.yearlyPrice / 12)
                          : plan.monthlyPrice
                        ).toLocaleString('en-PH')}
                      </span>
                      <div>
                        <div className="text-neutral-500 dark:text-slate-400 text-lg">/month</div>
                        {billingYearly && (
                          <div className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">billed annually</div>
                        )}
                      </div>
                    </div>
                    {billingYearly ? (
                      <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-3 font-medium">
                        ₱{plan.yearlyPrice.toLocaleString('en-PH')}/year — save ₱{((plan.monthlyPrice * 12) - plan.yearlyPrice).toLocaleString('en-PH')}
                      </p>
                    ) : (
                      <p className="text-neutral-400 dark:text-slate-500 text-sm mt-3">
                        Switch to yearly and save {Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100)}%
                      </p>
                    )}
                  </div>
                </div>

                {/* Features 2-column grid */}
                <div className="grid sm:grid-cols-2 gap-2.5 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-sm text-neutral-700 dark:text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  to="/register"
                  className="w-full btn btn-primary justify-center text-base py-4 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Start Your Free 30-Day Trial
                  <ArrowRight size={18} />
                </Link>
                <p className="text-center text-xs text-neutral-400 dark:text-slate-500 mt-3">
                  No credit card required • Cancel anytime • Full access from day 1
                </p>
              </div>
            </div>
          </div>

          {/* Feature Category Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { Icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400', title: 'Employee Mgmt', items: ['201 Files & Profiles', 'Org Charts', 'Onboarding'] },
              { Icon: Calculator, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400', title: 'Payroll', items: ['Overtime & Holiday', '13th Month Pay', 'Loans & Deductions'] },
              { Icon: Shield, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400', title: 'Government', items: ['SSS / PhilHealth', 'Pag-IBIG / BIR'] },
              { Icon: Clock, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400', title: 'Attendance & Leave', items: ['Daily Time Logs', 'Leave Approvals', 'Tardiness Reports'] },
            ].map(({ Icon, color, title, items }, i) => (
              <div key={i} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-neutral-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-md transition-all text-center group">
                <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon size={22} />
                </div>
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{title}</h4>
                <ul className="space-y-1">
                  {items.map((item, j) => (
                    <li key={j} className="text-xs text-neutral-500 dark:text-slate-400">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Guarantee Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center sm:text-left p-6 bg-neutral-50 dark:bg-slate-900 rounded-2xl border border-neutral-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary-500/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">30-Day Free Trial Guarantee</h4>
              <p className="text-neutral-500 dark:text-slate-400 text-sm max-w-md">
                Full access to every feature for 30 days â€” completely free. No credit card required.
                Cancel anytime, no questions asked. If you continue, you'll only be billed after your trial ends.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-neutral-900 dark:text-white mb-4">
              Trusted by Philippine Businesses
            </h2>
            <p className="text-lg text-neutral-500 dark:text-slate-400">
              See what our customers have to say about SAHOD
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="p-6 bg-white rounded-2xl border border-neutral-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-neutral-600 mb-6">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{testimonial.name}</p>
                    <p className="text-sm text-neutral-500">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-500 to-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-6">
            Ready to Transform Your HR Operations?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join hundreds of Philippine businesses already using SAHOD to streamline their HR processes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              Start Free Trial
              <ChevronRight size={20} />
            </Link>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-400/20 text-white font-semibold rounded-xl hover:bg-primary-400/30 transition-all border border-white/20"
            >
              Login to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-neutral-900 text-neutral-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={sahodLogo} 
                  alt="SAHOD Logo" 
                  className="h-10 w-auto"
                />
                <span className="font-heading font-bold text-xl text-white">SAHOD</span>
              </div>
              <p className="text-sm leading-relaxed">
                Smart Automation Human Operations Data - The complete HRIS solution 
                designed specifically for Philippine businesses.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Start Free Trial</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-800 text-center text-sm">
            <p>Â© 2026 DevSpot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
