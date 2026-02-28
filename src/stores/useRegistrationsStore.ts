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


export interface PendingRegistration {
  id: string;
  // Company Info
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  address: string;
  industryType: string;
  companySize: string;
  // HR Admin Info
  hrAdminName: string;
  hrAdminEmail: string;
  hrAdminPhone: string;
  hrAdminPosition: string;
  hrAdminPassword: string; // Store password for login after approval
  // Subscription
  requestedPlan: 'starter' | 'professional' | 'enterprise';
  startTrial: boolean;
  // Status
  status: 'pending' | 'approved' | 'rejected';
  dateRegistered: string;
  // Approval tracking
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

export interface ApprovedCompany {
  id: string;
  companyName: string;
  companyEmail: string;
  hrAdminName: string;
  hrAdminEmail: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'trial' | 'active' | 'expired' | 'suspended';
  trialStartDate: string;
  trialEndDate: string;
  approvedAt: string;
  employeeCount: number;
}

// Approved user credentials for login
export interface ApprovedUser {
  email: string;
  password: string;
  displayName: string;
  role: 'hr_client';
  companyId: string;
  companyName: string;
  plan: 'starter' | 'professional' | 'enterprise';
  approvedAt: string;
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
  
  // Getters
  getPendingCount: () => number;
  getPendingRegistrations: () => PendingRegistration[];
  getApprovedCompanies: () => ApprovedCompany[];
  getApprovedUser: (email: string) => ApprovedUser | undefined;
  validateUserCredentials: (email: string, password: string) => ApprovedUser | null;
}

// Helper to generate unique IDs
const generateId = () => `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
        
        // Create approved company
        const approvedCompany: ApprovedCompany = {
          id: companyId,
          companyName: registration.companyName,
          companyEmail: registration.companyEmail,
          hrAdminName: registration.hrAdminName,
          hrAdminEmail: registration.hrAdminEmail,
          plan: registration.requestedPlan,
          status: 'trial',
          trialStartDate: now,
          trialEndDate: calculateTrialEndDate(now),
          approvedAt: now,
          employeeCount: 0,
        };
        
        // Create approved user for login
        const approvedUser: ApprovedUser = {
          email: registration.hrAdminEmail.toLowerCase(),
          password: registration.hrAdminPassword,
          displayName: registration.hrAdminName,
          role: 'hr_client',
          companyId: companyId,
          companyName: registration.companyName,
          plan: registration.requestedPlan,
          approvedAt: now,
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
            users.push({
              email: data.email,
              password: data.password,
              displayName: data.displayName,
              role: 'hr_client',
              companyId: data.companyId,
              companyName: data.companyName,
              plan: data.plan,
              approvedAt: data.approvedAt,
            });
          });
          
          set({ approvedUsers: users });
          console.log('✅ Loaded', users.length, 'HR users from Firebase');
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
              industryType: data.industryType,
              companySize: data.companySize,
              hrAdminName: data.hrAdminName,
              hrAdminEmail: data.hrAdminEmail,
              hrAdminPassword: data.hrAdminPassword,
              hrAdminPosition: data.hrAdminPosition,
              hrAdminPhone: data.hrAdminPhone,
              requestedPlan: data.requestedPlan,
              startTrial: data.startTrial || false,
              status: data.status || 'pending',
              dateRegistered: data.dateRegistered,
              approvedAt: data.approvedAt,
              approvedBy: data.approvedBy,
              rejectedAt: data.rejectedAt,
              rejectedBy: data.rejectedBy,
              rejectionReason: data.rejectionReason,
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
              hrAdminName: data.hrAdminName,
              hrAdminEmail: data.hrAdminEmail,
              plan: data.plan,
              status: data.status,
              trialStartDate: data.trialStartDate,
              trialEndDate: data.trialEndDate,
              approvedAt: data.approvedAt,
              employeeCount: data.employeeCount || 0,
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
      
      validateUserCredentials: (email: string, password: string) => {
        const user = get().approvedUsers.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        return user || null;
      },
    }),
    {
      name: 'sahod-registrations',
    }
  )
);
