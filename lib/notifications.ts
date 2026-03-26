// ============================================================================
// NOTIFICATIONS API SERVICE
// ============================================================================
// API functions for notification operations

import api, { endpoints } from './api';
import { Notification, NotificationCount } from '@/types';

/**
 * Get all notifications for current user
 */
export const getAllNotifications = async (): Promise<Notification[]> => {
  const response = await api.get<Notification[]>(endpoints.notifications.list);
  return response.data;
};

/**
 * Get unread notifications for current user
 */
export const getUnreadNotifications = async (): Promise<Notification[]> => {
  const response = await api.get<Notification[]>(endpoints.notifications.unread);
  return response.data;
};

/**
 * Get count of unread notifications
 */
export const getUnreadNotificationCount = async (): Promise<number> => {
  const response = await api.get<NotificationCount>(endpoints.notifications.unreadCount);
  return response.data.count;
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (id: number): Promise<void> => {
  await api.put(endpoints.notifications.markAsRead(id));
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.put(endpoints.notifications.markAllAsRead);
};

// ----------------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------------

/**
 * Get notification icon based on type
 */
export const getNotificationIcon = (type: Notification['type']): string => {
  switch (type) {
    case 'REQUISITION_APPROVED':
      return '✅';
    case 'REQUISITION_REJECTED':
      return '❌';
    case 'REQUISITION_DISBURSED':
      return '💰';
    case 'RETIREMENT_APPROVED':
      return '✅';
    case 'RETIREMENT_REJECTED':
      return '❌';
    default:
      return '🔔';
  }
};

/**
 * Get notification color based on type
 */
export const getNotificationColor = (type: Notification['type']): string => {
  switch (type) {
    case 'REQUISITION_APPROVED':
    case 'RETIREMENT_APPROVED':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'REQUISITION_REJECTED':
    case 'RETIREMENT_REJECTED':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'REQUISITION_DISBURSED':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

/**
 * Format notification type for display
 */
export const formatNotificationType = (type: Notification['type']): string => {
  switch (type) {
    case 'REQUISITION_APPROVED':
      return 'Requisition Approved';
    case 'REQUISITION_REJECTED':
      return 'Requisition Rejected';
    case 'REQUISITION_DISBURSED':
      return 'Requisition Disbursed';
    case 'RETIREMENT_APPROVED':
      return 'Retirement Approved';
    case 'RETIREMENT_REJECTED':
      return 'Retirement Rejected';
    default:
      return 'Notification';
  }
};