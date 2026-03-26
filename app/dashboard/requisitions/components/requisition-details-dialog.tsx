'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CashRequisition } from '@/types';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';
import { getStatusBadgeVariant, getStatusDisplayText, getPaymentMethodDisplay } from '@/lib/requisitions';
import {
  FileText,
  User,
  Calendar,
  DollarSign,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
} from 'lucide-react';

interface RequisitionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisition: CashRequisition | null;
}

export function RequisitionDetailsDialog({
  open,
  onOpenChange,
  requisition,
}: RequisitionDetailsDialogProps) {
  if (!requisition) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Requisition Details</span>
            <Badge variant={getStatusBadgeVariant(requisition.status)}>
              {getStatusDisplayText(requisition.status)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Complete information about this cash requisition
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Basic Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Requisition Number</p>
                  <p className="font-medium">{requisition.requisitionNumber}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(requisition.date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Requested By</p>
                  <p className="font-medium">{requisition.requestedBy.name}</p>
                  <p className="text-xs text-gray-500">
                    {requisition.requestedBy.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="font-medium">{requisition.department}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Financial Details
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Amount Requested</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(requisition.amountRequested)}
                  </p>
                </div>
              </div>

              {requisition.approvedAmount && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Approved Amount</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(requisition.approvedAmount)}
                    </p>
                  </div>
                </div>
              )}

              {requisition.paymentMethod && (
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Payment Method</p>
                    <p className="font-medium">
                      {getPaymentMethodDisplay(requisition.paymentMethod)}
                    </p>
                  </div>
                </div>
              )}

              {requisition.paymentReference && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Payment Reference</p>
                    <p className="font-medium">{requisition.paymentReference}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
              {requisition.description}
            </p>
          </div>

          {/* Rejection Reason */}
          {requisition.rejectionReason && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Rejection Reason
                </h3>
                <p className="text-sm text-gray-700 bg-red-50 p-3 rounded border border-red-200">
                  {requisition.rejectionReason}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Timeline
            </h3>
            <div className="space-y-3">
              {/* Created */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  {(requisition.approvedAt ||
                    requisition.rejectedAt ||
                    requisition.disbursedAt) && (
                    <div className="w-0.5 h-full bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-sm">Created</p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(requisition.createdAt)}
                  </p>
                  <p className="text-xs text-gray-500">
                    by {requisition.requestedBy.name}
                  </p>
                </div>
              </div>

              {/* Approved*/}
              {requisition.approvedAt && requisition.approvedBy && requisition.status !== 'REJECTED' && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    {requisition.disbursedAt && (
                      <div className="w-0.5 h-full bg-gray-200 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-sm text-green-600">Approved</p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(requisition.approvedAt)}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {requisition.approvedBy.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Rejected - use approvedAt/approvedBy since backend reuses those fields */}
              {requisition.status === 'REJECTED' && requisition.approvedAt && requisition.approvedBy && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-red-600">Rejected</p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(requisition.approvedAt)}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {requisition.approvedBy.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Disbursed */}
              {requisition.disbursedAt && requisition.disbursedBy && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-purple-600">Disbursed</p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(requisition.disbursedAt)}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {requisition.disbursedBy.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}