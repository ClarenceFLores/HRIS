/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Calendar, FileText, Clock, AlertCircle, 
  CheckCircle, Loader2, Info, CalendarDays
} from 'lucide-react';

const leaveTypes = [
  { value: 'vacation', label: 'Vacation Leave', description: 'Annual leave for rest and recreation', days: 15, icon: '🏖️' },
  { value: 'sick', label: 'Sick Leave', description: 'For medical conditions and appointments', days: 10, icon: '🏥' },
  { value: 'emergency', label: 'Emergency Leave', description: 'Unforeseen urgent situations', days: 3, icon: '🚨' },
  { value: 'maternity', label: 'Maternity Leave', description: 'For expecting mothers (105 days)', days: 105, icon: '👶' },
  { value: 'paternity', label: 'Paternity Leave', description: 'For new fathers (7 days)', days: 7, icon: '👨‍👧' },
  { value: 'bereavement', label: 'Bereavement Leave', description: 'Death of immediate family member', days: 5, icon: '🕯️' },
];

export function LeaveRequestPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate number of days
  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
  };

  const selectedLeaveType = leaveTypes.find(t => t.value === formData.leaveType);
  const numberOfDays = calculateDays();

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'leaveType':
        return value ? '' : 'Please select a leave type';
      case 'startDate':
        return value ? '' : 'Start date is required';
      case 'endDate':
        if (!value) return 'End date is required';
        if (formData.startDate && new Date(value) < new Date(formData.startDate)) {
          return 'End date cannot be before start date';
        }
        return '';
      case 'reason':
        if (!value.trim()) return 'Please provide a reason for your leave';
        if (value.trim().length < 10) return 'Please provide more details (min 10 characters)';
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof typeof formData]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    setTouched({ leaveType: true, startDate: true, endDate: true, reason: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      navigate('/leaves');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in">
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500 text-white rounded-xl shadow-lg">
            <CheckCircle size={20} />
            <span className="font-medium">Leave request submitted successfully!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`flex items-center gap-4 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <button 
          onClick={() => navigate('/leaves')} 
          className="p-2.5 hover:bg-neutral-100 rounded-xl transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-neutral-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-heading font-bold text-neutral-900">File Leave Request</h1>
          <p className="text-neutral-500 text-sm mt-1">Submit your leave request for approval</p>
        </div>
      </div>

      {/* Leave Balance Info */}
      <div className={`card p-4 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-100 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Info className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-primary-900">Your Leave Balance</h3>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              <span className="text-primary-700">Vacation: <strong>10 days</strong></span>
              <span className="text-primary-700">Sick: <strong>8 days</strong></span>
              <span className="text-primary-700">Emergency: <strong>3 days</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={`space-y-6 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Leave Type Selection */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900">Leave Type</h2>
              <p className="text-sm text-neutral-500">Select the type of leave you want to apply for</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {leaveTypes.map((type) => (
              <label
                key={type.value}
                className={`relative flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm ${
                  formData.leaveType === type.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="leaveType"
                  value={type.value}
                  checked={formData.leaveType === type.value}
                  onChange={(e) => handleChange('leaveType', e.target.value)}
                  onBlur={() => handleBlur('leaveType')}
                  className="sr-only"
                />
                <span className="text-2xl">{type.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">{type.label}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{type.description}</p>
                  <p className="text-xs text-primary-600 mt-1 font-medium">Max {type.days} days/year</p>
                </div>
                {formData.leaveType === type.value && (
                  <CheckCircle className="w-5 h-5 text-primary-500 absolute top-3 right-3" />
                )}
              </label>
            ))}
          </div>
          {errors.leaveType && touched.leaveType && (
            <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.leaveType}
            </p>
          )}
        </div>

        {/* Date Selection */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900">Leave Duration</h2>
              <p className="text-sm text-neutral-500">Select start and end dates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date <span className="text-red-500">*</span></label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  onBlur={() => handleBlur('startDate')}
                  min={new Date().toISOString().split('T')[0]}
                  className={`input pl-10 ${errors.startDate && touched.startDate ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.startDate && touched.startDate && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.startDate}
                </p>
              )}
            </div>
            <div>
              <label className="label">End Date <span className="text-red-500">*</span></label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  onBlur={() => handleBlur('endDate')}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className={`input pl-10 ${errors.endDate && touched.endDate ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.endDate && touched.endDate && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Days Summary */}
          {numberOfDays > 0 && (
            <div className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-primary-900">Total Leave Duration</span>
                </div>
                <span className="text-2xl font-bold text-primary-600">{numberOfDays} day{numberOfDays > 1 ? 's' : ''}</span>
              </div>
            </div>
          )}
        </div>

        {/* Reason */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900">Reason for Leave</h2>
              <p className="text-sm text-neutral-500">Provide details for your leave request</p>
            </div>
          </div>

          <div>
            <label className="label">Reason <span className="text-red-500">*</span></label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              onBlur={() => handleBlur('reason')}
              className={`input min-h-[120px] resize-y ${errors.reason && touched.reason ? 'border-red-500' : ''}`}
              placeholder="Please explain the purpose of your leave request..."
              rows={4}
            />
            <div className="flex justify-between mt-1.5">
              {errors.reason && touched.reason ? (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.reason}
                </p>
              ) : (
                <span className="text-xs text-neutral-400">Minimum 10 characters</span>
              )}
              <span className={`text-xs ${formData.reason.length < 10 ? 'text-neutral-400' : 'text-emerald-600'}`}>
                {formData.reason.length} / 500
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            Your request will be sent to your supervisor for approval
          </p>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              type="button" 
              onClick={() => navigate('/leaves')} 
              className="btn btn-secondary flex-1 sm:flex-initial"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn btn-primary flex-1 sm:flex-initial shadow-lg shadow-primary-500/25 min-w-[160px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
