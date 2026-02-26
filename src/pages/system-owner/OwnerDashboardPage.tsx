/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  CreditCard, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
  Bell,
  BarChart3,
  Settings2,
  UserCheck,
  UserX,
  Eye,
  Briefcase,
  Mail,
  Calendar,
  Check,
  X
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRegistrationsStore } from '@/stores/useRegistrationsStore';
import { useToast } from '@/components/common/Toast';

const mockGrowthData = {
  companyGrowth: [
    { month: 'Jan', value: 0 },
    { month: 'Feb', value: 0 },
    { month: 'Mar', value: 0 },
    { month: 'Apr', value: 0 },
    { month: 'May', value: 0 },
    { month: 'Jun', value: 0 },
  ],
  revenueGrowth: [
    { month: 'Jan', value: 0 },
    { month: 'Feb', value: 0 },
    { month: 'Mar', value: 0 },
    { month: 'Apr', value: 0 },
    { month: 'May', value: 0 },
    { month: 'Jun', value: 0 },
  ],
};

const mockAlerts: { id: number; type: string; message: string; time: string }[] = [];

export function OwnerDashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<{
    id: string;
    companyName: string;
    hrAdminName: string;
    email: string;
    industryType: string;
    requestedPlan: string;
    companySize: string;
    dateRegistered: string;
    phone: string;
    address: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dismissedNotification, setDismissedNotification] = useState(false);
  const lastNotifiedCount = useRef<number>(0);
  
  // Get pending registrations from store
  const { 
    pendingRegistrations: storedRegistrations, 
    approvedCompanies,
    approveRegistration, 
    rejectRegistration,
    getPendingCount 
  } = useRegistrationsStore();
  
  // Calculate stats from store data
  const stats = useMemo(() => {
    const pendingCount = storedRegistrations.filter(r => r.status === 'pending').length;
    const activeCount = approvedCompanies.filter(c => c.status === 'active').length;
    const trialCount = approvedCompanies.filter(c => c.status === 'trial').length;
    const suspendedCount = approvedCompanies.filter(c => c.status === 'suspended').length;
    const expiredCount = approvedCompanies.filter(c => c.status === 'expired').length;
    const totalEmployees = approvedCompanies.reduce((sum, c) => sum + (c.employeeCount || 0), 0);
    
    // Calculate expiring soon (within 7 days)
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expiringSoon = approvedCompanies.filter(c => {
      if (c.status !== 'trial') return false;
      const endDate = new Date(c.trialEndDate);
      return endDate <= sevenDaysFromNow && endDate >= now;
    }).length;
    
    // Calculate monthly revenue based on plans
    const revenue = approvedCompanies.reduce((sum, c) => {
      if (c.status === 'active') {
        switch (c.plan) {
          case 'starter': return sum + 999;
          case 'professional': return sum + 2499;
          case 'enterprise': return sum + 4999;
          default: return sum;
        }
      }
      return sum;
    }, 0);
    
    return {
      totalCompanies: approvedCompanies.length,
      activeCompanies: activeCount,
      trialCompanies: trialCount,
      suspendedCompanies: suspendedCount,
      pendingApprovals: pendingCount,
      expiredTrials: expiredCount,
      expiringSoon,
      totalEmployees,
      monthlyRevenue: revenue,
    };
  }, [storedRegistrations, approvedCompanies]);
  
  // Calculate plan distribution
  const planDistribution = useMemo(() => {
    const total = approvedCompanies.length || 1;
    const starterCount = approvedCompanies.filter(c => c.plan === 'starter').length;
    const professionalCount = approvedCompanies.filter(c => c.plan === 'professional').length;
    const enterpriseCount = approvedCompanies.filter(c => c.plan === 'enterprise').length;
    
    const plans = [
      { plan: 'Starter', count: starterCount, percentage: Math.round((starterCount / total) * 100), color: 'bg-blue-500' },
      { plan: 'Professional', count: professionalCount, percentage: Math.round((professionalCount / total) * 100), color: 'bg-emerald-500' },
      { plan: 'Enterprise', count: enterpriseCount, percentage: Math.round((enterpriseCount / total) * 100), color: 'bg-purple-500' },
    ];
    
    // Only return plans with count > 0, or show all if no companies exist
    return plans.filter(p => p.count > 0).length > 0 
      ? plans.filter(p => p.count > 0) 
      : plans;
  }, [approvedCompanies]);
  
  // Convert stored registrations to display format
  const pendingApprovals = storedRegistrations.filter(r => r.status === 'pending').map(r => ({
    id: r.id,
    companyName: r.companyName,
    hrAdminName: r.hrAdminName,
    email: r.hrAdminEmail,
    industryType: r.industryType,
    requestedPlan: r.requestedPlan.charAt(0).toUpperCase() + r.requestedPlan.slice(1),
    companySize: r.companySize,
    dateRegistered: r.dateRegistered,
    phone: r.companyPhone,
    address: r.address,
  }));
  
  // Show notification banner when there are pending approvals and not dismissed
  const showNotificationBanner = pendingApprovals.length > 0 && !dismissedNotification;

  useEffect(() => {
    setMounted(true);
    // Initialize lastNotifiedCount on first mount to prevent false notifications
    lastNotifiedCount.current = pendingApprovals.length;
  }, []);
  
  // Show toast when new registrations come in
  useEffect(() => {
    if (pendingApprovals.length > lastNotifiedCount.current && lastNotifiedCount.current > 0) {
      const newCount = pendingApprovals.length - lastNotifiedCount.current;
      toast.info(
        `${newCount} New Registration${newCount > 1 ? 's' : ''}`,
        'A new company has registered and is awaiting approval.'
      );
      setDismissedNotification(false); // Reset dismissed state when new registrations come in
    }
    lastNotifiedCount.current = pendingApprovals.length;
  }, [pendingApprovals.length, toast]);

  // Handle approval
  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    
    const registration = pendingApprovals.find(a => a.id === id);
    
    // Use the store's approve function
    approveRegistration(id, user?.email || 'System Owner');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSelectedApproval(null);
    setIsProcessing(false);
    
    // Show success toast
    toast.success(
      'Company Approved!',
      `${registration?.companyName || 'Company'} has been approved. Their 30-day trial has started.`
    );
  };

  // Handle rejection
  const handleReject = async (id: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    setIsProcessing(true);
    
    const registration = pendingApprovals.find(a => a.id === id);
    
    // Use the store's reject function
    rejectRegistration(id, user?.email || 'System Owner', reason);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSelectedApproval(null);
    setIsProcessing(false);
    
    toast.warning(
      'Registration Rejected',
      `${registration?.companyName || 'Company'} registration has been rejected.`
    );
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
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

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info':
        return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-neutral-500" />;
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

  return (
    <div className={`space-y-6 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Notification Banner for Pending Approvals */}
      {showNotificationBanner && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-800">
                {pendingApprovals.length} New Registration{pendingApprovals.length > 1 ? 's' : ''} Awaiting Approval
              </p>
              <p className="text-sm text-amber-600">
                Review and approve new company registrations to start their trial period.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setDismissedNotification(true)}
            className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-white">
            Platform Dashboard
          </h1>
          <p className="text-neutral-500 dark:text-slate-400 mt-1">
            Welcome back, {user?.displayName || 'System Owner'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-500 dark:text-slate-400">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
          <button
            onClick={handleRefresh}
            className="btn btn-secondary flex items-center gap-2"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Companies */}
        <div className="card p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-slate-400">Total Companies</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">{stats.totalCompanies}</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-sm text-neutral-500 dark:text-slate-400">{stats.trialCompanies} in trial</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Companies */}
        <div className="card p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-slate-400">Active Companies</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.activeCompanies}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-neutral-500 dark:text-slate-400">
                  {stats.totalCompanies > 0 ? Math.round((stats.activeCompanies / stats.totalCompanies) * 100) : 0}% of total
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Trial Companies */}
        <div className="card p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-slate-400">Trial Companies</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.trialCompanies}</p>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-600">{stats.expiringSoon} expiring soon</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Total Employees */}
        <div className="card p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-slate-400">Total Employees</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">{stats.totalEmployees.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-sm text-neutral-400 dark:text-slate-500">across all companies</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals Section */}
      {pendingApprovals.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-neutral-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">Pending Approvals</h3>
                  <p className="text-sm text-neutral-500 dark:text-slate-400">{pendingApprovals.length} registrations awaiting review</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/app/companies?status=pending')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All
              </button>
            </div>
          </div>
          <div className="divide-y divide-neutral-100">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="p-5 hover:bg-neutral-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                      {approval.companyName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-neutral-900 dark:text-white">{approval.companyName}</h4>
                        {getPlanBadge(approval.requestedPlan)}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-neutral-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-neutral-400" />
                          <span>{approval.hrAdminName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-neutral-400" />
                          <span>{approval.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-neutral-400" />
                          <span>{approval.industryType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-neutral-400" />
                          <span>Registered: {formatDate(approval.dateRegistered)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-16 lg:ml-0">
                    <button
                      onClick={() => setSelectedApproval(approval)}
                      className="btn btn-secondary flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Review
                    </button>
                    <button
                      onClick={() => handleReject(approval.id)}
                      disabled={isProcessing}
                      className="btn bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 flex items-center gap-2"
                    >
                      <UserX className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(approval.id)}
                      disabled={isProcessing}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State for Pending Approvals */}
      {pendingApprovals.length === 0 && (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="font-semibold text-neutral-700 mb-1">No Pending Registrations</h3>
          <p className="text-sm text-neutral-500 max-w-md mx-auto">
            All company registrations have been reviewed. New registrations from HR accounts will appear here for your approval.
          </p>
        </div>
      )}

      {/* Revenue & Suspended Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Revenue Card */}
        <div className="card p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">Monthly Revenue</p>
              <p className="text-3xl font-bold text-neutral-900 mt-1">
                {formatCurrency(stats.monthlyRevenue)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-sm text-neutral-400">from active subscriptions</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Suspended Companies */}
        <div className="card p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">Suspended Companies</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.suspendedCompanies}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-neutral-500">
                  {stats.suspendedCompanies} accounts need attention
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Growth Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-neutral-900">Company Growth</h3>
              <p className="text-sm text-neutral-500">Monthly registration trend</p>
            </div>
            <select className="text-sm border border-neutral-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>Last 6 months</option>
              <option>Last 12 months</option>
              <option>This year</option>
            </select>
          </div>
          {/* Simple bar chart representation */}
          <div className="flex items-end justify-between h-48 gap-2">
            {mockGrowthData.companyGrowth.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all hover:from-primary-600 hover:to-primary-500"
                  style={{ height: `${(item.value / 160) * 100}%` }}
                ></div>
                <span className="text-xs text-neutral-500">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Growth Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-neutral-900">Revenue Growth</h3>
              <p className="text-sm text-neutral-500">Monthly revenue trend</p>
            </div>
            <select className="text-sm border border-neutral-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>Last 6 months</option>
              <option>Last 12 months</option>
              <option>This year</option>
            </select>
          </div>
          {/* Simple bar chart representation */}
          <div className="flex items-end justify-between h-48 gap-2">
            {mockGrowthData.revenueGrowth.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all hover:from-emerald-600 hover:to-emerald-500"
                  style={{ height: `${(item.value / 500000) * 100}%` }}
                ></div>
                <span className="text-xs text-neutral-500">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Distribution & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Distribution */}
        <div className="card p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Subscription Distribution</h3>
          <div className="space-y-4">
            {planDistribution.map((plan, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-700">{plan.plan}</span>
                  <span className="text-sm text-neutral-500">{plan.count} ({plan.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${plan.color} rounded-full transition-all duration-500`}
                    style={{ width: `${plan.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Total Active</span>
              <span className="font-semibold text-neutral-900">{stats.activeCompanies} companies</span>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">Recent Alerts</h3>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {mockAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                  alert.type === 'error' ? 'bg-red-50' : 
                  alert.type === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
                }`}
              >
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800">{alert.message}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{alert.time}</p>
                </div>
                <button className="text-xs text-neutral-500 hover:text-neutral-700 font-medium">
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="font-semibold text-neutral-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/app/companies')}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
          >
            <Building2 className="w-6 h-6 text-primary-600" />
            <span className="text-sm font-medium text-neutral-700">Manage Companies</span>
          </button>
          <button 
            onClick={() => navigate('/app/subscriptions')}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
          >
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <span className="text-sm font-medium text-neutral-700">Subscriptions</span>
          </button>
          <button 
            onClick={() => navigate('/app/platform-analytics')}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
          >
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-neutral-700">Analytics</span>
          </button>
          <button 
            onClick={() => navigate('/app/system-config')}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
          >
            <Settings2 className="w-6 h-6 text-amber-600" />
            <span className="text-sm font-medium text-neutral-700">System Config</span>
          </button>
        </div>
      </div>

      {/* Approval Detail Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xl">
                    {selectedApproval.companyName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">{selectedApproval.companyName}</h2>
                    <p className="text-neutral-500">Registration Review</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedApproval(null)}
                  className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                  <Clock className="w-4 h-4" />
                  Pending Approval
                </span>
                {getPlanBadge(selectedApproval.requestedPlan)}
              </div>

              {/* Company Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-neutral-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-neutral-400" />
                  Company Details
                </h4>
                <div className="bg-neutral-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Industry</span>
                    <span className="font-medium text-neutral-900">{selectedApproval.industryType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Company Size</span>
                    <span className="font-medium text-neutral-900">{selectedApproval.companySize} employees</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Address</span>
                    <span className="font-medium text-neutral-900">{selectedApproval.address}</span>
                  </div>
                </div>
              </div>

              {/* HR Admin Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-neutral-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-neutral-400" />
                  HR Administrator
                </h4>
                <div className="bg-neutral-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Name</span>
                    <span className="font-medium text-neutral-900">{selectedApproval.hrAdminName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Email</span>
                    <span className="font-medium text-neutral-900">{selectedApproval.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Phone</span>
                    <span className="font-medium text-neutral-900">{selectedApproval.phone}</span>
                  </div>
                </div>
              </div>

              {/* Registration Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-neutral-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  Registration Info
                </h4>
                <div className="bg-neutral-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Date Registered</span>
                    <span className="font-medium text-neutral-900">{formatDate(selectedApproval.dateRegistered)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Requested Plan</span>
                    <span className="font-medium text-neutral-900">{selectedApproval.requestedPlan}</span>
                  </div>
                </div>
              </div>

              {/* Trial Info */}
              <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">30-Day Trial Period</p>
                  <p>Upon approval, this company will start a 30-day free trial with full access to all features.</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 flex flex-col sm:flex-row justify-end gap-3">
              <button 
                onClick={() => setSelectedApproval(null)}
                className="btn btn-secondary w-full sm:w-auto"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleReject(selectedApproval.id)}
                disabled={isProcessing}
                className="btn bg-red-500 text-white hover:bg-red-600 w-full sm:w-auto flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <UserX className="w-4 h-4" />
                )}
                Reject
              </button>
              <button 
                onClick={() => handleApprove(selectedApproval.id)}
                disabled={isProcessing}
                className="btn btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
                Approve & Start Trial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
