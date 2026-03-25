// ============================================================================
// API CLIENT CONFIGURATION
// ============================================================================
// Axios instance configured to communicate with Spring Boot backend
// Handles authentication, request/response interceptors, and error handling

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '@/types';

// Base URL for API - change this to your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// ----------------------------------------------------------------------------
// REQUEST INTERCEPTOR - Add JWT token to every request
// ----------------------------------------------------------------------------

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to Authorization header
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ----------------------------------------------------------------------------
// RESPONSE INTERCEPTOR - Handle errors globally
// ----------------------------------------------------------------------------

api.interceptors.response.use(
  (response) => {
    // If response is successful, just return the data
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle different error scenarios
    
    // 1. Network Error (backend not running)
    if (!error.response) {
      console.error('Network Error: Cannot connect to backend');
      return Promise.reject({
        message: 'Cannot connect to server. Please check if backend is running.',
        status: 0,
      });
    }

    // 2. Unauthorized (401) - Token expired or invalid
    if (error.response.status === 401) {
      console.error('Unauthorized: Token expired or invalid');
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login (only on client side)
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      
      return Promise.reject({
        message: 'Session expired. Please login again.',
        status: 401,
      });
    }

    // 3. Forbidden (403) - No permission
    if (error.response.status === 403) {
      console.error('Forbidden: Insufficient permissions');
      return Promise.reject({
        message: 'You do not have permission to perform this action.',
        status: 403,
      });
    }

    // 4. Not Found (404)
    if (error.response.status === 404) {
      return Promise.reject({
        message: error.response.data?.message || 'Resource not found.',
        status: 404,
      });
    }

    // 5. Validation Error (400)
    if (error.response.status === 400) {
      return Promise.reject({
        message: error.response.data?.message || 'Invalid request data.',
        status: 400,
      });
    }

    // 6. Server Error (500)
    if (error.response.status >= 500) {
      console.error('Server Error:', error.response.data);
      return Promise.reject({
        message: 'Server error. Please try again later.',
        status: error.response.status,
      });
    }

    // Default error
    return Promise.reject({
      message: error.response.data?.message || 'An unexpected error occurred.',
      status: error.response.status,
    });
  }
);

// ----------------------------------------------------------------------------
// API ENDPOINTS - Organized by module
// ----------------------------------------------------------------------------

export const endpoints = {
  // Authentication
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },

  // Users
  users: {
    list: '/api/users',
    byId: (id: number) => `/api/users/${id}`,
    create: '/api/users',
    update: (id: number) => `/api/users/${id}`,
    delete: (id: number) => `/api/users/${id}`,
  },

  // Cash Requisitions
  requisitions: {
    list: '/api/requisitions',
    byId: (id: number) => `/api/requisitions/${id}`,
    my: '/api/requisitions/my',
    byStatus: (status: string) => `/api/requisitions/status/${status}`,
    byDepartment: (dept: string) => `/api/requisitions/department/${dept}`,
    create: '/api/requisitions',
    approve: (id: number) => `/api/requisitions/${id}/approve`,
    reject: (id: number) => `/api/requisitions/${id}/reject`,
    disburse: (id: number) => `/api/requisitions/${id}/disburse`,
  },

  // Expenditure Retirements
  retirements: {
    list: '/api/retirements',
    byId: (id: number) => `/api/retirements/${id}`,
    my: '/api/retirements/my',
    byStatus: (status: string) => `/api/retirements/status/${status}`,
    create: '/api/retirements', // Multipart form data
    createSimple: '/api/retirements/simple', // JSON only
    approve: (id: number) => `/api/retirements/${id}/approve`,
    reject: (id: number) => `/api/retirements/${id}/reject`,
    downloadAttachment: (id: number) => `/api/retirements/attachments/${id}`,
  },

  // Notifications
  notifications: {
    list: '/api/notifications',
    unread: '/api/notifications/unread',
    unreadCount: '/api/notifications/unread/count',
    markAsRead: (id: number) => `/api/notifications/${id}/read`,
    markAllAsRead: '/api/notifications/read-all',
  },
};

// ----------------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------------

/**
 * Format currency (TZS)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date (DD/MM/YYYY)
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

/**
 * Format date with time (DD/MM/YYYY HH:MM)
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Calculate relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(dateString);
};

/**
 * Download file from blob
 */
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default api;