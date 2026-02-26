/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Users,
  FileText,
  Calendar,
  Clock,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Download,
  Filter,
  Search,
  ChevronDown,
  BarChart3,
  Eye,
  Settings,
  Wallet,
  Building,
  Save,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { usePlanStore, DEFAULT_PLAN, type PlanData } from '@/stores/usePlanStore';

// Payment transactions - populated from database
const mockTransactions: {
  id: string;
  company: string;
  plan: string;
  amount: number;
  status: string;
  date: string;
  method: string;
}[] = [];

// Revenue summary - calculated from transactions
const mockRevenue = {
  monthly: 0,
  quarterly: 0,
  yearly: 0,
  growth: 0,
  pending: 0,
  failed: 0,
};

type TabType = 'plans' | 'payments' | 'revenue' | 'settings';

// Mock payment methods
const defaultPaymentMethods = [
  { id: '1', name: 'GCash', type: 'ewallet', accountNumber: '0917-123-4567', accountName: 'SAHOD Inc.', enabled: true },
  { id: '2', name: 'PayMaya', type: 'ewallet', accountNumber: '0928-987-6543', accountName: 'SAHOD Inc.', enabled: true },
  { id: '3', name: 'BDO', type: 'bank', accountNumber: '1234-5678-9012', accountName: 'SAHOD Inc.', enabled: true },
  { id: '4', name: 'BPI', type: 'bank', accountNumber: '9876-5432-1098', accountName: 'SAHOD Inc.', enabled: false },
  { id: '5', name: 'Credit/Debit Card', type: 'card', accountNumber: 'Via Paymongo', accountName: 'SAHOD Inc.', enabled: true },
];

export function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('plans');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { plan, setPlan: updatePlan } = usePlanStore();
  const [transactions, setTransactions] = useState(mockTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<typeof mockTransactions[0] | null>(null);
  const [paymentMethods, setPaymentMethods] = useState(defaultPaymentMethods);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({ name: '', type: 'bank', accountNumber: '', accountName: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [editedPlan, setEditedPlan] = useState<PlanData>(plan);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showPlanModal) {
      setEditedPlan({ ...plan });
    }
  }, [showPlanModal, plan]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSavePlan = () => {
    updatePlan({ ...editedPlan });
    setShowPlanModal(false);
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...editedPlan.features];
    newFeatures[index] = value;
    setEditedPlan({ ...editedPlan, features: newFeatures });
  };

  const handleAddFeature = () => {
    setEditedPlan({ ...editedPlan, features: [...editedPlan.features, ''] });
  };

  const handleRemoveFeature = (index: number) => {
    if (editedPlan.features.length > 1) {
      const newFeatures = editedPlan.features.filter((_, i) => i !== index);
      setEditedPlan({ ...editedPlan, features: newFeatures });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Export transactions to CSV
  const handleExportTransactions = () => {
    const headers = ['Transaction ID', 'Company', 'Plan', 'Amount', 'Method', 'Status', 'Date'];
    const csvData = filteredTransactions.map(txn => [
      txn.id,
      txn.company,
      txn.plan,
      txn.amount.toString(),
      txn.method,
      txn.status,
      txn.date
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Delete plan handler
  const handleAddPaymentMethod = async () => {
    if (!newPaymentMethod.name || !newPaymentMethod.accountNumber || !newPaymentMethod.accountName) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newMethod = {
      id: Date.now().toString(),
      ...newPaymentMethod,
      enabled: true
    };
    
    setPaymentMethods(prev => [...prev, newMethod]);
    setNewPaymentMethod({ name: '', type: 'bank', accountNumber: '', accountName: '' });
    setShowAddPaymentMethod(false);
    setIsSaving(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-3 h-3" />
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  // Toggle payment method
  const togglePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === id ? { ...method, enabled: !method.enabled } : method
    ));
  };

  // Delete payment method
  const deletePaymentMethod = (id: string) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      setPaymentMethods(prev => prev.filter(m => m.id !== id));
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    const matchesFilter = paymentFilter === 'all' || txn.status === paymentFilter;
    const matchesSearch = txn.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          txn.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className={`space-y-6 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-white">
            Subscriptions
          </h1>
          <p className="text-neutral-500 dark:text-slate-400 mt-1">
            Manage subscription plans and monitor payments
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-slate-700 -mx-1">
        <nav className="flex gap-1 sm:gap-8 overflow-x-auto pb-px scrollbar-hide px-1">
          <button
            onClick={() => setActiveTab('plans')}
            className={`pb-4 px-2 sm:px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'plans'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 dark:text-slate-400 hover:text-neutral-700 dark:hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Plan Management
            </div>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-4 px-2 sm:px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'payments'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 dark:text-slate-400 hover:text-neutral-700 dark:hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Payment Monitoring
            </div>
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`pb-4 px-2 sm:px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'revenue'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 dark:text-slate-400 hover:text-neutral-700 dark:hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Revenue Reports
            </div>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 px-2 sm:px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 dark:text-slate-400 hover:text-neutral-700 dark:hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Payment Settings
            </div>
          </button>
        </nav>
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="max-w-2xl mx-auto">
            <div className="card p-8 relative ring-2 ring-primary-500">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary-500 text-white text-xs font-medium px-4 py-1.5 rounded-full shadow-lg">
                  Active Plan - Displayed on Landing Page
                </span>
              </div>

              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">{plan.name}</h3>
                  <p className="text-neutral-600 dark:text-slate-400">{plan.description}</p>
                </div>
                <button 
                  onClick={() => setShowPlanModal(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Plan
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6 p-6 bg-primary-50 rounded-xl">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-slate-400 mb-1">Monthly Price</p>
                  <p className="text-3xl font-bold text-primary-600">{formatCurrency(plan.monthlyPrice)}</p>
                  <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1">Billed monthly</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-slate-400 mb-1">Yearly Price</p>
                  <p className="text-3xl font-bold text-primary-600">{formatCurrency(plan.yearlyPrice)}</p>
                  <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1">Save {Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100)}% annually</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Plan Features:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700 dark:text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-slate-700">
                <p className="text-sm text-neutral-500 dark:text-slate-400">
                  <strong className="text-neutral-700 dark:text-slate-300">Note:</strong> Changes to this plan will be reflected on the landing page immediately. 
                  Existing subscribers will not be affected unless you modify their subscriptions individually.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Payment Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {mockTransactions.filter(t => t.status === 'paid').length}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-slate-400">Paid</p>
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">
                    {mockTransactions.filter(t => t.status === 'pending').length}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-slate-400">Pending</p>
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {mockTransactions.filter(t => t.status === 'failed').length}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-slate-400">Failed</p>
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {formatCurrency(mockRevenue.pending)}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-slate-400">Pending Amount</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="card p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <button 
                  onClick={handleExportTransactions}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-slate-800 border-b border-neutral-200 dark:border-slate-700">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 dark:text-slate-400 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 dark:text-slate-400 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 dark:text-slate-400 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 dark:text-slate-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 dark:text-slate-400 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 dark:text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-600 dark:text-slate-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-slate-700">
                  {filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-neutral-900 dark:text-white">{txn.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-neutral-900 dark:text-white">{txn.company}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-neutral-600 dark:text-slate-400">{txn.plan}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-neutral-900 dark:text-white">{formatCurrency(txn.amount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-neutral-600 dark:text-slate-400">{txn.method}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(txn.status)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-neutral-600 dark:text-slate-400">{formatDate(txn.date)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedTransaction(txn)}
                          className="p-2 text-neutral-400 dark:text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-slate-400">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{formatCurrency(mockRevenue.monthly)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600">+{mockRevenue.growth}%</span>
                <span className="text-sm text-neutral-400 dark:text-slate-500">vs last month</span>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-slate-400">Quarterly Revenue</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{formatCurrency(mockRevenue.quarterly)}</p>
                </div>
              </div>
              <p className="text-sm text-neutral-500 dark:text-slate-400">Q1 2026</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-slate-400">Annual Revenue</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{formatCurrency(mockRevenue.yearly)}</p>
                </div>
              </div>
              <p className="text-sm text-neutral-500 dark:text-slate-400">Projected for 2026</p>
            </div>
          </div>

          {/* Revenue Chart Placeholder */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white">Revenue Trend</h3>
                <p className="text-sm text-neutral-500 dark:text-slate-400">Monthly revenue over time</p>
              </div>
              <select className="text-sm border border-neutral-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>Last 6 months</option>
                <option>Last 12 months</option>
                <option>This year</option>
              </select>
            </div>
            <div className="h-64 flex items-end justify-between gap-4">
              {[380000, 395000, 420000, 445000, 465000, 485000].map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative">
                    <div 
                      className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all hover:from-emerald-600 hover:to-emerald-500"
                      style={{ height: `${(value / 500000) * 200}px` }}
                    ></div>
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-slate-400">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Revenue by Plan</h3>
              <div className="space-y-4">
                {[
                  { name: 'Starter', revenue: 67500, percentage: 14, color: 'bg-blue-500' },
                  { name: 'Professional', revenue: 351000, percentage: 72, color: 'bg-purple-500' },
                  { name: 'Enterprise', revenue: 66500, percentage: 14, color: 'bg-pink-500' },
                ].map((plan, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-700 dark:text-slate-300">{plan.name}</span>
                      <span className="text-sm text-neutral-500 dark:text-slate-400">
                        {formatCurrency(plan.revenue)} ({plan.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${plan.color} rounded-full transition-all duration-500`}
                        style={{ width: `${plan.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Revenue Formula</h3>
              <div className="bg-neutral-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 dark:text-slate-400">Starter (45 × ₱1,500)</span>
                  <span className="font-medium text-neutral-900 dark:text-white">₱67,500</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 dark:text-slate-400">Professional (78 × ₱4,500)</span>
                  <span className="font-medium text-neutral-900 dark:text-white">₱351,000</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 dark:text-slate-400">Enterprise (33 × ₱12,000)</span>
                  <span className="font-medium text-neutral-900 dark:text-white">₱66,500</span>
                </div>
                <hr className="border-neutral-200 dark:border-slate-700" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900 dark:text-white">Total Monthly</span>
                  <span className="font-bold text-lg text-emerald-600">{formatCurrency(mockRevenue.monthly)}</span>
                </div>
              </div>
              <button className="btn btn-secondary w-full mt-4 flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Export Revenue Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Edit Subscription Plan
              </h2>
              <p className="text-sm text-neutral-500 dark:text-slate-400 mt-1">
                Changes will be reflected on the landing page
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="label">Plan Name</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="e.g., SAHOD HRIS"
                  value={editedPlan.name}
                  onChange={(e) => setEditedPlan({ ...editedPlan, name: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea 
                  className="input" 
                  rows={2}
                  placeholder="Brief description of the plan"
                  value={editedPlan.description}
                  onChange={(e) => setEditedPlan({ ...editedPlan, description: e.target.value })}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Monthly Price (₱)</label>
                  <input 
                    type="number" 
                    className="input" 
                    placeholder="1399"
                    value={editedPlan.monthlyPrice}
                    onChange={(e) => setEditedPlan({ ...editedPlan, monthlyPrice: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="label">Yearly Price (₱)</label>
                  <input 
                    type="number" 
                    className="input" 
                    placeholder="15588"
                    value={editedPlan.yearlyPrice}
                    onChange={(e) => setEditedPlan({ ...editedPlan, yearlyPrice: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1">
                    Annual discount: {Math.round((1 - editedPlan.yearlyPrice / (editedPlan.monthlyPrice * 12)) * 100)}%
                  </p>
                </div>
              </div>

              <div>
                <label className="label mb-3">Features</label>
                <div className="space-y-2">
                  {editedPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        className="input flex-1"
                        placeholder="e.g., Unlimited employees"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                      />
                      {editedPlan.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="btn btn-secondary btn-sm flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Feature
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 dark:border-slate-700 flex justify-end gap-3">
              <button 
                onClick={() => setShowPlanModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleSavePlan} className="btn btn-primary">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
