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

// Demo mode flag - set to true to bypass Firebase auth
const DEMO_MODE = false;

// System owner credentials
const DEMO_CREDENTIALS: Record<string, { password: string; role: UserRole; displayName: string }> = {
  'clarenceflores082001@gmail.com': {
    password: 'Garfield_1.1',
    role: 'system_owner',
    displayName: 'Clarence Flores',
  },
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
        
        // First check system owner account
        const systemAccount = DEMO_CREDENTIALS[email.toLowerCase()];
        
        if (systemAccount && systemAccount.password === password) {
          const user = createUserFromCredentials(email, systemAccount.role, systemAccount.displayName);
          set({ 
            user, 
            firebaseUser: null,
            isAuthenticated: true, 
            isLoading: false 
          });
          markSession();
          return;
        }
        
        // Then check approved HR users from local state
        const localApprovedUser = useRegistrationsStore.getState().validateUserCredentials(email.toLowerCase(), password);
        
        if (localApprovedUser) {
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
          return;
        }

        // Fallback: query Firestore hrUsers collection directly
        // This handles cases where local state is empty (different device / cleared storage)
        try {
          const hrUserDoc = await getDoc(doc(db, 'hrUsers', email.toLowerCase()));
          if (hrUserDoc.exists()) {
            const data = hrUserDoc.data();
            if (data.password === password) {
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
              return;
            }
          }
        } catch (firestoreError) {
          console.warn('Firestore hrUsers lookup failed:', firestoreError);
        }
        
        // If DEMO_MODE, credentials not found - throw error
        if (DEMO_MODE) {
          set({ error: 'Invalid email or password.', isLoading: false });
          throw new Error('Invalid email or password.');
        }

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
              } catch (error) {
                console.error('Error converting user:', error);
                set({ isLoading: false });
              }
            } else {
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
