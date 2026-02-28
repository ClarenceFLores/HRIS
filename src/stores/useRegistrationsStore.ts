/**
 * Store for managing company registrations
 * 
 * This store manages pending HR account registrations that need
 * approval from the system owner (developer).
 */

/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where 
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
  testFirestoreAccess: () => Promise<void>;
  
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
          console.log('🔍 Current auth state:', auth.currentUser?.email || 'Not authenticated');
          console.log('🔍 Firebase config:', { projectId: db.app.options.projectId });
          console.log('🔍 Attempting to read hrUsers collection...');
          
          const usersSnapshot = await getDocs(collection(db, 'hrUsers'));
          console.log('🔍 hrUsers collection snapshot received, doc count:', usersSnapshot.size);
          
          if (usersSnapshot.empty) {
            console.log('⚠️ hrUsers collection is empty');
            set({ approvedUsers: [] });
            return;
          }
          
          const users: ApprovedUser[] = [];
          usersSnapshot.forEach((doc) => {
            console.log(`📄 Processing hrUser doc: ${doc.id}`);
            const data = doc.data();
            console.log(`📄 Data:`, { 
              email: data.email, 
              companyId: data.companyId, 
              displayName: data.displayName,
              hasPassword: !!data.password 
            });
            
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
          console.log('✅ Loaded HR users from Firebase:', users.map(u => ({ email: u.email, companyId: u.companyId })));
        } catch (error) {
          console.error('❌ Failed to load HR users from Firebase:', error);
          console.error('🔍 Error details:', {
            name: (error as Error).name,
            message: (error as Error).message,
            code: (error as any).code,
            stack: (error as Error).stack?.split('\n').slice(0, 5).join('\n')
          });
          
          // Set empty array as fallback so login can still work with localStorage
          set({ approvedUsers: [] });
          
          // If this is a permission error, log additional debugging info
          if ((error as any).code === 'permission-denied') {
            console.error('🚫 Permission denied - possible causes:');
            console.error('  1. Firestore rules not deployed correctly');
            console.error('  2. Firebase project ID mismatch');
            console.error('  3. Network connectivity issues');
            console.error('  4. Firebase SDK not configured properly');
            
            console.log('🔍 Current Firebase config check:');
            console.log('  - Auth current user:', auth.currentUser?.email || 'None');
            console.log('  - DB project ID:', db.app.options.projectId);
            console.log('  - Expected project ID: hris-2ea69');
          }
        }
      },

      // Test Firestore access - useful for debugging permission issues
      testFirestoreAccess: async () => {
        try {
          console.log('🧪 Testing basic Firestore access...');
          
          // Test 1: Try to create a test document
          console.log('📋 Test 1: Creating test document in hrUsers collection...');
          try {
            const testDoc = {
              email: 'test@example.com',
              password: 'testpass',
              displayName: 'Test User',
              role: 'hr_client',
              companyId: 'TEST-COMP-001',
              companyName: 'Test Company',
              plan: 'starter',
              approvedAt: new Date().toISOString(),
              createdAt: new Date(),
              isTestDocument: true
            };
            
            await setDoc(doc(db, 'hrUsers', 'test@example.com'), testDoc);
            console.log('✅ Test document created successfully');
          } catch (createError) {
            console.error('❌ Failed to create test document:', createError);
          }
          
          // Test 2: Try to read hrUsers collection
          console.log('📋 Test 2: hrUsers collection access');
          const testSnapshot = await getDocs(collection(db, 'hrUsers'));
          console.log('✅ hrUsers read successful, doc count:', testSnapshot.size);
          
          if (testSnapshot.size > 0) {
            console.log('📄 Found documents:');
            testSnapshot.forEach((docSnapshot) => {
              const data = docSnapshot.data();
              console.log(`  - ${docSnapshot.id}: ${data.displayName || 'No name'} (${data.email || 'No email'})`);
            });
          }
          
          // Test 3: Try to read pendingRegistrations collection  
          console.log('📋 Test 3: pendingRegistrations collection access');
          const pendingSnapshot = await getDocs(collection(db, 'pendingRegistrations'));
          console.log('✅ pendingRegistrations read successful, doc count:', pendingSnapshot.size);
          
          console.log('✅ All Firestore access tests passed');
        } catch (error) {
          console.error('❌ Firestore access test failed:', error);
          console.error('🔍 This indicates permission or configuration issues');
        }
      },

      // Full load (pendingRegistrations + companies + hrUsers) – system owner only
      loadFromFirestore: async () => {
        try {
          // Double-check auth state before making restricted calls
          const currentUser = auth.currentUser;
          if (!currentUser || currentUser.email !== 'clarenceflores082001@gmail.com') {
            console.warn('⚠️ loadFromFirestore skipped: not system owner or not authenticated');
            return;
          }
          
          console.log('🔍 Loading Firestore data for system owner...');
          // Load pending registrations
          const pendingSnapshot = await getDocs(collection(db, 'pendingRegistrations'));
          const pendingRegs: PendingRegistration[] = [];
          pendingSnapshot.forEach((doc) => {
            const data = doc.data();
            pendingRegs.push({
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
            });
          });
          
          // Load approved companies
          const companiesSnapshot = await getDocs(collection(db, 'companies'));
          const companies: ApprovedCompany[] = [];
          companiesSnapshot.forEach((doc) => {
            const data = doc.data();
            companies.push({
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
            });
          });
          
          // Load approved HR users
          const usersSnapshot = await getDocs(collection(db, 'hrUsers'));
          const users: ApprovedUser[] = [];
          usersSnapshot.forEach((doc) => {
            const data = doc.data();
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
          
          // Update store with Firebase data
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
