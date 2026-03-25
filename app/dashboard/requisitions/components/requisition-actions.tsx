'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  DollarSign,
} from 'lucide-react';
import { CashRequisition } from '@/types';
import {
  canApproveRequisition,
  canRejectRequisition,
  canDisburseRequisition,
} from '@/lib/requisitions';
import { RequisitionDetailsDialog } from './requisition-details-dialog';
import { ApproveRequisitionDialog } from './approve-requisition-dialog';
import { RejectRequisitionDialog } from './reject-requisition-dialog';
import { DisburseRequisitionDialog } from './disburse-requisition-dialog';

interface RequisitionActionsProps {
  requisition: CashRequisition;
  currentUserId: number;
  currentUserRole: string;
  onRequisitionUpdated: () => void;
}

export function RequisitionActions({
  requisition,
  currentUserId,
  currentUserRole,
  onRequisitionUpdated,
}: RequisitionActionsProps) {
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDisburseDialogOpen, setIsDisburseDialogOpen] = useState(false);

  // Check permissions
  const canApprove = canApproveRequisition(
    requisition,
    currentUserRole,
    currentUserId
  );
  const canReject = canRejectRequisition(
    requisition,
    currentUserRole,
    currentUserId
  );
  const canDisburse = canDisburseRequisition(requisition, currentUserRole);

  const hasActions = canApprove || canReject || canDisburse;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* View Details */}
          <DropdownMenuItem onClick={() => setIsDetailsDialogOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>

          {hasActions && <DropdownMenuSeparator />}

          {/* Approve */}
          {canApprove && (
            <DropdownMenuItem onClick={() => setIsApproveDialogOpen(true)}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Approve
            </DropdownMenuItem>
          )}

          {/* Reject */}
          {canReject && (
            <DropdownMenuItem onClick={() => setIsRejectDialogOpen(true)}>
              <XCircle className="mr-2 h-4 w-4 text-red-600" />
              Reject
            </DropdownMenuItem>
          )}

          {/* Disburse */}
          {canDisburse && (
            <DropdownMenuItem onClick={() => setIsDisburseDialogOpen(true)}>
              <DollarSign className="mr-2 h-4 w-4 text-blue-600" />
              Disburse Funds
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Details Dialog */}
      <RequisitionDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        requisition={requisition}
      />

      {/* Approve Dialog */}
      <ApproveRequisitionDialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
        requisition={requisition}
        onRequisitionUpdated={onRequisitionUpdated}
      />

      {/* Reject Dialog */}
      <RejectRequisitionDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        requisition={requisition}
        onRequisitionUpdated={onRequisitionUpdated}
      />

      {/* Disburse Dialog */}
      <DisburseRequisitionDialog
        open={isDisburseDialogOpen}
        onOpenChange={setIsDisburseDialogOpen}
        requisition={requisition}
        onRequisitionUpdated={onRequisitionUpdated}
      />
    </>
  );
}