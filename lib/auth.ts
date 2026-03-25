// ============================================================================
// AUTHENTICATION UTILITIES
// ============================================================================
// Helper functions and API calls for authentication

import api, { endpoints } from './api';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types';

// ----------------------------------------------------------------------------
// AUTHENTICATION API CALLS
// ----------------------------------------------------------------------------

/**
 * Login user
 */
export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(endpoints.auth.login, credentials);
  return response.data;
};

/**
 * Register new user
 */
export const registerUser = async (data: RegisterRequest): Promise<User> => {
  const response = await api.post<User>(endpoints.auth.register, data);
  return response.data;
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<void> => {
  await api.post(endpoints.auth.logout);
};

/**
 * Get current user details
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>(endpoints.auth.me);
  return response.data;
};

// ----------------------------------------------------------------------------
// TOKEN UTILITIES
// ----------------------------------------------------------------------------

/**
 * Check if token exists in localStorage
 */
export const hasToken = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};

/**
 * Get token from localStorage
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

/**
 * Remove token from localStorage
 */
export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ----------------------------------------------------------------------------
// ROLE UTILITIES
// ----------------------------------------------------------------------------

/**
 * Check if user has specific role
 */
export const hasRole = (user: User | null, role: User['role'] | User['role'][]): boolean => {
  if (!user) return false;
  
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  
  return user.role === role;
};

/**
 * Check if user is admin
 */
export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, 'ADMIN');
};

/**
 * Check if user is finance
 */
export const isFinance = (user: User | null): boolean => {
  return hasRole(user, ['FINANCE', 'ADMIN']);
};

/**
 * Check if user is approver
 */
export const isApprover = (user: User | null): boolean => {
  return hasRole(user, ['APPROVER', 'ADMIN']);
};

/**
 * Check if user is field staff
 */
export const isFieldStaff = (user: User | null): boolean => {
  return hasRole(user, 'FIELD_STAFF');
};

// ----------------------------------------------------------------------------
// PERMISSION UTILITIES
// ----------------------------------------------------------------------------

export const PERMISSIONS = {
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

/**
 * Check if user has specific permission
 */
export const hasPermission = (
  user: User | null,
  permission: keyof typeof PERMISSIONS['ADMIN']
): boolean => {
  if (!user) return false;
  return PERMISSIONS[user.role][permission];
};

/**
 * Get user's permissions object
 */
export const getUserPermissions = (user: User | null) => {
  if (!user) return PERMISSIONS.FIELD_STAFF;
  return PERMISSIONS[user.role];
};

// ----------------------------------------------------------------------------
// DISPLAY UTILITIES
// ----------------------------------------------------------------------------

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: User['role']): string => {
  const roleNames: Record<User['role'], string> = {
    FIELD_STAFF: 'Field Staff',
    APPROVER: 'Approver',
    FINANCE: 'Finance',
    ADMIN: 'Administrator',
  };
  return roleNames[role];
};

/**
 * Get role badge color
 */
export const getRoleBadgeVariant = (role: User['role']): string => {
  const variants: Record<User['role'], string> = {
    FIELD_STAFF: 'default',
    APPROVER: 'secondary',
    FINANCE: 'outline',
    ADMIN: 'destructive',
  };
  return variants[role];
};

/**
 * Get user initials for avatar
 */
export const getUserInitials = (name: string): string => {
  const names = name.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// ----------------------------------------------------------------------------
// VALIDATION UTILITIES
// ----------------------------------------------------------------------------

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Get password strength message
 */
export const getPasswordStrengthMessage = (password: string): string => {
  if (password.length === 0) return '';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[a-z]/.test(password)) return 'Password must contain lowercase letter';
  if (!/[A-Z]/.test(password)) return 'Password must contain uppercase letter';
  if (!/\d/.test(password)) return 'Password must contain a number';
  return 'Strong password';
};

/**
 * Validate phone number (Tanzanian format)
 */
export const isValidPhone = (phone: string): boolean => {
  // Basic validation for Tanzanian phone numbers
  // Accepts: +255XXXXXXXXX, 255XXXXXXXXX, 0XXXXXXXXX
  const phoneRegex = /^(\+?255|0)[67]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};