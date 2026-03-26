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
import { MoreVertical, Eye, CheckCircle, XCircle } from 'lucide-react';
import { ExpenditureRetirement } from '@/types';
import { canApproveRetirement, canRejectRetirement } from '@/lib/retirements';
import { RetirementDetailsDialog } from './retirement-details-dialog';
import { ApproveRetirementDialog } from './approve-retirement-dialog';
import { RejectRetirementDialog } from './reject-retirement-dialog';

interface RetirementActionsProps {
  retirement: ExpenditureRetirement;
  currentUserId: number;
  currentUserRole: string;
  onRetirementUpdated: () => void;
}

export function RetirementActions({
  retirement,
  currentUserId,
  currentUserRole,
  onRetirementUpdated,
}: RetirementActionsProps) {
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  // Check permissions
  const canApprove = canApproveRetirement(retirement, currentUserRole, currentUserId);
  const canReject = canRejectRetirement(retirement, currentUserRole, currentUserId);

  const hasActions = canApprove || canReject;

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
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Details Dialog */}
      <RetirementDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        retirement={retirement}
      />

      {/* Approve Dialog */}
      <ApproveRetirementDialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
        retirement={retirement}
        onRetirementUpdated={onRetirementUpdated}
      />

      {/* Reject Dialog */}
      <RejectRetirementDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        retirement={retirement}
        onRetirementUpdated={onRetirementUpdated}
      />
    </>
  );
}