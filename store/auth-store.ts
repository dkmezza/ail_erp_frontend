// ============================================================================
// AUTHENTICATION STORE (Zustand)
// ============================================================================
// Global state management for user authentication
// Persists token and user data to localStorage

import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  // Login action - save token and user
  login: (token: string, user: User) => {
    // Save to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    // Update state
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  // Logout action - clear everything
  logout: () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Reset state
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  // Update user data (e.g., after profile update)
  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  // Initialize - check localStorage on app load
  initialize: () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr && userStr !== 'undefined') {
        const user = JSON.parse(userStr);
        
        // Validate that user object has required properties
        if (user && user.id && user.email) {
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // Invalid user data, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ isLoading: false });
    }
  },
}));

// ----------------------------------------------------------------------------
// PERMISSIONS CONSTANT
// ----------------------------------------------------------------------------

const ROLE_PERMISSIONS = {
  FIELD_STAFF: {
    canCreateRequisition: true,
    canApproveRequisition: false,
    canDisburseRequisition: false,
    canCreateRetirement: true,
    canApproveRetirement: false,
    canViewAllData: false,
    canManageUsers: false,
  },
  APPROVER: {
    canCreateRequisition: true,
    canApproveRequisition: true,
    canDisburseRequisition: false,
    canCreateRetirement: true,
    canApproveRetirement: false,
    canViewAllData: true,
    canManageUsers: false,
  },
  FINANCE: {
    canCreateRequisition: true,
    canApproveRequisition: false,
    canDisburseRequisition: true,
    canCreateRetirement: true,
    canApproveRetirement: true,
    canViewAllData: true,
    canManageUsers: false,
  },
  ADMIN: {
    canCreateRequisition: true,
    canApproveRequisition: true,
    canDisburseRequisition: true,
    canCreateRetirement: true,
    canApproveRetirement: true,
    canViewAllData: true,
    canManageUsers: true,
  },
} as const;

// ----------------------------------------------------------------------------
// HELPER HOOKS
// ----------------------------------------------------------------------------

/**
 * Hook to check if user has specific role
 */
export const useHasRole = (role: User['role'] | User['role'][]) => {
  const user = useAuthStore((state) => state.user);
  
  if (!user) return false;
  
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  
  return user.role === role;
};

/**
 * Hook to check if user has permission for an action
 */
export const useHasPermission = (permission: keyof typeof ROLE_PERMISSIONS['ADMIN']) => {
  const user = useAuthStore((state) => state.user);
  
  if (!user) return false;
  
  return ROLE_PERMISSIONS[user.role][permission];
};

/**
 * Hook to get user's display name
 */
export const useUserName = () => {
  const user = useAuthStore((state) => state.user);
  return user?.name || 'User';
};

/**
 * Hook to get user's initials for avatar
 */
export const useUserInitials = () => {
  const user = useAuthStore((state) => state.user);
  if (!user) return 'U';
  
  const names = user.name.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return user.name.substring(0, 2).toUpperCase();
};