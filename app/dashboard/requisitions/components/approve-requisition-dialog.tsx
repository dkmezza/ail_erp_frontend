'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { approveRequisition } from '@/lib/requisitions';
import { CashRequisition, ApproveRequisitionRequest } from '@/types';
import { formatCurrency } from '@/lib/utils';

const approveRequisitionSchema = z.object({
  approvedAmount: z
    .number()
    .positive('Amount must be greater than 0')
    .max(10000000, 'Amount cannot exceed 10,000,000 TZS'),
});

type ApproveRequisitionFormData = z.infer<typeof approveRequisitionSchema>;

interface ApproveRequisitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisition: CashRequisition | null;
  onRequisitionUpdated: () => void;
}

export function ApproveRequisitionDialog({
  open,
  onOpenChange,
  requisition,
  onRequisitionUpdated,
}: ApproveRequisitionDialogProps) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ApproveRequisitionFormData>({
    resolver: zodResolver(approveRequisitionSchema),
  });

  // Set default approved amount when requisition changes
  useState(() => {
    if (requisition) {
      setValue('approvedAmount', requisition.amountRequested);
    }
  });

  const onSubmit = async (data: ApproveRequisitionFormData) => {
    if (!requisition) return;

    try {
      setIsLoading(true);
      setError('');
      setSuccess(false);

      await approveRequisition(requisition.id, data as ApproveRequisitionRequest);

      setSuccess(true);

      // Close dialog and refresh list after short delay
      setTimeout(() => {
        setSuccess(false);
        onRequisitionUpdated();
        onOpenChange(false);
      }, 1500);
    } catch (err: any) {
      console.error('Approve requisition error:', err);
      setError(err.message || 'Failed to approve requisition. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError('');
    setSuccess(false);
    onOpenChange(false);
  };

  if (!requisition) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Approve Requisition</DialogTitle>
          <DialogDescription>
            Review and approve this cash requisition
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Success Alert */}
          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Requisition approved successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Requisition Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Requisition #:</span>
              <span className="font-medium">{requisition.requisitionNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Requester:</span>
              <span className="font-medium">{requisition.requestedBy.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Department:</span>
              <span className="font-medium">{requisition.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Requested Amount:</span>
              <span className="font-medium">
                {formatCurrency(requisition.amountRequested)}
              </span>
            </div>
            <div className="pt-2 border-t">
              <span className="text-gray-600">Description:</span>
              <p className="mt-1 text-gray-900">{requisition.description}</p>
            </div>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You can approve the full amount or modify it if needed. The requester
              will be notified of the approved amount.
            </AlertDescription>
          </Alert>

          {/* Approved Amount Field */}
          <div className="space-y-2">
            <Label htmlFor="approvedAmount">Approved Amount (TZS) *</Label>
            <Input
              id="approvedAmount"
              type="number"
              step="0.01"
              defaultValue={requisition.amountRequested}
              {...register('approvedAmount', { valueAsNumber: true })}
              disabled={isLoading}
            />
            {errors.approvedAmount && (
              <p className="text-sm text-red-600">
                {errors.approvedAmount.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Enter the amount you want to approve (can be different from requested)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                'Approve Requisition'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}