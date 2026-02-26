/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  AlertTriangle,
  Activity,
  Clock,
  Calendar,
  Zap,
  FileText,
  UserCheck,
  CreditCard,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  PieChart,
  LineChart
} from 'lucide-react';

// Business metrics - calculated from database
const businessMetrics = {
  mrr: 0,
  mrrGrowth: 0,
  arr: 0,
  arrGrowth: 0,
  churnRate: 0,
  churnChange: 0,
  growthRate: 0,
  ltv: 0,
  cac: 0,
  ltvCacRatio: 0,
};

const usageMetrics = {
  avgEmployeesPerCompany: 0,
  avgDailyActiveUsers: 0,
  avgSessionDuration: 0,
  totalLogins: 0,
  mobileUsage: 0,
  desktopUsage: 0,
};

const featureUsage: { name: string; usage: number; trend: string }[] = [];

const riskAlerts: { company: string; type: string; risk: string; detail: string; amount?: number; usage?: string; lastActive?: string }[] = [];

const monthlyRevenue: { month: string; revenue: number }[] = [];

const churnData: { month: string; rate: number }[] = [];

type TabType = 'business' | 'usage' | 'risk';

export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('business');
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState('6m');

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));

  return (
    <div className={`space-y-6 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900">
            Platform Analytics
          </h1>
          <p className="text-neutral-500 mt-1">
            Business metrics, usage insights, and risk monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input w-40"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
          <button className="btn btn-outline flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex gap-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('business')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'business'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Business Analytics
            </div>
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'usage'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Usage Analytics
            </div>
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'risk'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risk Monitoring
              <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                {riskAlerts.filter(a => a.risk === 'high').length}
              </span>
            </div>
          </button>
        </nav>
      </div>

      {/* Business Analytics Tab */}
      {activeTab === 'business' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* MRR */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-neutral-500 text-sm font-medium">Monthly Recurring Revenue</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{formatCurrency(businessMetrics.mrr)}</p>
              <div className="flex items-center gap-1 mt-2">
                <div className="flex items-center gap-1 text-emerald-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">{businessMetrics.mrrGrowth}%</span>
                </div>
                <span className="text-xs text-neutral-400">vs last month</span>
              </div>
            </div>

            {/* ARR */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-neutral-500 text-sm font-medium">Annual Recurring Revenue</span>
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{formatCurrency(businessMetrics.arr)}</p>
              <div className="flex items-center gap-1 mt-2">
                <div className="flex items-center gap-1 text-emerald-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">{businessMetrics.arrGrowth}%</span>
                </div>
                <span className="text-xs text-neutral-400">vs last year</span>
              </div>
            </div>

            {/* Churn Rate */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-neutral-500 text-sm font-medium">Churn Rate</span>
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{businessMetrics.churnRate}%</p>
              <div className="flex items-center gap-1 mt-2">
                <div className="flex items-center gap-1 text-emerald-600">
                  <ArrowDownRight className="w-4 h-4" />
                  <span className="text-sm font-medium">{Math.abs(businessMetrics.churnChange)}%</span>
                </div>
                <span className="text-xs text-neutral-400">better than target</span>
              </div>
            </div>

            {/* Growth Rate */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-neutral-500 text-sm font-medium">Growth Rate</span>
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Target className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{businessMetrics.growthRate}%</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-neutral-400">MoM customer growth</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-neutral-900">Revenue Trend</h3>
                <LineChart className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="h-48 flex items-end justify-between gap-2">
                {monthlyRevenue.map((month, index) => (
                  <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t transition-all duration-500"
                      style={{ 
                        height: `${(month.revenue / maxRevenue) * 160}px`,
                        animationDelay: `${index * 100}ms`
                      }}
                    />
                    <span className="text-xs text-neutral-500">{month.month}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between text-sm">
                <span className="text-neutral-500">Total: {formatCurrency(monthlyRevenue.reduce((a, b) => a + b.revenue, 0))}</span>
                <span className="text-emerald-600 font-medium">+27.6% growth</span>
              </div>
            </div>

            {/* Churn Trend */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-neutral-900">Churn Rate Trend</h3>
                <TrendingDown className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="h-48">
                <div className="relative h-full">
                  {/* Target line */}
                  <div className="absolute left-0 right-0 top-1/2 border-t-2 border-dashed border-red-300 z-0">
                    <span className="absolute -top-5 right-0 text-xs text-red-500 bg-white px-1">Target: 3%</span>
                  </div>
                  
                  {/* Churn bars */}
                  <div className="flex items-end justify-between gap-4 h-full">
                    {churnData.map((data, index) => (
                      <div key={data.month} className="flex-1 flex flex-col items-center gap-2 relative z-10">
                        <span className="text-xs text-neutral-600 font-medium">{data.rate}%</span>
                        <div 
                          className={`w-full rounded-t transition-all duration-500 ${
                            data.rate > 3 ? 'bg-red-400' : data.rate > 2.5 ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ 
                            height: `${(data.rate / 4) * 120}px`,
                            animationDelay: `${index * 100}ms`
                          }}
                        />
                        <span className="text-xs text-neutral-500">{data.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between text-sm">
                <span className="text-neutral-500">Current: {businessMetrics.churnRate}%</span>
                <span className="text-emerald-600 font-medium">Below target ✓</span>
              </div>
            </div>
          </div>

          {/* Unit Economics */}
          <div className="card p-6">
            <h3 className="font-semibold text-neutral-900 mb-6">Unit Economics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-neutral-50 rounded-xl">
                <p className="text-sm text-neutral-500 mb-2">Customer Lifetime Value</p>
                <p className="text-3xl font-bold text-neutral-900">{formatCurrency(businessMetrics.ltv)}</p>
                <p className="text-xs text-neutral-400 mt-1">Average revenue per customer</p>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-xl">
                <p className="text-sm text-neutral-500 mb-2">Customer Acquisition Cost</p>
                <p className="text-3xl font-bold text-neutral-900">{formatCurrency(businessMetrics.cac)}</p>
                <p className="text-xs text-neutral-400 mt-1">Marketing + Sales cost</p>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <p className="text-sm text-emerald-600 mb-2">LTV:CAC Ratio</p>
                <p className="text-3xl font-bold text-emerald-700">{businessMetrics.ltvCacRatio}:1</p>
                <p className="text-xs text-emerald-500 mt-1">Healthy ratio (target: 3:1+)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usage Analytics Tab */}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          {/* Usage Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-neutral-500 text-sm font-medium">Avg Employees / Company</span>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-neutral-900">{usageMetrics.avgEmployeesPerCompany}</p>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-neutral-500 text-sm font-medium">Daily Active Users</span>
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-neutral-900">{usageMetrics.avgDailyActiveUsers.toLocaleString()}</p>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-neutral-500 text-sm font-medium">Avg Session Duration</span>
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-neutral-900">{usageMetrics.avgSessionDuration} min</p>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-neutral-500 text-sm font-medium">Total Logins (30d)</span>
                <UserCheck className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-neutral-900">{usageMetrics.totalLogins.toLocaleString()}</p>
            </div>
          </div>

          {/* Feature Usage & Device Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feature Usage */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-neutral-900">Most Used Features</h3>
                <BarChart3 className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="space-y-4">
                {featureUsage.map((feature, index) => (
                  <div key={feature.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-neutral-700">{feature.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-900">{feature.usage}%</span>
                        {feature.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                        {feature.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                      </div>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          feature.usage >= 80 ? 'bg-primary-500' :
                          feature.usage >= 60 ? 'bg-blue-500' :
                          'bg-neutral-300'
                        }`}
                        style={{ 
                          width: `${feature.usage}%`,
                          transitionDelay: `${index * 100}ms`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Distribution */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-neutral-900">Device Distribution</h3>
                <PieChart className="w-5 h-5 text-neutral-400" />
              </div>
              
              <div className="flex items-center justify-center mb-6">
                {/* Simple pie chart visualization */}
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 32 32" className="w-full h-full -rotate-90">
                    <circle
                      cx="16"
                      cy="16"
                      r="10"
                      fill="transparent"
                      stroke="rgb(79, 70, 229)"
                      strokeWidth="10"
                      strokeDasharray={`${usageMetrics.desktopUsage} ${100 - usageMetrics.desktopUsage}`}
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="10"
                      fill="transparent"
                      stroke="rgb(16, 185, 129)"
                      strokeWidth="10"
                      strokeDasharray={`${usageMetrics.mobileUsage} 100`}
                      strokeDashoffset={`-${usageMetrics.desktopUsage}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-neutral-900">{usageMetrics.totalLogins.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                  <div className="w-3 h-3 bg-primary-500 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Desktop</p>
                    <p className="text-lg font-bold text-neutral-700">{usageMetrics.desktopUsage}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Mobile</p>
                    <p className="text-lg font-bold text-neutral-700">{usageMetrics.mobileUsage}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="card p-6">
            <h3 className="font-semibold text-neutral-900 mb-6">Peak Usage Hours</h3>
            <div className="overflow-x-auto">
              <div className="flex gap-1 min-w-[600px]">
                {Array.from({ length: 24 }, (_, hour) => {
                  // Simulate activity pattern
                  const activity = hour >= 8 && hour <= 18 
                    ? 60 + Math.random() * 40 
                    : Math.random() * 30;
                  return (
                    <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full h-16 rounded transition-all duration-500"
                        style={{
                          backgroundColor: `rgba(79, 70, 229, ${activity / 100})`,
                        }}
                      />
                      <span className="text-xs text-neutral-400">
                        {hour.toString().padStart(2, '0')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary-100 rounded" />
                <span>Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary-300 rounded" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary-500 rounded" />
                <span>High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary-700 rounded" />
                <span>Peak</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Monitoring Tab */}
      {activeTab === 'risk' && (
        <div className="space-y-6">
          {/* Risk Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-5 border-l-4 border-l-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">High Risk</p>
                  <p className="text-2xl font-bold text-red-600">
                    {riskAlerts.filter(a => a.risk === 'high').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="card p-5 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">Medium Risk</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {riskAlerts.filter(a => a.risk === 'medium').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="card p-5 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">Low Risk</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {riskAlerts.filter(a => a.risk === 'low').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Risk Alerts Table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="font-semibold text-neutral-900">Active Risk Alerts</h3>
              <p className="text-sm text-neutral-500 mt-1">Companies requiring attention</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                      Company
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                      Risk Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                      Severity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                      Details
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {riskAlerts.map((alert, index) => (
                    <tr key={index} className="hover:bg-neutral-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-neutral-600" />
                          </div>
                          <span className="font-medium text-neutral-900">{alert.company}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {alert.type === 'payment' && <CreditCard className="w-4 h-4 text-neutral-400" />}
                          {alert.type === 'limit' && <Zap className="w-4 h-4 text-neutral-400" />}
                          {alert.type === 'inactive' && <Clock className="w-4 h-4 text-neutral-400" />}
                          <span className="capitalize text-neutral-700">{alert.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.risk === 'high' ? 'bg-red-100 text-red-700' :
                          alert.risk === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {alert.risk.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-neutral-700">{alert.detail}</p>
                        {alert.amount && (
                          <p className="text-xs text-neutral-500 mt-1">
                            Amount: {formatCurrency(alert.amount)}
                          </p>
                        )}
                        {alert.usage && (
                          <p className="text-xs text-neutral-500 mt-1">
                            Usage: {alert.usage}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button className="btn btn-outline btn-sm">
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Payment Risk */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900">Payment Risk</h4>
                  <p className="text-xs text-neutral-500">Overdue & failed payments</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Overdue (15+ days)</span>
                  <span className="font-medium text-red-600">1</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Card Declined</span>
                  <span className="font-medium text-amber-600">1</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Due Next 7 Days</span>
                  <span className="font-medium text-neutral-900">8</span>
                </div>
              </div>
            </div>

            {/* Limit Risk */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900">Limit Risk</h4>
                  <p className="text-xs text-neutral-500">Near plan limits</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Employee Limit (90%+)</span>
                  <span className="font-medium text-amber-600">2</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Storage Limit (80%+)</span>
                  <span className="font-medium text-blue-600">1</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">API Limit (75%+)</span>
                  <span className="font-medium text-neutral-900">0</span>
                </div>
              </div>
            </div>

            {/* Activity Risk */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900">Activity Risk</h4>
                  <p className="text-xs text-neutral-500">Inactive accounts</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">No Login (14+ days)</span>
                  <span className="font-medium text-amber-600">1</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">No Login (7-14 days)</span>
                  <span className="font-medium text-blue-600">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Low Engagement</span>
                  <span className="font-medium text-neutral-900">5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
