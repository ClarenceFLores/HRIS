/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 *
 * Shared subscription plan store — single source of truth for both the
 * Landing Page and the Developer Subscription management page.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PlanData {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
}

export const DEFAULT_PLAN: PlanData = {
  name: 'SAHOD HRIS',
  description: 'Complete HR solution for Philippine businesses',
  monthlyPrice: 1399,
  yearlyPrice: 13990, // ~2 months free (≈17% off)
  features: [
    'Unlimited employees',
    'Full payroll processing with overtime & night differential',
    'SSS, PhilHealth, Pag-IBIG computation',
    'Employee 201 files & document storage',
    'Attendance & time tracking with tardiness reports',
    'Leave management with approval workflow',
    'Government compliance reports (SSS R-3, RF-1, HDMF)',
    'Multi-branch support',
    'Audit trail & data backup',
    'Priority support',
    'Free 30-day trial — no credit card required',
  ],
};

interface PlanState {
  plan: PlanData;
  setPlan: (plan: PlanData) => void;
  resetPlan: () => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      plan: DEFAULT_PLAN,
      setPlan: (plan) => set({ plan }),
      resetPlan: () => set({ plan: DEFAULT_PLAN }),
    }),
    { name: 'sahod-plan' }
  )
);
