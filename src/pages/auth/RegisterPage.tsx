/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, User, Mail, Phone, MapPin, Briefcase, Users,
  Lock, Eye, EyeOff, CheckCircle, ArrowLeft, ArrowRight,
  X, Clock, Sun, Moon, Shield, Zap, Globe, Smartphone
} from 'lucide-react';
import { useRegistrationsStore } from '@/stores/useRegistrationsStore';
import { useAppStore } from '@/stores/useAppStore';

interface CompanyInfo {
  companyName: string;
  companyEmail: string;
  contactNumber: string;
  address: string;
  industryType: string;
  companySize: string;
}

interface HRAdminInfo {
  fullName: string;
  position: string;
  email: string;
  contactNumber: string;
  password: string;
  confirmPassword: string;
}

interface SubscriptionInfo {
  plan: string;
  startTrial: boolean;
}

interface AgreementInfo {
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useAppStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: '',
    companyEmail: '',
    contactNumber: '',
    address: '',
    industryType: '',
    companySize: '',
  });

  const [hrAdminInfo, setHRAdminInfo] = useState<HRAdminInfo>({
    fullName: '',
    position: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    plan: 'professional',
    startTrial: true,
  });

  const [agreementInfo, setAgreementInfo] = useState<AgreementInfo>({
    acceptTerms: false,
    acceptPrivacy: false,
  });

  const industryTypes = [
    'Technology & IT',
    'Healthcare & Medical',
    'Manufacturing',
    'Retail & E-commerce',
    'Financial Services',
    'Education',
    'Construction',
    'Hospitality & Tourism',
    'Agriculture',
    'Transportation & Logistics',
    'Real Estate',
    'Telecommunications',
    'Food & Beverage',
    'Media & Entertainment',
    'Government',
    'Non-Profit',
    'Other',
  ];

  const companySizes = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-100', label: '51-100 employees' },
    { value: '101-250', label: '101-250 employees' },
    { value: '251-500', label: '251-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' },
  ];

  const steps = [
    { number: 1, title: 'Company', icon: Building2 },
    { number: 2, title: 'HR Admin', icon: User },
    { number: 3, title: 'Trial Plan', icon: Clock },
    { number: 4, title: 'Confirm', icon: CheckCircle },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!companyInfo.companyName.trim()) newErrors.companyName = 'Please enter your company name.';
      if (!companyInfo.companyEmail.trim()) newErrors.companyEmail = 'Please enter a valid company email address.';
      else if (!/\S+@\S+\.\S+/.test(companyInfo.companyEmail)) newErrors.companyEmail = 'Please enter a valid email address (e.g. company@example.com).';
      if (!companyInfo.contactNumber.trim()) newErrors.contactNumber = 'Please enter a contact number.';
      if (!companyInfo.address.trim()) newErrors.address = 'Please enter your company address.';
      if (!companyInfo.industryType) newErrors.industryType = 'Please select your industry type.';
      if (!companyInfo.companySize) newErrors.companySize = 'Please select your company size.';
    }

    if (step === 2) {
      if (!hrAdminInfo.fullName.trim()) newErrors.fullName = 'Please enter your full name.';
      if (!hrAdminInfo.position.trim()) newErrors.position = 'Please enter your position or job title.';
      if (!hrAdminInfo.email.trim()) newErrors.email = 'Please enter your email address.';
      else if (!/\S+@\S+\.\S+/.test(hrAdminInfo.email)) newErrors.email = 'Please enter a valid email address (e.g. hr@company.com).';
      if (!hrAdminInfo.contactNumber.trim()) newErrors.hrContactNumber = 'Please enter your contact number.';
      if (!hrAdminInfo.password) newErrors.password = 'Please create a password.';
      else if (hrAdminInfo.password.length < 8) newErrors.password = 'Password must be at least 8 characters long.';
      if (hrAdminInfo.password !== hrAdminInfo.confirmPassword) newErrors.confirmPassword = 'Passwords do not match. Please try again.';
    }

    if (step === 3) {
      if (!agreementInfo.acceptTerms) newErrors.acceptTerms = 'You must accept the Terms & Conditions to continue.';
      if (!agreementInfo.acceptPrivacy) newErrors.acceptPrivacy = 'You must accept the Privacy Policy to continue.';
    }

    if (step === 4) {
      // No additional validation — step 3 already captured T&C acceptance
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
    // Get the addRegistration function from the store
    const { addRegistration } = useRegistrationsStore.getState();
    
    // Add registration to the store
    await addRegistration({
      // Company Info
      companyName: companyInfo.companyName,
      companyEmail: companyInfo.companyEmail,
      companyPhone: companyInfo.contactNumber,
      address: companyInfo.address,
      industryType: companyInfo.industryType,
      companySize: companyInfo.companySize,
      // HR Admin Info
      hrAdminName: hrAdminInfo.fullName,
      hrAdminEmail: hrAdminInfo.email,
      hrAdminPhone: hrAdminInfo.contactNumber,
      hrAdminPosition: hrAdminInfo.position,
      hrAdminPassword: hrAdminInfo.password,
      // Subscription
      requestedPlan: subscriptionInfo.plan as 'starter' | 'professional' | 'enterprise',
      startTrial: subscriptionInfo.startTrial,
    });
    
    // Simulate small delay for UI feedback
    await new Promise(resolve => setTimeout(resolve, 500));

    // Redirect to login with pending approval message
    navigate('/login', { state: { registered: true, pendingApproval: true } });
    } catch (error) {
      console.error('Registration failed:', error);
      setErrors({ submit: 'Registration failed. Please check your connection and try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-neutral-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="SAHOD" 
                className="w-10 h-10 rounded-xl object-contain shadow-lg shadow-primary-500/25"
              />
              <span className="font-heading font-bold text-xl text-neutral-800 dark:text-white">SAHOD</span>
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-neutral-500 dark:text-slate-400 hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
              </button>
              <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                Already have an account? Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back to Landing */}
        <Link to="/" className="inline-flex items-center gap-2 text-neutral-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6">
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-neutral-900 dark:text-white mb-2">
            Create Account
          </h1>
          <p className="text-neutral-600 dark:text-slate-400">
            Register your company and start managing your HR operations with SAHOD
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  currentStep >= step.number
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-neutral-100 text-neutral-400'
                }`}>
                  <step.icon size={24} />
                </div>
                <span className={`text-sm font-medium mt-2 ${
                  currentStep >= step.number ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400 dark:text-slate-600'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`hidden sm:block w-24 h-1 mx-4 rounded ${
                  currentStep > step.number ? 'bg-primary-500' : 'bg-neutral-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-neutral-100 dark:border-slate-700 p-8">
          {/* Step 1: Company Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Company Information</h2>
                  <p className="text-sm text-neutral-500 dark:text-slate-400">Tell us about your company</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyInfo.companyName}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                    placeholder="Enter company name"
                    className={`form-input ${errors.companyName ? 'border-red-500' : ''}`}
                  />
                  {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Company Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="email"
                      value={companyInfo.companyEmail}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, companyEmail: e.target.value })}
                      placeholder="company@example.com"
                      className={`form-input pl-10 ${errors.companyEmail ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.companyEmail && <p className="text-red-500 text-sm mt-1">{errors.companyEmail}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="tel"
                      value={companyInfo.contactNumber}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, contactNumber: e.target.value })}
                      placeholder="+63 912 345 6789"
                      className={`form-input pl-10 ${errors.contactNumber ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Industry Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <select
                      value={companyInfo.industryType}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, industryType: e.target.value })}
                      className={`form-select pl-10 ${errors.industryType ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select industry</option>
                      {industryTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  {errors.industryType && <p className="text-red-500 text-sm mt-1">{errors.industryType}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Company Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
                    <textarea
                      value={companyInfo.address}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                      placeholder="Enter complete company address"
                      rows={2}
                      className={`form-input pl-10 ${errors.address ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Company Size <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <select
                      value={companyInfo.companySize}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, companySize: e.target.value })}
                      className={`form-select pl-10 ${errors.companySize ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select company size</option>
                      {companySizes.map((size) => (
                        <option key={size.value} value={size.value}>{size.label}</option>
                      ))}
                    </select>
                  </div>
                  {errors.companySize && <p className="text-red-500 text-sm mt-1">{errors.companySize}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: HR Admin Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">HR Admin Information</h2>
                  <p className="text-sm text-neutral-500 dark:text-slate-400">This person will be the HR Client administrator</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={hrAdminInfo.fullName}
                    onChange={(e) => setHRAdminInfo({ ...hrAdminInfo, fullName: e.target.value })}
                    placeholder="Enter full name"
                    className={`form-input ${errors.fullName ? 'border-red-500' : ''}`}
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={hrAdminInfo.position}
                      onChange={(e) => setHRAdminInfo({ ...hrAdminInfo, position: e.target.value })}
                      placeholder="e.g. HR Manager, Director of HR"
                      className={`form-input pl-10 ${errors.position ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="email"
                      value={hrAdminInfo.email}
                      onChange={(e) => setHRAdminInfo({ ...hrAdminInfo, email: e.target.value })}
                      placeholder="hr@company.com"
                      className={`form-input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="tel"
                      value={hrAdminInfo.contactNumber}
                      onChange={(e) => setHRAdminInfo({ ...hrAdminInfo, contactNumber: e.target.value })}
                      placeholder="+63 912 345 6789"
                      className={`form-input pl-10 ${errors.hrContactNumber ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.hrContactNumber && <p className="text-red-500 text-sm mt-1">{errors.hrContactNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={hrAdminInfo.password}
                      onChange={(e) => setHRAdminInfo({ ...hrAdminInfo, password: e.target.value })}
                      placeholder="Create a password"
                      className={`form-input pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={hrAdminInfo.confirmPassword}
                      onChange={(e) => setHRAdminInfo({ ...hrAdminInfo, confirmPassword: e.target.value })}
                      placeholder="Confirm your password"
                      className={`form-input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: 30-Day Free Trial */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Hero Banner */}
              <div className="text-center p-8 bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/20 dark:to-slate-700 rounded-2xl border border-primary-100 dark:border-primary-800">
                <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full mb-3">
                  NO CREDIT CARD REQUIRED
                </span>
                <h2 className="text-2xl font-heading font-bold text-neutral-900 dark:text-white mb-2">
                  Your 30-Day Free Trial
                </h2>
                <p className="text-neutral-600 dark:text-slate-400 max-w-md mx-auto">
                  Get full access to all SAHOD features — completely free for 30 days. Start right away after approval.
                </p>
              </div>

              {/* Why 30 Days */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                  Why do we offer a 30-day trial?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      icon: Building2,
                      title: 'Set Up Your Company',
                      desc: 'Configure your company profile, departments, and positions without any time pressure.',
                      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                    },
                    {
                      icon: Users,
                      title: 'Onboard Employees',
                      desc: 'Add your team, assign roles, and get familiar with the full employee management system.',
                      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
                    },
                    {
                      icon: Zap,
                      title: 'Run Your First Payroll',
                      desc: 'Process a complete payroll cycle — including deductions, contributions, and payslips.',
                      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
                    },
                  ].map(({ icon: Icon, title, desc, color }) => (
                    <div key={title} className="p-5 rounded-xl border border-neutral-100 dark:border-slate-600 bg-white dark:bg-slate-700/50 space-y-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                        <Icon size={20} />
                      </div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">{title}</h4>
                      <p className="text-xs text-neutral-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* What's Included */}
              <div className="p-6 bg-neutral-50 dark:bg-slate-700/30 rounded-xl border border-neutral-100 dark:border-slate-700">
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  What's included in your trial
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Users, label: 'Employee Management' },
                    { icon: Zap, label: 'Payroll Processing' },
                    { icon: Shield, label: 'Gov\'t Compliance' },
                    { icon: Globe, label: 'Cloud Access' },
                    { icon: Smartphone, label: 'Mobile-Friendly' },
                    { icon: Clock, label: 'Attendance Tracking' },
                    { icon: Building2, label: 'Leave Management' },
                    { icon: CheckCircle, label: 'Reports & Analytics' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 p-3 bg-white dark:bg-slate-700 rounded-lg border border-neutral-100 dark:border-slate-600 text-xs text-neutral-700 dark:text-slate-300 font-medium">
                      <Icon size={14} className="text-primary-500 shrink-0" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* After 30 Days */}
              <div className="p-5 rounded-xl border border-neutral-200 dark:border-slate-600 bg-white dark:bg-slate-700/30">
                <h3 className="font-semibold text-neutral-900 dark:text-white text-sm mb-3">What happens after 30 days?</h3>
                <div className="space-y-2 text-sm text-neutral-600 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                    <span>Your data is <strong className="text-neutral-800 dark:text-slate-200">always safe</strong> — nothing is deleted at the end of your trial.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                    <span>Our team will reach out with a <strong className="text-neutral-800 dark:text-slate-200">tailored subscription quote</strong> based on your company size.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                    <span>You choose when and if to upgrade — <strong className="text-neutral-800 dark:text-slate-200">no automatic charges</strong>.</span>
                  </div>
                </div>
              </div>

              {/* T&C Checkboxes */}
              <div className="space-y-3 pt-2">
                <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Before you continue</h3>
                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  errors.acceptTerms ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-neutral-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={agreementInfo.acceptTerms}
                    onChange={(e) => setAgreementInfo({ ...agreementInfo, acceptTerms: e.target.checked })}
                    className="w-5 h-5 mt-0.5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="font-medium text-neutral-900 dark:text-white text-sm">
                      I accept the <a href="#" className="text-primary-600 hover:underline">Terms & Conditions</a>
                    </span>
                    <p className="text-xs text-neutral-500 dark:text-slate-400 mt-0.5">
                      By checking this box, you agree to abide by SAHOD's terms of service.
                    </p>
                  </div>
                </label>
                {errors.acceptTerms && <p className="text-red-500 text-sm">{errors.acceptTerms}</p>}

                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  errors.acceptPrivacy ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-neutral-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={agreementInfo.acceptPrivacy}
                    onChange={(e) => setAgreementInfo({ ...agreementInfo, acceptPrivacy: e.target.checked })}
                    className="w-5 h-5 mt-0.5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="font-medium text-neutral-900 dark:text-white text-sm">
                      I accept the <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
                    </span>
                    <p className="text-xs text-neutral-500 dark:text-slate-400 mt-0.5">
                      We handle your data responsibly in compliance with the Philippine Data Privacy Act.
                    </p>
                  </div>
                </label>
                {errors.acceptPrivacy && <p className="text-red-500 text-sm">{errors.acceptPrivacy}</p>}
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Review &amp; Confirm</h2>
                  <p className="text-sm text-neutral-500 dark:text-slate-400">Review your registration details before submitting</p>
                </div>
              </div>

              {/* Summary */}
              <div className="p-6 bg-neutral-50 dark:bg-slate-700/30 rounded-xl border border-neutral-100 dark:border-slate-700 space-y-5">
                <h3 className="font-semibold text-neutral-900 dark:text-white">Registration Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-neutral-500 dark:text-slate-400 text-xs uppercase tracking-wider">Company</p>
                    <p className="font-semibold text-neutral-900 dark:text-white">{companyInfo.companyName}</p>
                    <p className="text-neutral-600 dark:text-slate-400">{companyInfo.companyEmail}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-neutral-500 dark:text-slate-400 text-xs uppercase tracking-wider">HR Admin</p>
                    <p className="font-semibold text-neutral-900 dark:text-white">{hrAdminInfo.fullName}</p>
                    <p className="text-neutral-600 dark:text-slate-400">{hrAdminInfo.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-neutral-500 dark:text-slate-400 text-xs uppercase tracking-wider">Industry</p>
                    <p className="font-semibold text-neutral-900 dark:text-white">{companyInfo.industryType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-neutral-500 dark:text-slate-400 text-xs uppercase tracking-wider">Company Size</p>
                    <p className="font-semibold text-neutral-900 dark:text-white">{companyInfo.companySize} employees</p>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <p className="text-neutral-500 dark:text-slate-400 text-xs uppercase tracking-wider">Plan</p>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900 dark:text-white">30-Day Free Trial</span>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">
                        No credit card required
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What Happens Next */}
              <div className="p-5 rounded-xl border border-primary-100 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
                <h3 className="font-semibold text-primary-900 dark:text-primary-300 text-sm mb-3">What happens after you submit?</h3>
                <div className="space-y-2">
                  {[
                    'Your registration will be reviewed by the SAHOD team.',
                    'You\'ll receive an email confirmation once your account is approved.',
                    'Your 30-day free trial begins from the date of approval.',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-primary-800 dark:text-primary-300">
                      <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col mt-8 pt-6 border-t border-neutral-100 dark:border-slate-700 gap-4">
            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
                <X size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            )}
            <div className="flex items-center justify-between">
            {currentStep > 1 ? (
              <button onClick={handleBack} className="btn btn-secondary">
                <ArrowLeft size={18} />
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button onClick={handleNext} className="btn btn-primary">
                Continue
                <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            )}
            </div>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-neutral-500 dark:text-slate-500 mt-6">
          Need help? Contact us at <a href="mailto:support@sahod.ph" className="text-primary-600 hover:underline">support@sahod.ph</a>
        </p>
      </div>
    </div>
  );
}
