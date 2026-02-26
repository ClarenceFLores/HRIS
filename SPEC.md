# PH HRIS - Philippine HRIS SaaS Platform Specification

## Project Overview

**Project Name:** PH HRIS (Philippine HRIS)
**Project Type:** Multi-tenant SaaS Web Application
**Core Functionality:** Human Resource Information System with Philippine labor law compliance
**Target Users:** Philippine companies (SMEs to large enterprises), HR professionals, employees

---

## Technology Stack

### Frontend
- **Framework:** ReactJS 18+ with Vite
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios
- **PDF Generation:** jsPDF
- **Date Handling:** date-fns
- **Icons:** Lucide React

### Backend (Serverless)
- **Authentication:** Firebase Auth
- **Database:** Firestore (multi-tenant)
- **File Storage:** Firebase Storage
- **Cloud Functions:** Firebase Functions
- **Hosting:** Firebase Hosting

---

## UI/UX Specification

### Design System

#### Color Palette
```
css
/* Primary Colors */
--primary-50: #f0f9ff;
--primary-100: #e0f2fe;
--primary-200: #bae6fd;
--primary-300: #7dd3fc;
--primary-400: #38bdf8;
--primary-500: #0ea5e9;  /* Main Primary */
--primary-600: #0284c7;
--primary-700: #0369a1;
--primary-800: #075985;
--primary-900: #0c4a6e;

/* Neutral Colors */
--neutral-50: #fafafa;
--neutral-100: #f5f5f5;
--neutral-200: #e5e5e5;
--neutral-300: #d4d4d4;
--neutral-400: #a3a3a3;
--neutral-500: #737373;
--neutral-600: #525252;
--neutral-700: #404040;
--neutral-800: #262626;
--neutral-900: #171717;

/* Accent Colors */
--accent-success: #10b981;
--accent-warning: #f59e0b;
--accent-danger: #ef4444;
--accent-info: #3b82f6;

/* Dark Mode */
--dark-bg: #0f172a;
--dark-surface: #1e293b;
--dark-border: #334155;
```

#### Typography
- **Font Family:** 
  - Headings: "Plus Jakarta Sans", sans-serif
  - Body: "Inter", sans-serif
- **Font Sizes:**
  - xs: 0.75rem (12px)
  - sm: 0.875rem (14px)
  - base: 1rem (16px)
  - lg: 1.125rem (18px)
  - xl: 1.25rem (20px)
  - 2xl: 1.5rem (24px)
  - 3xl: 1.875rem (30px)
  - 4xl: 2.25rem (36px)

#### Spacing System
- Base unit: 4px
- Scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64

#### Border Radius
- sm: 0.375rem (6px)
- md: 0.5rem (8px)
- lg: 0.75rem (12px)
- xl: 1rem (16px)
- 2xl: 1.5rem (24px)
- full: 9999px

#### Shadows
- sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
- md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
- lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
- xl: 0 20px 25px -5px rgb(0 0 0 / 0.1)

---

### Layout Structure

#### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

#### Main Layout
```
+------------------+--------------------------------+
|                  |          Header               |
|    Sidebar       |  (Sticky, with profile)       |
|  (Collapsible)   +--------------------------------+
|                  |                                |
|   - Logo         |        Main Content            |
|   - Navigation   |                                |
|   - User Info    |        (Scrollable)            |
|                  |                                |
+------------------+--------------------------------+
```

#### Sidebar
- Width: 280px (desktop), 0-280px (mobile drawer)
- Collapsible to 80px (icons only)
- Mobile: Overlay drawer with backdrop
- Contains: Logo, main nav, user mini-profile

#### Header
- Height: 64px
- Fixed/sticky position
- Contains: Page title, search, notifications, profile dropdown

---

## Core Features Specification

### 1. Authentication & Authorization

#### Roles
| Role | Permissions |
|------|-------------|
| Super Admin | Full system access, manage tenants, billing |
| HR Admin | Full company access, all HR functions |
| Payroll Officer | Payroll processing only |
| Employee | Self-service portal access |

#### Firebase Auth
- Email/password authentication
- Google OAuth (optional)
- Password reset flow
- Email verification

### 2. Multi-Tenant Architecture

#### Firestore Structure
```
/tenants/{tenantId}
  /settings
  /users/{userId}
  /employees/{employeeId}
  /attendance/{recordId}
  /leaves/{leaveId}
  /payroll/{payrollId}
  /reports/{reportId}
```

#### Tenant Isolation
- Firestore Security Rules: `request.auth.token.tenantId == resource.data.tenantId`
- All queries filtered by tenantId

### 3. Employee Management

#### Employee Data Model
```
typescript
interface Employee {
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
  gender: 'male' | 'female' | 'other';
  civilStatus: 'single' | 'married' | 'widowed' | 'separated';
  address: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
  };
  employment: {
    department: string;
    position: string;
    employmentType: 'regular' | 'contractual' | 'part-time' | 'probationary';
    hireDate: Date;
    regularDate?: Date;
    manager?: string;
  };
  compensation: {
    salaryType: 'monthly' | 'daily' | 'hourly';
    basicSalary: number;
    paySchedule: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly';
    bankAccount?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    governmentIds };
  };
 : {
    sss?: string;
    philhealth?: string;
    pagibig?: string;
    tin?: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  status: 'active' | 'inactive' | 'resigned' | 'terminated';
  createdAt: Date;
  updatedAt: Date;
}
```

### 4. Attendance & Shift Scheduling

#### Attendance Record
```
typescript
interface AttendanceRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  date: Date;
  timeIn?: Date;
  timeOut?: Date;
  breakMinutes: number;
  totalHours: number;
  lateMinutes: number;
  undertimeMinutes: number;
  overtimeHours: number;
  nightDifferentialHours: number;
  status: 'present' | 'absent' | 'late' | 'on_leave' | 'holiday';
  remarks?: string;
}
```

#### Shift Schedule
```
typescript
interface ShiftSchedule {
  id: string;
  tenantId: string;
  name: string;
  timeIn: string; // "HH:mm"
  timeOut: string;
  breakStart: string;
  breakEnd: string;
  isNightShift: boolean;
  days: string[]; // ["monday", "tuesday", etc.]
}
```

### 5. Leave Management

#### Leave Types (Philippine Compliant)
- Vacation Leave
- Sick Leave
- Maternity Leave (105 days)
- Paternity Leave (7 days)
- Solo Parent Leave (7 days)
- Bereavement Leave
- Emergency Leave
- Service Incentive Leave (5 days per year)

#### Leave Request
```
typescript
interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approverId?: string;
  approverNotes?: string;
  attachments?: string[]; // URLs
  createdAt: Date;
  updatedAt: Date;
}
```

#### Approval Workflow
1. Employee submits leave request
2. Manager receives notification
3. Manager approves/rejects with notes
4. Employee notified of decision
5. If approved, attendance auto-marked

### 6. Payroll System (Philippine Labor Law Compliant)

#### Payroll Components

##### Regular Deductions
- SSS Premium (2024 rates)
- PhilHealth Premium (2024 rates)
- Pag-IBIG Premium (2024 rates)
- Withholding Tax (BIR table)
- Other deductions (loans, etc.)

##### Additional Pay
- Overtime Pay
- Night Differential (10% of hourly rate per hour)
- Holiday Pay (double or double-plus)
- 13th Month Pay
- Separation Pay

#### Government Contribution Rates (2024 - Editable)

##### SSS
| Monthly Salary | Employee Employer |
|---------------- ||----------|----------|
| 4,000 - 4,999.99 | 200 | 240 |
| 5,000 - 5,999.99 | 240 | 290 |
| ... | ... | ... |
| 29,000 - 29,999.99 | 1,160 | 1,400 |
| 30,000+ | 1,200 | 1,450 |

##### PhilHealth
- Employee: 2.5% of monthly salary
- Employer: 2.5% of monthly salary
- Maximum salary: ₱100,000

##### Pag-IBIG
- Employee: 2% of monthly salary (max ₱100)
- Employer: 2% of monthly salary (max ₱100)

##### BIR Withholding Tax
- Use graduated table with dependent deductions

#### Payroll Processing Steps
1. Select pay period
2. Import/generate attendance
3. Review and adjust
4. Calculate deductions
5. Review summary
6. Process payroll
7. Generate payslips

#### Payslip Model
```
typescript
interface Payslip {
  id: string;
  tenantId: string;
  employeeId: string;
  payrollId: string;
  periodStart: Date;
  periodEnd: Date;
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
  netPay: number;
  createdAt: Date;
}
```

### 7. Reports Dashboard

#### KPIs
- Total Employees
- Present Today
- On Leave
- Pending Leave Requests
- Payroll Total
- Turnover Rate

#### Report Types
- Employee Roster
- Attendance Summary
- Leave Balance Report
- Payroll Register
- Government Contribution Summary
- 13th Month Pay Report
- BIR Alphalist
- SSS, PhilHealth, Pag-IBIG Reports

### 8. Subscription Billing

#### Plans
| Plan | Price | Features |
|------|-------|----------|
| Starter | ₱999/mo | 1-25 employees, basic features |
| Professional | ₱2,499/mo | 26-100 employees, all features |
| Enterprise | ₱4,999/mo | 101-500 employees, priority support |
| Custom | Contact | 500+ employees, custom features |

#### Billing Data
```
typescript
interface Subscription {
  id: string;
  tenantId: string;
  plan: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  monthlyAmount: number;
  paymentMethod: 'gcash' | 'bank_transfer' | 'credit_card';
}
```

---

## UI Components

### Core Components
1. **Layout** - Main app layout with sidebar/header
2. **DataTable** - Sortable, filterable, paginated tables
3. **DataCard** - KPI display cards
4. **FormInput** - Styled form inputs with validation
5. **Modal** - Confirmation/action modals
6. **Toast** - Notification toasts
7. **Button** - Primary, secondary, danger, ghost
8. **Dropdown** - Select/dropdown menus
9. **DatePicker** - Date selection
10. **FileUpload** - File/image upload
11. **Avatar** - User avatars
12. **Badge** - Status badges
13. **Stepper** - Multi-step process UI
14. **Calendar** - Attendance calendar
15. **PayslipViewer** - PDF payslip display

### Component States
- Default
- Hover
- Focus
- Active
- Disabled
- Loading (skeleton)
- Error
- Success

---

## Accessibility (WCAG 2.1 AA)

- Color contrast ratio: 4.5:1 minimum
- Focus indicators visible
- Keyboard navigation support
- Screen reader compatible
- ARIA labels on interactive elements
- Form error announcements

---

## Performance Requirements

- Initial load: < 3 seconds
- Route transition: < 500ms
- Table render (1000 rows): < 1 second
- Firestore queries: Optimized with indexes
- Image optimization: Lazy loading

---

## File Structure

```
hris/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── forms/
│   │   └── features/
│   ├── contexts/
│   ├── hooks/
│   ├── lib/
│   │   ├── firebase/
│   │   └── utils/
│   ├── pages/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── employees/
│   │   ├── attendance/
│   │   ├── leaves/
│   │   ├── payroll/
│   │   ├── reports/
│   │   └── settings/
│   ├── stores/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Acceptance Criteria

### Authentication
- [ ] Users can register and login
- [ ] Password reset works
- [ ] Role-based access enforced

### Employee Management
- [ ] CRUD operations work
- [ ] Search/filter employees
- [ ] Profile view/edit

### Attendance
- [ ] Daily attendance tracking
- [ ] Shift scheduling
- [ ] Overtime/night differential auto-calc

### Leave
- [ ] Leave request submission
- [ ] Approval workflow
- [ ] Leave balance tracking

### Payroll
- [ ] Pay period selection
- [ ] Attendance import
- [ ] Deductions auto-calc
- [ ] Payslip generation
- [ ] 13th month pay calc

### Reports
- [ ] Dashboard KPIs
- [ ] Export to PDF/Excel

### Responsive
- [ ] Mobile-friendly
- [ ] Tablet support
- [ ] Desktop full feature

### Performance
- [ ] Fast load times
- [ ] Smooth animations
- [ ] No layout shifts

---

## Philippine Labor Law References

- Labor Code of the Philippines
- SSS Act of 1997 (RA 8282)
- PhilHealth Act (RA 7875, as amended)
- Pag-IBIG Fund Act (RA 7749)
- BIR Tax Reform Act (RA 10963 / TRAIN Law)
- DOLE Department Orders
