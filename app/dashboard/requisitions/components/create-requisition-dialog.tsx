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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { createRequisition } from '@/lib/requisitions';
import { CreateRequisitionRequest } from '@/types';
import { DEPARTMENTS } from '@/types';
import { getTodayFormatted } from '@/lib/utils';

const createRequisitionSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  amountRequested: z
    .number()
    .positive('Amount must be greater than 0')
    .max(10000000, 'Amount cannot exceed 10,000,000 TZS'),
  department: z.string().min(1, 'Please select a department'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters'),
});

type CreateRequisitionFormData = z.infer<typeof createRequisitionSchema>;

interface CreateRequisitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequisitionCreated: () => void;
}

export function CreateRequisitionDialog({
  open,
  onOpenChange,
  onRequisitionCreated,
}: CreateRequisitionDialogProps) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<CreateRequisitionFormData>({
    resolver: zodResolver(createRequisitionSchema),
    defaultValues: {
      date: getTodayFormatted(),
    },
  });

  const onSubmit = async (data: CreateRequisitionFormData) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess(false);

      await createRequisition(data as CreateRequisitionRequest);

      setSuccess(true);
      reset({
        date: getTodayFormatted(),
      });

      // Close dialog and refresh list after short delay
      setTimeout(() => {
        setSuccess(false);
        onRequisitionCreated();
      }, 1500);
    } catch (err: any) {
      console.error('Create requisition error:', err);
      setError(err.message || 'Failed to create requisition. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset({
      date: getTodayFormatted(),
    });
    setError('');
    setSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Cash Requisition</DialogTitle>
          <DialogDescription>
            Submit a request for cash advance for business expenses
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Success Alert */}
          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Requisition created successfully!
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

          {/* Two Column Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Date Field */}
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
                disabled={isLoading}
              />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            {/* Amount Field */}
            <div className="space-y-2">
              <Label htmlFor="amountRequested">Amount (TZS) *</Label>
              <Input
                id="amountRequested"
                type="number"
                step="0.01"
                placeholder="50000.00"
                {...register('amountRequested', { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.amountRequested && (
                <p className="text-sm text-red-600">
                  {errors.amountRequested.message}
                </p>
              )}
            </div>

            {/* Department Field */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                onValueChange={(value) => setValue('department', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-red-600">
                  {errors.department.message}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed description of what the funds will be used for..."
                rows={4}
                {...register('description')}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Minimum 10 characters, maximum 500 characters
              </p>
            </div>
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
                  Creating...
                </>
              ) : (
                'Create Requisition'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}