// ============================================================================
// REQUISITIONS API SERVICE
// ============================================================================
// API functions for cash requisition operations

import api, { endpoints } from './api';
import {
  CashRequisition,
  CreateRequisitionRequest,
  ApproveRequisitionRequest,
  RejectRequisitionRequest,
  DisburseRequisitionRequest,
  PaginatedResponse,
  RequisitionStatus,
} from '@/types';

/**
 * Transform backend requisition response to frontend format
 * Backend returns flattened user data (requestedById, requestedByName, etc.)
 * Frontend expects nested user objects (requestedBy: { id, name, email })
 */
const transformRequisition = (backendReq: any): CashRequisition => {
  return {
    id: backendReq.id,
    requisitionNumber: backendReq.requisitionNumber,
    date: backendReq.date,
    amountRequested: backendReq.amountRequested,
    approvedAmount: backendReq.approvedAmount,
    department: backendReq.department,
    description: backendReq.description,
    status: backendReq.status,
    paymentMethod: backendReq.paymentMethod,
    paymentReference: backendReq.paymentReference,
    rejectionReason: backendReq.rejectionReason,
    requestedBy: {
      id: backendReq.requestedById,
      name: backendReq.requestedByName,
      email: backendReq.requestedByEmail,
      role: 'FIELD_STAFF', // Default, not provided by backend
      isActive: true,
      createdAt: '',
      updatedAt: '',
    },
    approvedBy: backendReq.approvedById
      ? {
          id: backendReq.approvedById,
          name: backendReq.approvedByName,
          email: backendReq.approvedByEmail || '',
          role: 'APPROVER',
          isActive: true,
          createdAt: '',
          updatedAt: '',
        }
      : undefined,
    rejectedBy: backendReq.rejectedById
      ? {
          id: backendReq.rejectedById,
          name: backendReq.rejectedByName,
          email: backendReq.rejectedByEmail || '',
          role: 'APPROVER',
          isActive: true,
          createdAt: '',
          updatedAt: '',
        }
      : undefined,
    disbursedBy: backendReq.disbursedById
      ? {
          id: backendReq.disbursedById,
          name: backendReq.disbursedByName,
          email: backendReq.disbursedByEmail || '',
          role: 'FINANCE',
          isActive: true,
          createdAt: '',
          updatedAt: '',
        }
      : undefined,
    approvedAt: backendReq.approvedAt,
    rejectedAt: backendReq.rejectedAt,
    disbursedAt: backendReq.disbursedAt,
    createdAt: backendReq.createdAt,
    updatedAt: backendReq.updatedAt,
  };
};

// ----------------------------------------------------------------------------
// REQUISITION API CALLS
// ----------------------------------------------------------------------------

/**
 * Get all requisitions with pagination
 */
export const getAllRequisitions = async (
  page = 0,
  size = 20
): Promise<PaginatedResponse<CashRequisition>> => {
  const response = await api.get<PaginatedResponse<any>>(
    endpoints.requisitions.list,
    {
      params: { page, size },
    }
  );
  
  // Transform the response
  if (response.data.content) {
    response.data.content = response.data.content.map(transformRequisition);
  }
  
  return response.data as PaginatedResponse<CashRequisition>;
};

/**
 * Get all requisitions without pagination
 */
export const getAllRequisitionsSimple = async (): Promise<CashRequisition[]> => {
  const response = await api.get<any>(endpoints.requisitions.list);
  
  // Handle both array and paginated response
  const data = Array.isArray(response.data) 
    ? response.data 
    : response.data.content || [];
    
  return data.map(transformRequisition);
};

/**
 * Get my requisitions (current user)
 */
export const getMyRequisitions = async (): Promise<CashRequisition[]> => {
  const response = await api.get<any>(endpoints.requisitions.my);
  
  // Handle both array and paginated response
  const data = Array.isArray(response.data) 
    ? response.data 
    : response.data.content || [];
    
  return data.map(transformRequisition);
};

/**
 * Get requisition by ID
 */
export const getRequisitionById = async (id: number): Promise<CashRequisition> => {
  const response = await api.get<any>(endpoints.requisitions.byId(id));
  return transformRequisition(response.data);
};

/**
 * Get requisitions by status
 */
export const getRequisitionsByStatus = async (
  status: RequisitionStatus
): Promise<CashRequisition[]> => {
  const response = await api.get<any>(
    endpoints.requisitions.byStatus(status)
  );
  
  // Handle both array and paginated response
  const data = Array.isArray(response.data) 
    ? response.data 
    : response.data.content || [];
    
  return data.map(transformRequisition);
};

/**
 * Get requisitions by department
 */
export const getRequisitionsByDepartment = async (
  department: string
): Promise<CashRequisition[]> => {
  const response = await api.get<any>(
    endpoints.requisitions.byDepartment(department)
  );
  
  // Handle both array and paginated response
  const data = Array.isArray(response.data) 
    ? response.data 
    : response.data.content || [];
    
  return data.map(transformRequisition);
};

/**
 * Create new requisition
 */
export const createRequisition = async (
  data: CreateRequisitionRequest
): Promise<CashRequisition> => {
  const response = await api.post<any>(
    endpoints.requisitions.create,
    data
  );
  return transformRequisition(response.data);
};

/**
 * Approve requisition
 */
export const approveRequisition = async (
  id: number,
  data: ApproveRequisitionRequest
): Promise<CashRequisition> => {
  const response = await api.put<any>(
    endpoints.requisitions.approve(id),
    data
  );
  return transformRequisition(response.data);
};

/**
 * Reject requisition
 */
export const rejectRequisition = async (
  id: number,
  data: RejectRequisitionRequest
): Promise<CashRequisition> => {
  const response = await api.put<any>(
    endpoints.requisitions.reject(id),
    data
  );
  return transformRequisition(response.data);
};

/**
 * Disburse requisition
 */
export const disburseRequisition = async (
  id: number,
  data: DisburseRequisitionRequest
): Promise<CashRequisition> => {
  const response = await api.put<any>(
    endpoints.requisitions.disburse(id),
    data
  );
  return transformRequisition(response.data);
};

// ----------------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------------

/**
 * Search requisitions by requisition number or description
 */
export const searchRequisitions = (
  requisitions: CashRequisition[],
  searchTerm: string
): CashRequisition[] => {
  if (!searchTerm) return requisitions;

  const term = searchTerm.toLowerCase();
  return requisitions.filter(
    (req) =>
      req.requisitionNumber.toLowerCase().includes(term) ||
      req.description.toLowerCase().includes(term) ||
      req.department.toLowerCase().includes(term) ||
      req.requestedBy.name.toLowerCase().includes(term)
  );
};

/**
 * Filter requisitions by status
 */
export const filterRequisitionsByStatus = (
  requisitions: CashRequisition[],
  status?: RequisitionStatus | 'all'
): CashRequisition[] => {
  if (!status || status === 'all') return requisitions;
  return requisitions.filter((req) => req.status === status);
};

/**
 * Filter requisitions by department
 */
export const filterRequisitionsByDepartment = (
  requisitions: CashRequisition[],
  department?: string
): CashRequisition[] => {
  if (!department || department === 'all') return requisitions;
  return requisitions.filter((req) => req.department === department);
};

/**
 * Get status badge variant
 */
export const getStatusBadgeVariant = (
  status: RequisitionStatus
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const variants: Record<
    RequisitionStatus,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    PENDING: 'secondary',
    APPROVED: 'default',
    REJECTED: 'destructive',
    DISBURSED: 'outline',
  };
  return variants[status];
};

/**
 * Get status display text
 */
export const getStatusDisplayText = (status: RequisitionStatus): string => {
  const displayText: Record<RequisitionStatus, string> = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    DISBURSED: 'Disbursed',
  };
  return displayText[status];
};

/**
 * Get payment method display text
 */
export const getPaymentMethodDisplay = (method?: string): string => {
  if (!method) return '-';
  
  const display: Record<string, string> = {
    MOBILE_MONEY: 'Mobile Money',
    BANK: 'Bank Transfer',
    CASH: 'Cash',
    CHEQUE: 'Cheque',
  };
  return display[method] || method;
};

/**
 * Check if user can approve requisition
 */
export const canApproveRequisition = (
  requisition: CashRequisition,
  userRole: string,
  userId: number
): boolean => {
  // Must be PENDING status
  if (requisition.status !== 'PENDING') return false;
  
  // Must have APPROVER or ADMIN role
  if (!['APPROVER', 'ADMIN'].includes(userRole)) return false;
  
  // Cannot approve own requisition
  if (requisition.requestedBy.id === userId) return false;
  
  return true;
};

/**
 * Check if user can reject requisition
 */
export const canRejectRequisition = (
  requisition: CashRequisition,
  userRole: string,
  userId: number
): boolean => {
  // Same logic as approve
  return canApproveRequisition(requisition, userRole, userId);
};

/**
 * Check if user can disburse requisition
 */
export const canDisburseRequisition = (
  requisition: CashRequisition,
  userRole: string
): boolean => {
  // Must be APPROVED status
  if (requisition.status !== 'APPROVED') return false;
  
  // Must have FINANCE or ADMIN role
  if (!['FINANCE', 'ADMIN'].includes(userRole)) return false;
  
  return true;
};

/**
 * Calculate days since requisition was created
 */
export const getDaysSinceCreated = (createdAt: string): number => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Check if requisition is overdue (pending for more than 3 days)
 */
export const isRequisitionOverdue = (requisition: CashRequisition): boolean => {
  if (requisition.status !== 'PENDING') return false;
  return getDaysSinceCreated(requisition.createdAt) > 3;
};