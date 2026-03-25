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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { rejectRequisition } from '@/lib/requisitions';
import { CashRequisition, RejectRequisitionRequest } from '@/types';
import { formatCurrency } from '@/lib/utils';

const rejectRequisitionSchema = z.object({
  rejectionReason: z
    .string()
    .min(10, 'Rejection reason must be at least 10 characters')
    .max(500, 'Rejection reason cannot exceed 500 characters'),
});

type RejectRequisitionFormData = z.infer<typeof rejectRequisitionSchema>;

interface RejectRequisitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisition: CashRequisition | null;
  onRequisitionUpdated: () => void;
}

export function RejectRequisitionDialog({
  open,
  onOpenChange,
  requisition,
  onRequisitionUpdated,
}: RejectRequisitionDialogProps) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RejectRequisitionFormData>({
    resolver: zodResolver(rejectRequisitionSchema),
  });

  const onSubmit = async (data: RejectRequisitionFormData) => {
    if (!requisition) return;

    try {
      setIsLoading(true);
      setError('');
      setSuccess(false);

      await rejectRequisition(requisition.id, data as RejectRequisitionRequest);

      setSuccess(true);
      reset();

      // Close dialog and refresh list after short delay
      setTimeout(() => {
        setSuccess(false);
        onRequisitionUpdated();
        onOpenChange(false);
      }, 1500);
    } catch (err: any) {
      console.error('Reject requisition error:', err);
      setError(err.message || 'Failed to reject requisition. Please try again.');
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
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Reject Requisition
          </DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this requisition
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Success Alert */}
          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Requisition rejected successfully!
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
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">
                {formatCurrency(requisition.amountRequested)}
              </span>
            </div>
            <div className="pt-2 border-t">
              <span className="text-gray-600">Description:</span>
              <p className="mt-1 text-gray-900">{requisition.description}</p>
            </div>
          </div>

          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This action cannot be undone. The requester will be notified of the
              rejection.
            </AlertDescription>
          </Alert>

          {/* Rejection Reason Field */}
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">Rejection Reason *</Label>
            <Textarea
              id="rejectionReason"
              placeholder="Explain why this requisition is being rejected..."
              rows={4}
              {...register('rejectionReason')}
              disabled={isLoading}
            />
            {errors.rejectionReason && (
              <p className="text-sm text-red-600">
                {errors.rejectionReason.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Minimum 10 characters, maximum 500 characters
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
            <Button
              type="submit"
              variant="destructive"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Requisition'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}