'use client';

import { useState, useEffect } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, Upload, X, Plus, Trash2 } from 'lucide-react';
import { createRetirement } from '@/lib/retirements';
import { getAllRequisitionsSimple } from '@/lib/requisitions';
import { CreateRetirementRequest, CashRequisition } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

const lineItemSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  cost: z.number().positive('Cost must be greater than 0'),
});

interface LineItemForm {
  date: string;
  description: string;
  cost: number;
}

interface CreateRetirementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRetirementCreated: () => void;
}

export function CreateRetirementDialog({
  open,
  onOpenChange,
  onRetirementCreated,
}: CreateRetirementDialogProps) {
  const user = useAuthStore((state) => state.user);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [requisitions, setRequisitions] = useState<CashRequisition[]>([]);
  const [loadingRequisitions, setLoadingRequisitions] = useState(false);
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<number | null>(null);
  const [lineItems, setLineItems] = useState<LineItemForm[]>([]);
  const [currentLineItem, setCurrentLineItem] = useState<LineItemForm>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    cost: 0,
  });

  const selectedRequisition = requisitions.find((r) => r.id === selectedRequisitionId);
  const amountReceived = selectedRequisition?.approvedAmount || selectedRequisition?.amountRequested || 0;
  const amountExpensed = lineItems.reduce((sum, item) => sum + item.cost, 0);
  const amountRemaining = amountReceived - amountExpensed;

  // Fetch approved/disbursed requisitions
  useEffect(() => {
    const fetchRequisitions = async () => {
      try {
        setLoadingRequisitions(true);
        const data = await getAllRequisitionsSimple();
        // Filter only DISBURSED requisitions without retirement
        const eligible = data.filter((r) => r.status === 'DISBURSED');
        setRequisitions(eligible);
      } catch (err) {
        console.error('Error fetching requisitions:', err);
      } finally {
        setLoadingRequisitions(false);
      }
    };

    if (open) {
      fetchRequisitions();
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validate total files
    if (files.length + selectedFiles.length > 20) {
      setError('Maximum 20 files allowed');
      return;
    }

    // Validate each file
    for (const file of selectedFiles) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`File ${file.name} is too large. Max size is 5MB`);
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError(`File ${file.name} is not allowed. Only images and PDFs are accepted`);
        return;
      }
    }

    setFiles([...files, ...selectedFiles]);
    setError('');
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const addLineItem = () => {
    try {
      lineItemSchema.parse(currentLineItem);
      setLineItems([...lineItems, currentLineItem]);
      setCurrentLineItem({
        date: new Date().toISOString().split('T')[0],
        description: '',
        cost: 0,
      });
      setError('');
    } catch (err: any) {
      setError(err.errors[0]?.message || 'Invalid line item data');
    }
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess(false);

      // Validate
      if (!selectedRequisitionId) {
        setError('Please select a requisition');
        return;
      }

      if (lineItems.length === 0) {
        setError('Please add at least one expense item');
        return;
      }

      if (!user?.name) {
        setError('User information not available');
        return;
      }

      const data: CreateRetirementRequest = {
        requisitionId: selectedRequisitionId,
        employeeName: user.name,
        employeeTitle: user.department || 'Staff',
        amountReceived: amountReceived,
        lineItems: lineItems,
      };

      await createRetirement(data, files);

      setSuccess(true);
      
      // Reset form
      setSelectedRequisitionId(null);
      setLineItems([]);
      setFiles([]);
      setCurrentLineItem({
        date: new Date().toISOString().split('T')[0],
        description: '',
        cost: 0,
      });

      // Close dialog and refresh list after short delay
      setTimeout(() => {
        setSuccess(false);
        onRetirementCreated();
      }, 1500);
    } catch (err: any) {
      console.error('Create retirement error:', err);
      setError(err.message || 'Failed to create retirement. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedRequisitionId(null);
    setLineItems([]);
    setFiles([]);
    setCurrentLineItem({
      date: new Date().toISOString().split('T')[0],
      description: '',
      cost: 0,
    });
    setError('');
    setSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Expenditure Retirement</DialogTitle>
          <DialogDescription>
            Retire cash advance by submitting itemized expenses and receipts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Success Alert */}
          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Retirement submitted successfully!
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

          {/* Requisition Selection */}
          <div className="space-y-2">
            <Label htmlFor="requisitionId">Select Requisition *</Label>
            <Select
              value={selectedRequisitionId?.toString()}
              onValueChange={(value) => setSelectedRequisitionId(parseInt(value))}
              disabled={isLoading || loadingRequisitions}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingRequisitions ? 'Loading...' : 'Select a requisition'} />
              </SelectTrigger>
              <SelectContent>
                {requisitions.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">
                    No eligible requisitions found
                  </div>
                ) : (
                  requisitions.map((req) => (
                    <SelectItem key={req.id} value={req.id.toString()}>
                      {req.requisitionNumber} - {formatCurrency(req.approvedAmount || req.amountRequested)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedRequisition && (
              <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                <p><strong>Department:</strong> {selectedRequisition.department}</p>
                <p><strong>Amount Received:</strong> {formatCurrency(amountReceived)}</p>
                <p><strong>Description:</strong> {selectedRequisition.description}</p>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <Label>Expense Items *</Label>
            
            {/* Add Line Item Form */}
            <div className="grid gap-2 md:grid-cols-4 p-3 bg-gray-50 rounded">
              <div>
                <Input
                  type="date"
                  value={currentLineItem.date}
                  onChange={(e) => setCurrentLineItem({ ...currentLineItem, date: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  placeholder="Description (e.g., Fuel, Meals, Lodging)"
                  value={currentLineItem.description}
                  onChange={(e) => setCurrentLineItem({ ...currentLineItem, description: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Cost"
                  value={currentLineItem.cost || ''}
                  onChange={(e) => setCurrentLineItem({ ...currentLineItem, cost: parseFloat(e.target.value) || 0 })}
                  disabled={isLoading}
                />
                <Button onClick={addLineItem} disabled={isLoading} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Line Items Table */}
            {lineItems.length > 0 && (
              <div className="border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-sm">{new Date(item.date).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell className="text-sm">{item.description}</TableCell>
                        <TableCell className="text-sm text-right">{formatCurrency(item.cost)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLineItem(index)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Totals */}
            {selectedRequisitionId && lineItems.length > 0 && (
              <div className="bg-blue-50 p-3 rounded space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Amount Received:</span>
                  <span>{formatCurrency(amountReceived)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount Expensed:</span>
                  <span>{formatCurrency(amountExpensed)}</span>
                </div>
                <div className={`flex justify-between font-bold ${amountRemaining < 0 ? 'text-red-600' : amountRemaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  <span>Amount Remaining:</span>
                  <span>{formatCurrency(amountRemaining)}</span>
                </div>
                {amountRemaining < 0 && (
                  <p className="text-xs text-red-600 mt-1">⚠️ You have overspent. Additional approval may be required.</p>
                )}
                {amountRemaining > 0 && (
                  <p className="text-xs text-orange-600 mt-1">⚠️ You have unspent funds. Please explain or return the excess.</p>
                )}
              </div>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="files">Receipts/Invoices (Optional, Max 20 files)</Label>
            
            {files.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF, PDF up to 5MB each (Max 20 files)
                </p>
                <Input
                  id="files"
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="hidden"
                />
                <label htmlFor="files">
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2"
                    disabled={isLoading}
                    onClick={() => document.getElementById('files')?.click()}
                  >
                    Choose Files
                  </Button>
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid gap-2">
                  {files.map((file, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                          <Upload className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                {files.length < 20 && (
                  <div>
                    <Input
                      id="files-more"
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={handleFileChange}
                      disabled={isLoading}
                      className="hidden"
                    />
                    <label htmlFor="files-more">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={isLoading}
                        onClick={() => document.getElementById('files-more')?.click()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add More Files ({files.length}/20)
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            )}
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
            <Button onClick={onSubmit} disabled={isLoading || lineItems.length === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Retirement'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}