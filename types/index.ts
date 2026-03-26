// ============================================================================
// TYPE DEFINITIONS FOR APECK ERP SYSTEM
// ============================================================================

// ----------------------------------------------------------------------------
// USER & AUTHENTICATION TYPES
// ----------------------------------------------------------------------------

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'FIELD_STAFF' | 'APPROVER' | 'FINANCE' | 'ADMIN';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  department: string;
  role: UserRole;
}

// ----------------------------------------------------------------------------
// CASH REQUISITION TYPES
// ----------------------------------------------------------------------------

export interface CashRequisition {
  id: number;
  requisitionNumber: string;
  date: string;
  amountRequested: number;
  approvedAmount?: number;
  department: string;
  description: string;
  status: RequisitionStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  rejectionReason?: string;
  requestedBy: User;
  approvedBy?: User;
  rejectedBy?: User;
  disbursedBy?: User;
  approvedAt?: string;
  rejectedAt?: string;
  disbursedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type RequisitionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISBURSED';

export type PaymentMethod = 'MOBILE_MONEY' | 'BANK' | 'CASH' | 'CHEQUE';

export interface CreateRequisitionRequest {
  date: string;
  amountRequested: number;
  department: string;
  description: string;
}

export interface ApproveRequisitionRequest {
  approvedAmount: number;
}

export interface RejectRequisitionRequest {
  rejectionReason: string;
}

export interface DisburseRequisitionRequest {
  paymentMethod: PaymentMethod;
  paymentReference?: string;
}

// ----------------------------------------------------------------------------
// EXPENDITURE RETIREMENT TYPES
// ----------------------------------------------------------------------------

export interface ExpenditureRetirement {
  id: number;
  retirementNumber: string;
  requisition: CashRequisition;
  employeeName: string;
  employeeTitle: string;
  amountReceived: number;
  amountExpensed: number;
  status: RetirementStatus;
  financeNotes?: string;
  submittedBy: User;
  financeApprovedBy?: User;
  financeApprovedAt?: string;
  createdAt: string;
  updatedAt: string;
  lineItems: RetirementLineItem[];
  attachments: RetirementAttachment[];
}

export interface RetirementLineItem {
  id: number;
  date: string;
  description: string;
  cost: number;
}

export interface RetirementAttachment {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export type RetirementStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CreateRetirementRequest {
  requisitionId: number;
  employeeName: string;
  employeeTitle: string;
  amountReceived: number;
  lineItems: {
    date: string;
    description: string;
    cost: number;
  }[];
}

// For multipart form data with files
export interface CreateRetirementFormData {
  retirement: string; // JSON stringified CreateRetirementRequest
  files: File[];
}

export interface ApproveRetirementRequest {
  financeNotes?: string;
}

export interface RejectRetirementRequest {
  financeNotes: string; // Rejection reason is mandatory
}

// ----------------------------------------------------------------------------
// NOTIFICATION TYPES
// ----------------------------------------------------------------------------

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: number;
}

export type NotificationType =
  | 'REQUISITION_APPROVED'
  | 'REQUISITION_REJECTED'
  | 'REQUISITION_DISBURSED'
  | 'RETIREMENT_APPROVED'
  | 'RETIREMENT_REJECTED';

export interface NotificationCount {
  count: number;
}

// ----------------------------------------------------------------------------
// PAGINATION TYPES
// ----------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// ----------------------------------------------------------------------------
// DASHBOARD TYPES
// ----------------------------------------------------------------------------

export interface DashboardStats {
  pendingRequisitions: number;
  approvedRequisitions: number;
  disbursedRequisitions: number;
  pendingRetirements: number;
  approvedRetirements: number;
  totalDisbursed: number;
  overdueRetirements: number;
}

// ----------------------------------------------------------------------------
// FILTER & SEARCH TYPES
// ----------------------------------------------------------------------------

export interface RequisitionFilters {
  status?: RequisitionStatus;
  department?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface RetirementFilters {
  status?: RetirementStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// ----------------------------------------------------------------------------
// API ERROR TYPES
// ----------------------------------------------------------------------------

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

// ----------------------------------------------------------------------------
// FORM STATE TYPES
// ----------------------------------------------------------------------------

export interface FormState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

// ----------------------------------------------------------------------------
// TABLE TYPES
// ----------------------------------------------------------------------------

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableSort {
  key: string;
  direction: 'asc' | 'desc';
}

// ----------------------------------------------------------------------------
// DEPARTMENT OPTIONS
// ----------------------------------------------------------------------------

export const DEPARTMENTS = [
  'Operations',
  'Finance',
  'Sales',
  'Marketing',
  'IT',
  'HR',
  'Logistics',
  'Administration',
] as const;

export type Department = (typeof DEPARTMENTS)[number];

// ----------------------------------------------------------------------------
// STATUS BADGE VARIANTS
// ----------------------------------------------------------------------------

export const STATUS_VARIANTS: Record<RequisitionStatus | RetirementStatus, string> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
  DISBURSED: 'default',
};

// ----------------------------------------------------------------------------
// ROLE PERMISSIONS
// ----------------------------------------------------------------------------

export const ROLE_PERMISSIONS = {
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