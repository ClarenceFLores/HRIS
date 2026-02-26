/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { 
  Play, Download, Eye, FileText, Calculator, Wallet, Users, 
  TrendingUp, ChevronRight, CheckCircle, Clock, AlertCircle,
  Banknote, Building, Loader2, Calendar, Filter, Search,
  DollarSign, PieChart, BarChart3, Plus, Edit3, Trash2,
  CreditCard, Home, Heart, Shield, Award, X
} from 'lucide-react';
import { useHRStore } from '@/stores/useHRStore';
import { useAppStore } from '@/stores/useAppStore';

// PayrollEmp shape mapped from HRPayrollRecord
interface PayrollEmp {
  id: string; name: string; department: string; position: string;
  basicSalary: number; overtime: number; holiday: number; allowances: number;
  sss: number; philHealth: number; pagibig: number; tax: number;
}

// --- mock data removed; now using useHRStore ---

// Calculate contributions from store data (called inside component)
const _calculateContributionsFromData = (emps: PayrollEmp[]) => {
  const sssTotal = emps.reduce((sum, emp) => sum + emp.sss, 0);
  const philHealthTotal = emps.reduce((sum, emp) => sum + emp.philHealth, 0);
  const pagibigTotal = emps.reduce((sum, emp) => sum + emp.pagibig, 0);

  return [
    { 
      name: 'SSS', 
      employee: sssTotal * 0.45, // Employee share (4.5%)
      employer: sssTotal * 0.55, // Employer share (5.5%)
      total: sssTotal, 
      icon: '🏛️', 
      color: 'from-blue-500 to-blue-600',
      rate: '10%'
    },
    { 
      name: 'PhilHealth', 
      employee: philHealthTotal * 0.5, // Employee share (50%)
      employer: philHealthTotal * 0.5, // Employer share (50%)
      total: philHealthTotal, 
      icon: '🏥', 
      color: 'from-emerald-500 to-emerald-600',
      rate: '2.75%'
    },
    { 
      name: 'Pag-IBIG', 
      employee: pagibigTotal * 0.5, // Employee share (50%)
      employer: pagibigTotal * 0.5, // Employer share (50%)
      total: pagibigTotal, 
      icon: '🏠', 
      color: 'from-amber-500 to-amber-600',
      rate: '2%'
    },
  ];
};

export function PayrollPage() {
  const { payrollRecords, payrollPeriods, runPayroll } = useHRStore();
  const { addToast } = useAppStore();

  // Map payrollRecords to flat PayrollEmp display shape
  const latestPeriod = payrollPeriods[0];
  const payrollEmployees: PayrollEmp[] = (
    latestPeriod ? payrollRecords.filter(r => r.periodId === latestPeriod.id) : payrollRecords
  ).map(r => ({
    id: r.id,
    name: r.employeeName,
    department: r.department,
    position: r.position,
    basicSalary: r.basicSalary,
    overtime: r.overtime,
    holiday: r.holiday,
    allowances: r.allowances,
    sss: r.sss,
    philHealth: r.philHealth,
    pagibig: r.pagIbig,
    tax: r.tax,
  }));

  const [selectedPeriod, setSelectedPeriod] = useState('january-2024');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'employees' | 'reports'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<PayrollEmp | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const contributionBreakdown = _calculateContributionsFromData(payrollEmployees);
  const currentPayroll = payrollPeriods[0];
  const processingPayroll = payrollPeriods.find(p => p.status === 'draft');

  // Calculate totals from payrollEmployees
  const totalBasicSalary = payrollEmployees.reduce((sum, emp) => sum + emp.basicSalary, 0);
  const totalOvertime = payrollEmployees.reduce((sum, emp) => sum + emp.overtime, 0);
  const totalAllowances = payrollEmployees.reduce((sum, emp) => sum + emp.allowances, 0);
  const totalDeductions = payrollEmployees.reduce((sum, emp) => sum + emp.sss + emp.philHealth + emp.pagibig + emp.tax, 0);
  const totalGross = totalBasicSalary + totalOvertime + totalAllowances;
  const totalNet = totalGross - totalDeductions;

  // Filter employees based on search
  const filteredEmployees = payrollEmployees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProcessPayroll = async () => {
    setIsProcessing(true);
    if (latestPeriod) {
      runPayroll(latestPeriod.id);
      addToast({ type: 'success', title: 'Payroll Processed', message: `Payroll for ${latestPeriod.period} has been processed.` });
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
  };

  const generatePayslip = (employee: PayrollEmp) => {
    setSelectedEmployee(employee);
    setShowPayslipModal(true);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', badge: 'bg-emerald-100 text-emerald-700', label: 'Completed' };
      case 'processing':
        return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', badge: 'bg-amber-100 text-amber-700', label: 'Processing' };
      default:
        return { icon: AlertCircle, color: 'text-neutral-600', bg: 'bg-neutral-100', badge: 'bg-neutral-100 text-neutral-700', label: status };
    }
  };

  const PayslipModal = () => {
    if (!selectedEmployee) return null;
    
    const grossPay = selectedEmployee.basicSalary + selectedEmployee.overtime + selectedEmployee.allowances;
    const totalDeductions = selectedEmployee.sss + selectedEmployee.philHealth + selectedEmployee.pagibig + selectedEmployee.tax;
    const netPay = grossPay - totalDeductions;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Payslip Header */}
          <div className="p-6 border-b border-neutral-200 bg-gradient-to-r from-primary-50 to-primary-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-primary-900">Payslip</h2>
                <p className="text-primary-700">January 2024</p>
              </div>
              <button 
                onClick={() => setShowPayslipModal(false)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-primary-600" />
              </button>
            </div>
          </div>

          {/* Employee Info */}
          <div className="p-6 border-b border-neutral-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Employee Information</h3>
                <div className="space-y-1">
                  <p><span className="text-neutral-500">Name:</span> {selectedEmployee.name}</p>
                  <p><span className="text-neutral-500">Department:</span> {selectedEmployee.department}</p>
                  <p><span className="text-neutral-500">Position:</span> {selectedEmployee.position}</p>
                  <p><span className="text-neutral-500">Employee ID:</span> EMP-{selectedEmployee.id.toString().padStart(4, '0')}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Pay Period</h3>
                <div className="space-y-1">
                  <p><span className="text-neutral-500">Period:</span> January 1-31, 2024</p>
                  <p><span className="text-neutral-500">Pay Date:</span> January 31, 2024</p>
                  <p><span className="text-neutral-500">Working Days:</span> 22</p>
                  <p><span className="text-neutral-500">Status:</span> <span className="badge bg-emerald-100 text-emerald-700">Paid</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings */}
          <div className="p-6 border-b border-neutral-200">
            <h3 className="font-semibold text-neutral-900 mb-4">Earnings</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-600">Basic Salary</span>
                <span className="font-medium">₱{selectedEmployee.basicSalary.toLocaleString()}</span>
              </div>
              {selectedEmployee.overtime > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Overtime Pay</span>
                  <span className="font-medium">₱{selectedEmployee.overtime.toLocaleString()}</span>
                </div>
              )}
              {selectedEmployee.holiday > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Holiday Pay</span>
                  <span className="font-medium">₱{selectedEmployee.holiday.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-600">Allowances</span>
                <span className="font-medium">₱{selectedEmployee.allowances.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-neutral-200 flex justify-between">
                <span className="font-semibold">Gross Pay</span>
                <span className="font-semibold text-lg">₱{grossPay.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="p-6 border-b border-neutral-200">
            <h3 className="font-semibold text-neutral-900 mb-4">Deductions</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-600">SSS Contribution</span>
                <span className="font-medium text-red-600">-₱{selectedEmployee.sss.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">PhilHealth</span>
                <span className="font-medium text-red-600">-₱{selectedEmployee.philHealth.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Pag-IBIG</span>
                <span className="font-medium text-red-600">-₱{selectedEmployee.pagibig.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Withholding Tax</span>
                <span className="font-medium text-red-600">-₱{selectedEmployee.tax.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-neutral-200 flex justify-between">
                <span className="font-semibold">Total Deductions</span>
                <span className="font-semibold text-lg text-red-600">-₱{totalDeductions.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="p-6">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-emerald-900 font-semibold text-lg">Net Pay</span>
                <span className="text-2xl font-bold text-emerald-600">₱{netPay.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary flex-1">
                <Download size={18} />
                Download PDF
              </button>
              <button className="btn btn-outline flex-1">
                <FileText size={18} />
                Print
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
            <Wallet className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-neutral-900">Payroll Management</h1>
            <p className="text-neutral-500 text-sm">Process and manage employee compensation</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-1 p-1 bg-neutral-100 rounded-lg">
            <button 
              onClick={() => setViewMode('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'overview' ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setViewMode('employees')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'employees' ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Employees
            </button>
            <button 
              onClick={() => setViewMode('reports')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'reports' ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Reports
            </button>
          </div>
          <button 
            onClick={handleProcessPayroll}
            disabled={isProcessing}
            className="btn btn-primary shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play size={18} />
                Process Payroll
              </>
            )}
          </button>
        </div>
      </div>

      {/* Processing Alert */}
      {processingPayroll && (
        <div className={`card p-4 border-l-4 border-l-amber-500 bg-amber-50/50 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
            </div>
            <div>
              <h3 className="font-medium text-amber-900">Payroll Processing</h3>
              <p className="text-sm text-amber-700">Processing payroll for: {processingPayroll.period}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="card p-5 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900">{payrollEmployees.length}</p>
              <p className="text-sm text-neutral-500">Active Employees</p>
            </div>
          </div>
        </div>
        <div className="card p-5 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
              <Banknote className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900">₱{Math.round(totalGross/1000)}K</p>
              <p className="text-sm text-neutral-500">Gross Payroll</p>
            </div>
          </div>
        </div>
        <div className="card p-5 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900">₱{Math.round(totalDeductions/1000)}K</p>
              <p className="text-sm text-neutral-500">Total Deductions</p>
            </div>
          </div>
        </div>
        <div className="card p-5 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900">₱{Math.round(totalNet/1000)}K</p>
              <p className="text-sm text-neutral-500">Net Payroll</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content based on view mode */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Payroll History */}
          <div className={`xl:col-span-2 card overflow-hidden transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-xl">
                    <Calendar className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Payroll History</h2>
                    <p className="text-sm text-neutral-500">Recent payroll runs and records</p>
                  </div>
                </div>
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="input w-auto min-w-[180px] text-sm"
                >
                  <option value="">All Periods</option>
                  <option value="january-2024">January 2024</option>
                  <option value="december-2023">December 2023</option>
                  <option value="november-2023">November 2023</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="font-semibold">Pay Period</th>
                    <th className="font-semibold text-center">Employees</th>
                    <th className="font-semibold text-right">Gross Pay</th>
                    <th className="font-semibold text-right hidden sm:table-cell">Net Pay</th>
                    <th className="font-semibold">Status</th>
                    <th className="font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollPeriods.map((payroll) => {
                    const statusConfig = getStatusConfig(payroll.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr key={payroll.id} className="group hover:bg-neutral-50 transition-colors">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-neutral-500" />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900">{payroll.period}</p>
                              {payroll.processedDate && (
                                <p className="text-xs text-neutral-500">Processed: {payroll.processedDate}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-100 font-semibold text-neutral-700">
                            {payroll.totalEmployees}
                          </span>
                        </td>
                        <td className="text-right font-medium text-neutral-900">
                          ₱{payroll.grossPay.toLocaleString()}
                        </td>
                        <td className="text-right font-medium text-emerald-600 hidden sm:table-cell">
                          ₱{payroll.netPay.toLocaleString()}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                            <span className={`badge ${statusConfig.badge}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors" title="View Details">
                              <Eye size={16} className="text-neutral-400" />
                            </button>
                            <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors" title="Download">
                              <Download size={16} className="text-neutral-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Contributions Summary */}
          <div className={`card overflow-hidden transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Building className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">Contributions</h2>
                  <p className="text-sm text-neutral-500">Government deductions</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {contributionBreakdown.map((contribution) => (
                <div key={contribution.name} className="p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{contribution.icon}</span>
                      <div>
                        <span className="font-semibold text-neutral-900">{contribution.name}</span>
                        <p className="text-xs text-neutral-500">{contribution.rate} of salary</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-neutral-900">₱{contribution.total.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex-1 flex items-center justify-between px-3 py-1.5 bg-white rounded-lg">
                      <span className="text-neutral-500">Employee</span>
                      <span className="font-medium text-neutral-700">₱{contribution.employee.toLocaleString()}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-between px-3 py-1.5 bg-white rounded-lg">
                      <span className="text-neutral-500">Employer</span>
                      <span className="font-medium text-neutral-700">₱{contribution.employer.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-primary-900">Total Contributions</span>
                  <span className="text-xl font-bold text-primary-600">
                    ₱{contributionBreakdown.reduce((sum, c) => sum + c.total, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Payroll View */}
      {viewMode === 'employees' && (
        <div className={`space-y-6 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Search and filters */}
          <div className="card p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
              <select className="input w-auto">
                <option value="">All Departments</option>
                <option value="HR">Human Resources</option>
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
          </div>

          {/* Employee Payroll Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="font-semibold">Employee</th>
                    <th className="font-semibold text-right">Basic Salary</th>
                    <th className="font-semibold text-right">Overtime</th>
                    <th className="font-semibold text-right">Allowances</th>
                    <th className="font-semibold text-right">Deductions</th>
                    <th className="font-semibold text-right">Net Pay</th>
                    <th className="font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => {
                    const grossPay = employee.basicSalary + employee.overtime + employee.allowances;
                    const totalDeductions = employee.sss + employee.philHealth + employee.pagibig + employee.tax;
                    const netPay = grossPay - totalDeductions;
                    
                    return (
                      <tr key={employee.id} className="hover:bg-neutral-50 transition-colors">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="font-semibold text-primary-600">
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900">{employee.name}</p>
                              <p className="text-sm text-neutral-500">{employee.position}</p>
                              <p className="text-xs text-neutral-400">{employee.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-right font-medium">₱{employee.basicSalary.toLocaleString()}</td>
                        <td className="text-right text-emerald-600">
                          {employee.overtime > 0 ? `₱${employee.overtime.toLocaleString()}` : '-'}
                        </td>
                        <td className="text-right">₱{employee.allowances.toLocaleString()}</td>
                        <td className="text-right text-red-600">-₱{totalDeductions.toLocaleString()}</td>
                        <td className="text-right font-semibold text-emerald-600">₱{netPay.toLocaleString()}</td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => generatePayslip(employee)}
                              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors" 
                              title="Generate Payslip"
                            >
                              <FileText size={16} className="text-neutral-400" />
                            </button>
                            <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors" title="Edit">
                              <Edit3 size={16} className="text-neutral-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reports View */}
      {viewMode === 'reports' && (
        <div className={`card p-6 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Payroll & Compliance Reports</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'SSS R-3', desc: 'Monthly contribution report', color: 'text-blue-600 bg-blue-100', icon: Shield },
              { name: 'PhilHealth RF-1', desc: 'Member remittance report', color: 'text-emerald-600 bg-emerald-100', icon: Heart },
              { name: 'Pag-IBIG', desc: 'Membership savings report', color: 'text-amber-600 bg-amber-100', icon: Home },
              { name: 'BIR 2316', desc: 'Certificate of compensation payment', color: 'text-purple-600 bg-purple-100', icon: FileText },
              { name: 'Payroll Summary', desc: 'Detailed payroll breakdown', color: 'text-indigo-600 bg-indigo-100', icon: BarChart3 },
              { name: '13th Month Pay', desc: 'Annual bonus calculation', color: 'text-pink-600 bg-pink-100', icon: Award },
            ].map((report) => {
              const IconComponent = report.icon;
              return (
                <button 
                  key={report.name}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all text-left"
                >
                  <div className={`p-3 rounded-xl ${report.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors">{report.name}</p>
                    <p className="text-xs text-neutral-500">{report.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {showPayslipModal && <PayslipModal />}
    </div>
  );
}
