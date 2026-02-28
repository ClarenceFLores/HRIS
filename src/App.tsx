/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRegistrationsStore } from '@/stores/useRegistrationsStore';import { useHRStore } from './stores/useHRStore';import { MainLayout } from '@/components/layout/MainLayout';
import { ToastProvider } from '@/components/common/Toast';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { EmployeeListPage } from '@/pages/employees/EmployeeListPage';
import { EmployeeFormPage } from '@/pages/employees/EmployeeFormPage';
import { AttendancePage } from '@/pages/attendance/AttendancePage';
import { LeaveListPage } from '@/pages/leaves/LeaveListPage';
import { LeaveRequestPage } from '@/pages/leaves/LeaveRequestPage';
import { LeaveCalendarPage } from '@/pages/leaves/LeaveCalendarPage';
import { PayrollPage } from '@/pages/payroll/PayrollPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';

// System Owner pages
import { OwnerDashboardPage } from '@/pages/system-owner/OwnerDashboardPage';
import { CompaniesPage } from '@/pages/system-owner/CompaniesPage';
import { SubscriptionsPage } from '@/pages/system-owner/SubscriptionsPage';
import { SystemConfigPage } from '@/pages/system-owner/SystemConfigPage';
import { AnalyticsPage } from '@/pages/system-owner/AnalyticsPage';

// Role Guards
import {
  EmployeeManagementGuard,
  PayrollManagementGuard,
  LeaveManagementGuard,
  ReportsGuard,
  SettingsGuard,
  SystemOwnerGuard,
} from '@/components/common/RoleGuard';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Helper to get dashboard path based on role
const getDashboardPath = (role?: string) => {
  if (role === 'system_owner') return '/app/owner-dashboard';
  return '/app/dashboard';
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Component to redirect to appropriate dashboard based on role
function RoleBasedDashboardRedirect() {
  const { user } = useAuthStore();
  return <Navigate to={getDashboardPath(user?.role)} replace />;
}

function App() {
  const { user, initAuthListener } = useAuthStore();
  const loadHrUsers = useRegistrationsStore((state) => state.loadHrUsers);
  const loadFromFirestore = useRegistrationsStore((state) => state.loadFromFirestore);
  const testFirestoreAccess = useRegistrationsStore((state) => state.testFirestoreAccess);
  const loadHRData = useHRStore((state) => state.loadFromFirestore);

  // Initialize Firebase auth listener and handle Remember Me session guard
  useEffect(() => {
    // ── Remember Me session guard ────────────────────────────────────────
    // If the user did NOT check "Remember Me", their auth should only last
    // for the current browser session.  sessionStorage is cleared by the
    // browser when all tabs of the site are closed, so if it's empty here
    // it means a new browser session has started without persistent login.
    const rememberPref = localStorage.getItem('sahod-remember');
    const sessionActive = sessionStorage.getItem('sahod-session-active');
    if (rememberPref === 'false' && !sessionActive) {
      // Clear persisted auth so the user is redirected to login
      useAuthStore.getState().setUser(null);
      useAuthStore.getState().setFirebaseUser(null);
      localStorage.removeItem('sahod-auth');
    }
    // ────────────────────────────────────────────────────────────────────

    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, [initAuthListener]);

  // Load HR users from Firestore on app startup so they can log in
  // This only reads the publicly-readable hrUsers collection
  useEffect(() => {
    // Test Firestore access first for debugging
    testFirestoreAccess().then(() => {
      console.log('🧪 Firestore access test completed, waiting 2 seconds then loading HR users...');
      // Add a small delay to ensure test data is created
      return new Promise(resolve => setTimeout(resolve, 2000));
    }).then(() => {
      return loadHrUsers();
    }).catch(err => {
      console.warn('Could not load HR users on startup:', err);
    });
  }, [loadHrUsers, testFirestoreAccess]);

  // Also refresh HR user data when app becomes active (for updated credentials)
  useEffect(() => {
    const handleFocus = () => {
      loadHrUsers().catch(err => {
        console.warn('Could not refresh HR users data:', err);
      });
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadHrUsers]);

  // Refresh Firestore data when system owner logs in for latest registrations
  useEffect(() => {
    if (user?.role === 'system_owner' && user?.email === 'clarenceflores082001@gmail.com') {
      // Add a small delay to ensure Firebase auth token is fully propagated
      const timer = setTimeout(() => {
        loadFromFirestore().catch(err => {
          console.warn('Could not refresh Firestore data:', err);
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user?.role, user?.email, loadFromFirestore]);

  // Load HR data when HR client logs in
  useEffect(() => {
    if (user?.role === 'hr_client' && user?.companyId) {
      const timer = setTimeout(() => {
        loadHRData().catch(err => {
          console.warn('Could not load HR data from Firestore:', err);
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user?.role, user?.companyId, loadHRData]);

  return (
    <ToastProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RoleBasedDashboardRedirect />} />
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* Employee Management - HR Only */}
          <Route path="employees" element={<EmployeeManagementGuard><EmployeeListPage /></EmployeeManagementGuard>} />
          <Route path="employees/new" element={<EmployeeManagementGuard><EmployeeFormPage /></EmployeeManagementGuard>} />
          <Route path="employees/:id/edit" element={<EmployeeManagementGuard><EmployeeFormPage /></EmployeeManagementGuard>} />
          
          {/* Attendance - HR Only */}
          <Route path="attendance" element={<EmployeeManagementGuard><AttendancePage /></EmployeeManagementGuard>} />
          
          {/* Leave Management - HR Only */}
          <Route path="leaves" element={<LeaveManagementGuard><LeaveListPage /></LeaveManagementGuard>} />
          <Route path="leaves/new" element={<LeaveManagementGuard><LeaveRequestPage /></LeaveManagementGuard>} />
          <Route path="leaves/calendar" element={<LeaveManagementGuard><LeaveCalendarPage /></LeaveManagementGuard>} />
          
          {/* Payroll - HR Only */}
          <Route path="payroll" element={<PayrollManagementGuard><PayrollPage /></PayrollManagementGuard>} />
          
          {/* Reports - HR Only */}
          <Route path="reports" element={<ReportsGuard><ReportsPage /></ReportsGuard>} />
          
          {/* Settings - HR Only */}
          <Route path="settings" element={<SettingsGuard><SettingsPage /></SettingsGuard>} />
          
          {/* System Owner Routes - System Owner Only */}
          <Route path="owner-dashboard" element={<SystemOwnerGuard><OwnerDashboardPage /></SystemOwnerGuard>} />
          <Route path="companies" element={<SystemOwnerGuard><CompaniesPage /></SystemOwnerGuard>} />
          <Route path="subscriptions" element={<SystemOwnerGuard><SubscriptionsPage /></SystemOwnerGuard>} />
          <Route path="system-config" element={<SystemOwnerGuard><SystemConfigPage /></SystemOwnerGuard>} />
          <Route path="platform-analytics" element={<SystemOwnerGuard><AnalyticsPage /></SystemOwnerGuard>} />
        </Route>
        
        {/* Redirect old routes to new /app prefix */}
        <Route path="/dashboard" element={<Navigate to="/app" replace />} />
        <Route path="/employees/*" element={<Navigate to="/app/employees" replace />} />
        <Route path="/attendance" element={<Navigate to="/app/attendance" replace />} />
        <Route path="/leaves/*" element={<Navigate to="/app/leaves" replace />} />
        <Route path="/payroll" element={<Navigate to="/app/payroll" replace />} />
        <Route path="/reports" element={<Navigate to="/app/reports" replace />} />
        <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
