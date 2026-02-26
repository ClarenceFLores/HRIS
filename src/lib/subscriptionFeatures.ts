/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 * 
 * Subscription-Based Feature Access System for SAHOD
 * 
 * This module defines which features are available per subscription plan.
 * HR clients will only see/access features based on their active subscription.
 */

export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise';

export interface PlanFeatures {
  // Employee Management
  maxEmployees: number;
  employeeProfiles: boolean;
  documentStorage: boolean;
  organizationChart: boolean;
  
  // Attendance & Time
  attendanceTracking: boolean;
  overtimeComputation: boolean;
  shiftScheduling: boolean;
  biometricIntegration: boolean;
  
  // Leave Management
  leaveManagement: boolean;
  leaveApprovalWorkflow: boolean;
  customLeaveTypes: boolean;
  leaveCreditsManagement: boolean;
  
  // Payroll
  basicPayroll: boolean;
  advancedPayroll: boolean;
  automaticDeductions: boolean;
  bonusManagement: boolean;
  loanManagement: boolean;
  thirteenthMonthPay: boolean;
  
  // Government Compliance
  sssComputation: boolean;
  philhealthComputation: boolean;
  pagibigComputation: boolean;
  birTaxComputation: boolean;
  governmentReports: boolean;
  
  // Reports
  basicReports: boolean;
  advancedReports: boolean;
  customReports: boolean;
  exportToPdf: boolean;
  exportToExcel: boolean;
  scheduledReports: boolean;
  
  // Additional Features
  multiBranch: boolean;
  apiAccess: boolean;
  auditTrail: boolean;
  dataBackup: boolean;
  customBranding: boolean;
  
  // Support
  supportLevel: 'email' | 'priority' | 'dedicated';
  supportResponseTime: string;
}

export interface PlanInfo {
  id: SubscriptionPlan;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  employeeLimit: number;
  features: PlanFeatures;
  popular?: boolean;
}

// Get pricing from environment variables or use defaults
export const getMonthlyPrice = () => {
  const envPrice = import.meta.env.VITE_MONTHLY_PRICE;
  return envPrice ? parseInt(envPrice) : 1399;
};

export const getYearlyPrice = () => {
  const envPrice = import.meta.env.VITE_YEARLY_PRICE;
  return envPrice ? parseInt(envPrice) : 15588;
};

export const isBirTaxEnabled = () => {
  const envValue = import.meta.env.VITE_ENABLE_BIR_TAX;
  return envValue === 'true';
};

/**
 * Complete feature definitions per subscription plan
 */
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, PlanInfo> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small businesses getting started with HR automation',
    monthlyPrice: getMonthlyPrice(),
    yearlyPrice: getYearlyPrice(),
    employeeLimit: 10,
    features: {
      // Employee Management
      maxEmployees: 10,
      employeeProfiles: true,
      documentStorage: false,
      organizationChart: false,
      
      // Attendance & Time
      attendanceTracking: true,
      overtimeComputation: false,
      shiftScheduling: false,
      biometricIntegration: false,
      
      // Leave Management
      leaveManagement: true,
      leaveApprovalWorkflow: true,
      customLeaveTypes: false,
      leaveCreditsManagement: false,
      
      // Payroll
      basicPayroll: true,
      advancedPayroll: false,
      automaticDeductions: true,
      bonusManagement: false,
      loanManagement: false,
      thirteenthMonthPay: true,
      
      // Government Compliance
      sssComputation: true,
      philhealthComputation: true,
      pagibigComputation: true,
      birTaxComputation: isBirTaxEnabled(),
      governmentReports: false,
      
      // Reports
      basicReports: true,
      advancedReports: false,
      customReports: false,
      exportToPdf: true,
      exportToExcel: false,
      scheduledReports: false,
      
      // Additional Features
      multiBranch: false,
      apiAccess: false,
      auditTrail: false,
      dataBackup: false,
      customBranding: false,
      
      // Support
      supportLevel: 'email',
      supportResponseTime: '48 hours',
    },
  },
  
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing companies with advanced HR needs',
    monthlyPrice: getMonthlyPrice(),
    yearlyPrice: getYearlyPrice(),
    employeeLimit: 50,
    popular: true,
    features: {
      // Employee Management
      maxEmployees: 50,
      employeeProfiles: true,
      documentStorage: true,
      organizationChart: true,
      
      // Attendance & Time
      attendanceTracking: true,
      overtimeComputation: true,
      shiftScheduling: true,
      biometricIntegration: false,
      
      // Leave Management
      leaveManagement: true,
      leaveApprovalWorkflow: true,
      customLeaveTypes: true,
      leaveCreditsManagement: true,
      
      // Payroll
      basicPayroll: true,
      advancedPayroll: true,
      automaticDeductions: true,
      bonusManagement: true,
      loanManagement: true,
      thirteenthMonthPay: true,
      
      // Government Compliance
      sssComputation: true,
      philhealthComputation: true,
      pagibigComputation: true,
      birTaxComputation: true,
      governmentReports: true,
      
      // Reports
      basicReports: true,
      advancedReports: true,
      customReports: false,
      exportToPdf: true,
      exportToExcel: true,
      scheduledReports: false,
      
      // Additional Features
      multiBranch: false,
      apiAccess: false,
      auditTrail: true,
      dataBackup: true,
      customBranding: false,
      
      // Support
      supportLevel: 'priority',
      supportResponseTime: '24 hours',
    },
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with custom requirements',
    monthlyPrice: getMonthlyPrice(),
    yearlyPrice: getYearlyPrice(),
    employeeLimit: -1, // Unlimited
    features: {
      // Employee Management
      maxEmployees: -1, // Unlimited
      employeeProfiles: true,
      documentStorage: true,
      organizationChart: true,
      
      // Attendance & Time
      attendanceTracking: true,
      overtimeComputation: true,
      shiftScheduling: true,
      biometricIntegration: true,
      
      // Leave Management
      leaveManagement: true,
      leaveApprovalWorkflow: true,
      customLeaveTypes: true,
      leaveCreditsManagement: true,
      
      // Payroll
      basicPayroll: true,
      advancedPayroll: true,
      automaticDeductions: true,
      bonusManagement: true,
      loanManagement: true,
      thirteenthMonthPay: true,
      
      // Government Compliance
      sssComputation: true,
      philhealthComputation: true,
      pagibigComputation: true,
      birTaxComputation: true,
      governmentReports: true,
      
      // Reports
      basicReports: true,
      advancedReports: true,
      customReports: true,
      exportToPdf: true,
      exportToExcel: true,
      scheduledReports: true,
      
      // Additional Features
      multiBranch: true,
      apiAccess: true,
      auditTrail: true,
      dataBackup: true,
      customBranding: true,
      
      // Support
      supportLevel: 'dedicated',
      supportResponseTime: '4 hours',
    },
  },
};

/**
 * Feature categories for display in UI
 */
export const FEATURE_CATEGORIES = {
  employees: {
    name: 'Employee Management',
    icon: 'Users',
    features: [
      { key: 'employeeProfiles', label: 'Employee Profiles & 201 Files' },
      { key: 'documentStorage', label: 'Document Storage' },
      { key: 'organizationChart', label: 'Organization Chart' },
    ],
  },
  attendance: {
    name: 'Attendance & Time',
    icon: 'Clock',
    features: [
      { key: 'attendanceTracking', label: 'Attendance Tracking' },
      { key: 'overtimeComputation', label: 'Overtime Computation' },
      { key: 'shiftScheduling', label: 'Shift Scheduling' },
      { key: 'biometricIntegration', label: 'Biometric Integration' },
    ],
  },
  leaves: {
    name: 'Leave Management',
    icon: 'Calendar',
    features: [
      { key: 'leaveManagement', label: 'Leave Requests' },
      { key: 'leaveApprovalWorkflow', label: 'Approval Workflow' },
      { key: 'customLeaveTypes', label: 'Custom Leave Types' },
      { key: 'leaveCreditsManagement', label: 'Leave Credits Management' },
    ],
  },
  payroll: {
    name: 'Payroll',
    icon: 'Wallet',
    features: [
      { key: 'basicPayroll', label: 'Basic Payroll Processing' },
      { key: 'advancedPayroll', label: 'Advanced Payroll (OT, Night Diff)' },
      { key: 'bonusManagement', label: 'Bonus Management' },
      { key: 'loanManagement', label: 'Loan & Cash Advance' },
      { key: 'thirteenthMonthPay', label: '13th Month Pay Computation' },
    ],
  },
  compliance: {
    name: 'Government Compliance',
    icon: 'Shield',
    features: [
      { key: 'sssComputation', label: 'SSS Computation' },
      { key: 'philhealthComputation', label: 'PhilHealth Computation' },
      { key: 'pagibigComputation', label: 'Pag-IBIG Computation' },
      { key: 'governmentReports', label: 'Government Reports Generation' },
    ],
  },
  reports: {
    name: 'Reports & Analytics',
    icon: 'FileText',
    features: [
      { key: 'basicReports', label: 'Basic Reports' },
      { key: 'advancedReports', label: 'Advanced Analytics' },
      { key: 'customReports', label: 'Custom Report Builder' },
      { key: 'exportToPdf', label: 'Export to PDF' },
      { key: 'exportToExcel', label: 'Export to Excel' },
      { key: 'scheduledReports', label: 'Scheduled Reports' },
    ],
  },
  additional: {
    name: 'Additional Features',
    icon: 'Settings',
    features: [
      { key: 'multiBranch', label: 'Multi-Branch Support' },
      { key: 'apiAccess', label: 'API Access' },
      { key: 'auditTrail', label: 'Audit Trail' },
      { key: 'dataBackup', label: 'Automatic Data Backup' },
      { key: 'customBranding', label: 'Custom Branding' },
    ],
  },
};

/**
 * Get plan by ID
 */
export function getPlanById(planId: SubscriptionPlan): PlanInfo {
  return SUBSCRIPTION_PLANS[planId];
}

/**
 * Check if a specific feature is available in a plan
 */
export function hasFeature(planId: SubscriptionPlan, featureKey: keyof PlanFeatures): boolean {
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) return false;
  
  const value = plan.features[featureKey];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return true;
  
  return false;
}

/**
 * Get all enabled features for a plan
 */
export function getEnabledFeatures(planId: SubscriptionPlan): string[] {
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) return [];
  
  const features = plan.features;
  return Object.entries(features)
    .filter(([_, value]) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value !== 0;
      return true;
    })
    .map(([key]) => key);
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get employee limit display text
 */
export function getEmployeeLimitText(limit: number): string {
  if (limit === -1) return 'Unlimited employees';
  return `Up to ${limit} employees`;
}

/**
 * Compare two plans to highlight differences
 */
export function comparePlans(plan1Id: SubscriptionPlan, plan2Id: SubscriptionPlan): {
  feature: string;
  plan1: boolean | string | number;
  plan2: boolean | string | number;
}[] {
  const plan1 = SUBSCRIPTION_PLANS[plan1Id];
  const plan2 = SUBSCRIPTION_PLANS[plan2Id];
  
  if (!plan1 || !plan2) return [];
  
  const comparison: { feature: string; plan1: boolean | string | number; plan2: boolean | string | number }[] = [];
  
  Object.keys(plan1.features).forEach((key) => {
    const featureKey = key as keyof PlanFeatures;
    if (plan1.features[featureKey] !== plan2.features[featureKey]) {
      comparison.push({
        feature: key,
        plan1: plan1.features[featureKey],
        plan2: plan2.features[featureKey],
      });
    }
  });
  
  return comparison;
}
