// ============================================================================
// RETIREMENTS API SERVICE
// ============================================================================
// API functions for expenditure retirement operations

import api, { endpoints } from './api';
import {
  ExpenditureRetirement,
  CreateRetirementRequest,
  ApproveRetirementRequest,
  RejectRetirementRequest,
  PaginatedResponse,
  RetirementStatus,
} from '@/types';

/**
 * Transform backend retirement response to frontend format
 * Backend returns flattened user data (submittedById, submittedByName, etc.)
 * Frontend expects nested user objects (submittedBy: { id, name, email })
 */
const transformRetirement = (backendRet: any): ExpenditureRetirement => {
  // Backend returns flat fields, so we need to build the requisition object
  const requisition: any = {
    id: backendRet.requisitionId,
    requisitionNumber: backendRet.requisitionNumber,
    date: '',
    amountRequested: backendRet.amountReceived,
    approvedAmount: backendRet.amountReceived,
    department: '',
    description: '',
    status: 'DISBURSED' as const,
    requestedBy: {
      id: backendRet.submittedById,
      name: backendRet.submittedByName,
      email: '',
      role: 'FIELD_STAFF' as const,
      isActive: true,
      createdAt: '',
      updatedAt: '',
    },
    createdAt: '',
    updatedAt: '',
  };

  return {
    id: backendRet.id,
    retirementNumber: backendRet.retirementNumber,
    requisition: requisition,
    employeeName: backendRet.employeeName,
    employeeTitle: backendRet.employeeTitle,
    amountReceived: backendRet.amountReceived,
    amountExpensed: backendRet.amountExpensed,
    status: backendRet.status,
    financeNotes: backendRet.financeNotes,
    submittedBy: {
      id: backendRet.submittedById,
      name: backendRet.submittedByName,
      email: backendRet.submittedByEmail || '',
      role: 'FIELD_STAFF',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    },
    financeApprovedBy: backendRet.financeApprovedById
      ? {
          id: backendRet.financeApprovedById,
          name: backendRet.financeApprovedByName,
          email: backendRet.financeApprovedByEmail || '',
          role: 'FINANCE',
          isActive: true,
          createdAt: '',
          updatedAt: '',
        }
      : undefined,
    financeApprovedAt: backendRet.financeApprovedAt,
    createdAt: backendRet.createdAt,
    updatedAt: backendRet.updatedAt,
    lineItems: backendRet.lineItems || [],
    attachments: backendRet.attachments || [],
  };
};

// ----------------------------------------------------------------------------
// RETIREMENT API CALLS
// ----------------------------------------------------------------------------

/**
 * Get all retirements with pagination
 */
export const getAllRetirements = async (
  page = 0,
  size = 20
): Promise<PaginatedResponse<ExpenditureRetirement>> => {
  const response = await api.get<PaginatedResponse<any>>(
    endpoints.retirements.list,
    {
      params: { page, size },
    }
  );

  // Transform the response
  if (response.data.content) {
    response.data.content = response.data.content.map(transformRetirement);
  }

  return response.data as PaginatedResponse<ExpenditureRetirement>;
};

/**
 * Get all retirements without pagination
 */
export const getAllRetirementsSimple = async (): Promise<ExpenditureRetirement[]> => {
  const response = await api.get<any>(endpoints.retirements.list);

  // Handle both array and paginated response
  const data = Array.isArray(response.data)
    ? response.data
    : response.data.content || [];

  return data.map(transformRetirement);
};

/**
 * Get my retirements (current user)
 */
export const getMyRetirements = async (): Promise<ExpenditureRetirement[]> => {
  const response = await api.get<any>(endpoints.retirements.my);

  // Handle both array and paginated response
  const data = Array.isArray(response.data)
    ? response.data
    : response.data.content || [];

  return data.map(transformRetirement);
};

/**
 * Get retirement by ID
 */
export const getRetirementById = async (id: number): Promise<ExpenditureRetirement> => {
  const response = await api.get<any>(endpoints.retirements.byId(id));
  return transformRetirement(response.data);
};

/**
 * Get retirements by status
 */
export const getRetirementsByStatus = async (
  status: RetirementStatus
): Promise<ExpenditureRetirement[]> => {
  const response = await api.get<any>(endpoints.retirements.byStatus(status));

  // Handle both array and paginated response
  const data = Array.isArray(response.data)
    ? response.data
    : response.data.content || [];

  return data.map(transformRetirement);
};

/**
 * Create new retirement with multiple file uploads
 */
export const createRetirement = async (
  data: CreateRetirementRequest,
  files?: File[]
): Promise<ExpenditureRetirement> => {
  const formData = new FormData();

  // Append retirement data as JSON string
  formData.append('retirement', JSON.stringify(data));

  // Append all files
  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append('files', file);
    });
  }

  const response = await api.post<any>(endpoints.retirements.create, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return transformRetirement(response.data);
};

/**
 * Approve retirement
 */
export const approveRetirement = async (
  id: number,
  data?: ApproveRetirementRequest
): Promise<ExpenditureRetirement> => {
  const response = await api.put<any>(
    endpoints.retirements.approve(id),
    data || {}
  );
  return transformRetirement(response.data);
};

/**
 * Reject retirement
 */
export const rejectRetirement = async (
  id: number,
  data: RejectRetirementRequest
): Promise<ExpenditureRetirement> => {
  const response = await api.put<any>(endpoints.retirements.reject(id), data);
  return transformRetirement(response.data);
};

/**
 * Download attachment file
 */
export const downloadAttachment = async (attachmentId: number, filename: string): Promise<void> => {
  const response = await api.get(endpoints.retirements.downloadAttachment(attachmentId), {
    responseType: 'blob',
  });

  // Create a download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// ----------------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------------

/**
 * Search retirements by retirement number or description
 */
export const searchRetirements = (
  retirements: ExpenditureRetirement[],
  searchTerm: string
): ExpenditureRetirement[] => {
  if (!searchTerm) return retirements;

  const term = searchTerm.toLowerCase();
  return retirements.filter(
    (ret) =>
      ret.retirementNumber.toLowerCase().includes(term) ||
      ret.requisition.requisitionNumber.toLowerCase().includes(term) ||
      ret.submittedBy.name.toLowerCase().includes(term) ||
      ret.employeeName.toLowerCase().includes(term) ||
      ret.lineItems.some(item => item.description.toLowerCase().includes(term))
  );
};

/**
 * Filter retirements by status
 */
export const filterRetirementsByStatus = (
  retirements: ExpenditureRetirement[],
  status?: RetirementStatus | 'all'
): ExpenditureRetirement[] => {
  if (!status || status === 'all') return retirements;
  return retirements.filter((ret) => ret.status === status);
};

/**
 * Get status badge variant
 */
export const getRetirementStatusBadgeVariant = (
  status: RetirementStatus
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const variants: Record<
    RetirementStatus,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    PENDING: 'secondary',
    APPROVED: 'default',
    REJECTED: 'destructive',
  };
  return variants[status];
};

/**
 * Get status display text
 */
export const getRetirementStatusDisplayText = (status: RetirementStatus): string => {
  const displayText: Record<RetirementStatus, string> = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
  };
  return displayText[status];
};

/**
 * Check if user can approve retirement
 */
export const canApproveRetirement = (
  retirement: ExpenditureRetirement,
  userRole: string,
  userId: number
): boolean => {
  // Must be PENDING status
  if (retirement.status !== 'PENDING') return false;

  // Must have FINANCE or ADMIN role
  if (!['FINANCE', 'ADMIN'].includes(userRole)) return false;

  // Cannot approve own retirement
  if (retirement.submittedBy.id === userId) return false;

  return true;
};

/**
 * Check if user can reject retirement
 */
export const canRejectRetirement = (
  retirement: ExpenditureRetirement,
  userRole: string,
  userId: number
): boolean => {
  // Same logic as approve
  return canApproveRetirement(retirement, userRole, userId);
};

/**
 * Calculate days since retirement was created
 */
export const getDaysSinceCreated = (createdAt: string): number => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Check if retirement is overdue (pending for more than 3 days)
 */
export const isRetirementOverdue = (retirement: ExpenditureRetirement): boolean => {
  if (retirement.status !== 'PENDING') return false;
  return getDaysSinceCreated(retirement.createdAt) > 3;
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Check if file is an image
 */
export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
  return imageExtensions.includes(getFileExtension(filename));
};

/**
 * Check if file is a PDF
 */
export const isPdfFile = (filename: string): boolean => {
  return getFileExtension(filename) === 'pdf';
};