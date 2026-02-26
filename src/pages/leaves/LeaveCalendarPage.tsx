/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Filter, Users, 
  CalendarDays, TrendingUp, CheckCircle, Clock, XCircle,
  User, MapPin, Phone, MessageSquare, AlertTriangle,
  Download, FileText, Eye, Edit3, X
} from 'lucide-react';

// Import leave data (in real app this would come from API)
const mockLeaves = [
  { 
    id: 1, 
    employee: 'Maria Santos', 
    avatar: 'MS', 
    department: 'Human Resources', 
    type: 'Vacation', 
    startDate: '2024-02-15', 
    endDate: '2024-02-19', 
    days: 5, 
    status: 'pending', 
    reason: 'Family vacation to Palawan. Will be celebrating my anniversary with my spouse.', 
    requestDate: '2024-01-28',
    supervisor: 'John Manager',
    emergencyContact: '+63 917 123 4567'
  },
  { 
    id: 2, 
    employee: 'Juan dela Cruz', 
    avatar: 'JC', 
    department: 'Engineering', 
    type: 'Sick', 
    startDate: '2024-02-08', 
    endDate: '2024-02-09', 
    days: 2, 
    status: 'approved', 
    reason: 'Flu symptoms and high fever. Doctor advised rest for recovery.', 
    requestDate: '2024-02-07',
    supervisor: 'Tech Lead'
  },
  { 
    id: 3, 
    employee: 'Ana Rodriguez', 
    avatar: 'AR', 
    department: 'Marketing', 
    type: 'Emergency', 
    startDate: '2024-01-30', 
    endDate: '2024-01-30', 
    days: 1, 
    status: 'approved', 
    reason: 'Family emergency - grandfather hospitalized. Need to assist with medical care.', 
    requestDate: '2024-01-29',
    supervisor: 'Marketing Head'
  },
  { 
    id: 5, 
    employee: 'Isabel Garcia', 
    avatar: 'IG', 
    department: 'Operations', 
    type: 'Maternity', 
    startDate: '2024-03-01', 
    endDate: '2024-06-14', 
    days: 105, 
    status: 'approved', 
    reason: 'Maternity leave for childbirth and newborn care as per Philippine labor law.', 
    requestDate: '2024-01-15',
    supervisor: 'Operations Head'
  },
];

// Employee leave balances
const employeeBalance = {
  vacation: { used: 5, available: 10, total: 15 },
  sick: { used: 2, available: 8, total: 10 },
  emergency: { used: 1, available: 2, total: 3 },
  personal: { used: 0, available: 3, total: 3 }
};

export function LeaveCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [selectedLeave, setSelectedLeave] = useState<typeof mockLeaves[0] | null>(null);
  const [mounted, setMounted] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const weeks = [];
  const current = new Date(startDate);
  
  while (current <= lastDay || weeks.length < 6) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  // Filter leaves
  const filteredLeaves = mockLeaves.filter(leave => {
    const matchesDepartment = !filterDepartment || leave.department === filterDepartment;
    const matchesStatus = !filterStatus || leave.status === filterStatus;
    return matchesDepartment && matchesStatus;
  });

  // Get leaves for a specific date
  const getLeavesForDate = (date: Date) => {
    return filteredLeaves.filter(leave => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      return date >= leaveStart && date <= leaveEnd;
    });
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'Vacation': return 'bg-blue-500';
      case 'Sick': return 'bg-amber-500';
      case 'Emergency': return 'bg-red-500';
      case 'Maternity': return 'bg-pink-500';
      case 'Paternity': return 'bg-purple-500';
      case 'Bereavement': return 'bg-gray-500';
      default: return 'bg-neutral-500';
    }
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'approved': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'rejected': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
      default: return { bg: 'bg-neutral-50 dark:bg-slate-800', text: 'text-neutral-700 dark:text-slate-300', border: 'border-neutral-200 dark:border-slate-700' };
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(year, month + (direction === 'next' ? 1 : -1)));
  };

  const LeaveDetailsModal = () => {
    if (!selectedLeave) return null;
    
    const statusColors = getStatusColors(selectedLeave.status);
    const StatusIcon = selectedLeave.status === 'approved' ? CheckCircle : 
                      selectedLeave.status === 'pending' ? Clock : XCircle;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-neutral-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                  <span className="font-semibold text-primary-600">{selectedLeave.avatar}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{selectedLeave.employee}</h2>
                  <p className="text-neutral-500 dark:text-slate-400">{selectedLeave.department}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLeave(null)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-600 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Leave Details */}
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Leave Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-slate-400">Type:</span>
                  <span className={`badge ${getLeaveTypeColor(selectedLeave.type)} text-white`}>
                    {selectedLeave.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-slate-400">Duration:</span>
                  <span className="font-medium">
                    {new Date(selectedLeave.startDate).toLocaleDateString()} - {new Date(selectedLeave.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-slate-400">Days:</span>
                  <span className="font-medium">{selectedLeave.days} day{selectedLeave.days > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-slate-400">Status:</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${statusColors.text}`} />
                    <span className={`badge ${statusColors.bg} ${statusColors.text} ${statusColors.border} capitalize`}>
                      {selectedLeave.status}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-slate-400">Requested:</span>
                  <span className="font-medium">{new Date(selectedLeave.requestDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Reason</h3>
              <div className="p-3 bg-neutral-50 dark:bg-slate-800 rounded-lg">
                <p className="text-neutral-700 dark:text-slate-300">{selectedLeave.reason}</p>
              </div>
            </div>

            {/* Contact Info */}
            {selectedLeave.emergencyContact && (
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Emergency Contact</h3>
                <div className="flex items-center gap-2 text-neutral-700 dark:text-slate-300">
                  <Phone className="w-4 h-4" />
                  <span>{selectedLeave.emergencyContact}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-slate-700">
              {selectedLeave.status === 'pending' && (
                <>
                  <button className="btn btn-primary flex-1">
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button className="btn btn-outline flex-1">
                    <XCircle size={16} />
                    Reject
                  </button>
                </>
              )}
              <button className="btn btn-secondary">
                <MessageSquare size={16} />
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-xl">
            <CalendarDays className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-white">Leave Calendar</h1>
            <p className="text-neutral-500 dark:text-slate-400 text-sm">Visual overview of employee leave schedules</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-slate-700 rounded-lg">
            <button 
              onClick={() => setViewMode('month')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'month' ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Month
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="card p-5 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white">{filteredLeaves.length}</p>
              <p className="text-sm text-neutral-500 dark:text-slate-400">Active Requests</p>
            </div>
          </div>
        </div>
        <div className="card p-5 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white">{filteredLeaves.filter(l => l.status === 'approved').length}</p>
              <p className="text-sm text-neutral-500 dark:text-slate-400">Approved</p>
            </div>
          </div>
        </div>
        <div className="card p-5 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white">{filteredLeaves.filter(l => l.status === 'pending').length}</p>
              <p className="text-sm text-neutral-500 dark:text-slate-400">Pending</p>
            </div>
          </div>
        </div>
        <div className="card p-5 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white">{filteredLeaves.reduce((sum, l) => sum + l.days, 0)}</p>
              <p className="text-sm text-neutral-500 dark:text-slate-400">Total Days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Calendar View */}
        <div className={`xl:col-span-3 card overflow-hidden transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Calendar Header */}
          <div className="p-6 border-b border-neutral-100 dark:border-slate-700 bg-gradient-to-r from-neutral-50 dark:from-slate-800 to-white dark:to-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-1">
                  <button 
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="input w-auto text-sm"
                >
                  <option value="">All Departments</option>
                  <option value="Human Resources">HR</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input w-auto text-sm"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          {viewMode === 'month' && (
            <div className="p-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-semibold text-neutral-500 dark:text-slate-400">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="space-y-2">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 gap-2">
                    {week.map((date, dayIndex) => {
                      const leavesForDate = getLeavesForDate(date);
                      const isCurrentMonth = date.getMonth() === month;
                      const isToday = date.toDateString() === new Date().toDateString();
                      
                      return (
                        <div 
                          key={dayIndex}
                          className={`min-h-[100px] p-2 border border-neutral-100 dark:border-slate-700 rounded-lg ${
                            isCurrentMonth ? 'bg-white' : 'bg-neutral-50 dark:bg-slate-800'
                          } ${isToday ? 'ring-2 ring-primary-500' : ''}`}
                        >
                          <div className={`text-sm font-medium mb-1 ${
                            isCurrentMonth ? 'text-neutral-900' : 'text-neutral-400 dark:text-slate-500'
                          } ${isToday ? 'text-primary-600' : ''}`}>
                            {date.getDate()}
                          </div>
                          <div className="space-y-1">
                            {leavesForDate.slice(0, 2).map((leave, index) => (
                              <button
                                key={index}
                                onClick={() => setSelectedLeave(leave)}
                                className={`w-full text-xs p-1 rounded text-white text-left hover:opacity-80 transition-opacity ${getLeaveTypeColor(leave.type)}`}
                                title={`${leave.employee} - ${leave.type}`}
                              >
                                <div className="truncate">{leave.employee}</div>
                                <div className="truncate opacity-75">{leave.type}</div>
                              </button>
                            ))}
                            {leavesForDate.length > 2 && (
                              <div className="text-xs text-neutral-500 dark:text-slate-400 text-center p-1">
                                +{leavesForDate.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="p-6">
              <div className="space-y-4">
                {filteredLeaves.map((leave) => {
                  const statusColors = getStatusColors(leave.status);
                  const StatusIcon = leave.status === 'approved' ? CheckCircle : 
                                    leave.status === 'pending' ? Clock : XCircle;
                  
                  return (
                    <div key={leave.id} className="flex items-center gap-4 p-4 border border-neutral-200 dark:border-slate-700 rounded-xl hover:shadow-sm transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                        <span className="font-semibold text-primary-600">{leave.avatar}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-neutral-900 dark:text-white">{leave.employee}</h3>
                            <p className="text-sm text-neutral-500 dark:text-slate-400">{leave.department}</p>
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${statusColors.bg} ${statusColors.text}`}>
                              <StatusIcon className="w-3 h-3" />
                              <span className="text-xs font-medium capitalize">{leave.status}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600 dark:text-slate-400">
                          <span className={`badge ${getLeaveTypeColor(leave.type)} text-white`}>{leave.type}</span>
                          <span>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</span>
                          <span>{leave.days} day{leave.days > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedLeave(leave)}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-neutral-400 dark:text-slate-500" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Leave Balance Sidebar */}
        <div className={`space-y-6 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* My Leave Balance */}
          <div className="card">
            <div className="p-4 border-b border-neutral-100 dark:border-slate-700">
              <h3 className="font-semibold text-neutral-900 dark:text-white">My Leave Balance</h3>
              <p className="text-sm text-neutral-500 dark:text-slate-400">Current year allocation</p>
            </div>
            <div className="p-4 space-y-4">
              {Object.entries(employeeBalance).map(([type, balance]) => (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="capitalize font-medium">{type}</span>
                    <span>{balance.available} / {balance.total}</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full" 
                      style={{ width: `${(balance.available / balance.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="card">
            <div className="p-4 border-b border-neutral-100 dark:border-slate-700">
              <h3 className="font-semibold text-neutral-900 dark:text-white">Leave Types</h3>
            </div>
            <div className="p-4 space-y-3">
              {[
                { type: 'Vacation', color: 'bg-blue-500' },
                { type: 'Sick', color: 'bg-amber-500' },
                { type: 'Emergency', color: 'bg-red-500' },
                { type: 'Maternity', color: 'bg-pink-500' },
                { type: 'Paternity', color: 'bg-purple-500' },
                { type: 'Bereavement', color: 'bg-gray-500' },
              ].map(({ type, color }) => (
                <div key={type} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${color}`}></div>
                  <span className="text-sm text-neutral-700 dark:text-slate-300">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leave Details Modal */}
      {selectedLeave && <LeaveDetailsModal />}
    </div>
  );
}