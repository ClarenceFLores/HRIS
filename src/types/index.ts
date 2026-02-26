/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

// User & Authentication Types
// SAHOD SaaS Role Hierarchy:
// 1. system_owner - Platform level (SaaS owner, manages all companies)
// 2. hr_client - Company level (HR/Admin, manages their company only)
// 3. employee - Employee level (Self-service, own data only)
export type UserRole = 'system_owner' | 'hr_client' | 'employee';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  companyId?: string; // For hr_client and employee - which company they belong to
  employeeId?: string; // For employee role - links to their employee record
  permissions?: string[]; // Granular permissions
  createdAt: Date;
  updatedAt: Date;
}

// Role-based Permissions
export interface RolePermissions {
  // System Owner Permissions
  canManageCompanies: boolean;
  canManageSubscriptions: boolean;
  canManageSystemConfig: boolean;
  canViewPlatformAnalytics: boolean;
  
  // HR Client Permissions
  canManageEmployees: boolean;
  canManageAttendance: boolean;
  canManagePayroll: boolean;
  canManageLeaves: boolean;
  canViewReports: boolean;
  canManageCompanySettings: boolean;
  
  // Employee Permissions
  canViewOwnProfile: boolean;
  canViewOwnAttendance: boolean;
  canFileLeaveRequest: boolean;
  canViewOwnPayslips: boolean;
}

// Default permissions by role
export const DEFAULT_PERMISSIONS: Record<UserRole, RolePermissions> = {
  system_owner: {
    canManageCompanies: true,
    canManageSubscriptions: true,
    canManageSystemConfig: true,
    canViewPlatformAnalytics: true,
    canManageEmployees: false,
    canManageAttendance: false,
    canManagePayroll: false,
    canManageLeaves: false,
    canViewReports: true,
    canManageCompanySettings: false,
    canViewOwnProfile: true,
    canViewOwnAttendance: false,
    canFileLeaveRequest: false,
    canViewOwnPayslips: false,
  },
  hr_client: {
    canManageCompanies: false,
    canManageSubscriptions: false,
    canManageSystemConfig: false,
    canViewPlatformAnalytics: false,
    canManageEmployees: true,
    canManageAttendance: true,
    canManagePayroll: true,
    canManageLeaves: true,
    canViewReports: true,
    canManageCompanySettings: true,
    canViewOwnProfile: true,
    canViewOwnAttendance: true,
    canFileLeaveRequest: true,
    canViewOwnPayslips: true,
  },
  employee: {
    canManageCompanies: false,
    canManageSubscriptions: false,
    canManageSystemConfig: false,
    canViewPlatformAnalytics: false,
    canManageEmployees: false,
    canManageAttendance: false,
    canManagePayroll: false,
    canManageLeaves: false,
    canViewReports: false,
    canManageCompanySettings: false,
    canViewOwnProfile: true,
    canViewOwnAttendance: true,
    canFileLeaveRequest: true,
    canViewOwnPayslips: true,
  },
};

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Company Types (replaces Tenant for clarity)
// Account Status Flow:
// 1. pending - HR creates account, awaits developer approval
// 2. trial - Developer approved, 30-day trial active
// 3. active - Paid subscription active
// 4. expired - Trial ended without payment, account locked
// 5. suspended - Admin suspended the account
// 6. rejected - Developer rejected the application
export type AccountStatus = 'pending' | 'trial' | 'active' | 'expired' | 'suspended' | 'rejected';

export interface Company {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  tin?: string; // Tax Identification Number
  sssNumber?: string;
  philhealthNumber?: string;
  pagibigNumber?: string;
  logo?: string;
  industryType?: string;
  companySize?: string;
  subscription: Subscription;
  settings: CompanySettings;
  status: AccountStatus;
  hrClientId: string; // Primary HR admin user ID
  // Trial/Approval fields
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedAt?: Date;
  approvedBy?: string; // System owner ID who approved
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
  trialStartDate?: Date;
  trialEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  plan: 'starter' | 'professional' | 'enterprise' | 'custom';
  status: 'pending' | 'trial' | 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  monthlyAmount: number;
  employeeLimit: number;
  // Trial tracking
  trialStartDate?: Date;
  trialEndDate?: Date;
  // Payment tracking
  lastPaymentDate?: Date;
  nextPaymentDueDate?: Date;
}

export interface CompanySettings {
  timezone: string;
  currency: string;
  dateFormat: string;
  fiscalYearStart: number;
  defaultPaySchedule: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly';
}

// Employee Types
export type EmploymentType = 'regular' | 'contractual' | 'part-time' | 'probationary';
export type Gender = 'male' | 'female' | 'other';
export type CivilStatus = 'single' | 'married' | 'widowed' | 'separated';
export type EmployeeStatus = 'active' | 'inactive' | 'resigned' | 'terminated';
export type SalaryType = 'monthly' | 'daily' | 'hourly';

export interface Employee {
  id: string;
  tenantId: string;
  employeeNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: Gender;
  civilStatus: CivilStatus;
  address: Address;
  employment: EmploymentInfo;
  compensation: CompensationInfo;
  governmentIds: GovernmentIds;
  emergencyContact: EmergencyContact;
  status: EmployeeStatus;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  province: string;
  zipCode: string;
}

export interface EmploymentInfo {
  department: string;
  position: string;
  employmentType: EmploymentType;
  hireDate: Date;
  regularDate?: Date;
  managerId?: string;
  shiftScheduleId?: string;
}

export interface CompensationInfo {
  salaryType: SalaryType;
  basicSalary: number;
  allowances: number;
  paySchedule: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly';
  bankAccount?: BankAccount;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface GovernmentIds {
  sss?: string;
  philhealth?: string;
  pagibig?: string;
  tin?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

// Attendance Types
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'on_leave' | 'holiday' | 'no_schedule';

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
  breakMinutes: number;
  totalHours: number;
  lateMinutes: number;
  undertimeMinutes: number;
  overtimeHours: number;
  nightDifferentialHours: number;
  status: AttendanceStatus;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShiftSchedule {
  id: string;
  tenantId: string;
  name: string;
  timeIn: string;
  timeOut: string;
  breakStart?: string;
  breakEnd?: string;
  isNightShift: boolean;
  days: string[];
  isDefault?: boolean;
}

// Leave Types
export type LeaveType = 
  | 'vacation' 
  | 'sick' 
  | 'maternity' 
  | 'paternity' 
  | 'solo_parent' 
  | 'bereavement' 
  | 'emergency' 
  | 'service_incentive'
  | 'unpaid';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  approverId?: string;
  approverNotes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveBalance {
  id: string;
  tenantId: string;
  employeeId: string;
  leaveType: LeaveType;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

// Payroll Types
export interface PayrollPeriod {
  id: string;
  tenantId: string;
  name: string;
  startDate: string;
  endDate: string;
  payDate: string;
  status: 'draft' | 'processing' | 'completed' | 'cancelled';
  processedAt?: Date;
  createdAt: Date;
}

export interface PayrollRecord {
  id: string;
  tenantId: string;
  payrollPeriodId: string;
  employeeId: string;
  basicSalary: number;
  allowances: number;
  overtimePay: number;
  nightDifferential: number;
  holidayPay: number;
  otherIncome: number;
  grossIncome: number;
  sssDeduction: number;
  philHealthDeduction: number;
  pagIbigDeduction: number;
  taxDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  regularHours: number;
  overtimeHours: number;
  lateMinutes: number;
  absentDays: number;
  createdAt: Date;
}

export interface Payslip {
  id: string;
  tenantId: string;
  employeeId: string;
  payrollPeriodId: string;
  periodStart: string;
  periodEnd: string;
  basicSalary: number;
  allowances: number;
  overtimePay: number;
  nightDifferential: number;
  holidayPay: number;
  otherIncome: number;
  grossIncome: number;
  sssDeduction: number;
  philHealthDeduction: number;
  pagIbigDeduction: number;
  taxDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  createdAt: Date;
}

// Government Contribution Rates (Editable)
export interface SSSRate {
  minSalary: number;
  maxSalary: number;
  employeeShare: number;
  employerShare: number;
}

export interface PhilHealthRate {
  rate: number;
  minSalary: number;
  maxSalary: number;
  maxMonthlyContribution: number;
}

export interface PagIbigRate {
  rate: number;
  maxContribution: number;
}

export interface ContributionRates {
  sss: SSSRate[];
  philHealth: PhilHealthRate;
  pagIbig: PagIbigRate;
  taxWithholding: TaxWithholdingTable[];
}

export interface TaxWithholdingTable {
  compensationLevel: number;
  from: number;
  to: number;
  baseTax: number;
  percentOver: number;
  exemption: number;
}

// Dashboard Types
export interface DashboardKPIs {
  totalEmployees: number;
  presentToday: number;
  onLeave: number;
  pendingLeaveRequests: number;
  payrollTotal: number;
  turnoverRate: number;
}

// Notification Types
export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Table Types
export type ReactNode = string | number | boolean | Record<string, unknown> | null | undefined;

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  width?: string;
}

export interface TableSort {
  key: string;
  direction: 'asc' | 'desc';
}

export interface TablePagination {
  page: number;
  pageSize: number;
  total: number;
}

// Modal Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

// Toast Types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}
