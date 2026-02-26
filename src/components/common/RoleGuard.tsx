/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ('system_owner' | 'hr_client' | 'employee')[];
  redirectTo?: string;
}

/**
 * RoleGuard Component
 * 
 * Protects routes by only allowing access to users with specific roles.
 * Redirects unauthorized users to a specified route or dashboard.
 * 
 * @example
 * <RoleGuard allowedRoles={['hr_client', 'system_owner']}>
 *   <EmployeeListPage />
 * </RoleGuard>
 */
export function RoleGuard({ children, allowedRoles, redirectTo }: RoleGuardProps) {
  const { user, isLoading } = useAuthStore();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // If no user or user doesn't have required role, redirect
  if (!user || !allowedRoles.includes(user.role as any)) {
    const destination = redirectTo || (user?.role === 'system_owner' ? '/app/owner-dashboard' : '/app/dashboard');
    return <Navigate to={destination} replace />;
  }

  // User has required role, render children
  return <>{children}</>;
}

/**
 * Permission-based wrapper for employee management routes
 */
export function EmployeeManagementGuard({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['system_owner', 'hr_client']}>
      {children}
    </RoleGuard>
  );
}

/**
 * Permission-based wrapper for payroll routes
 */
export function PayrollManagementGuard({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['system_owner', 'hr_client']}>
      {children}
    </RoleGuard>
  );
}

/**
 * Permission-based wrapper for leave management routes
 */
export function LeaveManagementGuard({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['system_owner', 'hr_client']}>
      {children}
    </RoleGuard>
  );
}

/**
 * Permission-based wrapper for reports routes
 */
export function ReportsGuard({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['system_owner', 'hr_client']}>
      {children}
    </RoleGuard>
  );
}

/**
 * Permission-based wrapper for settings routes
 */
export function SettingsGuard({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['system_owner', 'hr_client']}>
      {children}
    </RoleGuard>
  );
}

/**
 * System Owner only routes
 */
export function SystemOwnerGuard({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['system_owner']}>
      {children}
    </RoleGuard>
  );
}

/**
 * Employee self-service routes (all authenticated users)
 */
export function EmployeeSelfServiceGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

/**
 * Hook to check if user can access specific feature
 */
export function useFeatureAccess() {
  const { user } = useAuthStore();
  
  const canManageEmployees = user?.role === 'system_owner' || user?.role === 'hr_client';
  const canManagePayroll = user?.role === 'system_owner' || user?.role === 'hr_client';
  const canManageLeaves = user?.role === 'system_owner' || user?.role === 'hr_client';
  const canViewReports = user?.role === 'system_owner' || user?.role === 'hr_client';
  const canManageSettings = user?.role === 'system_owner' || user?.role === 'hr_client';
  const canAccessSystemOwner = user?.role === 'system_owner';
  
  return {
    canManageEmployees,
    canManagePayroll,
    canManageLeaves,
    canViewReports,
    canManageSettings,
    canAccessSystemOwner,
    userRole: user?.role,
    isHR: user?.role === 'hr_client',
    isSystemOwner: user?.role === 'system_owner',
    isEmployee: user?.role === 'employee',
  };
}
