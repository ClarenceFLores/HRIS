# PH HRIS - Implementation TODO

## Phase 1: Project Setup (Core Config)
- [x] SPEC.md - Project specification
- [ ] package.json - Dependencies
- [ ] vite.config.ts - Vite configuration
- [ ] tsconfig.json - TypeScript config
- [ ] tailwind.config.js - Tailwind configuration
- [ ] postcss.config.js - PostCSS config
- [ ] index.html - Entry HTML

## Phase 2: Firebase Setup
- [ ] firebase/config.ts - Firebase initialization
- [ ] firebase/auth.ts - Authentication service
- [ ] firebase/firestore.ts - Firestore service
- [ ] firebase/storage.ts - Storage service

## Phase 3: Core Infrastructure
- [ ] types/index.ts - TypeScript interfaces
- [ ] lib/utils.ts - Utility functions
- [ ] contexts/AuthContext.tsx - Auth context
- [ ] stores/useAuthStore.ts - Auth store (Zustand)
- [ ] stores/useAppStore.ts - App store
- [ ] hooks/useAuth.ts - Auth hooks

## Phase 4: UI Components (Common)
- [ ] components/common/Button.tsx
- [ ] components/common/Input.tsx
- [ ] components/common/Modal.tsx
- [ ] components/common/Toast.tsx
- [ ] components/common/Badge.tsx
- [ ] components/common/Avatar.tsx
- [ ] components/common/Card.tsx
- [ ] components/common/DataTable.tsx
- [ ] components/common/DatePicker.tsx
- [ ] components/common/Select.tsx
- [ ] components/common/Loading.tsx
- [ ] components/common/EmptyState.tsx

## Phase 5: Layout Components
- [ ] components/layout/Sidebar.tsx
- [ ] components/layout/Header.tsx
- [ ] components/layout/Footer.tsx
- [ ] components/layout/MainLayout.tsx

## Phase 6: Auth Pages
- [ ] pages/auth/Login.tsx
- [ ] pages/auth/Register.tsx
- [ ] pages/auth/ForgotPassword.tsx

## Phase 7: Dashboard
- [ ] pages/dashboard/Dashboard.tsx
- [ ] components/features/KPICard.tsx

## Phase 8: Employee Management
- [ ] pages/employees/EmployeeList.tsx
- [ ] pages/employees/EmployeeForm.tsx
- [ ] pages/employees/EmployeeProfile.tsx

## Phase 9: Attendance
- [ ] pages/attendance/AttendanceList.tsx
- [ ] pages/attendance/AttendanceCalendar.tsx
- [ ] pages/attendance/ShiftSchedule.tsx

## Phase 10: Leave Management
- [ ] pages/leaves/LeaveList.tsx
- [ ] pages/leaves/LeaveRequest.tsx
- [ ] pages/leaves/LeaveApproval.tsx

## Phase 11: Payroll System
- [ ] pages/payroll/PayrollList.tsx
- [ ] pages/payroll/PayrollProcess.tsx
- [ ] pages/payroll/PayslipView.tsx
- [ ] lib/payroll/calculator.ts - Philippine payroll calculations

## Phase 12: Reports
- [ ] pages/reports/ReportsDashboard.tsx

## Phase 13: Settings
- [ ] pages/settings/Settings.tsx
- [ ] pages/settings/RateConfiguration.tsx

## Phase 14: Routing & App Entry
- [ ] App.tsx - Main routing
- [ ] main.tsx - React mount
