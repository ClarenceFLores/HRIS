/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { 
  Clock, Calendar, CheckCircle, XCircle, AlertCircle, 
  ChevronLeft, ChevronRight, Search, Download, Filter,
  Users, Timer, TrendingUp, BarChart3, RefreshCw
} from 'lucide-react';
import { useHRStore } from '@/stores/useHRStore';
import { useAppStore } from '@/stores/useAppStore';

export function AttendancePage() {
  const { attendance, refreshAttendance } = useHRStore();
  const { addToast } = useAppStore();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter attendance by selected date
  const dateAttendance = attendance.filter(a => a.date === date);

  const filteredAttendance = dateAttendance.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const presentCount = dateAttendance.filter(r => r.status === 'present').length;
  const lateCount = dateAttendance.filter(r => r.status === 'late' || r.status === 'early-out').length;
  const absentCount = dateAttendance.filter(r => r.status === 'absent').length;
  const onLeaveCount = dateAttendance.filter(r => r.status === 'on-leave').length;
  const hoursWorked = dateAttendance.filter(r => r.hours > 0);
  const avgHours = hoursWorked.length ? (hoursWorked.reduce((sum, r) => sum + r.hours, 0) / hoursWorked.length).toFixed(1) : '0.0';
  const totalEmployees = dateAttendance.length;
  const attendanceRate = totalEmployees ? ((presentCount + lateCount) / totalEmployees * 100).toFixed(0) : '0';

  const handleExport = () => {
    const headers = ['Employee', 'Department', 'Date', 'Time In', 'Time Out', 'Hours', 'Status'];
    const rows = filteredAttendance.map(r => [r.employeeName, r.department, r.date, r.timeIn || '--', r.timeOut || '--', r.hours.toString(), r.status]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `attendance-${date}.csv`; a.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', title: 'Exported', message: `Attendance for ${date} exported as CSV.` });
  };

  const handleRefresh = () => {
    refreshAttendance();
    addToast({ type: 'info', title: 'Refreshed', message: 'Attendance records reloaded.' });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'present':
        return { 
          icon: CheckCircle, 
          color: 'text-emerald-600', 
          bg: 'bg-emerald-100', 
          badge: 'bg-emerald-100 text-emerald-700',
          label: 'Present'
        };
      case 'late':
        return { 
          icon: AlertCircle, 
          color: 'text-amber-600', 
          bg: 'bg-amber-100', 
          badge: 'bg-amber-100 text-amber-700',
          label: 'Late'
        };
      case 'early-out':
        return { 
          icon: Clock, 
          color: 'text-orange-600', 
          bg: 'bg-orange-100', 
          badge: 'bg-orange-100 text-orange-700',
          label: 'Early Out'
        };
      case 'absent':
        return { 
          icon: XCircle, 
          color: 'text-red-600', 
          bg: 'bg-red-100', 
          badge: 'bg-red-100 text-red-700',
          label: 'Absent'
        };
      case 'on-leave':
        return { 
          icon: Calendar, 
          color: 'text-blue-600', 
          bg: 'bg-blue-100', 
          badge: 'bg-blue-100 text-blue-700',
          label: 'On Leave'
        };
      default:
        return { 
          icon: Clock, 
          color: 'text-neutral-600', 
          bg: 'bg-neutral-100', 
          badge: 'bg-neutral-100 text-neutral-700',
          label: status
        };
    }
  };

  const changeDate = (days: number) => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + days);
    setDate(currentDate.toISOString().split('T')[0]);
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-PH', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-xl">
              <Clock className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-neutral-900">Attendance</h1>
              <p className="text-neutral-500 text-sm">Track and manage daily attendance</p>
            </div>
          </div>
        </div>
        
        {/* Date Picker */}
        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl p-1.5 shadow-sm">
          <button 
            onClick={() => changeDate(-1)}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft size={20} className="text-neutral-600" />
          </button>
          <div className="relative flex items-center gap-2 px-3">
            <Calendar className="w-5 h-5 text-primary-500" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-0 text-sm font-medium text-neutral-900 focus:outline-none cursor-pointer"
            />
          </div>
          <button 
            onClick={() => changeDate(1)}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Next day"
          >
            <ChevronRight size={20} className="text-neutral-600" />
          </button>
        </div>
      </div>

      {/* Date Label */}
      <div className={`text-center transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
          <Calendar size={16} />
          {formatDisplayDate(date)}
        </span>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="card p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-xl">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{presentCount}</p>
              <p className="text-xs text-neutral-500">Present</p>
            </div>
          </div>
        </div>
        <div className="card p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{lateCount}</p>
              <p className="text-xs text-neutral-500">Late/Early Out</p>
            </div>
          </div>
        </div>
        <div className="card p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 rounded-xl">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{absentCount}</p>
              <p className="text-xs text-neutral-500">Absent</p>
            </div>
          </div>
        </div>
        <div className="card p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{onLeaveCount}</p>
              <p className="text-xs text-neutral-500">On Leave</p>
            </div>
          </div>
        </div>
        <div className="card p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 rounded-xl">
              <Timer className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{avgHours}h</p>
              <p className="text-xs text-neutral-500">Avg Hours</p>
            </div>
          </div>
        </div>
        <div className="card p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{attendanceRate}%</p>
              <p className="text-xs text-primary-100">Attendance Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className={`card overflow-hidden transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Filters */}
        <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 bg-white"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input w-auto min-w-[140px] bg-white"
              >
                <option value="">All Status</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="early-out">Early Out</option>
                <option value="absent">Absent</option>
                <option value="on-leave">On Leave</option>
              </select>
              <button className="btn btn-secondary" onClick={handleExport}>
                <Download size={18} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="bg-neutral-50">
                <th className="font-semibold">Employee</th>
                <th className="font-semibold">Department</th>
                <th className="font-semibold text-center">Time In</th>
                <th className="font-semibold text-center">Time Out</th>
                <th className="font-semibold text-center">Hours</th>
                <th className="font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((record) => {
                const statusConfig = getStatusConfig(record.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <tr key={record.id} className="group hover:bg-neutral-50 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-sm">{`${record.employeeName.split(' ')[0][0]}${record.employeeName.split(' ').slice(-1)[0][0]}`.toUpperCase()}</span>
                        </div>
                        <span className="font-medium text-neutral-900">{record.employeeName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-neutral-600">{record.department}</span>
                    </td>
                    <td className="text-center">
                      <span className={`font-mono text-sm ${record.timeIn === '--:--' ? 'text-neutral-400' : 'text-neutral-900'}`}>
                        {record.timeIn}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`font-mono text-sm ${record.timeOut === '--:--' ? 'text-neutral-400' : 'text-neutral-900'}`}>
                        {record.timeOut}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`font-medium ${record.hours === 0 ? 'text-neutral-400' : record.hours >= 8 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {record.hours > 0 ? `${record.hours}h` : '-'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                        <span className={`badge ${statusConfig.badge}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredAttendance.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
              <Users className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">No records found</h3>
            <p className="text-neutral-500">
              No attendance records match your search criteria.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            Showing {filteredAttendance.length} of {dateAttendance.length} records
          </p>
          <button className="btn btn-ghost text-sm" onClick={handleRefresh}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Status Legend</h3>
        <div className="flex flex-wrap gap-4">
          {['present', 'late', 'early-out', 'absent', 'on-leave'].map((status) => {
            const config = getStatusConfig(status);
            const StatusIcon = config.icon;
            return (
              <div key={status} className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${config.bg}`}>
                  <StatusIcon className={`w-4 h-4 ${config.color}`} />
                </div>
                <span className="text-sm text-neutral-600">{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
