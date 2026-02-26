/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { 
  Users, Clock, Calendar, Wallet, TrendingUp, TrendingDown, ArrowRight, 
  Plus, CheckCircle, XCircle, UserPlus, ClipboardList, Banknote,
  AlertTriangle, BarChart3, Activity, Sparkles, CalendarCheck, FileText,
  UserX, Building2, PieChart, UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useHRStore } from '@/stores/useHRStore';

// Mock data - In real app, this would come from your database/API
const mockStats = {
  totalEmployees: 127,
  activeEmployees: 120,
  employeesOnLeave: 7,
  presentToday: 98,
  pendingLeaveRequests: 5,
  payrollStatus: 'In Progress',
  monthlyPayroll: 4250000,
};

const mockDepartments = [
  { name: 'Engineering', count: 45, color: 'bg-blue-500' },
  { name: 'Sales', count: 32, color: 'bg-emerald-500' },
  { name: 'Marketing', count: 18, color: 'bg-purple-500' },
  { name: 'HR', count: 12, color: 'bg-amber-500' },
  { name: 'Finance', count: 15, color: 'bg-rose-500' },
  { name: 'Operations', count: 5, color: 'bg-indigo-500' },
];

const mockRecentActivities = [
  { id: 1, action: 'New employee hired', employee: 'Maria Santos', time: '2 hours ago', type: 'hire', icon: UserPlus },
  { id: 2, action: 'Leave request approved', employee: 'Juan Dela Cruz', time: '3 hours ago', type: 'leave', icon: CheckCircle },
  { id: 3, action: 'Salary updated', employee: 'Anna Reyes', time: '5 hours ago', type: 'salary', icon: Wallet },
  { id: 4, action: 'Department transfer', employee: 'Carlos Lopez', time: '1 day ago', type: 'transfer', icon: Building2 },
  { id: 5, action: 'Performance review completed', employee: 'Lisa Chen', time: '2 days ago', type: 'review', icon: BarChart3 },
];

// Dashboard stats with real data
const stats = [
  {
    name: 'Total Employees',
    value: mockStats.totalEmployees.toString(),
    change: '+5%',
    changeType: 'increase',
    icon: Users,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    description: 'All workforce',
  },
  {
    name: 'Active Employees',
    value: mockStats.activeEmployees.toString(),
    change: '+2%',
    changeType: 'increase',
    icon: UserCheck,
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    description: 'Currently working',
  },
  {
    name: 'Employees On Leave',
    value: mockStats.employeesOnLeave.toString(),
    change: '-3%',
    changeType: 'decrease',
    icon: UserX,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    description: 'Currently on leave',
  },
  {
    name: 'Monthly Payroll',
    value: `₱${(mockStats.monthlyPayroll / 1000000).toFixed(1)}M`,
    change: 'On Track',
    changeType: 'increase',
    icon: Wallet,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    description: 'Current period',
  },
];

// Recent employees - populated from database
const recentEmployees: { id: number; name: string; position: string; department: string; hireDate: string; avatar: string; status: string }[] = [];

// Pending leaves - populated from database  
const pendingLeaves: { id: number; employee: string; type: string; days: number; status: string; avatar: string; urgency: string }[] = [];

// Today's attendance - populated from database
const todayAttendance: { id: number; name: string; timeIn: string; status: string; avatar: string }[] = [];

// Upcoming payroll - populated from database
const upcomingPayroll = {
  nextPayDate: 'February 28, 2026',
  cutoffDate: 'February 15, 2026',
  employeesCount: mockStats.activeEmployees,
  estimatedAmount: `₱${(mockStats.monthlyPayroll / 1000000).toFixed(1)}M`,
  status: mockStats.payrollStatus,
};

const quickActions = [
  { icon: UserPlus, label: 'Add Employee', to: '/app/employees/new', color: 'from-blue-500 to-blue-600', hoverBg: 'hover:bg-blue-50' },
  { icon: ClipboardList, label: 'Take Attendance', to: '/app/attendance', color: 'from-emerald-500 to-emerald-600', hoverBg: 'hover:bg-emerald-50' },
  { icon: Calendar, label: 'File Leave', to: '/app/leaves/new', color: 'from-amber-500 to-amber-600', hoverBg: 'hover:bg-amber-50' },
  { icon: Banknote, label: 'Process Payroll', to: '/app/payroll', color: 'from-purple-500 to-purple-600', hoverBg: 'hover:bg-purple-50' },
];

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function DashboardPage() {
  const { user } = useAuthStore();
  const { getDashboardStats, employees, leaveRequests, attendance, payrollPeriods, approveLeave, rejectLeave } = useHRStore();
  const liveStats = getDashboardStats();
  const today = new Date().toISOString().split('T')[0];

  // Derive live dashboard data from store
  const liveRecentEmployees = [...employees]
    .sort((a, b) => b.hireDate.localeCompare(a.hireDate))
    .slice(0, 5)
    .map(e => ({
      id: e.id,
      name: e.firstName + ' ' + e.lastName,
      position: e.position,
      department: e.department,
      hireDate: e.hireDate,
      avatar: `${e.firstName[0]}${e.lastName[0]}`.toUpperCase(),
      status: e.status,
    }));

  const livePendingLeaves = leaveRequests
    .filter(l => l.status === 'pending')
    .map(l => ({
      id: l.id,
      employee: l.employeeName,
      avatar: l.employeeName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
      type: l.type,
      days: l.days,
      urgency: l.type === 'Emergency' || l.type === 'Bereavement' ? 'urgent' : 'normal',
    }));

  const liveTodayAttendance = attendance
    .filter(a => a.date === today)
    .map(a => ({
      id: a.id,
      name: a.employeeName,
      avatar: a.employeeName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
      timeIn: a.timeIn || '--:--',
      status: a.status === 'present' ? 'on-time' : a.status === 'late' ? 'late' : a.status,
    }));

  // Compute department distribution dynamically
  const deptColors = ['bg-blue-500','bg-emerald-500','bg-purple-500','bg-amber-500','bg-rose-500','bg-indigo-500','bg-teal-500','bg-orange-500'];
  const deptMap = new Map<string, number>();
  employees.filter(e => e.status === 'active').forEach(e => deptMap.set(e.department, (deptMap.get(e.department) || 0) + 1));
  const liveDepartments = Array.from(deptMap.entries()).map(([name, count], i) => ({ name, count, color: deptColors[i % deptColors.length] }));

  const latestPeriod = payrollPeriods[0];
  const liveUpcomingPayroll = {
    nextPayDate: latestPeriod?.payDate || 'TBD',
    cutoffDate: latestPeriod?.endDate || 'TBD',
    employeesCount: liveStats.activeEmployees,
    estimatedAmount: `₱${((latestPeriod?.netPay || liveStats.monthlyPayroll) / 1000000).toFixed(1)}M`,
    status: latestPeriod?.status === 'draft' ? 'In Progress' : latestPeriod?.status === 'completed' ? 'Completed' : 'Pending',
  };

  const liveStatCards = [
    { name: 'Total Employees', value: liveStats.totalEmployees.toString(), change: '+5%', changeType: 'increase' as const, icon: Users, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-600', description: 'All workforce' },
    { name: 'Active Employees', value: liveStats.activeEmployees.toString(), change: '+2%', changeType: 'increase' as const, icon: UserCheck, color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600', description: 'Currently working' },
    { name: 'Employees On Leave', value: liveStats.onLeave.toString(), change: '-3%', changeType: 'decrease' as const, icon: UserX, color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-50', textColor: 'text-amber-600', description: 'Currently on leave' },
    { name: 'Monthly Payroll', value: `₱${(liveStats.monthlyPayroll / 1000000).toFixed(1)}M`, change: 'On Track', changeType: 'increase' as const, icon: Wallet, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', textColor: 'text-purple-600', description: 'Current period' },
  ];

  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'border-l-red-500 bg-red-50/50';
      case 'high': return 'border-l-amber-500 bg-amber-50/50';
      default: return 'border-l-blue-500 bg-blue-50/50';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-amber-600">{greeting}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900">
            Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-neutral-500 mt-1">
            Here's what's happening with your team today.
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/app/employees/new" 
            className="btn btn-primary shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={18} />
            Add Employee
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {liveStatCards.map((stat, index) => (
          <div 
            key={stat.name} 
            className={`card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default group ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full ${
                stat.changeType === 'increase' 
                  ? 'text-emerald-700 bg-emerald-100' 
                  : 'text-red-700 bg-red-100'
              }`}>
                {stat.changeType === 'increase' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">{stat.value}</p>
              <p className="text-sm font-medium text-neutral-700 mt-1">{stat.name}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Department Overview - Takes 2 columns */}
        <div className={`xl:col-span-2 card overflow-hidden transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
          <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-xl">
                  <Building2 className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">Department Overview</h2>
                  <p className="text-sm text-neutral-500">Employee distribution by department</p>
                </div>
              </div>
              <Link 
                to="/app/reports" 
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
              >
                View reports <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {liveDepartments.map((dept, index) => (
                <div 
                  key={dept.name}
                  className="text-center p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <div className={`w-12 h-12 ${dept.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <span className="text-white font-bold text-lg">{dept.count}</span>
                  </div>
                  <h3 className="font-semibold text-neutral-900 text-sm">{dept.name}</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {((dept.count / (liveStats.totalEmployees || 1)) * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities Panel */}
        <div className={`card overflow-hidden transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '500ms' }}>
          <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">Recent Activities</h2>
                  <p className="text-sm text-neutral-500">Latest HR actions</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                Live
              </span>
            </div>
          </div>
          <div className="divide-y divide-neutral-100">
            {mockRecentActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="p-4 hover:bg-neutral-50/80 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'hire' ? 'bg-emerald-100' :
                    activity.type === 'leave' ? 'bg-green-100' :
                    activity.type === 'salary' ? 'bg-purple-100' :
                    activity.type === 'transfer' ? 'bg-blue-100' :
                    'bg-amber-100'
                  }`}>
                    <activity.icon size={16} className={
                      activity.type === 'hire' ? 'text-emerald-600' :
                      activity.type === 'leave' ? 'text-green-600' :
                      activity.type === 'salary' ? 'text-purple-600' :
                      activity.type === 'transfer' ? 'text-blue-600' :
                      'text-amber-600'
                    } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800">{activity.action}</p>
                    <p className="text-sm text-primary-600 font-medium">{activity.employee}</p>
                    <p className="text-xs text-neutral-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-neutral-50 border-t border-neutral-100">
            <Link 
              to="/app/reports" 
              className="w-full btn btn-secondary btn-sm justify-center"
            >
              View All Activities
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Employees */}
        <div className={`xl:col-span-2 card overflow-hidden transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '600ms' }}>
          <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-xl">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">Recent Employees</h2>
                  <p className="text-sm text-neutral-500">Newly hired team members</p>
                </div>
              </div>
              <Link 
                to="/app/employees" 
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
              >
                View all <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-neutral-100">
            {liveRecentEmployees.map((employee, index) => (
              <div 
                key={employee.id} 
                className="p-4 flex items-center justify-between hover:bg-neutral-50/80 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                      <span className="text-white font-semibold text-sm">{employee.avatar}</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">{employee.name}</p>
                    <p className="text-sm text-neutral-500">{employee.position}</p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-neutral-100 text-xs font-medium text-neutral-600">
                    {employee.department}
                  </span>
                  <p className="text-xs text-neutral-400 mt-1.5">Hired {formatDate(employee.hireDate)}</p>
                </div>
              </div>
            ))}
          </div>
          {liveRecentEmployees.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
              <p className="text-neutral-500">No recent employees</p>
            </div>
          )}
        </div>

        {/* Pending Leaves */}
        <div className={`card overflow-hidden transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '500ms' }}>
          <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-amber-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">Pending Leaves</h2>
                  <p className="text-sm text-neutral-500">Awaiting approval</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                {livePendingLeaves.length} pending
              </span>
            </div>
          </div>
          <div className="divide-y divide-neutral-100">
            {livePendingLeaves.map((leave) => (
              <div 
                key={leave.id} 
                className={`p-4 border-l-4 ${getUrgencyColor(leave.urgency)} hover:bg-opacity-80 transition-colors`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neutral-400 to-neutral-500 flex items-center justify-center">
                      <span className="text-white font-medium text-xs">{leave.avatar}</span>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 text-sm">{leave.employee}</p>
                      <p className="text-xs text-neutral-500">{leave.type} Leave</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-neutral-600 bg-white px-2 py-1 rounded-md shadow-sm">
                    {leave.days} day{leave.days > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { approveLeave(String(leave.id)); }} className="flex-1 btn btn-sm bg-emerald-500 hover:bg-emerald-600 text-white text-xs py-1.5">
                    <CheckCircle size={14} />
                    Approve
                  </button>
                  <button onClick={() => { rejectLeave(String(leave.id), 'Declined from dashboard'); }} className="flex-1 btn btn-sm bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-xs py-1.5">
                    <XCircle size={14} />
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-neutral-50 border-t border-neutral-100">
            <Link 
              to="/app/leaves" 
              className="w-full btn btn-secondary btn-sm justify-center"
            >
              View All Requests
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Panels Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance */}
        <div className={`card overflow-hidden transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '550ms' }}>
          <div className="p-5 border-b border-neutral-100 bg-gradient-to-r from-emerald-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Clock className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-neutral-900">Today's Attendance</h2>
                  <p className="text-xs text-neutral-500">Live check-in status</p>
                </div>
              </div>
            </div>
          </div>
          <div className="divide-y divide-neutral-100 max-h-60 overflow-y-auto">
            {liveTodayAttendance.map((att) => (
              <div key={att.id} className="px-4 py-3 flex items-center justify-between hover:bg-neutral-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center">
                    <span className="text-white font-medium text-xs">{att.avatar}</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-800">{att.name.split(' ')[0]}</span>
                </div>
                <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">{att.timeIn}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    att.status === 'on-time' ? 'bg-emerald-500' :
                    att.status === 'early' ? 'bg-blue-500' :
                    att.status === 'late' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-neutral-50 border-t border-neutral-100">
            <Link to="/app/attendance" className="w-full btn btn-secondary btn-sm justify-center text-xs">
              View Full Attendance
            </Link>
          </div>
        </div>

        {/* Upcoming Payroll Schedule */}
        <div className={`card overflow-hidden transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '600ms' }}>
          <div className="p-5 border-b border-neutral-100 bg-gradient-to-r from-purple-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <CalendarCheck className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-neutral-900">Upcoming Payroll</h2>
                  <p className="text-xs text-neutral-500">Next pay schedule</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-purple-600">{liveUpcomingPayroll.nextPayDate}</p>
              <p className="text-sm text-neutral-500 mt-1">Next Pay Date</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Cutoff Date</span>
                <span className="font-medium text-neutral-800">{liveUpcomingPayroll.cutoffDate}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Employees</span>
                <span className="font-medium text-neutral-800">{liveUpcomingPayroll.employeesCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Est. Amount</span>
                <span className="font-medium text-neutral-800">{liveUpcomingPayroll.estimatedAmount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Status</span>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">{liveUpcomingPayroll.status}</span>
              </div>
            </div>
          </div>
          <div className="p-3 bg-neutral-50 border-t border-neutral-100">
            <Link to="/app/payroll" className="w-full btn btn-primary btn-sm justify-center text-xs">
              Process Payroll
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`card p-6 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '700ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 rounded-xl">
            <Activity className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Quick Actions</h2>
            <p className="text-sm text-neutral-500">Frequently used operations</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link 
              key={action.label}
              to={action.to} 
              className={`group p-5 rounded-2xl border-2 border-neutral-100 ${action.hoverBg} hover:border-neutral-200 transition-all duration-300 text-center hover:shadow-md hover:-translate-y-1`}
            >
              <div className={`w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-neutral-700 group-hover:text-neutral-900 transition-colors">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Statistics Overview */}
      <div className={`card p-6 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '700ms' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Monthly Overview</h2>
              <p className="text-sm text-neutral-500">Key metrics at a glance</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-neutral-50 rounded-xl">
            <p className="text-3xl font-bold text-emerald-600">98%</p>
            <p className="text-sm text-neutral-600 mt-1">Avg. Attendance</p>
          </div>
          <div className="text-center p-4 bg-neutral-50 rounded-xl">
            <p className="text-3xl font-bold text-blue-600">12</p>
            <p className="text-sm text-neutral-600 mt-1">New Hires</p>
          </div>
          <div className="text-center p-4 bg-neutral-50 rounded-xl">
            <p className="text-3xl font-bold text-amber-600">45</p>
            <p className="text-sm text-neutral-600 mt-1">Leaves Approved</p>
          </div>
          <div className="text-center p-4 bg-neutral-50 rounded-xl">
            <p className="text-3xl font-bold text-purple-600">₱2.4M</p>
            <p className="text-sm text-neutral-600 mt-1">Total Payroll</p>
          </div>
        </div>
      </div>
    </div>
  );
}
