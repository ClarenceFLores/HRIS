/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, CheckCircle, XCircle, Clock, Search, Filter, 
  Calendar, FileText, AlertTriangle, TrendingUp, Eye,
  ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { useHRStore } from '@/stores/useHRStore';
import { useAppStore } from '@/stores/useAppStore';

// Fallback static mock leaves (only used if store is empty)
const _unused_mockLeaves_kept_for_reference = [
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
    id: 4, 
    employee: 'Carlos Mendoza', 
    avatar: 'CM', 
    department: 'Finance', 
    type: 'Vacation', 
    startDate: '2024-02-20', 
    endDate: '2024-02-23', 
    days: 4, 
    status: 'pending', 
    reason: 'Pre-planned vacation to Baguio with family. Hotel bookings already confirmed.', 
    requestDate: '2024-02-01',
    supervisor: 'Finance Manager'
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
  { 
    id: 6, 
    employee: 'Roberto Torres', 
    avatar: 'RT', 
    department: 'Sales', 
    type: 'Bereavement', 
    startDate: '2024-02-05', 
    endDate: '2024-02-07', 
    days: 3, 
    status: 'approved', 
    reason: 'Bereavement leave for father\'s passing. Need time for funeral arrangements and mourning.', 
    requestDate: '2024-02-04',
    supervisor: 'Sales Director'
  },
  { 
    id: 7, 
    employee: 'Sofia Reyes', 
    avatar: 'SR', 
    department: 'Customer Service', 
    type: 'Sick', 
    startDate: '2024-01-25', 
    endDate: '2024-01-26', 
    days: 2, 
    status: 'rejected', 
    reason: 'Mild headache and feeling unwell. Want to rest at home.', 
    requestDate: '2024-01-24',
    supervisor: 'CS Manager',
    rejectionReason: 'Insufficient medical justification for sick leave. Please provide medical certificate for future requests.'
  },
  { 
    id: 8, 
    employee: 'Miguel Castillo', 
    avatar: 'MC', 
    department: 'Engineering', 
    type: 'Paternity', 
    startDate: '2024-02-12', 
    endDate: '2024-02-18', 
    days: 7, 
    status: 'pending', 
    reason: 'Paternity leave for newborn child care and supporting my wife during recovery period.', 
    requestDate: '2024-01-20',
    supervisor: 'Engineering Lead'
  },
  { 
    id: 9, 
    employee: 'Carmen Lopez', 
    avatar: 'CL', 
    department: 'Human Resources', 
    type: 'Vacation', 
    startDate: '2024-01-22', 
    endDate: '2024-01-24', 
    days: 3, 
    status: 'approved', 
    reason: 'Long weekend getaway to Boracay. Advance booking for cheaper accommodation.', 
    requestDate: '2024-01-10',
    supervisor: 'HR Director'
  },
  { 
    id: 10, 
    employee: 'David Kim', 
    avatar: 'DK', 
    department: 'Finance', 
    type: 'Emergency', 
    startDate: '2024-02-14', 
    endDate: '2024-02-14', 
    days: 1, 
    status: 'pending', 
    reason: 'Car accident involving family member. Need to handle insurance and hospital matters urgently.', 
    requestDate: '2024-02-13',
    supervisor: 'Finance Head'
  }
];

const leaveTypes = [
  { value: 'Vacation', label: 'Vacation Leave', color: 'bg-blue-100 text-blue-700' },
  { value: 'Sick', label: 'Sick Leave', color: 'bg-amber-100 text-amber-700' },
  { value: 'Emergency', label: 'Emergency Leave', color: 'bg-red-100 text-red-700' },
  { value: 'Maternity', label: 'Maternity Leave', color: 'bg-pink-100 text-pink-700' },
  { value: 'Paternity', label: 'Paternity Leave', color: 'bg-purple-100 text-purple-700' },
  { value: 'Bereavement', label: 'Bereavement Leave', color: 'bg-gray-100 text-gray-700' },
];

export function LeaveListPage() {
  const { leaveRequests, approveLeave, rejectLeave } = useHRStore();
  const { addToast } = useAppStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Map store leaves to display shape
  const allLeaves = leaveRequests.map(l => ({
    ...l,
    employee: l.employeeName,
    avatar: l.employeeName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
  }));

  const filteredLeaves = allLeaves.filter(leave => {
    const matchesStatus = !statusFilter || leave.status === statusFilter;
    const matchesType = !typeFilter || leave.type === typeFilter;
    const matchesSearch = !searchTerm || 
      leave.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeaves = filteredLeaves.slice(startIndex, startIndex + itemsPerPage);

  const pendingCount = allLeaves.filter(l => l.status === 'pending').length;
  const approvedCount = allLeaves.filter(l => l.status === 'approved').length;
  const rejectedCount = allLeaves.filter(l => l.status === 'rejected').length;
  const totalDays = allLeaves.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.days, 0);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', badge: 'bg-emerald-100 text-emerald-700' };
      case 'rejected':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', badge: 'bg-red-100 text-red-700' };
      case 'pending':
        return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', badge: 'bg-amber-100 text-amber-700' };
      default:
        return { icon: Clock, color: 'text-neutral-600', bg: 'bg-neutral-100', badge: 'bg-neutral-100 text-neutral-700' };
    }
  };

  const getLeaveTypeColor = (type: string) => {
    const found = leaveTypes.find(t => t.value === type);
    return found?.color || 'bg-neutral-100 text-neutral-700';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  };

  const handleApprove = (id: string | number) => {
    approveLeave(String(id));
    addToast({ type: 'success', title: 'Leave Approved', message: 'Leave request has been approved.' });
  };

  const handleReject = (id: string | number) => {
    rejectLeave(String(id), 'Rejected by HR manager.');
    addToast({ type: 'error', title: 'Leave Rejected', message: 'Leave request has been rejected.' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-xl">
            <Calendar className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-neutral-900">Leave Requests</h1>
            <p className="text-neutral-500 text-sm">Manage and approve employee leave requests</p>
          </div>
        </div>
        <Link to="/app/leaves/new" className="btn btn-primary shadow-lg shadow-primary-500/25">
          <Plus size={18} />
          File Leave
        </Link>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="card p-4 border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{pendingCount}</p>
              <p className="text-xs text-neutral-500">Pending Requests</p>
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-xl">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{approvedCount}</p>
              <p className="text-xs text-neutral-500">Approved This Month</p>
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 rounded-xl">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{rejectedCount}</p>
              <p className="text-xs text-neutral-500">Rejected This Month</p>
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{totalDays}</p>
              <p className="text-xs text-neutral-500">Total Leave Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className={`card overflow-hidden transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Filters */}
        <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="Search by employee or department..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="input pl-10 bg-white"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="input w-auto min-w-[130px] bg-white"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="input w-auto min-w-[150px] bg-white"
              >
                <option value="">All Leave Types</option>
                {leaveTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="bg-neutral-50">
                <th className="font-semibold">Employee</th>
                <th className="font-semibold">Leave Type</th>
                <th className="font-semibold hidden sm:table-cell">Duration</th>
                <th className="font-semibold text-center">Days</th>
                <th className="font-semibold">Status</th>
                <th className="font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeaves.map((leave) => {
                const statusConfig = getStatusConfig(leave.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <tr key={leave.id} className="group hover:bg-neutral-50 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-sm">{leave.avatar}</span>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{leave.employee}</p>
                          <p className="text-xs text-neutral-500">{leave.department}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getLeaveTypeColor(leave.type)}`}>
                        {leave.type}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell">
                      <div className="text-sm">
                        <p className="text-neutral-900">{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</p>
                        <p className="text-xs text-neutral-500">Requested: {formatDate(leave.requestDate)}</p>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 font-semibold text-sm">
                        {leave.days}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                        <span className={`badge ${statusConfig.badge} capitalize`}>
                          {leave.status}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors" title="View details">
                          <Eye size={16} className="text-neutral-400" />
                        </button>
                        {leave.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(leave.id)}
                              className="btn btn-sm bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                              <CheckCircle size={14} />
                              Approve
                            </button>
                            <button 
                              onClick={() => handleReject(leave.id)}
                              className="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredLeaves.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">No leave requests found</h3>
            <p className="text-neutral-500 mb-4">
              No requests match your current filters
            </p>
            <button 
              onClick={() => { setStatusFilter(''); setTypeFilter(''); setSearchTerm(''); }}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {filteredLeaves.length > 0 && (
          <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-neutral-500">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLeaves.length)} of {filteredLeaves.length} requests
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary btn-sm disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 py-1 text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary btn-sm disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
