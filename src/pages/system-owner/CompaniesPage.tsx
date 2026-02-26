/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  Power,
  PowerOff,
  KeyRound,
  Trash2,
  TrendingUp,
  Users,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Shield,
  ChevronDown,
  Download,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Edit3,
  Save
} from 'lucide-react';
import { useRegistrationsStore } from '@/stores/useRegistrationsStore';

type CompanyStatus = 'all' | 'pending' | 'active' | 'trial' | 'expired' | 'suspended';

type CompanyData = {
  id: string;
  name: string;
  slug: string;
  hrAdmin: { name: string; email: string };
  plan: string;
  employees: number;
  maxEmployees: number;
  status: string;
  expiryDate: string;
  trialEndDate?: string;
  monthlyFee: number;
  createdAt: string;
  phone: string;
  address: string;
};

export function CompaniesPage() {
  // Get approved companies from store
  const { approvedCompanies: storeCompanies } = useRegistrationsStore();
  
  // Transform store companies to display format
  const transformedCompanies = useMemo((): CompanyData[] => {
    return storeCompanies.map(company => {
      const planPricing: Record<string, number> = {
        starter: 999,
        professional: 2499,
        enterprise: 4999
      };
      const planLimits: Record<string, number> = {
        starter: 10,
        professional: 50,
        enterprise: 999
      };
      
      return {
        id: company.id,
        name: company.companyName,
        slug: company.companyName.toLowerCase().replace(/\s+/g, '-'),
        hrAdmin: { name: company.hrAdminName, email: company.hrAdminEmail },
        plan: company.plan.charAt(0).toUpperCase() + company.plan.slice(1),
        employees: company.employeeCount || 0,
        maxEmployees: planLimits[company.plan] || 10,
        status: company.status,
        expiryDate: company.trialEndDate,
        trialEndDate: company.trialEndDate,
        monthlyFee: planPricing[company.plan] || 999,
        createdAt: company.approvedAt,
        phone: '',
        address: ''
      };
    });
  }, [storeCompanies]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CompanyStatus>('all');
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [editingCompany, setEditingCompany] = useState<CompanyData | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [localCompanies, setLocalCompanies] = useState<CompanyData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [planFilter, setPlanFilter] = useState<string>('all');
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  
  // New company form state
  const [newCompany, setNewCompany] = useState({
    name: '',
    slug: '',
    hrAdminName: '',
    hrAdminEmail: '',
    phone: '',
    address: '',
    plan: 'Starter',
    maxEmployees: 25,
    monthlyFee: 1500,
  });

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Combine store companies with locally added companies
  const companies = useMemo(() => {
    const storeIds = new Set(transformedCompanies.map(c => c.id));
    // Only include local companies that aren't in the store (to avoid duplicates)
    const uniqueLocalCompanies = localCompanies.filter(c => !storeIds.has(c.id));
    return [...transformedCompanies, ...uniqueLocalCompanies];
  }, [transformedCompanies, localCompanies]);

  // Close action menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setShowActionMenu(null);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Action handlers
  const handleViewProfile = (company: CompanyData) => {
    setSelectedCompany(company);
    setShowActionMenu(null);
  };

  const handleSuspendCompany = (companyId: string) => {
    setLocalCompanies(prev => prev.map(c => 
      c.id === companyId ? { ...c, status: 'suspended' } : c
    ));
    setShowActionMenu(null);
  };

  const handleActivateCompany = (companyId: string) => {
    setLocalCompanies(prev => prev.map(c => 
      c.id === companyId ? { ...c, status: 'active' } : c
    ));
    setShowActionMenu(null);
  };

  const handleResetPassword = (company: CompanyData) => {
    alert(`Password reset email sent to ${company.hrAdmin.email}`);
    setShowActionMenu(null);
  };

  const handleUpgradePlan = (company: CompanyData) => {
    alert(`Upgrade plan for ${company.name}`);
    setShowActionMenu(null);
  };

  const handleSupportMode = (company: CompanyData) => {
    alert(`Entering support mode for ${company.name}`);
    setShowActionMenu(null);
  };

  const handleDeleteCompany = (companyId: string) => {
    if (confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      setLocalCompanies(prev => prev.filter(c => c.id !== companyId));
    }
    setShowActionMenu(null);
  };

  // Edit company handlers
  const handleEditCompany = (company: CompanyData) => {
    setEditingCompany({ ...company });
    setSelectedCompany(null);
    setShowActionMenu(null);
  };

  const handleSaveCompany = async () => {
    if (!editingCompany) return;
    
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setLocalCompanies(prev => prev.map(c => 
      c.id === editingCompany.id ? editingCompany : c
    ));
    setIsSaving(false);
    setEditingCompany(null);
  };

  const handleEditFieldChange = (field: string, value: string | number) => {
    if (!editingCompany) return;
    
    if (field.startsWith('hrAdmin.')) {
      const subField = field.split('.')[1];
      setEditingCompany({
        ...editingCompany,
        hrAdmin: { ...editingCompany.hrAdmin, [subField]: value }
      });
    } else {
      setEditingCompany({ ...editingCompany, [field]: value });
    }
  };

  // Export companies to CSV
  const handleExportCompanies = () => {
    const headers = ['Company Name', 'Slug', 'HR Admin Name', 'HR Admin Email', 'Phone', 'Address', 'Plan', 'Employees', 'Max Employees', 'Status', 'Expiry Date', 'Monthly Fee', 'Created At'];
    const csvData = filteredCompanies.map(company => [
      company.name,
      company.slug,
      company.hrAdmin.name,
      company.hrAdmin.email,
      company.phone,
      company.address,
      company.plan,
      company.employees.toString(),
      company.maxEmployees.toString(),
      company.status,
      company.expiryDate,
      company.monthlyFee.toString(),
      company.createdAt
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `companies_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Add Company handlers
  const handleAddCompany = async () => {
    if (!newCompany.name || !newCompany.hrAdminEmail) {
      alert('Please fill in required fields: Company Name and HR Admin Email');
      return;
    }
    
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newId = `local-${Date.now()}`;
    const company: CompanyData = {
      id: newId,
      name: newCompany.name,
      slug: newCompany.slug || newCompany.name.toLowerCase().replace(/\s+/g, '-'),
      hrAdmin: { name: newCompany.hrAdminName, email: newCompany.hrAdminEmail },
      plan: newCompany.plan,
      employees: 0,
      maxEmployees: newCompany.maxEmployees,
      status: 'trial',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      monthlyFee: newCompany.monthlyFee,
      createdAt: new Date().toISOString().split('T')[0],
      phone: newCompany.phone,
      address: newCompany.address,
    };
    
    setLocalCompanies(prev => [...prev, company]);
    setIsSaving(false);
    setShowAddModal(false);
    setNewCompany({
      name: '',
      slug: '',
      hrAdminName: '',
      hrAdminEmail: '',
      phone: '',
      address: '',
      plan: 'Starter',
      maxEmployees: 25,
      monthlyFee: 1500,
    });
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          company.hrAdmin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          company.hrAdmin.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    const matchesPlan = planFilter === 'all' || company.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </span>
        );
      case 'trial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <Clock className="w-3 h-3" />
            Trial
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            <AlertTriangle className="w-3 h-3" />
            Expired
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Suspended
          </span>
        );
      default:
        return null;
    }
  };

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      'Starter': 'bg-blue-100 text-blue-700',
      'Professional': 'bg-purple-100 text-purple-700',
      'Enterprise': 'bg-pink-100 text-pink-700',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[plan] || 'bg-neutral-100 text-neutral-700'}`}>
        {plan}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const stats = {
    total: companies.length,
    pending: companies.filter(c => c.status === 'pending').length,
    active: companies.filter(c => c.status === 'active').length,
    trial: companies.filter(c => c.status === 'trial').length,
    expired: companies.filter(c => c.status === 'expired').length,
    suspended: companies.filter(c => c.status === 'suspended').length,
  };

  return (
    <div className={`space-y-6 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900">
            Companies
          </h1>
          <p className="text-neutral-500 mt-1">
            Manage all registered companies on the platform
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Company
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`card p-4 text-left transition-all ${statusFilter === 'all' ? 'ring-2 ring-primary-500' : 'hover:shadow-md'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
              <p className="text-sm text-neutral-500">Total</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`card p-4 text-left transition-all ${statusFilter === 'pending' ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
              <p className="text-sm text-neutral-500">Pending</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setStatusFilter('active')}
          className={`card p-4 text-left transition-all ${statusFilter === 'active' ? 'ring-2 ring-emerald-500' : 'hover:shadow-md'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
              <p className="text-sm text-neutral-500">Active</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setStatusFilter('trial')}
          className={`card p-4 text-left transition-all ${statusFilter === 'trial' ? 'ring-2 ring-amber-500' : 'hover:shadow-md'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.trial}</p>
              <p className="text-sm text-neutral-500">Trial</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setStatusFilter('expired')}
          className={`card p-4 text-left transition-all ${statusFilter === 'expired' ? 'ring-2 ring-orange-500' : 'hover:shadow-md'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats.expired}</p>
              <p className="text-sm text-neutral-500">Expired</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setStatusFilter('suspended')}
          className={`card p-4 text-left transition-all ${statusFilter === 'suspended' ? 'ring-2 ring-red-500' : 'hover:shadow-md'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
              <p className="text-sm text-neutral-500">Suspended</p>
            </div>
          </div>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search companies, HR admin..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowActionMenu(null);
              }}
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl transition-all duration-200 placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative" ref={filterMenuRef}>
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`btn btn-secondary flex items-center gap-2 ${planFilter !== 'all' ? 'ring-2 ring-primary-500' : ''}`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {planFilter !== 'all' && (
                  <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                )}
              </button>
              
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-neutral-200 p-4 z-50">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Subscription Plan
                      </label>
                      <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="all">All Plans</option>
                        <option value="Starter">Starter</option>
                        <option value="Professional">Professional</option>
                        <option value="Enterprise">Enterprise</option>
                      </select>
                    </div>
                    
                    <div className="pt-2 border-t border-neutral-100 flex gap-2">
                      <button
                        onClick={() => {
                          setPlanFilter('all');
                          setShowFilterMenu(false);
                        }}
                        className="flex-1 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setShowFilterMenu(false)}
                        className="flex-1 px-3 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={handleExportCompanies}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  HR Admin
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Employees
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 overflow-visible">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-neutral-50 transition-colors overflow-visible">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{company.name}</p>
                        <p className="text-sm text-neutral-500">{company.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-neutral-900">{company.hrAdmin.name}</p>
                      <p className="text-sm text-neutral-500">{company.hrAdmin.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getPlanBadge(company.plan)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-neutral-400" />
                      <span className="font-medium text-neutral-900">{company.employees}</span>
                      <span className="text-neutral-400">/ {company.maxEmployees}</span>
                    </div>
                    <div className="w-24 h-1.5 bg-neutral-200 rounded-full mt-1">
                      <div 
                        className={`h-full rounded-full ${
                          company.employees / company.maxEmployees > 0.9 ? 'bg-red-500' :
                          company.employees / company.maxEmployees > 0.7 ? 'bg-amber-500' :
                          'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min((company.employees / company.maxEmployees) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(company.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      <span className={`${
                        new Date(company.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          ? 'text-amber-600 font-medium'
                          : 'text-neutral-600'
                      }`}>
                        {formatDate(company.expiryDate)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 overflow-visible">
                    <div className="flex items-center justify-end gap-2 relative">
                      <button 
                        onClick={() => setSelectedCompany(company)}
                        className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <div className="relative" ref={showActionMenu === company.id ? actionMenuRef : null}>
                        <button 
                          onClick={() => setShowActionMenu(showActionMenu === company.id ? null : company.id)}
                          className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {showActionMenu === company.id && (
                          <div className="absolute right-0 bottom-full mb-1 w-48 bg-white rounded-xl shadow-lg border border-neutral-200 py-1 z-[9999]">
                            <button 
                              onClick={() => handleViewProfile(company)}
                              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Profile
                            </button>
                            {company.status === 'active' || company.status === 'trial' ? (
                              <button 
                                onClick={() => handleSuspendCompany(company.id)}
                                className="w-full px-4 py-2 text-left text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                              >
                                <PowerOff className="w-4 h-4" />
                                Suspend Company
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleActivateCompany(company.id)}
                                className="w-full px-4 py-2 text-left text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                              >
                                <Power className="w-4 h-4" />
                                Activate Company
                              </button>
                            )}
                            <button 
                              onClick={() => handleResetPassword(company)}
                              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                            >
                              <KeyRound className="w-4 h-4" />
                              Reset HR Password
                            </button>
                            <button 
                              onClick={() => handleUpgradePlan(company)}
                              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                            >
                              <TrendingUp className="w-4 h-4" />
                              Upgrade Plan
                            </button>
                            <button 
                              onClick={() => handleSupportMode(company)}
                              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                            >
                              <Shield className="w-4 h-4" />
                              Support Mode
                            </button>
                            <hr className="my-1 border-neutral-100" />
                            <button 
                              onClick={() => handleDeleteCompany(company.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Company
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            Showing <span className="font-medium">{filteredCompanies.length}</span> of <span className="font-medium">{companies.length}</span> companies
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
              Previous
            </button>
            <button className="px-3 py-1.5 text-sm font-medium bg-primary-500 text-white rounded-lg">
              1
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Company Detail Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl">
                    {selectedCompany.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">{selectedCompany.name}</h2>
                    <p className="text-neutral-500">{selectedCompany.slug}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCompany(null)}
                  className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Plan */}
              <div className="flex items-center gap-4">
                {getStatusBadge(selectedCompany.status)}
                {getPlanBadge(selectedCompany.plan)}
                <span className="text-sm text-neutral-500">
                  {formatCurrency(selectedCompany.monthlyFee)}/month
                </span>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-700">{selectedCompany.hrAdmin.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-700">{selectedCompany.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm sm:col-span-2">
                  <MapPin className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-700">{selectedCompany.address}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-neutral-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-neutral-900">{selectedCompany.employees}</p>
                  <p className="text-sm text-neutral-500">Employees</p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-neutral-900">{selectedCompany.maxEmployees}</p>
                  <p className="text-sm text-neutral-500">Max Limit</p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-neutral-900">
                    {Math.round((selectedCompany.employees / selectedCompany.maxEmployees) * 100)}%
                  </p>
                  <p className="text-sm text-neutral-500">Usage</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500">Registered</p>
                  <p className="font-medium text-neutral-900">{formatDate(selectedCompany.createdAt)}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Subscription Expires</p>
                  <p className="font-medium text-neutral-900">{formatDate(selectedCompany.expiryDate)}</p>
                </div>
              </div>

              {/* HR Admin */}
              <div className="bg-neutral-50 rounded-xl p-4">
                <h4 className="font-medium text-neutral-900 mb-2">HR Administrator</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                    {selectedCompany.hrAdmin.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">{selectedCompany.hrAdmin.name}</p>
                    <p className="text-sm text-neutral-500">{selectedCompany.hrAdmin.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedCompany(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button 
                onClick={() => handleEditCompany(selectedCompany)}
                className="btn btn-primary flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit Company
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {editingCompany && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xl">
                    <Edit3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Edit Company</h2>
                    <p className="text-neutral-500">Update company information</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingCompany(null)}
                  className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Company Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Company Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={editingCompany.name}
                      onChange={(e) => handleEditFieldChange('name', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Slug</label>
                    <input
                      type="text"
                      value={editingCompany.slug}
                      onChange={(e) => handleEditFieldChange('slug', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={editingCompany.phone}
                      onChange={(e) => handleEditFieldChange('phone', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={editingCompany.address}
                      onChange={(e) => handleEditFieldChange('address', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* HR Admin Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  HR Administrator
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Admin Name</label>
                    <input
                      type="text"
                      value={editingCompany.hrAdmin.name}
                      onChange={(e) => handleEditFieldChange('hrAdmin.name', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Admin Email</label>
                    <input
                      type="email"
                      value={editingCompany.hrAdmin.email}
                      onChange={(e) => handleEditFieldChange('hrAdmin.email', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Subscription Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Subscription Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Plan</label>
                    <select
                      value={editingCompany.plan}
                      onChange={(e) => handleEditFieldChange('plan', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="Starter">Starter</option>
                      <option value="Professional">Professional</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                    <select
                      value={editingCompany.status}
                      onChange={(e) => handleEditFieldChange('status', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="pending">Pending Approval</option>
                      <option value="trial">Trial</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Max Employees</label>
                    <input
                      type="number"
                      value={editingCompany.maxEmployees}
                      onChange={(e) => handleEditFieldChange('maxEmployees', parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Monthly Fee (₱)</label>
                    <input
                      type="number"
                      value={editingCompany.monthlyFee}
                      onChange={(e) => handleEditFieldChange('monthlyFee', parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={editingCompany.expiryDate}
                      onChange={(e) => handleEditFieldChange('expiryDate', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 flex flex-col sm:flex-row justify-end gap-3">
              <button 
                onClick={() => setEditingCompany(null)}
                className="btn btn-secondary w-full sm:w-auto"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveCompany}
                disabled={isSaving}
                className="btn btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Add New Company</h2>
                    <p className="text-neutral-500">Register a new company on the platform</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Company Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Company Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Company Name *</label>
                    <input
                      type="text"
                      value={newCompany.name}
                      onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                      placeholder="Enter company name"
                      className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Slug</label>
                    <input
                      type="text"
                      value={newCompany.slug}
                      onChange={(e) => setNewCompany({...newCompany, slug: e.target.value})}
                      placeholder="company-slug (auto-generated)"
                      className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={newCompany.phone}
                      onChange={(e) => setNewCompany({...newCompany, phone: e.target.value})}
                      placeholder="+63 XXX XXX XXXX"
                      className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={newCompany.address}
                      onChange={(e) => setNewCompany({...newCompany, address: e.target.value})}
                      placeholder="City, Province"
                      className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* HR Admin Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  HR Administrator
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Admin Name</label>
                    <input
                      type="text"
                      value={newCompany.hrAdminName}
                      onChange={(e) => setNewCompany({...newCompany, hrAdminName: e.target.value})}
                      placeholder="Full name"
                      className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Admin Email *</label>
                    <input
                      type="email"
                      value={newCompany.hrAdminEmail}
                      onChange={(e) => setNewCompany({...newCompany, hrAdminEmail: e.target.value})}
                      placeholder="email@company.com"
                      className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Subscription Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Subscription Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Plan</label>
                    <select
                      value={newCompany.plan}
                      onChange={(e) => {
                        const plan = e.target.value;
                        const planConfig = {
                          'Starter': { maxEmployees: 25, monthlyFee: 1500 },
                          'Professional': { maxEmployees: 100, monthlyFee: 4500 },
                          'Enterprise': { maxEmployees: 500, monthlyFee: 12000 },
                        };
                        const config = planConfig[plan as keyof typeof planConfig];
                        setNewCompany({
                          ...newCompany, 
                          plan, 
                          maxEmployees: config.maxEmployees,
                          monthlyFee: config.monthlyFee
                        });
                      }}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="Starter">Starter</option>
                      <option value="Professional">Professional</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Max Employees</label>
                    <input
                      type="number"
                      value={newCompany.maxEmployees}
                      onChange={(e) => setNewCompany({...newCompany, maxEmployees: parseInt(e.target.value)})}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Monthly Fee (₱)</label>
                    <input
                      type="number"
                      value={newCompany.monthlyFee}
                      onChange={(e) => setNewCompany({...newCompany, monthlyFee: parseInt(e.target.value)})}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Trial Period</p>
                  <p>New companies start with a 30-day trial period. An invitation email will be sent to the HR administrator.</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 flex flex-col sm:flex-row justify-end gap-3">
              <button 
                onClick={() => setShowAddModal(false)}
                className="btn btn-secondary w-full sm:w-auto"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCompany}
                disabled={isSaving}
                className="btn btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Company
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
