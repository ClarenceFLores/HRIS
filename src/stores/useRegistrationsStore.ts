/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 * 
 * Store for managing company registrations
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase/config';
import { PasswordUtils } from '../lib/crypto';


export interface PendingRegistration {
  id: string;
  // Company Info
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  website?: string;
  industryType: string;
  companySize: string;
  foundedYear?: number;
  description?: string;
  
  // Business Details
  businessRegistrationNumber?: string;
  taxId?: string;
  businessType: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship' | 'non_profit' | 'other';
  
  // HR Admin Info
  hrAdminName: string;
  hrAdminEmail: string;
  hrAdminPhone: string;
  hrAdminPosition: string;
  hrAdminPassword: string; // Store password for login after approval
  
  // Additional Contact Info
  secondaryContact?: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
  
  // Subscription
  requestedPlan: 'starter' | 'professional' | 'enterprise';
  startTrial: boolean;
  expectedEmployeeCount: number;
  
  // Features & Requirements
  requiredFeatures: string[];
  integrationsNeeded?: string[];
  currentHRSystem?: string;
  migrationRequired?: boolean;
  
  // Status
  status: 'pending' | 'approved' | 'rejected';
  dateRegistered: string;
  
  // Approval tracking
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  
  // Additional metadata
  sourceChannel?: 'website' | 'referral' | 'marketing' | 'direct';
  referralSource?: string;
  notes?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ApprovedCompany {
  id: string;
  
  // Basic Company Information
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  website?: string;
  industryType: string;
  companySize: string;
  foundedYear?: number;
  description?: string;
  
  // Business Details
  businessRegistrationNumber?: string;
  taxId?: string;
  businessType: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship' | 'non_profit' | 'other';
  
  // HR Admin Information
  hrAdminName: string;
  hrAdminEmail: string;
  hrAdminPhone: string;
  hrAdminPosition: string;
  
  // Secondary Contact
  secondaryContact?: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
  
  // Subscription & Plan Details
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'trial' | 'active' | 'expired' | 'suspended' | 'cancelled';
  trialStartDate: string;
  trialEndDate: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  billingCycle?: 'monthly' | 'yearly';
  
  // Usage & Metrics
  employeeCount: number;
  maxEmployees: number;
  activeUsers: number;
  storageUsed?: number; // in MB
  lastLoginDate?: string;
  
  // Features & Configuration
  enabledFeatures: string[];
  integrations: string[];
  customSettings?: Record<string, any>;
  
  // Compliance & Security
  dataRetentionPolicy?: number; // days
  twoFactorRequired?: boolean;
  ssoEnabled?: boolean;
  
  // Approval & Audit Trail
  approvedAt: string;
  approvedBy: string;
  createdAt?: string;
  updatedAt?: string;
  lastModifiedBy?: string;
  
  // Business Metrics
  monthlyRevenue?: number;
  currency?: string;
  paymentMethod?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  
  // Additional metadata
  notes?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  accountManager?: string;
}

// Approved user credentials for login
export interface ApprovedUser {
  email: string;
  password: string;
  displayName: string;
  role: 'hr_client';
  
  // Company Association
  companyId: string;
  companyName: string;
  
  // User Profile
  position: string;
  phone: string;
  
  // Subscription Info
  plan: 'starter' | 'professional' | 'enterprise';
  permissions: string[];
  
  // Access Control
  isActive: boolean;
  lastLoginDate?: string;
  twoFactorEnabled: boolean;
  
  // Audit Trail
  approvedAt: string;
  approvedBy: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Additional metadata
  timezone?: string;
  language?: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

interface RegistrationsState {
  pendingRegistrations: PendingRegistration[];
  approvedCompanies: ApprovedCompany[];
  approvedUsers: ApprovedUser[];
  
  // Actions
  addRegistration: (registration: Omit<PendingRegistration, 'id' | 'status' | 'dateRegistered'>) => Promise<void>;
  approveRegistration: (id: string, approvedBy: string) => Promise<void>;
  rejectRegistration: (id: string, rejectedBy: string, reason: string) => void;
  removeRegistration: (id: string) => void;
  loadHrUsers: () => Promise<void>;
  loadFromFirestore: () => Promise<void>;
  testFirestoreAccess: () => Promise<boolean>;
  migratePasswordHashes: () => Promise<void>;
  createTestHRUser: () => Promise<{ email: string; password: string }>;
  testRegistrationApprovalProcess: () => Promise<{
    registrationCreated: boolean;
    companyCreated: boolean;
    userCreated: boolean;
    passwordHashed: boolean;
    loginSuccessful: boolean;
    hrUserCredentials: { email: string; password: string };
  }>;
  
  // Getters
  getPendingCount: () => number;
  getPendingRegistrations: () => PendingRegistration[];
  getApprovedCompanies: () => ApprovedCompany[];
  getApprovedUser: (email: string) => ApprovedUser | undefined;
  validateUserCredentials: (email: string, password: string) => Promise<ApprovedUser | null>;
}

// Helper to generate unique IDs
const generateId = () => `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper functions for plan-based configuration
const getMaxEmployeesByPlan = (plan: 'starter' | 'professional' | 'enterprise'): number => {
  switch (plan) {
    case 'starter': return 25;
    case 'professional': return 100;
    case 'enterprise': return 1000;
    default: return 25;
  }
};

const getFeaturesByPlan = (plan: 'starter' | 'professional' | 'enterprise'): string[] => {
  const baseFeatures = ['employee_management', 'attendance_tracking', 'basic_reports'];
  
  switch (plan) {
    case 'starter':
      return baseFeatures;
    case 'professional':
      return [
        ...baseFeatures,
        'payroll_management',
        'leave_management',
        'advanced_reports',
        'document_management'
      ];
    case 'enterprise':
      return [
        ...baseFeatures,
        'payroll_management',
        'leave_management',
        'advanced_reports',
        'document_management',
        'api_access',
        'sso_integration',
        'custom_fields',
        'audit_logs',
        'white_labeling'
      ];
    default:
      return baseFeatures;
  }
};

const getPermissionsByPlan = (plan: 'starter' | 'professional' | 'enterprise'): string[] => {
  const basePermissions = [
    'view_employees',
    'manage_employees',
    'view_attendance',
    'manage_attendance',
    'view_basic_reports'
  ];
  
  switch (plan) {
    case 'starter':
      return basePermissions;
    case 'professional':
      return [
        ...basePermissions,
        'manage_payroll',
        'manage_leaves',
        'view_advanced_reports',
        'manage_documents'
      ];
    case 'enterprise':
      return [
        ...basePermissions,
        'manage_payroll',
        'manage_leaves',
        'view_advanced_reports',
        'manage_documents',
        'api_access',
        'system_configuration',
        'user_management',
        'audit_access'
      ];
    default:
      return basePermissions;
  }
};

// Calculate trial end date (30 days from approval)
const calculateTrialEndDate = (startDate: string): string => {
  const start = new Date(startDate);
  start.setDate(start.getDate() + 30);
  return start.toISOString().split('T')[0];
};

export const useRegistrationsStore = create<RegistrationsState>()(
  persist(
    (set, get) => ({
      pendingRegistrations: [],
      approvedCompanies: [],
      approvedUsers: [],
      
      addRegistration: async (registration) => {
        const newRegistration: PendingRegistration = {
          ...registration,
          id: generateId(),
          status: 'pending',
          dateRegistered: new Date().toISOString().split('T')[0],
        };
        
        try {
          // Save to Firestore
          await setDoc(doc(db, 'pendingRegistrations', newRegistration.id), {
            ...newRegistration,
            createdAt: new Date(),
          });
          console.log('✅ Registration saved to Firebase:', newRegistration.companyName);
        } catch (error) {
          console.error('❌ Failed to save registration to Firebase:', error);
        }
        
        // Save to localStorage
        set((state) => ({
          pendingRegistrations: [newRegistration, ...state.pendingRegistrations],
        }));
      },
      
      approveRegistration: async (id, approvedBy) => {
        const registration = get().pendingRegistrations.find(r => r.id === id);
        if (!registration) return;
        
        const now = new Date().toISOString().split('T')[0];
        const companyId = `COMP-${Date.now()}`;
        
        // Create approved company with all registration data
        const approvedCompany: ApprovedCompany = {
          id: companyId,
          // Basic company info from registration
          companyName: registration.companyName,
          companyEmail: registration.companyEmail,
          companyPhone: registration.companyPhone,
          address: registration.address,
          city: registration.city || '',
          state: registration.state || '',
          zipCode: registration.zipCode || '',
          country: registration.country || '',
          website: registration.website,
          industryType: registration.industryType,
          companySize: registration.companySize,
          foundedYear: registration.foundedYear,
          description: registration.description,
          
          // Business details
          businessRegistrationNumber: registration.businessRegistrationNumber,
          taxId: registration.taxId,
          businessType: registration.businessType,
          
          // HR Admin info
          hrAdminName: registration.hrAdminName,
          hrAdminEmail: registration.hrAdminEmail,
          hrAdminPhone: registration.hrAdminPhone,
          hrAdminPosition: registration.hrAdminPosition,
          secondaryContact: registration.secondaryContact,
          
          // Subscription details
          plan: registration.requestedPlan,
          status: 'trial',
          trialStartDate: now,
          trialEndDate: calculateTrialEndDate(now),
          
          // Usage metrics
          employeeCount: 0,
          maxEmployees: getMaxEmployeesByPlan(registration.requestedPlan),
          activeUsers: 1,
          
          // Features based on plan
          enabledFeatures: getFeaturesByPlan(registration.requestedPlan),
          integrations: registration.integrationsNeeded || [],
          
          // Security settings
          twoFactorRequired: false,
          ssoEnabled: false,
          
          // Audit info
          approvedAt: now,
          approvedBy,
          createdAt: now,
          updatedAt: now,
          lastModifiedBy: approvedBy,
          
          // Additional metadata
          notes: registration.notes,
          tags: [],
          priority: 'medium',
        };
        
        // Hash the password before storing
        const hashedPassword = await PasswordUtils.hashPassword(registration.hrAdminPassword);
        
        // Create approved user for login with enhanced profile
        const approvedUser: ApprovedUser = {
          email: registration.hrAdminEmail.toLowerCase(),
          password: hashedPassword,
          displayName: registration.hrAdminName,
          role: 'hr_client',
          
          // Company association
          companyId: companyId,
          companyName: registration.companyName,
          
          // User profile
          position: registration.hrAdminPosition,
          phone: registration.hrAdminPhone,
          
          // Subscription
          plan: registration.requestedPlan,
          permissions: getPermissionsByPlan(registration.requestedPlan),
          
          // Access control
          isActive: true,
          twoFactorEnabled: false,
          
          // Audit trail
          approvedAt: now,
          approvedBy,
          createdAt: now,
          updatedAt: now,
          
          // Default preferences
          timezone: 'UTC',
          language: 'en',
          emailNotifications: true,
          smsNotifications: false,
        };
        
        try {
          // Save to Firebase Firestore
          await setDoc(doc(db, 'companies', companyId), {
            ...approvedCompany,
            ...registration, // Include all registration details
            approvedBy,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          
          await setDoc(doc(db, 'hrUsers', registration.hrAdminEmail.toLowerCase()), {
            ...approvedUser,
            hrAdminPosition: registration.hrAdminPosition,
            hrAdminPhone: registration.hrAdminPhone,
            approvedBy,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          
          // Update pending registration status in Firestore
          await updateDoc(doc(db, 'pendingRegistrations', id), {
            status: 'approved',
            approvedAt: now,
            approvedBy,
            updatedAt: new Date(),
          });
          
          console.log('✅ HR account approved and saved to Firebase:', registration.hrAdminEmail);
          
          // Delete from pending after successful approval
          setTimeout(async () => {
            try {
              await deleteDoc(doc(db, 'pendingRegistrations', id));
              console.log('✅ Removed from pending registrations in Firebase');
            } catch (error) {
              console.error('❌ Failed to remove from pending:', error);
            }
          }, 2000);
        } catch (error) {
          console.error('❌ Failed to approve registration in Firebase:', error);
        }
        
        // Update localStorage
        set((state) => ({
          pendingRegistrations: state.pendingRegistrations.map(r => 
            r.id === id 
              ? { ...r, status: 'approved' as const, approvedAt: now, approvedBy }
              : r
          ),
          approvedCompanies: [approvedCompany, ...state.approvedCompanies],
          approvedUsers: [approvedUser, ...state.approvedUsers],
        }));
        
        // Remove from pending localStorage after a delay
        setTimeout(() => {
          set((state) => ({
            pendingRegistrations: state.pendingRegistrations.filter(r => r.id !== id),
          }));
        }, 2000);
      },
      
      rejectRegistration: (id, rejectedBy, reason) => {
        const now = new Date().toISOString().split('T')[0];
        
        set((state) => ({
          pendingRegistrations: state.pendingRegistrations.map(r => 
            r.id === id 
              ? { ...r, status: 'rejected' as const, rejectedAt: now, rejectedBy, rejectionReason: reason }
              : r
          ),
        }));
        
        // Remove from pending after a delay
        setTimeout(() => {
          set((state) => ({
            pendingRegistrations: state.pendingRegistrations.filter(r => r.id !== id),
          }));
        }, 1000);
      },
      
      removeRegistration: (id) => {
        set((state) => ({
          pendingRegistrations: state.pendingRegistrations.filter(r => r.id !== id),
        }));
      },
      
      // Load only hrUsers (publicly readable) – safe for any user / unauthenticated
      loadHrUsers: async () => {
        try {
          console.log('🔍 Loading HR users from Firestore...');
          console.log('🔍 Firebase Project:', db.app.options.projectId);
          console.log('🔑 Current auth user:', auth.currentUser?.email || 'Not authenticated');
          
          const usersSnapshot = await getDocs(collection(db, 'hrUsers'));
          console.log('✅ hrUsers collection accessed, doc count:', usersSnapshot.size);
          
          if (usersSnapshot.empty) {
            console.log('⚠️ hrUsers collection is empty - no users registered yet');
            set({ approvedUsers: [] });
            return;
          }
          
          const users: ApprovedUser[] = [];
          usersSnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            console.log('📄 Processing HR user document:', docSnapshot.id, data);
            users.push({
              email: data.email,
              password: data.password,
              displayName: data.displayName,
              role: 'hr_client',
              companyId: data.companyId,
              companyName: data.companyName,
              plan: data.plan,
              approvedAt: data.approvedAt,
              
              // Default values for new fields
              position: data.position || data.hrAdminPosition || 'HR Manager',
              phone: data.phone || data.hrAdminPhone || '',
              permissions: data.permissions || getPermissionsByPlan(data.plan || 'starter'),
              isActive: data.isActive ?? true,
              twoFactorEnabled: data.twoFactorEnabled ?? false,
              approvedBy: data.approvedBy || 'system',
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
              timezone: data.timezone || 'UTC',
              language: data.language || 'en',
              emailNotifications: data.emailNotifications ?? true,
              smsNotifications: data.smsNotifications ?? false,
            });
          });
          
          set({ approvedUsers: users });
          console.log('✅ Loaded', users.length, 'HR users from Firebase:', users.map(u => u.email));
        } catch (error) {
          console.error('❌ Failed to load HR users from Firebase:', error);
          
          // Set empty array as fallback so login can still work with localStorage
          set({ approvedUsers: [] });
          
          // If this is a permission error, provide helpful debugging info
          if ((error as any).code === 'permission-denied') {
            console.error('🚫 PERMISSION DENIED');
            console.error('📋 Troubleshooting steps:');
            console.error('  1. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)');
            console.error('  2. Clear Firebase cache: Run clearFirebaseCache() in browser console');
            console.error('  3. Wait 1-2 minutes for Firebase rules to propagate globally');
            console.error('  4. Check rules at: https://console.firebase.google.com/project/hris-2ea69/firestore/rules');
            console.error('');
            console.error('🔍 Current state:');
            console.error('  - Project ID:', db.app.options.projectId);
            console.error('  - Auth user:', auth.currentUser?.email || 'Not authenticated');
            console.error('  - Expected: Rules allow unauthenticated read access');
          }
        }
      },

      // Test Firestore access - useful for debugging permission issues
      testFirestoreAccess: async () => {
        console.log('🧪 Testing Firestore access...');
        console.log('📡 Project:', db.app.options.projectId);
        console.log('🔐 Auth:', auth.currentUser?.email || 'Not authenticated');
        
        try {
          // Test read access to hrUsers collection
          const snapshot = await getDocs(collection(db, 'hrUsers'));
          console.log('✅ READ test passed - hrUsers docs:', snapshot.size);
          
          // Test write access with a test document
          await setDoc(doc(db, 'hrUsers', '_test_document'), {
            email: 'test@firestore.test',
            displayName: 'Firestore Test Document',
            role: 'hr_client',
            companyId: 'TEST-001',
            companyName: 'Test Company',
            plan: 'starter',
            approvedAt: new Date().toISOString(),
            isTestDocument: true,
            createdAt: new Date(),
          });
          console.log('✅ WRITE test passed - test document created');
          
          console.log('✅ All Firestore tests passed!');
          return true;
        } catch (error) {
          console.error('❌ Firestore test failed:', error);
          console.error('💡 Run clearFirebaseCache() in console and hard refresh browser');
          return false;
        }
      },

      // Full load (pendingRegistrations + companies + hrUsers) – system owner only
      loadFromFirestore: async () => {
        const currentUser = auth.currentUser;
        if (!currentUser || currentUser.email !== 'clarenceflores082001@gmail.com') {
          console.warn('⚠️ loadFromFirestore: Requires system owner authentication');
          return;
        }
        
        try {
          console.log('🔍 Loading all Firestore data for system owner...');
          
          // Load pending registrations
          const pendingSnapshot = await getDocs(collection(db, 'pendingRegistrations'));
          const pendingRegs: PendingRegistration[] = pendingSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              companyName: data.companyName,
              companyEmail: data.companyEmail,
              companyPhone: data.companyPhone,
              address: data.address,
              city: data.city || '',
              state: data.state || '',
              zipCode: data.zipCode || '',
              country: data.country || '',
              website: data.website,
              industryType: data.industryType,
              companySize: data.companySize,
              foundedYear: data.foundedYear,
              description: data.description,
              businessRegistrationNumber: data.businessRegistrationNumber,
              taxId: data.taxId,
              businessType: data.businessType || 'corporation',
              hrAdminName: data.hrAdminName,
              hrAdminEmail: data.hrAdminEmail,
              hrAdminPassword: data.hrAdminPassword,
              hrAdminPosition: data.hrAdminPosition,
              hrAdminPhone: data.hrAdminPhone,
              secondaryContact: data.secondaryContact,
              requestedPlan: data.requestedPlan,
              startTrial: data.startTrial || false,
              expectedEmployeeCount: data.expectedEmployeeCount || 10,
              requiredFeatures: data.requiredFeatures || [],
              integrationsNeeded: data.integrationsNeeded,
              currentHRSystem: data.currentHRSystem,
              migrationRequired: data.migrationRequired,
              status: data.status || 'pending',
              dateRegistered: data.dateRegistered,
              approvedAt: data.approvedAt,
              approvedBy: data.approvedBy,
              rejectedAt: data.rejectedAt,
              rejectedBy: data.rejectedBy,
              rejectionReason: data.rejectionReason,
              sourceChannel: data.sourceChannel,
              referralSource: data.referralSource,
              notes: data.notes,
              ipAddress: data.ipAddress,
              userAgent: data.userAgent,
            };
          });
          
          // Load approved companies
          const companiesSnapshot = await getDocs(collection(db, 'companies'));
          const companies: ApprovedCompany[] = companiesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              companyName: data.companyName,
              companyEmail: data.companyEmail,
              companyPhone: data.companyPhone || '',
              address: data.address || '',
              city: data.city || '',
              state: data.state || '',
              zipCode: data.zipCode || '',
              country: data.country || '',
              website: data.website,
              industryType: data.industryType || '',
              companySize: data.companySize || '',
              foundedYear: data.foundedYear,
              description: data.description,
              businessRegistrationNumber: data.businessRegistrationNumber,
              taxId: data.taxId,
              businessType: data.businessType || 'corporation',
              hrAdminName: data.hrAdminName,
              hrAdminEmail: data.hrAdminEmail,
              hrAdminPhone: data.hrAdminPhone || '',
              hrAdminPosition: data.hrAdminPosition || '',
              secondaryContact: data.secondaryContact,
              plan: data.plan,
              status: data.status,
              trialStartDate: data.trialStartDate,
              trialEndDate: data.trialEndDate,
              subscriptionStartDate: data.subscriptionStartDate,
              subscriptionEndDate: data.subscriptionEndDate,
              billingCycle: data.billingCycle,
              employeeCount: data.employeeCount || 0,
              maxEmployees: data.maxEmployees || getMaxEmployeesByPlan(data.plan || 'starter'),
              activeUsers: data.activeUsers || 1,
              storageUsed: data.storageUsed,
              lastLoginDate: data.lastLoginDate,
              enabledFeatures: data.enabledFeatures || getFeaturesByPlan(data.plan || 'starter'),
              integrations: data.integrations || [],
              customSettings: data.customSettings,
              dataRetentionPolicy: data.dataRetentionPolicy,
              twoFactorRequired: data.twoFactorRequired ?? false,
              ssoEnabled: data.ssoEnabled ?? false,
              approvedAt: data.approvedAt,
              approvedBy: data.approvedBy || 'system',
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              lastModifiedBy: data.lastModifiedBy,
              monthlyRevenue: data.monthlyRevenue,
              currency: data.currency,
              paymentMethod: data.paymentMethod,
              billingAddress: data.billingAddress,
              notes: data.notes,
              tags: data.tags || [],
              priority: data.priority || 'medium',
              accountManager: data.accountManager,
            };
          });
          
          // Load approved HR users
          const usersSnapshot = await getDocs(collection(db, 'hrUsers'));
          const users: ApprovedUser[] = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              email: data.email,
              password: data.password,
              displayName: data.displayName,
              role: 'hr_client',
              companyId: data.companyId,
              companyName: data.companyName,
              plan: data.plan,
              approvedAt: data.approvedAt,
              
              // Default values for new fields
              position: data.position || data.hrAdminPosition || 'HR Manager',
              phone: data.phone || data.hrAdminPhone || '',
              permissions: data.permissions || getPermissionsByPlan(data.plan || 'starter'),
              isActive: data.isActive ?? true,
              twoFactorEnabled: data.twoFactorEnabled ?? false,
              approvedBy: data.approvedBy || 'system',
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
              timezone: data.timezone || 'UTC',
              language: data.language || 'en',
              emailNotifications: data.emailNotifications ?? true,
              smsNotifications: data.smsNotifications ?? false,
            };
          });
          
          // Update store
          set({
            pendingRegistrations: pendingRegs,
            approvedCompanies: companies,
            approvedUsers: users,
          });
          
          console.log('✅ Loaded from Firebase:', {
            pending: pendingRegs.length,
            companies: companies.length,
            users: users.length,
          });
        } catch (error) {
          console.error('❌ Failed to load from Firebase:', error);
        }
      },
      
      getPendingCount: () => {
        return get().pendingRegistrations.filter(r => r.status === 'pending').length;
      },
      
      getPendingRegistrations: () => {
        return get().pendingRegistrations.filter(r => r.status === 'pending');
      },
      
      getApprovedCompanies: () => {
        return get().approvedCompanies;
      },
      
      getApprovedUser: (email: string) => {
        return get().approvedUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      },
      
      validateUserCredentials: async (email: string, password: string): Promise<ApprovedUser | null> => {
        const user = get().approvedUsers.find(
          u => u.email.toLowerCase() === email.toLowerCase()
        );
        
        if (!user) {
          return null;
        }
        
        // Check if password is hashed or plain text (for migration)
        if (PasswordUtils.isHashed(user.password)) {
          const isValid = await PasswordUtils.verifyPassword(password, user.password);
          return isValid ? user : null;
        } else {
          // Legacy plain text password comparison
          console.warn('⚠️ Found plain text password for user:', email, '- Consider migrating');
          if (user.password === password) {
            // Optionally auto-migrate the password
            try {
              const hashedPassword = await PasswordUtils.hashPassword(password);
              // Update the user password in memory
              const updatedUsers = get().approvedUsers.map(u => 
                u.email === user.email ? { ...u, password: hashedPassword } : u
              );
              set({ approvedUsers: updatedUsers });
              
              // Update in Firestore
              await setDoc(doc(db, 'hrUsers', user.email.toLowerCase()), {
                ...user,
                password: hashedPassword,
                updatedAt: new Date(),
              }, { merge: true });
              
              console.log('✅ Auto-migrated password hash for:', email);
            } catch (error) {
              console.error('❌ Failed to auto-migrate password for:', email, error);
            }
            return user;
          }
        }
        
        return null;
      },
      
      migratePasswordHashes: async () => {
        const { approvedUsers } = get();
        const usersToMigrate = approvedUsers.filter(user => !PasswordUtils.isHashed(user.password));
        
        if (usersToMigrate.length === 0) {
          console.log('✅ All passwords are already hashed');
          return;
        }
        
        console.log(`🔄 Migrating ${usersToMigrate.length} plain text passwords...`);
        
        const updatedUsers = [...approvedUsers];
        
        for (const user of usersToMigrate) {
          try {
            const hashedPassword = await PasswordUtils.hashPassword(user.password);
            const userIndex = updatedUsers.findIndex(u => u.email === user.email);
            
            if (userIndex !== -1) {
              updatedUsers[userIndex] = { ...user, password: hashedPassword };
              
              // Update in Firestore
              await setDoc(doc(db, 'hrUsers', user.email.toLowerCase()), {
                ...user,
                password: hashedPassword,
                updatedAt: new Date(),
              }, { merge: true });
              
              console.log('✅ Migrated password for:', user.email);
            }
          } catch (error) {
            console.error('❌ Failed to migrate password for:', user.email, error);
          }
        }
        
        set({ approvedUsers: updatedUsers });
        console.log('🔄 Password migration completed');
      },
      
      // Test function to create a sample HR user for testing
      createTestHRUser: async () => {
        try {
          console.log('🧪 Creating test HR user...');
          
          const testPassword = 'TestPass123!';
          const hashedPassword = await PasswordUtils.hashPassword(testPassword);
          const now = new Date().toISOString().split('T')[0];
          
          const testUser: ApprovedUser = {
            email: 'testhr@company.com',
            password: hashedPassword,
            displayName: 'Test HR Admin',
            role: 'hr_client',
            companyId: 'TEST-COMP-001',
            companyName: 'Test Company Inc',
            position: 'HR Manager',
            phone: '+63 912 345 6789',
            plan: 'professional',
            permissions: getPermissionsByPlan('professional'),
            isActive: true,
            twoFactorEnabled: false,
            approvedAt: now,
            approvedBy: 'system',
            createdAt: now,
            updatedAt: now,
            timezone: 'UTC',
            language: 'en',
            emailNotifications: true,
            smsNotifications: false,
          };
          
          // Save to Firestore
          await setDoc(doc(db, 'hrUsers', testUser.email), testUser);
          
          // Update local state
          const { approvedUsers } = get();
          const updatedUsers = [testUser, ...approvedUsers.filter(u => u.email !== testUser.email)];
          set({ approvedUsers: updatedUsers });
          
          console.log('✅ Test HR user created successfully!');
          console.log('📧 Email:', testUser.email);
          console.log('🔑 Password:', testPassword);
          console.log('🏢 Company:', testUser.companyName);
          
          return { email: testUser.email, password: testPassword };
        } catch (error) {
          console.error('❌ Failed to create test HR user:', error);
          throw error;
        }
      },
      
      // Test complete registration approval workflow
      testRegistrationApprovalProcess: async () => {
        try {
          console.log('🚀 Testing complete registration approval process...');
          
          // Step 1: Create a test pending registration
          const testRegistration = {
            companyName: 'Test Approval Company',
            companyEmail: 'testapproval@company.com',
            companyPhone: '+63 912 111 2222',
            address: '123 Test Street, Test City',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345',
            country: 'Philippines',
            industryType: 'Technology & IT',
            companySize: '11-50',
            hrAdminName: 'Test HR Admin',
            hrAdminEmail: 'testhr@testapproval.com',
            hrAdminPhone: '+63 912 333 4444',
            hrAdminPosition: 'HR Manager',
            hrAdminPassword: 'TestPassword123!',
            requestedPlan: 'professional' as const,
            startTrial: true,
            businessType: 'corporation' as const,
          };
          
          console.log('👤 Step 1: Adding test registration...');
          await get().addRegistration(testRegistration);
          
          // Get the created registration ID
          const { pendingRegistrations } = get();
          const createdRegistration = pendingRegistrations.find(r => 
            r.companyEmail === testRegistration.companyEmail
          );
          
          if (!createdRegistration) {
            throw new Error('Test registration was not created');
          }
          
          console.log('✅ Step 1 Complete: Registration created with ID:', createdRegistration.id);
          
          // Step 2: Approve the registration
          console.log('✅ Step 2: Approving registration...');
          await get().approveRegistration(createdRegistration.id, 'Test System Owner');
          
          console.log('✅ Step 2 Complete: Registration approved');
          
          // Step 3: Verify data was created correctly
          console.log('🔍 Step 3: Verifying approval results...');
          
          const { approvedCompanies, approvedUsers } = get();
          
          // Check if company was created
          const createdCompany = approvedCompanies.find(c => 
            c.companyEmail === testRegistration.companyEmail
          );
          
          // Check if HR user was created
          const createdUser = approvedUsers.find(u => 
            u.email === testRegistration.hrAdminEmail
          );
          
          console.log('✅ Step 3 Results:');
          console.log('  📊 Company created:', !!createdCompany);
          console.log('  👤 HR user created:', !!createdUser);
          console.log('  🔐 Password hashed:', createdUser ? PasswordUtils.isHashed(createdUser.password) : false);
          console.log('  🏢 Company ID:', createdCompany?.id);
          console.log('  📧 HR Email:', createdUser?.email);
          
          // Step 4: Test HR user login
          console.log('🔐 Step 4: Testing HR user login...');
          const loginResult = await get().validateUserCredentials(
            testRegistration.hrAdminEmail,
            testRegistration.hrAdminPassword
          );
          
          console.log('✅ Step 4 Complete: Login test result:', !!loginResult);
          
          if (loginResult) {
            console.log('  📧 Login email:', loginResult.email);
            console.log('  👤 Display name:', loginResult.displayName);
            console.log('  🏢 Company:', loginResult.companyName);
            console.log('  📋 Plan:', loginResult.plan);
          }
          
          const testResults = {
            registrationCreated: !!createdRegistration,
            companyCreated: !!createdCompany,
            userCreated: !!createdUser,
            passwordHashed: createdUser ? PasswordUtils.isHashed(createdUser.password) : false,
            loginSuccessful: !!loginResult,
            hrUserCredentials: {
              email: testRegistration.hrAdminEmail,
              password: testRegistration.hrAdminPassword
            }
          };
          
          console.log('🎉 REGISTRATION APPROVAL TEST COMPLETED!');
          console.log('📋 Results Summary:', testResults);
          
          return testResults;
          
        } catch (error) {
          console.error('❌ Registration approval test failed:', error);
          throw error;
        }
      },
    }),
    {
      name: 'sahod-registrations',
    }
  )
);
