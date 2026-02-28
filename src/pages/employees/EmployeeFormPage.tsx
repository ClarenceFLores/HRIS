/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, User, Briefcase, Building2, Phone, Mail, 
  Calendar, Banknote, FileText, AlertCircle, CheckCircle, Loader2,
  MapPin, CreditCard, UserCircle
} from 'lucide-react';
import { useHRStore } from '@/stores/useHRStore';
import { useAppStore } from '@/stores/useAppStore';

interface FormErrors {
  [key: string]: string;
}

export function EmployeeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { addEmployee, updateEmployee, getEmployee } = useHRStore();
  const { addToast } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    civilStatus: '',
    address: '',
    city: '',
    // Employment Information
    department: '',
    position: '',
    employmentType: 'regular',
    hireDate: '',
    basicSalary: '',
    // Government IDs
    sssNumber: '',
    philhealthNumber: '',
    pagibigNumber: '',
    tinNumber: '',
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
  });

  // Load existing employee data when editing
  useEffect(() => {
    if (isEditing && id) {
      const emp = getEmployee(id);
      if (emp) {
        setFormData({
          firstName: emp.firstName,
          lastName: emp.lastName,
          middleName: emp.middleName,
          email: emp.email,
          phone: emp.phone,
          birthDate: emp.birthDate,
          gender: emp.gender,
          civilStatus: emp.civilStatus,
          address: emp.address,
          city: emp.city,
          department: emp.department,
          position: emp.position,
          employmentType: emp.employmentType,
          hireDate: emp.hireDate,
          basicSalary: String(emp.basicSalary),
          sssNumber: emp.sssNumber,
          philhealthNumber: emp.philhealthNumber,
          pagibigNumber: emp.pagibigNumber,
          tinNumber: emp.tinNumber,
          emergencyContactName: emp.emergencyContactName,
          emergencyContactPhone: emp.emergencyContactPhone,
          emergencyContactRelation: emp.emergencyContactRelation,
        });
      }
    }
  }, [id, isEditing, getEmployee]);

  // Validation
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return value.trim() ? '' : 'This field is required';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'phone':
        if (value && !/^(\+63|0)?[\d\s-]{10,}$/.test(value.replace(/\s/g, ''))) {
          return 'Invalid phone number format';
        }
        return '';
      case 'department':
        return value ? '' : 'Please select a department';
      case 'position':
        return value.trim() ? '' : 'Position is required';
      case 'hireDate':
        return value ? '' : 'Hire date is required';
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

  const validateForm = (): boolean => {
    const requiredFields = ['firstName', 'lastName', 'email', 'department', 'position', 'hireDate'];
    const newErrors: FormErrors = {};
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setActiveSection('personal');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      middleName: formData.middleName,
      email: formData.email,
      phone: formData.phone,
      birthDate: formData.birthDate,
      gender: formData.gender,
      civilStatus: formData.civilStatus,
      address: formData.address,
      city: formData.city,
      department: formData.department,
      position: formData.position,
      employmentType: formData.employmentType,
      hireDate: formData.hireDate,
      basicSalary: Number(formData.basicSalary) || 0,
      sssNumber: formData.sssNumber,
      philhealthNumber: formData.philhealthNumber,
      pagibigNumber: formData.pagibigNumber,
      tinNumber: formData.tinNumber,
      emergencyContactName: formData.emergencyContactName,
      emergencyContactPhone: formData.emergencyContactPhone,
      emergencyContactRelation: formData.emergencyContactRelation,
    };

    if (isEditing && id) {
      updateEmployee(id, payload);
    } else {
      addEmployee(payload);
    }

    setIsSubmitting(false);
    setShowSuccess(true);
    addToast({ type: 'success', title: `Employee ${isEditing ? 'updated' : 'added'}`, message: `${formData.firstName} ${formData.lastName} has been ${isEditing ? 'updated' : 'added'} successfully.` });
    
    setTimeout(() => navigate('/app/employees'), 1200);
  };

  const sections = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'government', label: 'Government IDs', icon: CreditCard },
    { id: 'emergency', label: 'Emergency', icon: Phone },
  ];

  const InputField = ({ 
    label, name, type = 'text', placeholder = '', required = false, icon: Icon, ...props 
  }: { 
    label: string; 
    name: string; 
    type?: string; 
    placeholder?: string; 
    required?: boolean;
    icon?: React.ElementType;
    [key: string]: unknown;
  }) => (
    <div>
      <label htmlFor={name} className="label flex items-center gap-1.5">
        {Icon && <Icon size={14} className="text-neutral-400 dark:text-slate-500" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name as keyof typeof formData]}
        onChange={(e) => handleChange(name, e.target.value)}
        onBlur={() => handleBlur(name)}
        className={`input ${errors[name] && touched[name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
        placeholder={placeholder}
        {...props}
      />
      {errors[name] && touched[name] && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} />
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in">
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500 text-white rounded-xl shadow-lg">
            <CheckCircle size={20} />
            <span className="font-medium">Employee {isEditing ? 'updated' : 'added'} successfully!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/app/employees')}
          className="p-2.5 hover:bg-neutral-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-neutral-600 dark:text-slate-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-white">
            {isEditing ? 'Edit Employee' : 'Add New Employee'}
          </h1>
          <p className="text-neutral-500 dark:text-slate-400 mt-1 text-sm">
            {isEditing ? 'Update employee information' : 'Fill in the details to add a new team member'}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Section Navigation */}
        <div className="lg:w-56 shrink-0">
          <nav className="card p-2 lg:sticky lg:top-6">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeSection === section.id 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-neutral-600 dark:text-slate-400 hover:bg-neutral-50 dark:hover:bg-slate-800'
                }`}
              >
                <section.icon size={18} />
                {section.label}
                {(section.id === 'personal' && (errors.firstName || errors.lastName || errors.email)) && (
                  <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
                )}
                {(section.id === 'employment' && (errors.department || errors.position || errors.hireDate)) && (
                  <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-6">
          {/* Personal Information */}
          {activeSection === 'personal' && (
            <div className="card p-6 animate-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Personal Information</h2>
                  <p className="text-sm text-neutral-500 dark:text-slate-400">Basic details about the employee</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="First Name" name="firstName" required icon={UserCircle} placeholder="e.g., Juan" />
                <InputField label="Last Name" name="lastName" required icon={UserCircle} placeholder="e.g., dela Cruz" />
                <InputField label="Middle Name" name="middleName" placeholder="Optional" />
                <div>
                  <label htmlFor="gender" className="label flex items-center gap-1.5">
                    <User size={14} className="text-neutral-400 dark:text-slate-500" />
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="input"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Prefer not to say</option>
                  </select>
                </div>
                <InputField label="Email Address" name="email" type="email" required icon={Mail} placeholder="juan@company.com" />
                <InputField label="Phone Number" name="phone" type="tel" icon={Phone} placeholder="+63 912 345 6789" />
                <InputField label="Date of Birth" name="birthDate" type="date" icon={Calendar} />
                <div>
                  <label htmlFor="civilStatus" className="label">Civil Status</label>
                  <select
                    id="civilStatus"
                    name="civilStatus"
                    value={formData.civilStatus}
                    onChange={(e) => handleChange('civilStatus', e.target.value)}
                    className="input"
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="widowed">Widowed</option>
                    <option value="separated">Separated</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label flex items-center gap-1.5">
                    <MapPin size={14} className="text-neutral-400 dark:text-slate-500" />
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="input"
                    placeholder="Street address"
                  />
                </div>
                <InputField label="City/Municipality" name="city" placeholder="e.g., Makati City" />
              </div>
            </div>
          )}

          {/* Employment Information */}
          {activeSection === 'employment' && (
            <div className="card p-6 animate-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Briefcase className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Employment Information</h2>
                  <p className="text-sm text-neutral-500 dark:text-slate-400">Job role and compensation details</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="department" className="label flex items-center gap-1.5">
                    <Building2 size={14} className="text-neutral-400 dark:text-slate-500" />
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    onBlur={() => handleBlur('department')}
                    className={`input ${errors.department && touched.department ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Department</option>
                    <option value="IT">IT</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Operations">Operations</option>
                    <option value="Legal">Legal</option>
                  </select>
                  {errors.department && touched.department && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.department}
                    </p>
                  )}
                </div>
                <InputField label="Position" name="position" required icon={Briefcase} placeholder="e.g., Software Engineer" />
                <div>
                  <label htmlFor="employmentType" className="label">Employment Type</label>
                  <select
                    id="employmentType"
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={(e) => handleChange('employmentType', e.target.value)}
                    className="input"
                  >
                    <option value="regular">Regular</option>
                    <option value="contractual">Contractual</option>
                    <option value="part-time">Part-time</option>
                    <option value="probationary">Probationary</option>
                  </select>
                </div>
                <InputField label="Hire Date" name="hireDate" type="date" required icon={Calendar} />
                <div className="md:col-span-2">
                  <label htmlFor="basicSalary" className="label flex items-center gap-1.5">
                    <Banknote size={14} className="text-neutral-400 dark:text-slate-500" />
                    Basic Monthly Salary
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-slate-400">₱</span>
                    <input
                      id="basicSalary"
                      name="basicSalary"
                      type="number"
                      value={formData.basicSalary}
                      onChange={(e) => handleChange('basicSalary', e.target.value)}
                      className="input pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Government IDs */}
          {activeSection === 'government' && (
            <div className="card p-6 animate-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Government IDs</h2>
                  <p className="text-sm text-neutral-500 dark:text-slate-400">Required for payroll processing</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sssNumber" className="label">SSS Number</label>
                  <input
                    id="sssNumber"
                    name="sssNumber"
                    type="text"
                    value={formData.sssNumber}
                    onChange={(e) => handleChange('sssNumber', e.target.value)}
                    className="input"
                    placeholder="XX-XXXXXXX-X"
                  />
                  <p className="mt-1 text-xs text-neutral-400 dark:text-slate-500">Format: 00-0000000-0</p>
                </div>
                <div>
                  <label htmlFor="philhealthNumber" className="label">PhilHealth Number</label>
                  <input
                    id="philhealthNumber"
                    name="philhealthNumber"
                    type="text"
                    value={formData.philhealthNumber}
                    onChange={(e) => handleChange('philhealthNumber', e.target.value)}
                    className="input"
                    placeholder="XX-XXXXXXXXX-X"
                  />
                  <p className="mt-1 text-xs text-neutral-400 dark:text-slate-500">Format: 00-000000000-0</p>
                </div>
                <div>
                  <label htmlFor="pagibigNumber" className="label">Pag-IBIG Number</label>
                  <input
                    id="pagibigNumber"
                    name="pagibigNumber"
                    type="text"
                    value={formData.pagibigNumber}
                    onChange={(e) => handleChange('pagibigNumber', e.target.value)}
                    className="input"
                    placeholder="XXXX-XXXX-XXXX"
                  />
                  <p className="mt-1 text-xs text-neutral-400 dark:text-slate-500">Format: 0000-0000-0000</p>
                </div>
                <div>
                  <label htmlFor="tinNumber" className="label">TIN (Tax Identification Number)</label>
                  <input
                    id="tinNumber"
                    name="tinNumber"
                    type="text"
                    value={formData.tinNumber}
                    onChange={(e) => handleChange('tinNumber', e.target.value)}
                    className="input"
                    placeholder="XXX-XXX-XXX-XXX"
                  />
                  <p className="mt-1 text-xs text-neutral-400 dark:text-slate-500">Format: 000-000-000-000</p>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {activeSection === 'emergency' && (
            <div className="card p-6 animate-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Phone className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Emergency Contact</h2>
                  <p className="text-sm text-neutral-500 dark:text-slate-400">Person to contact in case of emergency</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Contact Name" name="emergencyContactName" placeholder="Full name" />
                <InputField label="Contact Phone" name="emergencyContactPhone" type="tel" placeholder="+63 912 345 6789" />
                <div>
                  <label htmlFor="emergencyContactRelationship" className="label">Relationship</label>
                  <select
                    id="emergencyContactRelationship"
                    name="emergencyContactRelationship"
                    value={formData.emergencyContactRelation}
                    onChange={(e) => handleChange('emergencyContactRelation', e.target.value)}
                    className="input"
                  >
                    <option value="">Select Relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="child">Child</option>
                    <option value="friend">Friend</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="card p-4 flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-4">
            <p className="text-sm text-neutral-500 dark:text-slate-400">
              <span className="text-red-500">*</span> Required fields
            </p>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/app/employees')}
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {isEditing ? 'Update Employee' : 'Add Employee'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
