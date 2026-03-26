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
import { rejectRetirement } from '@/lib/retirements';
import { ExpenditureRetirement, RejectRetirementRequest } from '@/types';
import { formatCurrency } from '@/lib/utils';

const rejectRetirementSchema = z.object({
  financeNotes: z
    .string()
    .min(10, 'Rejection reason must be at least 10 characters')
    .max(500, 'Rejection reason cannot exceed 500 characters'),
});

type RejectRetirementFormData = z.infer<typeof rejectRetirementSchema>;

interface RejectRetirementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  retirement: ExpenditureRetirement | null;
  onRetirementUpdated: () => void;
}

export function RejectRetirementDialog({
  open,
  onOpenChange,
  retirement,
  onRetirementUpdated,
}: RejectRetirementDialogProps) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RejectRetirementFormData>({
    resolver: zodResolver(rejectRetirementSchema),
  });

  const onSubmit = async (data: RejectRetirementFormData) => {
    if (!retirement) return;

    try {
      setIsLoading(true);
      setError('');
      setSuccess(false);

      await rejectRetirement(retirement.id, data as RejectRetirementRequest);

      setSuccess(true);
      reset();

      // Close dialog and refresh list after short delay
      setTimeout(() => {
        setSuccess(false);
        onRetirementUpdated();
        onOpenChange(false);
      }, 1500);
    } catch (err: any) {
      console.error('Reject retirement error:', err);
      setError(err.message || 'Failed to reject retirement. Please try again.');
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

  if (!retirement) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Reject Retirement
          </DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this retirement
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Success Alert */}
          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Retirement rejected successfully!
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

          {/* Retirement Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Retirement #:</span>
              <span className="font-medium">{retirement.retirementNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Requisition #:</span>
              <span className="font-medium">{retirement.requisition.requisitionNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Submitted By:</span>
              <span className="font-medium">{retirement.submittedBy.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Received:</span>
              <span className="font-medium">
                {formatCurrency(retirement.amountReceived)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Expensed:</span>
              <span className="font-medium">
                {formatCurrency(retirement.amountExpensed)}
              </span>
            </div>
            <div className="pt-2 border-t">
              <span className="text-gray-600">Line Items:</span>
              <p className="mt-1 text-gray-900">{retirement.lineItems.length} expense item(s)</p>
            </div>
          </div>

          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This action cannot be undone. The submitter will be notified of the
              rejection and will need to resubmit.
            </AlertDescription>
          </Alert>

          {/* Rejection Reason Field */}
          <div className="space-y-2">
            <Label htmlFor="financeNotes">Rejection Reason *</Label>
            <Textarea
              id="financeNotes"
              placeholder="Explain why this retirement is being rejected..."
              rows={4}
              {...register('financeNotes')}
              disabled={isLoading}
            />
            {errors.financeNotes && (
              <p className="text-sm text-red-600">
                {errors.financeNotes.message}
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
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Retirement'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}