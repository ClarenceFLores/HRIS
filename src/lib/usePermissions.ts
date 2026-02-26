/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useAuthStore } from '@/stores/useAuthStore';
import { DEFAULT_PERMISSIONS, UserRole } from '@/types';

/**
 * SAHOD SaaS Role-Based Permissions Hook
 * 
 * Role Hierarchy:
 * 1. system_owner - Platform level (SaaS owner, manages all companies)
 * 2. hr_client - Company level (HR/Admin, manages their company only)
 * 3. employee - Employee level (Self-service, own data only)
 */

export interface UsePermissionsReturn {
  // User info
  role: UserRole | undefined;
  companyId: string | undefined;
  
  // Role checks
  isSystemOwner: boolean;
  isHrClient: boolean;
  isEmployee: boolean;
  
  // Permission checks
  canManageCompanies: boolean;
  canManageSubscriptions: boolean;
  canManageSystemConfig: boolean;
  canViewPlatformAnalytics: boolean;
  canManageEmployees: boolean;
  canManageAttendance: boolean;
  canManagePayroll: boolean;
  canManageLeaves: boolean;
  canViewReports: boolean;
  canManageCompanySettings: boolean;
  canViewOwnProfile: boolean;
  canViewOwnAttendance: boolean;
  canFileLeaveRequest: boolean;
  canViewOwnPayslips: boolean;
  
  // Helper functions
  hasPermission: (permission: keyof typeof DEFAULT_PERMISSIONS.system_owner) => boolean;
  canAccessRoute: (route: string) => boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const { user, isSystemOwner, isHrClient, isEmployee, hasPermission } = useAuthStore();
  
  const role = user?.role;
  const companyId = user?.companyId;
  
  // Get permissions based on role
  const permissions = role ? DEFAULT_PERMISSIONS[role] : null;
  
  // Permission helpers
  const checkPermission = (permission: keyof typeof DEFAULT_PERMISSIONS.system_owner): boolean => {
    if (!permissions) return false;
    return permissions[permission] || false;
  };
  
  // Route access control
  const canAccessRoute = (route: string): boolean => {
    if (!role) return false;
    
    // System Owner routes
    const systemOwnerRoutes = ['/app/companies', '/app/subscriptions', '/app/system-config', '/app/platform-analytics'];
    if (systemOwnerRoutes.some(r => route.startsWith(r))) {
      return isSystemOwner();
    }
    
    // HR Client routes
    const hrClientRoutes = ['/app/employees', '/app/attendance', '/app/payroll', '/app/leaves', '/app/reports', '/app/settings'];
    if (hrClientRoutes.some(r => route.startsWith(r))) {
      return isSystemOwner() || isHrClient();
    }
    
    // Employee routes (self-service)
    const employeeRoutes = ['/app/my-profile', '/app/my-attendance', '/app/my-leaves', '/app/my-payslips'];
    if (employeeRoutes.some(r => route.startsWith(r))) {
      return true; // All authenticated users can access
    }
    
    // Dashboard is accessible to all
    if (route === '/app/dashboard' || route === '/app') {
      return true;
    }
    
    return false;
  };
  
  return {
    // User info
    role,
    companyId,
    
    // Role checks
    isSystemOwner: isSystemOwner(),
    isHrClient: isHrClient(),
    isEmployee: isEmployee(),
    
    // System Owner permissions
    canManageCompanies: checkPermission('canManageCompanies'),
    canManageSubscriptions: checkPermission('canManageSubscriptions'),
    canManageSystemConfig: checkPermission('canManageSystemConfig'),
    canViewPlatformAnalytics: checkPermission('canViewPlatformAnalytics'),
    
    // HR Client permissions
    canManageEmployees: checkPermission('canManageEmployees'),
    canManageAttendance: checkPermission('canManageAttendance'),
    canManagePayroll: checkPermission('canManagePayroll'),
    canManageLeaves: checkPermission('canManageLeaves'),
    canViewReports: checkPermission('canViewReports'),
    canManageCompanySettings: checkPermission('canManageCompanySettings'),
    
    // Employee permissions
    canViewOwnProfile: checkPermission('canViewOwnProfile'),
    canViewOwnAttendance: checkPermission('canViewOwnAttendance'),
    canFileLeaveRequest: checkPermission('canFileLeaveRequest'),
    canViewOwnPayslips: checkPermission('canViewOwnPayslips'),
    
    // Helper functions
    hasPermission: checkPermission,
    canAccessRoute,
  };
}

/**
 * Role display names for UI
 */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  system_owner: 'System Owner',
  hr_client: 'HR Administrator',
  employee: 'Employee',
};

/**
 * Role descriptions for UI
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  system_owner: 'Full platform access. Manages all companies and system configuration.',
  hr_client: 'Company-level access. Manages employees, payroll, attendance, and reports.',
  employee: 'Self-service access. View profile, attendance, leaves, and payslips.',
};

/**
 * Get navigation items based on user role
 */
export function getNavigationByRole(role: UserRole | undefined) {
  if (!role) return [];
  
  const systemOwnerNav = [
    { name: 'Dashboard', href: '/app/dashboard', icon: 'LayoutDashboard' },
    { name: 'Companies', href: '/app/companies', icon: 'Building2' },
    { name: 'Subscriptions', href: '/app/subscriptions', icon: 'CreditCard' },
    { name: 'System Config', href: '/app/system-config', icon: 'Settings2' },
    { name: 'Analytics', href: '/app/platform-analytics', icon: 'BarChart3' },
  ];
  
  const hrClientNav = [
    { name: 'Dashboard', href: '/app/dashboard', icon: 'LayoutDashboard' },
    { name: 'Employees', href: '/app/employees', icon: 'Users' },
    { name: 'Attendance', href: '/app/attendance', icon: 'Clock' },
    { name: 'Leaves', href: '/app/leaves', icon: 'Calendar' },
    { name: 'Payroll', href: '/app/payroll', icon: 'Wallet' },
    { name: 'Reports', href: '/app/reports', icon: 'FileText' },
    { name: 'Settings', href: '/app/settings', icon: 'Settings' },
  ];
  
  const employeeNav = [
    { name: 'Dashboard', href: '/app/dashboard', icon: 'LayoutDashboard' },
    { name: 'My Profile', href: '/app/my-profile', icon: 'User' },
    { name: 'My Attendance', href: '/app/my-attendance', icon: 'Clock' },
    { name: 'My Leaves', href: '/app/my-leaves', icon: 'Calendar' },
    { name: 'My Payslips', href: '/app/my-payslips', icon: 'Receipt' },
  ];
  
  switch (role) {
    case 'system_owner':
      return systemOwnerNav;
    case 'hr_client':
      return hrClientNav;
    case 'employee':
      return employeeNav;
    default:
      return [];
  }
}
