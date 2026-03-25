// ============================================================================
// USER API SERVICE
// ============================================================================
// API functions for user management operations

import api, { endpoints } from './api';
import { User, RegisterRequest, PaginatedResponse } from '@/types';

// ----------------------------------------------------------------------------
// USER API CALLS
// ----------------------------------------------------------------------------

/**
 * Get all users with pagination
 */
export const getAllUsers = async (page = 0, size = 20): Promise<PaginatedResponse<User>> => {
  const response = await api.get<PaginatedResponse<User>>(endpoints.users.list, {
    params: { page, size },
  });
  return response.data;
};

/**
 * Get all users without pagination (for dropdowns, etc.)
 */
export const getAllUsersSimple = async (): Promise<User[]> => {
  const response = await api.get<User[]>(endpoints.users.list);
  return response.data;
};

/**
 * Get user by ID
 */
export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get<User>(endpoints.users.byId(id));
  return response.data;
};

/**
 * Create new user (Admin only)
 */
export const createUser = async (data: RegisterRequest): Promise<User> => {
  const response = await api.post<User>(endpoints.users.create, data);
  return response.data;
};

/**
 * Update user
 */
export const updateUser = async (id: number, data: Partial<User>): Promise<User> => {
  const response = await api.put<User>(endpoints.users.update(id), data);
  return response.data;
};

/**
 * Delete user (Admin only)
 */
export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(endpoints.users.delete(id));
};

/**
 * Toggle user active status
 */
export const toggleUserStatus = async (id: number, isActive: boolean): Promise<User> => {
  const response = await api.put<User>(endpoints.users.update(id), { isActive });
  return response.data;
};

// ----------------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------------

/**
 * Search users by name or email
 */
export const searchUsers = (users: User[], searchTerm: string): User[] => {
  if (!searchTerm) return users;
  
  const term = searchTerm.toLowerCase();
  return users.filter(
    (user) =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      (user.department && user.department.toLowerCase().includes(term))
  );
};

/**
 * Filter users by role
 */
export const filterUsersByRole = (users: User[], role?: string): User[] => {
  if (!role || role === 'all') return users;
  return users.filter((user) => user.role === role);
};

/**
 * Filter users by status
 */
export const filterUsersByStatus = (users: User[], status?: string): User[] => {
  if (!status || status === 'all') return users;
  const isActive = status === 'active';
  return users.filter((user) => user.isActive === isActive);
};