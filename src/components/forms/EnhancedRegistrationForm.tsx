/**
 * SAHOD - Human Resource Information System  
 * © 2026 DevSpot. All rights reserved.
 * 
 * Enhanced Registration Form Component with Expanded Field Data
 */

import React, { useState } from 'react';
import { useRegistrationsStore } from '@/stores/useRegistrationsStore';

interface EnhancedRegistrationFormData {
  // Company Information
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  website: string;
  industryType: string;
  companySize: string;
  foundedYear: number;
  description: string;
  
  // Business Details
  businessRegistrationNumber: string;
  taxId: string;
  businessType: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship' | 'non_profit' | 'other';
  
  // HR Admin Information
  hrAdminName: string;
  hrAdminEmail: string;
  hrAdminPhone: string;
  hrAdminPosition: string;
  hrAdminPassword: string;
  
  // Secondary Contact
  secondaryContactName: string;
  secondaryContactEmail: string;
  secondaryContactPhone: string;
  secondaryContactPosition: string;
  
  // Subscription Details
  requestedPlan: 'starter' | 'professional' | 'enterprise';
  startTrial: boolean;
  expectedEmployeeCount: number;
  
  // Requirements & Features
  requiredFeatures: string[];
  integrationsNeeded: string[];
  currentHRSystem: string;
  migrationRequired: boolean;
  
  // Additional Info
  sourceChannel: 'website' | 'referral' | 'marketing' | 'direct';
  referralSource: string;
  notes: string;
}

export function EnhancedRegistrationForm() {
  const { addRegistration } = useRegistrationsStore();
  const [formData, setFormData] = useState<EnhancedRegistrationFormData>({
    // Company Information
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Philippines',
    website: '',
    industryType: '',
    companySize: '',
    foundedYear: new Date().getFullYear(),
    description: '',
    
    // Business Details
    businessRegistrationNumber: '',
    taxId: '',
    businessType: 'corporation',
    
    // HR Admin Information
    hrAdminName: '',
    hrAdminEmail: '',
    hrAdminPhone: '',
    hrAdminPosition: '',
    hrAdminPassword: '',
    
    // Secondary Contact
    secondaryContactName: '',
    secondaryContactEmail: '',
    secondaryContactPhone: '',
    secondaryContactPosition: '',
    
    // Subscription Details
    requestedPlan: 'starter',
    startTrial: true,
    expectedEmployeeCount: 10,
    
    // Requirements & Features
    requiredFeatures: [],
    integrationsNeeded: [],
    currentHRSystem: '',
    migrationRequired: false,
    
    // Additional Info
    sourceChannel: 'website',
    referralSource: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const registrationData = {
        // Company Info
        companyName: formData.companyName,
        companyEmail: formData.companyEmail,
        companyPhone: formData.companyPhone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        website: formData.website || undefined,
        industryType: formData.industryType,
        companySize: formData.companySize,
        foundedYear: formData.foundedYear || undefined,
        description: formData.description || undefined,
        
        // Business Details
        businessRegistrationNumber: formData.businessRegistrationNumber || undefined,
        taxId: formData.taxId || undefined,
        businessType: formData.businessType,
        
        // HR Admin Info
        hrAdminName: formData.hrAdminName,
        hrAdminEmail: formData.hrAdminEmail,
        hrAdminPhone: formData.hrAdminPhone,
        hrAdminPosition: formData.hrAdminPosition,
        hrAdminPassword: formData.hrAdminPassword,
        
        // Secondary Contact (if provided)
        secondaryContact: formData.secondaryContactName ? {
          name: formData.secondaryContactName,
          email: formData.secondaryContactEmail,
          phone: formData.secondaryContactPhone,
          position: formData.secondaryContactPosition,
        } : undefined,
        
        // Subscription
        requestedPlan: formData.requestedPlan,
        startTrial: formData.startTrial,
        expectedEmployeeCount: formData.expectedEmployeeCount,
        
        // Features & Requirements
        requiredFeatures: formData.requiredFeatures,
        integrationsNeeded: formData.integrationsNeeded.length > 0 ? formData.integrationsNeeded : undefined,
        currentHRSystem: formData.currentHRSystem || undefined,
        migrationRequired: formData.migrationRequired || undefined,
        
        // Additional metadata
        sourceChannel: formData.sourceChannel || undefined,
        referralSource: formData.referralSource || undefined,
        notes: formData.notes || undefined,
        ipAddress: await getClientIP(),
        userAgent: navigator.userAgent,
      };

      await addRegistration(registrationData);
      
      // Show success message or redirect
      alert('Registration submitted successfully! We will review your application and get back to you soon.');
      
      // Reset form
      setFormData({
        companyName: '',
        companyEmail: '',
        companyPhone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Philippines',
        website: '',
        industryType: '',
        companySize: '',
        foundedYear: new Date().getFullYear(),
        description: '',
        businessRegistrationNumber: '',
        taxId: '',
        businessType: 'corporation',
        hrAdminName: '',
        hrAdminEmail: '',
        hrAdminPhone: '',
        hrAdminPosition: '',
        hrAdminPassword: '',
        secondaryContactName: '',
        secondaryContactEmail: '',
        secondaryContactPhone: '',
        secondaryContactPosition: '',
        requestedPlan: 'starter',
        startTrial: true,
        expectedEmployeeCount: 10,
        requiredFeatures: [],
        integrationsNeeded: [],
        currentHRSystem: '',
        migrationRequired: false,
        sourceChannel: 'website',
        referralSource: '',
        notes: '',
      });
      
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof EnhancedRegistrationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Complete Company Registration</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Company Name *</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Industry Type *</label>
              <select
                value={formData.industryType}
                onChange={(e) => updateField('industryType', e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Industry</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="retail">Retail</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Company Size *</label>
              <select
                value={formData.companySize}
                onChange={(e) => updateField('companySize', e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Founded Year</label>
              <input
                type="number"
                value={formData.foundedYear}
                onChange={(e) => updateField('foundedYear', parseInt(e.target.value))}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Company Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of your company..."
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Business Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">State/Province</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => updateField('state', e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Company Email *</label>
              <input
                type="email"
                value={formData.companyEmail}
                onChange={(e) => updateField('companyEmail', e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Company Phone *</label>
              <input
                type="tel"
                value={formData.companyPhone}
                onChange={(e) => updateField('companyPhone', e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* HR Admin Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">HR Administrator Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.hrAdminName}
                onChange={(e) => updateField('hrAdminName', e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Position/Title *</label>
              <input
                type="text"
                value={formData.hrAdminPosition}
                onChange={(e) => updateField('hrAdminPosition', e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email Address *</label>
              <input
                type="email"
                value={formData.hrAdminEmail}
                onChange={(e) => updateField('hrAdminEmail', e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
              <input
                type="tel"
                value={formData.hrAdminPhone}
                onChange={(e) => updateField('hrAdminPhone', e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Password *</label>
              <input
                type="password"
                value={formData.hrAdminPassword}
                onChange={(e) => updateField('hrAdminPassword', e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={8}
                placeholder="Minimum 8 characters"
              />
            </div>
          </div>
        </div>

        {/* Subscription Plan Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Subscription Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-blue-200 rounded-lg p-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="plan"
                  value="starter"
                  checked={formData.requestedPlan === 'starter'}
                  onChange={(e) => updateField('requestedPlan', e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-semibold">Starter Plan</div>
                  <div className="text-sm text-gray-600">Up to 25 employees</div>
                  <div className="text-lg font-bold text-blue-600">₱2,500/month</div>
                </div>
              </label>
            </div>
            
            <div className="border-2 border-blue-200 rounded-lg p-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="plan"
                  value="professional"
                  checked={formData.requestedPlan === 'professional'}
                  onChange={(e) => updateField('requestedPlan', e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-semibold">Professional Plan</div>
                  <div className="text-sm text-gray-600">Up to 100 employees</div>
                  <div className="text-lg font-bold text-blue-600">₱5,000/month</div>
                </div>
              </label>
            </div>
            
            <div className="border-2 border-blue-200 rounded-lg p-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="plan"
                  value="enterprise"
                  checked={formData.requestedPlan === 'enterprise'}
                  onChange={(e) => updateField('requestedPlan', e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-semibold">Enterprise Plan</div>
                  <div className="text-sm text-gray-600">Unlimited employees</div>
                  <div className="text-lg font-bold text-blue-600">₱10,000/month</div>
                </div>
              </label>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.startTrial}
                onChange={(e) => updateField('startTrial', e.target.checked)}
                className="mr-2"
              />
              Start with 30-day free trial
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Helper function to get client IP (placeholder)
async function getClientIP(): Promise<string | undefined> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return undefined;
  }
}