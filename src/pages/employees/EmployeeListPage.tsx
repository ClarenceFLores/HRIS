/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, MoreVertical, Filter, Download, Upload, 
  Eye, Edit2, Trash2, Mail, Phone, UserCheck, 
  ChevronLeft, ChevronRight, Users, X, RefreshCw
} from 'lucide-react';
import { useHRStore } from '@/stores/useHRStore';
import { useAppStore } from '@/stores/useAppStore';

export function EmployeeListPage() {
  const { employees: rawEmployees, deleteEmployee } = useHRStore();
  const { addToast } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;

  // Map store employees to display shape
  const employees = rawEmployees.map(e => ({
    id: e.id,
    name: `${e.firstName} ${e.lastName}`,
    email: e.email,
    phone: e.phone,
    department: e.department,
    position: e.position,
    status: e.status,
    hireDate: e.hireDate,
    avatar: `${e.firstName[0]}${e.lastName[0]}`.toUpperCase(),
    employmentType: e.employmentType,
  }));

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || emp.department === departmentFilter;
    const matchesStatus = !statusFilter || emp.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  const departments = [...new Set(employees.map(e => e.department))];

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || departmentFilter || statusFilter;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteEmployee(id);
      setDeleteConfirm(null);
      setOpenDropdown(null);
      addToast({ type: 'success', title: 'Employee deactivated', message: 'The employee has been set to inactive.' });
    } else {
      setDeleteConfirm(id);
    }
  };

  const handleExport = () => {
    const headers = ['Employee Number','Full Name','Email','Phone','Department','Position','Employment Type','Hire Date','Status'];
    const rows = employees.map(e => [
      rawEmployees.find(r => r.id === e.id)?.employeeNumber ?? '',
      e.name, e.email, e.phone, e.department, e.position, e.employmentType, e.hireDate, e.status
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'employees.csv'; a.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', title: 'Export complete', message: 'Employee data exported as CSV.' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-xl">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-neutral-900">Employees</h1>
              <p className="text-neutral-500 text-sm">Manage your organization's workforce</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary hidden sm:flex">
            <Upload size={18} />
            Import
          </button>
          <button className="btn btn-secondary hidden sm:flex" onClick={handleExport}>
            <Download size={18} />
            Export
          </button>
          <Link to="/app/employees/new" className="btn btn-primary shadow-lg shadow-primary-500/25">
            <Plus size={18} />
            Add Employee
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{employees.length}</p>
              <p className="text-xs text-neutral-500">Total Employees</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{employees.filter(e => e.status === 'active').length}</p>
              <p className="text-xs text-neutral-500">Active</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{departments.length}</p>
              <p className="text-xs text-neutral-500">Departments</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Plus className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">12</p>
              <p className="text-xs text-neutral-500">New This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, or position..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="input pl-10 w-full bg-white"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`btn btn-secondary ${showFilters ? 'bg-primary-50 border-primary-200' : ''}`}
              >
                <Filter size={16} />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                )}
              </button>

              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="input w-auto min-w-[150px] bg-white"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="input w-auto min-w-[120px] bg-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {hasActiveFilters && (
                <button 
                  onClick={clearFilters}
                  className="btn btn-ghost text-neutral-500 hover:text-neutral-700"
                >
                  <RefreshCw size={16} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-neutral-200">
              <span className="text-sm text-neutral-500">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')}><X size={12} /></button>
                </span>
              )}
              {departmentFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                  {departmentFilter}
                  <button onClick={() => setDepartmentFilter('')}><X size={12} /></button>
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                  {statusFilter}
                  <button onClick={() => setStatusFilter('')}><X size={12} /></button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="bg-neutral-50">
                <th className="font-semibold">Employee</th>
                <th className="font-semibold hidden md:table-cell">Contact</th>
                <th className="font-semibold">Department</th>
                <th className="font-semibold hidden lg:table-cell">Position</th>
                <th className="font-semibold">Status</th>
                <th className="font-semibold hidden sm:table-cell">Hire Date</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map(employee => (
                <tr key={employee.id} className="group hover:bg-primary-50/30 transition-colors">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                        <span className="text-white font-semibold text-sm">{employee.avatar}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">{employee.name}</p>
                        <p className="text-xs text-neutral-500 md:hidden">{employee.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell">
                    <div className="space-y-1">
                      <p className="text-sm text-neutral-700 flex items-center gap-1.5">
                        <Mail size={12} className="text-neutral-400" />
                        {employee.email}
                      </p>
                      <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                        <Phone size={12} className="text-neutral-400" />
                        {employee.phone}
                      </p>
                    </div>
                  </td>
                  <td>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-neutral-100 text-xs font-medium text-neutral-700">
                      {employee.department}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell text-neutral-600">{employee.position}</td>
                  <td>
                    <span className={`badge ${
                      employee.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        employee.status === 'active' ? 'bg-emerald-500' : 'bg-neutral-400'
                      }`}></span>
                      {employee.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell text-sm text-neutral-500">{formatDate(employee.hireDate)}</td>
                  <td>
                    <div className="relative" ref={openDropdown === employee.id ? dropdownRef : null}>
                      <button 
                        onClick={() => { setOpenDropdown(openDropdown === employee.id ? null : employee.id); setDeleteConfirm(null); }}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                      >
                        <MoreVertical size={18} className="text-neutral-400" />
                      </button>
                      
                      {openDropdown === employee.id && (
                        <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-neutral-200 py-1 z-50 animate-in">
                          <Link 
                            to={`/app/employees/${employee.id}/edit`}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                            onClick={() => setOpenDropdown(null)}
                          >
                            <Eye size={16} className="text-neutral-400" />
                            View / Edit
                          </Link>
                          <hr className="my-1 border-neutral-100" />
                          <button
                            onClick={() => handleDelete(employee.id)}
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-sm w-full transition-colors ${
                              deleteConfirm === employee.id
                                ? 'bg-red-50 text-red-700 font-semibold'
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <Trash2 size={16} />
                            {deleteConfirm === employee.id ? 'Click again to confirm' : 'Deactivate'}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredEmployees.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
              <Users className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">No employees found</h3>
            <p className="text-neutral-500 mb-4">
              {hasActiveFilters 
                ? "Try adjusting your search or filter criteria" 
                : "Get started by adding your first employee"}
            </p>
            {hasActiveFilters ? (
              <button onClick={clearFilters} className="btn btn-secondary">
                Clear Filters
              </button>
            ) : (
              <Link to="/app/employees/new" className="btn btn-primary">
                <Plus size={18} />
                Add Employee
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {filteredEmployees.length > 0 && (
          <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-neutral-500">
                Showing <span className="font-medium text-neutral-700">{startIndex + 1}</span> to{' '}
                <span className="font-medium text-neutral-700">{Math.min(startIndex + itemsPerPage, filteredEmployees.length)}</span> of{' '}
                <span className="font-medium text-neutral-700">{filteredEmployees.length}</span> employees
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page 
                          ? 'bg-primary-500 text-white' 
                          : 'hover:bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
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
