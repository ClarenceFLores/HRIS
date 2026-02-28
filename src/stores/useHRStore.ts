/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 *
 * Central HR data store — employees, attendance, leaves, payroll.
 * Persisted to localStorage AND synced to Firestore.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { useAuthStore } from './useAuthStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HREmployee {
  id: string;
  employeeNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  civilStatus: string;
  address: string;
  city: string;
  department: string;
  position: string;
  employmentType: string;
  hireDate: string;
  basicSalary: number;
  sssNumber: string;
  philhealthNumber: string;
  pagibigNumber: string;
  tinNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  status: 'active' | 'inactive' | 'resigned' | 'terminated';
  createdAt: string;
}

export interface HRAttendance {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  timeIn: string;
  timeOut: string;
  status: 'present' | 'absent' | 'late' | 'early-out' | 'on-leave';
  hours: number;
}

export interface HRLeaveRequest {
  id: string;
  employeeId: string;
  employee: string;
  avatar: string;
  department: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason: string;
  requestDate: string;
  rejectionReason?: string;
}

export interface HRPayrollPeriod {
  id: string;
  period: string;
  startDate: string;
  endDate: string;
  payDate: string;
  status: 'draft' | 'processing' | 'completed' | 'cancelled';
  totalEmployees: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  overtime: number;
  allowances: number;
  processedDate: string | null;
}

export interface HRPayrollRecord {
  id: string;
  periodId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  basicSalary: number;
  overtime: number;
  holiday: number;
  allowances: number;
  grossPay: number;
  sss: number;
  philHealth: number;
  pagibig: number;
  tax: number;
  totalDeductions: number;
  netPay: number;
}

// ─── Computation helpers ──────────────────────────────────────────────────────

function computeDeductions(basic: number) {
  // SSS contribution table (simplified 2024)
  let sss = 0;
  if (basic < 4250) sss = 180;
  else if (basic < 4750) sss = 202.5;
  else if (basic < 5250) sss = 225;
  else if (basic < 5750) sss = 247.5;
  else if (basic < 6250) sss = 270;
  else if (basic < 6750) sss = 292.5;
  else if (basic < 7250) sss = 315;
  else if (basic < 7750) sss = 337.5;
  else if (basic < 8250) sss = 360;
  else if (basic < 8750) sss = 382.5;
  else if (basic < 9250) sss = 405;
  else if (basic < 9750) sss = 427.5;
  else if (basic < 10250) sss = 450;
  else if (basic < 10750) sss = 472.5;
  else if (basic < 11250) sss = 495;
  else if (basic < 11750) sss = 517.5;
  else if (basic < 12250) sss = 540;
  else if (basic < 12750) sss = 562.5;
  else if (basic < 13250) sss = 585;
  else if (basic < 13750) sss = 607.5;
  else if (basic < 14250) sss = 630;
  else if (basic < 14750) sss = 652.5;
  else if (basic < 15250) sss = 675;
  else if (basic < 15750) sss = 697.5;
  else if (basic < 16250) sss = 720;
  else if (basic < 16750) sss = 742.5;
  else if (basic < 17250) sss = 765;
  else if (basic < 17750) sss = 787.5;
  else if (basic < 18250) sss = 810;
  else if (basic < 18750) sss = 832.5;
  else sss = 900;

  // PhilHealth: 5% of basic, split equally, max ₱5,000/month total (2024)
  const philHealthRate = 0.025;
  const philHealth = Math.min(basic * philHealthRate, 2500);

  // Pag-IBIG: 2% basic (employee share), max ₱100
  const pagibig = Math.min(basic * 0.02, 100);

  // Withholding tax (simplified): monthly basis
  const taxable = basic - sss - philHealth - pagibig;
  let tax = 0;
  if (taxable <= 20833) tax = 0;
  else if (taxable <= 33332) tax = (taxable - 20833) * 0.2;
  else if (taxable <= 66666) tax = 2500 + (taxable - 33333) * 0.25;
  else if (taxable <= 166666) tax = 10833 + (taxable - 66667) * 0.3;
  else if (taxable <= 666666) tax = 40833 + (taxable - 166667) * 0.32;
  else tax = 200833 + (taxable - 666667) * 0.35;

  return { sss, philHealth, pagibig, tax: Math.max(0, tax) };
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_EMPLOYEES: HREmployee[] = [
  { id: 'E001', employeeNumber: 'EMP-001', firstName: 'Maria', middleName: 'Cruz', lastName: 'Santos', email: 'msantos@company.com', phone: '+63 917 123 4567', birthDate: '1990-03-15', gender: 'female', civilStatus: 'married', address: '123 Rizal St.', city: 'Quezon City', department: 'Human Resources', position: 'HR Manager', employmentType: 'regular', hireDate: '2019-01-15', basicSalary: 45000, sssNumber: '33-1234567-8', philhealthNumber: '12-345678901-2', pagibigNumber: '1234-5678-9012', tinNumber: '123-456-789-000', emergencyContactName: 'Jose Santos', emergencyContactPhone: '+63 917 987 6543', emergencyContactRelation: 'Spouse', status: 'active', createdAt: '2019-01-15' },
  { id: 'E002', employeeNumber: 'EMP-002', firstName: 'Juan', middleName: '', lastName: 'Dela Cruz', email: 'jdelacruz@company.com', phone: '+63 918 234 5678', birthDate: '1992-07-22', gender: 'male', civilStatus: 'single', address: '456 Mabini Ave.', city: 'Makati', department: 'Engineering', position: 'Software Engineer', employmentType: 'regular', hireDate: '2020-05-01', basicSalary: 55000, sssNumber: '33-2345678-9', philhealthNumber: '12-456789012-3', pagibigNumber: '2345-6789-0123', tinNumber: '234-567-890-000', emergencyContactName: 'Rosa Dela Cruz', emergencyContactPhone: '+63 918 876 5432', emergencyContactRelation: 'Mother', status: 'active', createdAt: '2020-05-01' },
  { id: 'E003', employeeNumber: 'EMP-003', firstName: 'Ana', middleName: 'Reyes', lastName: 'Rodriguez', email: 'arodriguez@company.com', phone: '+63 919 345 6789', birthDate: '1994-11-08', gender: 'female', civilStatus: 'single', address: '789 Bonifacio Blvd.', city: 'Taguig', department: 'Marketing', position: 'Marketing Specialist', employmentType: 'regular', hireDate: '2021-02-15', basicSalary: 35000, sssNumber: '33-3456789-0', philhealthNumber: '12-567890123-4', pagibigNumber: '3456-7890-1234', tinNumber: '345-678-901-000', emergencyContactName: 'Pedro Rodriguez', emergencyContactPhone: '+63 919 765 4321', emergencyContactRelation: 'Father', status: 'active', createdAt: '2021-02-15' },
  { id: 'E004', employeeNumber: 'EMP-004', firstName: 'Carlos', middleName: '', lastName: 'Mendoza', email: 'cmendoza@company.com', phone: '+63 920 456 7890', birthDate: '1988-05-30', gender: 'male', civilStatus: 'married', address: '321 Luna St.', city: 'Pasig', department: 'Finance', position: 'Accountant', employmentType: 'regular', hireDate: '2018-08-01', basicSalary: 42000, sssNumber: '33-4567890-1', philhealthNumber: '12-678901234-5', pagibigNumber: '4567-8901-2345', tinNumber: '456-789-012-000', emergencyContactName: 'Lisa Mendoza', emergencyContactPhone: '+63 920 654 3210', emergencyContactRelation: 'Spouse', status: 'active', createdAt: '2018-08-01' },
  { id: 'E005', employeeNumber: 'EMP-005', firstName: 'Isabel', middleName: 'Torres', lastName: 'Garcia', email: 'igarcia@company.com', phone: '+63 921 567 8901', birthDate: '1986-09-12', gender: 'female', civilStatus: 'married', address: '654 Aguinaldo Rd.', city: 'Paranaque', department: 'Operations', position: 'Operations Manager', employmentType: 'regular', hireDate: '2017-03-20', basicSalary: 50000, sssNumber: '33-5678901-2', philhealthNumber: '12-789012345-6', pagibigNumber: '5678-9012-3456', tinNumber: '567-890-123-000', emergencyContactName: 'Marco Garcia', emergencyContactPhone: '+63 921 543 2109', emergencyContactRelation: 'Spouse', status: 'active', createdAt: '2017-03-20' },
  { id: 'E006', employeeNumber: 'EMP-006', firstName: 'Roberto', middleName: '', lastName: 'Torres', email: 'rtorres@company.com', phone: '+63 922 678 9012', birthDate: '1993-01-25', gender: 'male', civilStatus: 'single', address: '987 del Pilar St.', city: 'Mandaluyong', department: 'Sales', position: 'Sales Executive', employmentType: 'regular', hireDate: '2020-11-01', basicSalary: 38000, sssNumber: '33-6789012-3', philhealthNumber: '12-890123456-7', pagibigNumber: '6789-0123-4567', tinNumber: '678-901-234-000', emergencyContactName: 'Lita Torres', emergencyContactPhone: '+63 922 432 1098', emergencyContactRelation: 'Mother', status: 'active', createdAt: '2020-11-01' },
  { id: 'E007', employeeNumber: 'EMP-007', firstName: 'Sofia', middleName: '', lastName: 'Reyes', email: 'sreyes@company.com', phone: '+63 923 789 0123', birthDate: '1996-06-18', gender: 'female', civilStatus: 'single', address: '147 Kalaw Ave.', city: 'Manila', department: 'Customer Service', position: 'CS Representative', employmentType: 'probationary', hireDate: '2023-03-01', basicSalary: 28000, sssNumber: '33-7890123-4', philhealthNumber: '12-901234567-8', pagibigNumber: '7890-1234-5678', tinNumber: '789-012-345-000', emergencyContactName: 'Carmen Reyes', emergencyContactPhone: '+63 923 321 0987', emergencyContactRelation: 'Mother', status: 'active', createdAt: '2023-03-01' },
  { id: 'E008', employeeNumber: 'EMP-008', firstName: 'Miguel', middleName: 'Santos', lastName: 'Castillo', email: 'mcastillo@company.com', phone: '+63 924 890 1234', birthDate: '1989-12-03', gender: 'male', civilStatus: 'married', address: '258 Katipunan Blvd.', city: 'Quezon City', department: 'Engineering', position: 'Senior Developer', employmentType: 'regular', hireDate: '2016-07-15', basicSalary: 65000, sssNumber: '33-8901234-5', philhealthNumber: '12-012345678-9', pagibigNumber: '8901-2345-6789', tinNumber: '890-123-456-000', emergencyContactName: 'Diana Castillo', emergencyContactPhone: '+63 924 210 9876', emergencyContactRelation: 'Spouse', status: 'active', createdAt: '2016-07-15' },
];

const TODAY = new Date().toISOString().split('T')[0];

function buildSeedAttendance(): HRAttendance[] {
  return SEED_EMPLOYEES.map((emp, i) => {
    const statuses: HRAttendance['status'][] = ['present', 'present', 'present', 'late', 'present', 'absent', 'on-leave', 'early-out'];
    const status = statuses[i % statuses.length];
    const hours = status === 'absent' || status === 'on-leave' ? 0 : status === 'early-out' ? 5 : status === 'late' ? 7.5 : 8;
    return {
      id: genId(),
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      date: TODAY,
      timeIn: status === 'absent' || status === 'on-leave' ? '' : status === 'late' ? '09:45' : '08:00',
      timeOut: status === 'absent' || status === 'on-leave' ? '' : status === 'early-out' ? '13:00' : '17:00',
      status,
      hours,
    };
  });
}

const SEED_LEAVES: HRLeaveRequest[] = [
  { id: 'L001', employeeId: 'E001', employee: 'Maria Santos', avatar: 'MS', department: 'Human Resources', type: 'Vacation', startDate: '2026-03-15', endDate: '2026-03-19', days: 5, status: 'pending', reason: 'Family vacation to Palawan for our anniversary celebration.', requestDate: '2026-02-20' },
  { id: 'L002', employeeId: 'E002', employee: 'Juan Dela Cruz', avatar: 'JC', department: 'Engineering', type: 'Sick', startDate: '2026-02-08', endDate: '2026-02-09', days: 2, status: 'approved', reason: 'Flu symptoms and high fever. Doctor advised rest for recovery.', requestDate: '2026-02-07' },
  { id: 'L003', employeeId: 'E003', employee: 'Ana Rodriguez', avatar: 'AR', department: 'Marketing', type: 'Emergency', startDate: '2026-02-18', endDate: '2026-02-18', days: 1, status: 'pending', reason: 'Family emergency - grandfather hospitalized.', requestDate: '2026-02-17' },
  { id: 'L004', employeeId: 'E004', employee: 'Carlos Mendoza', avatar: 'CM', department: 'Finance', type: 'Vacation', startDate: '2026-03-20', endDate: '2026-03-24', days: 4, status: 'pending', reason: 'Pre-planned vacation to Baguio with family.', requestDate: '2026-02-10' },
  { id: 'L005', employeeId: 'E006', employee: 'Roberto Torres', avatar: 'RT', department: 'Sales', type: 'Bereavement', startDate: '2026-02-05', endDate: '2026-02-07', days: 3, status: 'approved', reason: 'Bereavement leave for father\'s passing.', requestDate: '2026-02-04' },
  { id: 'L006', employeeId: 'E007', employee: 'Sofia Reyes', avatar: 'SR', department: 'Customer Service', type: 'Sick', startDate: '2026-01-25', endDate: '2026-01-26', days: 2, status: 'rejected', reason: 'Mild headache and feeling unwell.', requestDate: '2026-01-24', rejectionReason: 'Insufficient medical justification. Please provide medical certificate.' },
  { id: 'L007', employeeId: 'E008', employee: 'Miguel Castillo', avatar: 'MC', department: 'Engineering', type: 'Paternity', startDate: '2026-03-10', endDate: '2026-03-17', days: 7, status: 'pending', reason: 'Paternity leave for newborn child care and supporting my wife.', requestDate: '2026-02-01' },
];

function buildSeedPayroll(): { periods: HRPayrollPeriod[]; records: HRPayrollRecord[] } {
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  const periodId = 'PP-CURRENT';

  const records: HRPayrollRecord[] = SEED_EMPLOYEES.map(emp => {
    const overtime = Math.round(emp.basicSalary * 0.08);
    const allowances = Math.round(emp.basicSalary * 0.06);
    const grossPay = emp.basicSalary + overtime + allowances;
    const { sss, philHealth, pagibig, tax } = computeDeductions(emp.basicSalary);
    const totalDeductions = sss + philHealth + pagibig + tax;
    return {
      id: genId(),
      periodId,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      position: emp.position,
      basicSalary: emp.basicSalary,
      overtime,
      holiday: 0,
      allowances,
      grossPay,
      sss: Math.round(sss),
      philHealth: Math.round(philHealth),
      pagibig: Math.round(pagibig),
      tax: Math.round(tax),
      totalDeductions: Math.round(totalDeductions),
      netPay: Math.round(grossPay - totalDeductions),
    };
  });

  const grossPay = records.reduce((s, r) => s + r.grossPay, 0);
  const deductions = records.reduce((s, r) => s + r.totalDeductions, 0);

  const currentPeriod: HRPayrollPeriod = {
    id: periodId,
    period: new Date(year, month, 1).toLocaleString('en-PH', { month: 'long', year: 'numeric' }),
    startDate: `${year}-${String(month + 1).padStart(2, '0')}-01`,
    endDate: `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`,
    payDate: `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`,
    status: 'draft',
    totalEmployees: SEED_EMPLOYEES.length,
    grossPay,
    deductions,
    netPay: grossPay - deductions,
    overtime: records.reduce((s, r) => s + r.overtime, 0),
    allowances: records.reduce((s, r) => s + r.allowances, 0),
    processedDate: null,
  };

  const prev1: HRPayrollPeriod = {
    id: 'PP-PREV1',
    period: new Date(year, month - 1, 1).toLocaleString('en-PH', { month: 'long', year: 'numeric' }),
    startDate: `${year}-${String(month).padStart(2, '0')}-01`,
    endDate: `${year}-${String(month).padStart(2, '0')}-28`,
    payDate: `${year}-${String(month).padStart(2, '0')}-28`,
    status: 'completed',
    totalEmployees: SEED_EMPLOYEES.length,
    grossPay: Math.round(grossPay * 0.97),
    deductions: Math.round(deductions * 0.97),
    netPay: Math.round((grossPay - deductions) * 0.97),
    overtime: Math.round(records.reduce((s, r) => s + r.overtime, 0) * 0.9),
    allowances: Math.round(records.reduce((s, r) => s + r.allowances, 0)),
    processedDate: `${year}-${String(month).padStart(2, '0')}-28`,
  };

  return { periods: [currentPeriod, prev1], records };
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface HRState {
  employees: HREmployee[];
  attendance: HRAttendance[];
  leaveRequests: HRLeaveRequest[];
  payrollPeriods: HRPayrollPeriod[];
  payrollRecords: HRPayrollRecord[];

  // Employee actions
  addEmployee: (data: Omit<HREmployee, 'id' | 'employeeNumber' | 'createdAt' | 'status'>) => void;
  updateEmployee: (id: string, data: Partial<HREmployee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployee: (id: string) => HREmployee | undefined;

  // Attendance actions
  refreshAttendance: () => void;
  markAttendance: (id: string, update: Partial<HRAttendance>) => void;

  // Leave actions
  addLeaveRequest: (req: Omit<HRLeaveRequest, 'id'>) => void;
  approveLeave: (id: string) => void;
  rejectLeave: (id: string, reason: string) => void;

  // Payroll actions
  runPayroll: (periodId: string) => void;
  addPayrollPeriod: (p: Omit<HRPayrollPeriod, 'id'>) => void;

  // Firestore sync actions
  syncToFirestore: () => Promise<void>;
  loadFromFirestore: () => Promise<void>;
  enableAutoSync: () => void;
  disableAutoSync: () => void;

  // Computed helpers
  getDashboardStats: () => {
    totalEmployees: number;
    activeEmployees: number;
    presentToday: number;
    onLeave: number;
    pendingLeaves: number;
    monthlyPayroll: number;
  };

  // Seed initialization flag
  _seeded: boolean;
}

const { periods: seedPeriods, records: seedRecords } = buildSeedPayroll();

export const useHRStore = create<HRState>()(
  persist(
    (set, get) => ({
      employees: SEED_EMPLOYEES,
      attendance: buildSeedAttendance(),
      leaveRequests: SEED_LEAVES,
      payrollPeriods: seedPeriods,
      payrollRecords: seedRecords,
      _seeded: true,

      // ── Employee ────────────────────────────────────────────

      addEmployee: (data) => {
        const employees = get().employees;
        const nextNum = employees.length + 1;
        const newEmp: HREmployee = {
          ...data,
          id: `E${String(nextNum).padStart(3, '0')}`,
          employeeNumber: `EMP-${String(nextNum).padStart(3, '0')}`,
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0],
        };
        set({ employees: [...employees, newEmp] });
        // Add today's attendance record for the new employee
        const att: HRAttendance = {
          id: genId(),
          employeeId: newEmp.id,
          employeeName: `${newEmp.firstName} ${newEmp.lastName}`,
          department: newEmp.department,
          date: TODAY,
          timeIn: '',
          timeOut: '',
          status: 'absent',
          hours: 0,
        };
        set((s) => ({ attendance: [...s.attendance, att] }));
        // Rebuild payroll record for new employee
        const { sss, philHealth, pagibig, tax } = computeDeductions(newEmp.basicSalary);
        const overtime = Math.round(newEmp.basicSalary * 0.08);
        const allowances = Math.round(newEmp.basicSalary * 0.06);
        const grossPay = newEmp.basicSalary + overtime + allowances;
        const totalDeductions = Math.round(sss + philHealth + pagibig + tax);
        const rec: HRPayrollRecord = {
          id: genId(),
          periodId: 'PP-CURRENT',
          employeeId: newEmp.id,
          employeeName: `${newEmp.firstName} ${newEmp.lastName}`,
          department: newEmp.department,
          position: newEmp.position,
          basicSalary: newEmp.basicSalary,
          overtime,
          holiday: 0,
          allowances,
          grossPay,
          sss: Math.round(sss),
          philHealth: Math.round(philHealth),
          pagibig: Math.round(pagibig),
          tax: Math.round(tax),
          totalDeductions,
          netPay: Math.round(grossPay - totalDeductions),
        };
        set((s) => ({ payrollRecords: [...s.payrollRecords, rec] }));
        
        // Auto-sync to Firestore
        get().syncToFirestore().catch(err => 
          console.warn('Failed to auto-sync new employee to Firestore:', err)
        );
      },

      updateEmployee: (id, data) => {
        set((s) => ({
          employees: s.employees.map(e => e.id === id ? { ...e, ...data } : e),
          attendance: s.attendance.map(a =>
            a.employeeId === id
              ? {
                  ...a,
                  employeeName: data.firstName ? `${data.firstName} ${data.lastName ?? ''}`.trim() : a.employeeName,
                  department: data.department ?? a.department,
                }
              : a
          ),
          payrollRecords: s.payrollRecords.map(r => {
            if (r.employeeId !== id) return r;
            const emp = { ...get().employees.find(e => e.id === id)!, ...data };
            const overtime = Math.round(emp.basicSalary * 0.08);
            const allowances = Math.round(emp.basicSalary * 0.06);
            const grossPay = emp.basicSalary + overtime + allowances;
            const { sss, philHealth, pagibig, tax } = computeDeductions(emp.basicSalary);
            const totalDeductions = Math.round(sss + philHealth + pagibig + tax);
            return {
              ...r,
              employeeName: `${emp.firstName} ${emp.lastName}`,
              department: emp.department,
              position: emp.position,
              basicSalary: emp.basicSalary,
              overtime,
              allowances,
              grossPay,
              sss: Math.round(sss),
              philHealth: Math.round(philHealth),
              pagibig: Math.round(pagibig),
              tax: Math.round(tax),
              totalDeductions,
              netPay: Math.round(grossPay - totalDeductions),
            };
          }),
        }));
        
        // Auto-sync to Firestore
        get().syncToFirestore().catch(err => 
          console.warn('Failed to auto-sync employee update to Firestore:', err)
        );
      },

      deleteEmployee: (id) => {
        set((s) => ({
          employees: s.employees.map(e => e.id === id ? { ...e, status: 'inactive' as const } : e),
        }));
        
        // Auto-sync to Firestore
        get().syncToFirestore().catch(err => 
          console.warn('Failed to auto-sync employee deletion to Firestore:', err)
        );
      },

      getEmployee: (id) => get().employees.find(e => e.id === id),

      // ── Attendance ──────────────────────────────────────────

      refreshAttendance: () => {
        set({ attendance: buildSeedAttendance() });
      },

      markAttendance: (id, update) => {
        set((s) => ({ attendance: s.attendance.map(a => a.id === id ? { ...a, ...update } : a) }));
        
        // Auto-sync to Firestore
        get().syncToFirestore().catch(err => 
          console.warn('Failed to auto-sync attendance to Firestore:', err)
        );
      },

      // ── Leave ───────────────────────────────────────────────

      addLeaveRequest: (req) => {
        const newReq: HRLeaveRequest = { ...req, id: `L${genId()}` };
        set((s) => ({ leaveRequests: [newReq, ...s.leaveRequests] }));
        
        // Auto-sync to Firestore
        get().syncToFirestore().catch(err => 
          console.warn('Failed to auto-sync leave request to Firestore:', err)
        );
      },

      approveLeave: (id) => {
        set((s) => ({
          leaveRequests: s.leaveRequests.map(r =>
            r.id === id ? { ...r, status: 'approved' as const } : r
          ),
        }));
        
        // Auto-sync to Firestore
        get().syncToFirestore().catch(err => 
          console.warn('Failed to auto-sync leave approval to Firestore:', err)
        );
      },

      rejectLeave: (id, reason) => {
        set((s) => ({
          leaveRequests: s.leaveRequests.map(r =>
            r.id === id ? { ...r, status: 'rejected' as const, rejectionReason: reason } : r
          ),
        }));
        
        // Auto-sync to Firestore
        get().syncToFirestore().catch(err => 
          console.warn('Failed to auto-sync leave rejection to Firestore:', err)
        );
      },

      // ── Payroll ─────────────────────────────────────────────

      addPayrollPeriod: (p) => {
        const period: HRPayrollPeriod = { ...p, id: `PP-${genId()}` };
        set((s) => ({ payrollPeriods: [period, ...s.payrollPeriods] }));
        
        // Auto-sync to Firestore
        get().syncToFirestore().catch(err => 
          console.warn('Failed to auto-sync payroll period to Firestore:', err)
        );
      },

      runPayroll: (periodId) => {
        const employees = get().employees.filter(e => e.status === 'active');
        const records: HRPayrollRecord[] = employees.map(emp => {
          const overtime = Math.round(emp.basicSalary * 0.08);
          const allowances = Math.round(emp.basicSalary * 0.06);
          const grossPay = emp.basicSalary + overtime + allowances;
          const { sss, philHealth, pagibig, tax } = computeDeductions(emp.basicSalary);
          const totalDeductions = Math.round(sss + philHealth + pagibig + tax);
          return {
            id: genId(),
            periodId,
            employeeId: emp.id,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            department: emp.department,
            position: emp.position,
            basicSalary: emp.basicSalary,
            overtime,
            holiday: 0,
            allowances,
            grossPay,
            sss: Math.round(sss),
            philHealth: Math.round(philHealth),
            pagibig: Math.round(pagibig),
            tax: Math.round(tax),
            totalDeductions,
            netPay: Math.round(grossPay - totalDeductions),
          };
        });

        const grossPay = records.reduce((s, r) => s + r.grossPay, 0);
        const deductions = records.reduce((s, r) => s + r.totalDeductions, 0);

        set((s) => ({
          payrollRecords: [
            ...s.payrollRecords.filter(r => r.periodId !== periodId),
            ...records,
          ],
          payrollPeriods: s.payrollPeriods.map(p =>
            p.id === periodId
              ? {
                  ...p,
                  status: 'completed' as const,
                  totalEmployees: employees.length,
                  grossPay,
                  deductions,
                  netPay: grossPay - deductions,
                  processedDate: new Date().toISOString().split('T')[0],
                }
              : p
          ),
        }));
        
        // Auto-sync to Firestore
        get().syncToFirestore().catch(err => 
          console.warn('Failed to auto-sync payroll run to Firestore:', err)
        );
      },

      // ── Firestore Sync ──────────────────────────────────────

      syncToFirestore: async () => {
        const { user } = useAuthStore.getState();
        
        console.log('🔄 Starting Firestore sync...');
        console.log('👤 Current user:', user ? {
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          id: user.id
        } : 'No user');
        
        if (!user?.companyId) {
          console.warn('⚠️ Cannot sync to Firestore: No company ID found');
          console.log('📋 User object:', user);
          return;
        }

        const { employees, attendance, leaveRequests, payrollPeriods, payrollRecords } = get();
        const companyId = user.companyId;
        
        console.log('📊 Data to sync:', {
          employees: employees.length,
          attendance: attendance.length,
          leaves: leaveRequests.length,
          payrollPeriods: payrollPeriods.length,
          payrollRecords: payrollRecords.length,
          companyId
        });

        try {
          console.log('🔄 Syncing HR data to Firestore...');

          // Sync employees with detailed logging
          console.log('📝 Syncing employees...');
          for (const emp of employees) {
            try {
              await setDoc(doc(db, `companies/${companyId}/employees`, emp.id), {
                ...emp,
                updatedAt: new Date(),
              });
              console.log(`✅ Employee ${emp.id} synced`);
            } catch (empError) {
              console.error(`❌ Failed to sync employee ${emp.id}:`, empError);
              throw empError; // Re-throw to stop the process
            }
          }

          // Sync attendance with detailed logging
          console.log('📝 Syncing attendance...');
          for (const att of attendance) {
            try {
              await setDoc(doc(db, `companies/${companyId}/attendance`, att.id), {
                ...att,
                updatedAt: new Date(),
              });
              console.log(`✅ Attendance ${att.id} synced`);
            } catch (attError) {
              console.error(`❌ Failed to sync attendance ${att.id}:`, attError);
              throw attError;
            }
          }

          // Sync leave requests with detailed logging
          console.log('📝 Syncing leave requests...');
          for (const leave of leaveRequests) {
            try {
              await setDoc(doc(db, `companies/${companyId}/leaves`, leave.id), {
                ...leave,
                updatedAt: new Date(),
              });
              console.log(`✅ Leave ${leave.id} synced`);
            } catch (leaveError) {
              console.error(`❌ Failed to sync leave ${leave.id}:`, leaveError);
              throw leaveError;
            }
          }

          // Sync payroll with detailed logging
          console.log('📝 Syncing payroll records...');
          for (const payroll of payrollRecords) {
            try {
              await setDoc(doc(db, `companies/${companyId}/payroll`, payroll.id), {
                ...payroll,
                updatedAt: new Date(),
              });
              console.log(`✅ Payroll ${payroll.id} synced`);
            } catch (payrollError) {
              console.error(`❌ Failed to sync payroll ${payroll.id}:`, payrollError);
              throw payrollError;
            }
          }

          console.log('✅ All HR data synced to Firestore successfully');
        } catch (error) {
          console.error('❌ Failed to sync HR data to Firestore:', error);
          console.error('📋 Error details:', {
            name: (error as Error).name,
            message: (error as Error).message,
            code: (error as any).code,
            stack: (error as Error).stack
          });
        }
      },

      loadFromFirestore: async () => {
        const { user } = useAuthStore.getState();
        if (!user?.companyId) {
          console.warn('⚠️ Cannot load from Firestore: No company ID');
          return;
        }

        try {
          console.log('🔄 Loading HR data from Firestore...');
          const companyId = user.companyId;

          // Load employees
          const employeesSnapshot = await getDocs(collection(db, `companies/${companyId}/employees`));
          const employees: HREmployee[] = [];
          employeesSnapshot.forEach(doc => employees.push(doc.data() as HREmployee));

          // Load attendance
          const attendanceSnapshot = await getDocs(collection(db, `companies/${companyId}/attendance`));
          const attendance: HRAttendance[] = [];
          attendanceSnapshot.forEach(doc => attendance.push(doc.data() as HRAttendance));

          // Load leave requests
          const leavesSnapshot = await getDocs(collection(db, `companies/${companyId}/leaves`));
          const leaveRequests: HRLeaveRequest[] = [];
          leavesSnapshot.forEach(doc => leaveRequests.push(doc.data() as HRLeaveRequest));

          // Load payroll
          const payrollSnapshot = await getDocs(collection(db, `companies/${companyId}/payroll`));
          const payrollRecords: HRPayrollRecord[] = [];
          payrollSnapshot.forEach(doc => payrollRecords.push(doc.data() as HRPayrollRecord));

          // Update state
          set({
            employees: employees.length > 0 ? employees : get().employees,
            attendance: attendance.length > 0 ? attendance : get().attendance,
            leaveRequests: leaveRequests.length > 0 ? leaveRequests : get().leaveRequests,
            payrollRecords: payrollRecords.length > 0 ? payrollRecords : get().payrollRecords,
          });

          console.log('✅ HR data loaded from Firestore:', {
            employees: employees.length,
            attendance: attendance.length,
            leaves: leaveRequests.length,
            payroll: payrollRecords.length,
          });
        } catch (error) {
          console.error('❌ Failed to load HR data from Firestore:', error);
        }
      },

      enableAutoSync: () => {
        // TODO: Implement real-time sync with onSnapshot
        console.log('🔄 Auto-sync enabled (placeholder)');
      },

      disableAutoSync: () => {
        // TODO: Implement cleanup of listeners
        console.log('⏹️ Auto-sync disabled (placeholder)');
      },

      // ── Dashboard ───────────────────────────────────────────

      getDashboardStats: () => {
        const { employees, attendance, leaveRequests, payrollPeriods, payrollRecords } = get();
        const totalEmployees = employees.filter(e => e.status === 'active').length;
        const activeEmployees = totalEmployees;
        const today = new Date().toISOString().split('T')[0];
        const todayAtt = attendance.filter(a => a.date === today);
        const presentToday = todayAtt.filter(a => a.status === 'present' || a.status === 'late' || a.status === 'early-out').length;
        const onLeave = todayAtt.filter(a => a.status === 'on-leave').length;
        const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length;
        const latestPeriod = payrollPeriods.find(p => p.status === 'completed');
        const monthlyPayroll = latestPeriod ? latestPeriod.netPay : payrollRecords.reduce((s, r) => s + r.netPay, 0);
        return { totalEmployees, activeEmployees, presentToday, onLeave, pendingLeaves, monthlyPayroll };
      },
    }),
    { name: 'sahod-hr' }
  )
);
