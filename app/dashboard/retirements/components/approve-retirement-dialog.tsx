'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { approveRetirement } from '@/lib/retirements';
import { ExpenditureRetirement } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ApproveRetirementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  retirement: ExpenditureRetirement | null;
  onRetirementUpdated: () => void;
}

export function ApproveRetirementDialog({
  open,
  onOpenChange,
  retirement,
  onRetirementUpdated,
}: ApproveRetirementDialogProps) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async () => {
    if (!retirement) return;

    try {
      setIsLoading(true);
      setError('');
      setSuccess(false);

      await approveRetirement(retirement.id);

      setSuccess(true);

      // Close dialog and refresh list after short delay
      setTimeout(() => {
        setSuccess(false);
        onRetirementUpdated();
        onOpenChange(false);
      }, 1500);
    } catch (err: any) {
      console.error('Approve retirement error:', err);
      setError(err.message || 'Failed to approve retirement. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccess(false);
    onOpenChange(false);
  };

  if (!retirement) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Approve Retirement</DialogTitle>
          <DialogDescription>
            Review and approve this expenditure retirement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Success Alert */}
          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Retirement approved successfully!
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
            {retirement.attachments.length > 0 && (
              <div className="pt-2 border-t">
                <span className="text-gray-600">Attachments:</span>
                <p className="mt-1 text-blue-600">{retirement.attachments.length} file(s) attached</p>
              </div>
            )}
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              By approving this retirement, you confirm that the expenditure is valid
              and properly documented. The submitter will be notified.
            </AlertDescription>
          </Alert>

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
            <Button onClick={onSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                'Approve Retirement'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}