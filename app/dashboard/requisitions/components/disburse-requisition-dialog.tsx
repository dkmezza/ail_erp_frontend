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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import { disburseRequisition } from '@/lib/requisitions';
import { CashRequisition, DisburseRequisitionRequest } from '@/types';
import { formatCurrency } from '@/lib/utils';

const disburseRequisitionSchema = z.object({
  paymentMethod: z.enum(['MOBILE_MONEY', 'BANK', 'CASH', 'CHEQUE']),
  paymentReference: z
    .string()
    .min(3, 'Payment reference must be at least 3 characters')
    .max(100, 'Payment reference cannot exceed 100 characters'),
});

type DisburseRequisitionFormData = z.infer<typeof disburseRequisitionSchema>;

interface DisburseRequisitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisition: CashRequisition | null;
  onRequisitionUpdated: () => void;
}

export function DisburseRequisitionDialog({
  open,
  onOpenChange,
  requisition,
  onRequisitionUpdated,
}: DisburseRequisitionDialogProps) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<DisburseRequisitionFormData>({
    resolver: zodResolver(disburseRequisitionSchema),
  });

  const onSubmit = async (data: DisburseRequisitionFormData) => {
    if (!requisition) return;

    try {
      setIsLoading(true);
      setError('');
      setSuccess(false);

      await disburseRequisition(requisition.id, data as DisburseRequisitionRequest);

      setSuccess(true);
      reset();

      // Close dialog and refresh list after short delay
      setTimeout(() => {
        setSuccess(false);
        onRequisitionUpdated();
        onOpenChange(false);
      }, 1500);
    } catch (err: any) {
      console.error('Disburse requisition error:', err);
      setError(err.message || 'Failed to disburse requisition. Please try again.');
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

  const amountToDisburse = requisition.approvedAmount || requisition.amountRequested;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Disburse Funds
          </DialogTitle>
          <DialogDescription>
            Record the payment details for this approved requisition
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Success Alert */}
          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Funds disbursed successfully!
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
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-gray-600">Amount to Disburse:</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(amountToDisburse)}
              </span>
            </div>
          </div>

          {/* Payment Method Field */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select
              onValueChange={(value) => setValue('paymentMethod', value as any)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                <SelectItem value="BANK">Bank Transfer</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CHEQUE">Cheque</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-sm text-red-600">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>

          {/* Payment Reference Field */}
          <div className="space-y-2">
            <Label htmlFor="paymentReference">Payment Reference *</Label>
            <Input
              id="paymentReference"
              placeholder="e.g., Transaction ID, Cheque #, Receipt #"
              {...register('paymentReference')}
              disabled={isLoading}
            />
            {errors.paymentReference && (
              <p className="text-sm text-red-600">
                {errors.paymentReference.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Enter transaction ID, cheque number, or other payment identifier
            </p>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Ensure the payment has been completed before marking as disbursed. The
              requester will be notified.
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Disbursement'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}