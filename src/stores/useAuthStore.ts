/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import type { User, UserRole } from '@/types';
import { useRegistrationsStore } from './useRegistrationsStore';
import { PasswordUtils } from '@/lib/crypto';
import { useHRStore } from './useHRStore';

// Demo mode flag - set to true to bypass Firebase auth
const DEMO_MODE = false;

// System owner credentials - always check these first regardless of DEMO_MODE
const SYSTEM_OWNER_CREDENTIALS: Record<string, { password: string; role: UserRole; displayName: string }> = {
  'clarenceflores082001@gmail.com': {
    password: 'Garfield_1.1',
    role: 'system_owner',
    displayName: 'Clarence Flores',
  },
};

// Demo HR credentials (only used when DEMO_MODE = true)
const DEMO_CREDENTIALS: Record<string, { password: string; role: UserRole; displayName: string }> = {
  // Add demo HR accounts here if needed
};

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initAuthListener: () => () => void;
  
  // Role helpers
  isSystemOwner: () => boolean;
  isHrClient: () => boolean;
  isEmployee: () => boolean;
  hasPermission: (permission: string) => boolean;
}

// System Owner email - full platform access
const SYSTEM_OWNER_EMAIL = 'clarenceflores082001@gmail.com';

// Helper to convert Firebase user to app user
const firebaseUserToAppUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  // Check if this is the system owner account
  const isOwner = firebaseUser.email === SYSTEM_OWNER_EMAIL;
  
  // Try to get additional user data from Firestore
  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: userData.displayName || firebaseUser.displayName || 'User',
        role: isOwner ? 'system_owner' : (userData.role || 'employee'),
        companyId: userData.companyId,
        employeeId: userData.employeeId,
        permissions: userData.permissions || [],
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
      };
    }
  } catch (error) {
    console.warn('Could not fetch user data from Firestore:', error);
  }

  // Default user object if no Firestore data
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || (isOwner ? 'Clarence Flores' : 'User'),
    role: isOwner ? 'system_owner' : 'hr_client',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// Create user object from credentials
const createUserFromCredentials = (email: string, role: UserRole, displayName: string): User => ({
  id: `user-${role}-${Date.now()}`,
  email,
  displayName,
  role,
  employeeId: role === 'employee' ? 'EMP-001' : undefined,
  companyId: role !== 'system_owner' ? undefined : undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      firebaseUser: null,
      isLoading: false, // Start as false to prevent infinite loading
      isAuthenticated: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),

      login: async (email: string, password: string, rememberMe = true) => {
        set({ isLoading: true, error: null });
        
        console.log('🚀 Starting login process...');
        console.log('📧 Email:', email);
        console.log('🔒 Password length:', password.length);
        console.log('📝 Remember me:', rememberMe);
        
        // Always check local credentials first (system owner and approved HR users)
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

        // Helper: mark session persistence preference
        const markSession = () => {
          localStorage.setItem('sahod-remember', rememberMe ? 'true' : 'false');
          // sessionStorage is cleared automatically when the browser tab/window closes
          sessionStorage.setItem('sahod-session-active', Date.now().toString());
          if (!rememberMe) {
            // Remove persisted zustand auth so it won't survive a browser restart
            localStorage.removeItem('sahod-auth');
          }
        };
        
        console.log('🔍 Login attempt for:', email);
        
        // ALWAYS check system owner first, regardless of DEMO_MODE
        const systemOwnerAccount = SYSTEM_OWNER_CREDENTIALS[email.toLowerCase()];
        console.log('🔑 System owner check:', {
          emailProvided: email.toLowerCase(),
          credentialsFound: !!systemOwnerAccount,
          passwordMatch: systemOwnerAccount ? systemOwnerAccount.password === password : false
        });
        
        if (systemOwnerAccount && systemOwnerAccount.password === password) {
          console.log('✅ System owner login successful');
          const user = createUserFromCredentials(email, systemOwnerAccount.role, systemOwnerAccount.displayName);
          set({ 
            user, 
            firebaseUser: null,
            isAuthenticated: true, 
            isLoading: false 
          });
          markSession();
          
          // Enable real-time sync for HR data
          if (user.role === 'hr_client' && user.companyId) {
            useHRStore.getState().enableAutoSync();
          }
          
          return;
        }
        
        console.log('❌ System owner credentials did not match, checking other options...');
        
        // If DEMO_MODE, also check demo credentials
        if (DEMO_MODE) {
          const demoAccount = DEMO_CREDENTIALS[email.toLowerCase()];
          
          if (demoAccount && demoAccount.password === password) {
            console.log('✅ Demo account login successful');
            const user = createUserFromCredentials(email, demoAccount.role, demoAccount.displayName);
            set({ 
              user, 
              firebaseUser: null,
              isAuthenticated: true, 
              isLoading: false 
            });
            markSession();
            
            // Enable real-time sync for HR data
            if (user.role === 'hr_client' && user.companyId) {
              useHRStore.getState().enableAutoSync();
            }
            
            return;
          }
        }
        
        // Then check approved HR users from local state
        console.log('👥 Checking HR users from local state...');
        const { approvedUsers } = useRegistrationsStore.getState();
        console.log('📋 Current approved users count:', approvedUsers.length);
        console.log('📋 Approved users:', approvedUsers.map(u => ({ email: u.email, hasPassword: !!u.password })));
        
        const localApprovedUser = await useRegistrationsStore.getState().validateUserCredentials(email.toLowerCase(), password);
        
        if (localApprovedUser) {
          console.log('✅ HR user found in local state:', localApprovedUser.email);
          const hrUser: User = {
            id: `hr-${localApprovedUser.companyId}-${Date.now()}`,
            email: localApprovedUser.email,
            displayName: localApprovedUser.displayName,
            role: localApprovedUser.role,
            companyId: localApprovedUser.companyId,
            createdAt: new Date(localApprovedUser.approvedAt),
            updatedAt: new Date(),
          };
          set({ 
            user: hrUser, 
            firebaseUser: null,
            isAuthenticated: true, 
            isLoading: false 
          });
          markSession();
          
          // Enable real-time sync for HR data
          useHRStore.getState().enableAutoSync();
          
          return;
        }
        
        console.log('⚠️ HR user not found in local state, checking Firestore...');

        // Fallback: query Firestore hrUsers collection directly
        // This handles cases where local state is empty (different device / cleared storage)
        try {
          const hrUserDoc = await getDoc(doc(db, 'hrUsers', email.toLowerCase()));
          if (hrUserDoc.exists()) {
            const data = hrUserDoc.data();
            console.log('📄 Firestore hrUsers document found:', email.toLowerCase());
            
            // Validate password using crypto utilities
            let passwordValid = false;
            if (PasswordUtils.isHashed(data.password)) {
              passwordValid = await PasswordUtils.verifyPassword(password, data.password);
            } else {
              // Legacy plain text comparison
              console.warn('⚠️ Found plain text password in Firestore for:', email.toLowerCase());
              passwordValid = data.password === password;
            }
            
            if (passwordValid) {
              console.log('✅ Password matches, logging in HR user from Firestore');
              const hrUser: User = {
                id: `hr-${data.companyId}-${Date.now()}`,
                email: data.email,
                displayName: data.displayName,
                role: 'hr_client',
                companyId: data.companyId,
                createdAt: new Date(data.approvedAt || Date.now()),
                updatedAt: new Date(),
              };
              set({
                user: hrUser,
                firebaseUser: null,
                isAuthenticated: true,
                isLoading: false,
              });
              markSession();
              
              // Enable real-time sync for HR data
              useHRStore.getState().enableAutoSync();
              
              return;
            } else {
              console.log('❌ Password mismatch for HR user in Firestore');
            }
          } else {
            console.log('❌ No hrUsers document found in Firestore for:', email.toLowerCase());
          }
        } catch (firestoreError) {
          console.warn('⚠️ Firestore hrUsers lookup failed:', firestoreError);
        }
        
        // If DEMO_MODE is enabled and no credentials match, throw error immediately
        if (DEMO_MODE) {
          console.log('❌ Demo mode: Invalid credentials');
          set({ error: 'Invalid email or password.', isLoading: false });
          throw new Error('Invalid email or password.');
        }

        console.log('🔗 Attempting Firebase authentication...');

        // If not DEMO_MODE, try Firebase authentication
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const appUser = await firebaseUserToAppUser(userCredential.user);
          
          set({ 
            user: appUser, 
            firebaseUser: userCredential.user,
            isAuthenticated: true, 
            isLoading: false 
          });
          markSession();
          
          // Enable real-time sync for HR data
          if (appUser.role === 'hr_client' && appUser.companyId) {
            useHRStore.getState().enableAutoSync();
          }
        } catch (error: any) {
          let errorMessage = 'Login failed. Please try again.';
          
          // Handle specific Firebase auth errors
          switch (error.code) {
            case 'auth/invalid-email':
              errorMessage = 'Invalid email address.';
              break;
            case 'auth/user-disabled':
              errorMessage = 'This account has been disabled.';
              break;
            case 'auth/user-not-found':
              errorMessage = 'No account found with this email.';
              break;
            case 'auth/wrong-password':
              errorMessage = 'Incorrect password.';
              break;
            case 'auth/invalid-credential':
              errorMessage = 'Invalid email or password.';
              break;
            case 'auth/too-many-requests':
              errorMessage = 'Too many failed attempts. Please try again later.';
              break;
          }
          
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          // Disable real-time sync before logging out
          useHRStore.getState().disableAutoSync();
          
          if (!DEMO_MODE) {
            await signOut(auth);
          }
          set({ 
            user: null, 
            firebaseUser: null,
            isAuthenticated: false, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            user: null, 
            firebaseUser: null,
            isAuthenticated: false, 
            error: (error as Error).message, 
            isLoading: false 
          });
        }
      },

      checkAuth: async () => {
        // In demo mode, rely on persisted state
        if (DEMO_MODE) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const currentUser = auth.currentUser;
          if (currentUser) {
            const appUser = await firebaseUserToAppUser(currentUser);
            set({ 
              user: appUser, 
              firebaseUser: currentUser,
              isAuthenticated: true, 
              isLoading: false 
            });
            
            // Enable real-time sync for HR data
            if (appUser.role === 'hr_client' && appUser.companyId) {
              useHRStore.getState().enableAutoSync();
            }
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      initAuthListener: () => {
        // In demo mode, just set loading to false and return a no-op
        if (DEMO_MODE) {
          set({ isLoading: false });
          return () => {};
        }

        try {
          const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
              try {
                const appUser = await firebaseUserToAppUser(firebaseUser);
                set({ 
                  user: appUser, 
                  firebaseUser,
                  isAuthenticated: true, 
                  isLoading: false 
                });
                
                // Enable real-time sync for HR data
                if (appUser.role === 'hr_client' && appUser.companyId) {
                  useHRStore.getState().enableAutoSync();
                }
              } catch (error) {
                console.error('Error converting user:', error);
                set({ isLoading: false });
              }
            } else {
              // Disable sync when user logs out
              useHRStore.getState().disableAutoSync();
              
              set({ 
                user: null, 
                firebaseUser: null,
                isAuthenticated: false, 
                isLoading: false 
              });
            }
          }, (error) => {
            console.error('Auth state listener error:', error);
            set({ isLoading: false, error: error.message });
          });
          
          return unsubscribe;
        } catch (error) {
          console.error('Failed to initialize auth listener:', error);
          set({ isLoading: false });
          return () => {};
        }
      },

      // Role helper methods
      isSystemOwner: () => get().user?.role === 'system_owner',
      
      isHrClient: () => get().user?.role === 'hr_client',
      
      isEmployee: () => get().user?.role === 'employee',
      
      hasPermission: (permission: string) => {
        const user = get().user;
        if (!user) return false;
        
        // System owner has all permissions
        if (user.role === 'system_owner') return true;
        
        // Check user-specific permissions
        if (user.permissions?.includes(permission)) return true;
        if (user.permissions?.includes('*')) return true;
        
        // Default permissions based on role
        const rolePermissions: Record<string, string[]> = {
          hr_client: [
            'manage_employees', 'manage_attendance', 'manage_payroll', 
            'manage_leaves', 'view_reports', 'manage_company_settings'
          ],
          employee: [
            'view_own_profile', 'view_own_attendance', 
            'file_leave_request', 'view_own_payslips'
          ]
        };
        
        return rolePermissions[user.role]?.includes(permission) || false;
      },
    }),
    {
      name: 'sahod-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
