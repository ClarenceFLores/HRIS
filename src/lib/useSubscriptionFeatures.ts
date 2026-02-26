/**
 * Hook to check subscription-based feature access
 * 
 * This hook provides easy access to check if the current user's subscription
 * includes specific features.
 */

import { useCallback, useMemo } from 'react';
/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useAuthStore } from '@/stores/useAuthStore';
import { 
  SubscriptionPlan, 
  PlanFeatures, 
  SUBSCRIPTION_PLANS,
  hasFeature,
  getEnabledFeatures,
  getPlanById,
} from './subscriptionFeatures';

export interface UseSubscriptionFeaturesReturn {
  // Current subscription info
  currentPlan: SubscriptionPlan | null;
  planName: string;
  employeeLimit: number;
  
  // Feature checks
  canUseFeature: (feature: keyof PlanFeatures) => boolean;
  getFeatureValue: <K extends keyof PlanFeatures>(feature: K) => PlanFeatures[K] | null;
  
  // Quick access to common features
  canAddEmployees: boolean;
  canProcessPayroll: boolean;
  canTrackAttendance: boolean;
  canManageLeaves: boolean;
  canGenerateReports: boolean;
  canUseAdvancedPayroll: boolean;
  canUseMultiBranch: boolean;
  canUseApiAccess: boolean;
  canExportToExcel: boolean;
  
  // Limits
  isAtEmployeeLimit: (currentCount: number) => boolean;
  remainingEmployeeSlots: (currentCount: number) => number;
  
  // Plan comparison
  enabledFeatures: string[];
  suggestUpgrade: () => SubscriptionPlan | null;
}

/**
 * Mock function to get company subscription - replace with actual API call
 */
function getCompanySubscription(_companyId: string | undefined): SubscriptionPlan {
  // TODO: Replace with actual API call to get company subscription
  // For now, default to professional for demo
  return 'professional';
}

export function useSubscriptionFeatures(): UseSubscriptionFeaturesReturn {
  const { user } = useAuthStore();
  
  // Get current subscription plan
  const currentPlan = useMemo(() => {
    if (!user?.companyId && user?.role !== 'system_owner') {
      // For demo purposes, return professional
      return 'professional';
    }
    return getCompanySubscription(user?.companyId);
  }, [user?.companyId, user?.role]);
  
  const planInfo = useMemo(() => {
    if (!currentPlan) return null;
    return getPlanById(currentPlan);
  }, [currentPlan]);
  
  // Check if a specific feature is available
  const canUseFeature = useCallback((feature: keyof PlanFeatures): boolean => {
    if (!currentPlan) return false;
    return hasFeature(currentPlan, feature);
  }, [currentPlan]);
  
  // Get specific feature value
  const getFeatureValue = useCallback(<K extends keyof PlanFeatures>(feature: K): PlanFeatures[K] | null => {
    if (!planInfo) return null;
    return planInfo.features[feature];
  }, [planInfo]);
  
  // Check employee limit
  const isAtEmployeeLimit = useCallback((currentCount: number): boolean => {
    if (!planInfo) return true;
    if (planInfo.employeeLimit === -1) return false; // Unlimited
    return currentCount >= planInfo.employeeLimit;
  }, [planInfo]);
  
  // Get remaining slots
  const remainingEmployeeSlots = useCallback((currentCount: number): number => {
    if (!planInfo) return 0;
    if (planInfo.employeeLimit === -1) return -1; // Unlimited
    return Math.max(0, planInfo.employeeLimit - currentCount);
  }, [planInfo]);
  
  // Suggest upgrade based on missing features
  const suggestUpgrade = useCallback((): SubscriptionPlan | null => {
    if (!currentPlan) return null;
    
    if (currentPlan === 'starter') return 'professional';
    if (currentPlan === 'professional') return 'enterprise';
    
    return null; // Already on enterprise
  }, [currentPlan]);
  
  // Get enabled features
  const enabledFeatures = useMemo(() => {
    if (!currentPlan) return [];
    return getEnabledFeatures(currentPlan);
  }, [currentPlan]);
  
  return {
    // Current subscription info
    currentPlan,
    planName: planInfo?.name || 'No Plan',
    employeeLimit: planInfo?.employeeLimit || 0,
    
    // Feature checks
    canUseFeature,
    getFeatureValue,
    
    // Quick access to common features
    canAddEmployees: canUseFeature('employeeProfiles'),
    canProcessPayroll: canUseFeature('basicPayroll'),
    canTrackAttendance: canUseFeature('attendanceTracking'),
    canManageLeaves: canUseFeature('leaveManagement'),
    canGenerateReports: canUseFeature('basicReports'),
    canUseAdvancedPayroll: canUseFeature('advancedPayroll'),
    canUseMultiBranch: canUseFeature('multiBranch'),
    canUseApiAccess: canUseFeature('apiAccess'),
    canExportToExcel: canUseFeature('exportToExcel'),
    
    // Limits
    isAtEmployeeLimit,
    remainingEmployeeSlots,
    
    // Plan comparison
    enabledFeatures,
    suggestUpgrade,
  };
}

/**
 * Component to show upgrade prompt when feature is not available
 */
export function useFeatureGate(feature: keyof PlanFeatures) {
  const { canUseFeature, suggestUpgrade, planName } = useSubscriptionFeatures();
  
  const isAvailable = canUseFeature(feature);
  const upgradePlan = suggestUpgrade();
  
  return {
    isAvailable,
    showUpgradePrompt: !isAvailable,
    currentPlan: planName,
    suggestedPlan: upgradePlan ? SUBSCRIPTION_PLANS[upgradePlan].name : null,
  };
}
