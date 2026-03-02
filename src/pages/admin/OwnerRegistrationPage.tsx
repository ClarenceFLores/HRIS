/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 * 
 * Business Owner Registration Page for System Owner
 */

import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/stores/useAuthStore';
import { Building2, Phone, User, Shield, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OwnerFormData {
  name: string;
  businessName: string;
  phone: string;
  email: string;
  address: string;
  industryType: string;
  businessType: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship' | 'other';
  registrationNumber?: string;
  taxId?: string;
}

export function OwnerRegistrationPage() {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<OwnerFormData>({
    name: '',
    businessName: '',
    phone: '',
    email: '',
    address: '',
    industryType: '',
    businessType: 'corporation',
    registrationNumber: '',
    taxId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.role !== 'system_owner') {
      setMessage({ type: 'error', text: 'Unauthorized: Only system owners can register business owners' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const ownerId = `OWNER-${Date.now()}`;
      
      // Create owner document in Firestore
      await setDoc(doc(db, 'owners', ownerId), {
        id: ownerId,
        name: formData.name,
        businessName: formData.businessName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        industryType: formData.industryType,
        businessType: formData.businessType,
        registrationNumber: formData.registrationNumber,
        taxId: formData.taxId,
        createdAt: new Date(),
        createdBy: user.email,
        isActive: true,
        status: 'active',
      });

      setMessage({ 
        type: 'success', 
        text: `Business owner "${formData.name}" registered successfully!` 
      });
      
      // Reset form
      setFormData({
        name: '',
        businessName: '',
        phone: '',
        email: '',
        address: '',
        industryType: '',
        businessType: 'corporation',
        registrationNumber: '',
        taxId: '',
      });

    } catch (error: any) {
      console.error('Owner registration error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to register business owner' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== 'system_owner') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">Only system owners can access business owner registration.</p>
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Business Owner Registration</h1>
          </div>
          <p className="text-gray-600">Register new business owners in the SAHOD HRIS system</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="owner@business.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="+63 912 345 6789"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter business name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="industryType"
                    value={formData.industryType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select industry</option>
                    {industryTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="corporation">Corporation</option>
                    <option value="llc">LLC</option>
                    <option value="partnership">Partnership</option>
                    <option value="sole_proprietorship">Sole Proprietorship</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Registration Number
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Registration number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax ID
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Tax identification number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter complete business address"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Link
                to="/dashboard"
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Saving...' : 'Register Owner'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}