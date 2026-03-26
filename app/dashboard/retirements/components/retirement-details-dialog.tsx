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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExpenditureRetirement } from '@/types';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { getRetirementStatusBadgeVariant, getRetirementStatusDisplayText, downloadAttachment } from '@/lib/retirements';
import {
  Receipt,
  User,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
} from 'lucide-react';

import { Loader2 } from 'lucide-react';

interface RetirementDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  retirement: ExpenditureRetirement | null;
}

export function RetirementDetailsDialog({
  open,
  onOpenChange,
  retirement,
}: RetirementDetailsDialogProps) {
  const [downloading, setDownloading] = useState(false);

  if (!retirement) return null;

  const handleDownloadAttachment = async (attachmentId: number, filename: string) => {
    try {
      setDownloading(true);
      await downloadAttachment(attachmentId, filename);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setDownloading(false);
    }
  };

  const amountRemaining = retirement.amountReceived - retirement.amountExpensed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Retirement Details</DialogTitle>
            <Badge variant={getRetirementStatusBadgeVariant(retirement.status)}>
              {getRetirementStatusDisplayText(retirement.status)}
            </Badge>
          </div>
          <DialogDescription>
            View complete expenditure retirement information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Header Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600">Retirement Number</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {retirement.retirementNumber}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Requisition: {retirement.requisition.requisitionNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600">Submitted By</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {retirement.submittedBy.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {retirement.submittedBy.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <div>
                    <p className="text-xs text-gray-600">Amount Received</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(retirement.amountReceived)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Amount Expensed</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(retirement.amountExpensed)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Remaining</p>
                    <p className={`text-sm font-bold ${amountRemaining === 0 ? 'text-green-600' : amountRemaining < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                      {formatCurrency(amountRemaining)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Employee Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Employee Information
            </h3>
            <div className="bg-gray-50 p-3 rounded space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Name:</span>
                <span className="text-sm font-medium text-gray-900">{retirement.employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Title:</span>
                <span className="text-sm font-medium text-gray-900">{retirement.employeeTitle}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Line Items */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Expense Items ({retirement.lineItems.length})
            </h3>
            {retirement.lineItems.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Date</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Description</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-700">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {retirement.lineItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3 text-gray-600">
                          {new Date(item.date).toLocaleDateString('en-GB')}
                        </td>
                        <td className="py-2 px-3 text-gray-900">{item.description}</td>
                        <td className="py-2 px-3 text-right font-medium text-gray-900">
                          {formatCurrency(item.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t">
                    <tr>
                      <td colSpan={2} className="py-2 px-3 font-semibold text-gray-900">Total</td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900">
                        {formatCurrency(retirement.amountExpensed)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No line items added</p>
            )}
          </div>

          {/* Attachments */}
          {retirement.attachments.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Attachments ({retirement.attachments.length})
                </h3>
                <div className="space-y-2">
                  {retirement.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                          <Receipt className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attachment.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {(attachment.fileSize / 1024).toFixed(2)} KB • Uploaded {new Date(attachment.uploadedAt).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadAttachment(attachment.id, attachment.fileName)}
                        disabled={downloading}
                      >
                        {downloading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Status Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Status Timeline</h3>
            <div className="space-y-3">
              {/* Submitted */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">Submitted</p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(retirement.createdAt)}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    By {retirement.submittedBy.name}
                  </p>
                </div>
              </div>

              {/* Approved */}
              {retirement.status === 'APPROVED' && retirement.financeApprovedAt && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">Approved by Finance</p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(retirement.financeApprovedAt)}
                      </p>
                    </div>
                    {retirement.financeApprovedBy && (
                      <p className="text-xs text-gray-600 mt-1">
                        By {retirement.financeApprovedBy.name}
                      </p>
                    )}
                    {retirement.financeNotes && (
                      <p className="text-xs text-gray-600 mt-1 bg-green-50 p-2 rounded">
                        Notes: {retirement.financeNotes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Rejected */}
              {retirement.status === 'REJECTED' && retirement.financeNotes && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">Rejected by Finance</p>
                      {retirement.financeApprovedAt && (
                        <p className="text-xs text-gray-500">
                          {formatDateTime(retirement.financeApprovedAt)}
                        </p>
                      )}
                    </div>
                    {retirement.financeApprovedBy && (
                      <p className="text-xs text-gray-600 mt-1">
                        By {retirement.financeApprovedBy.name}
                      </p>
                    )}
                    <p className="text-xs text-red-700 mt-1 bg-red-50 p-2 rounded">
                      Reason: {retirement.financeNotes}
                    </p>
                  </div>
                </div>
              )}

              {/* Pending */}
              {retirement.status === 'PENDING' && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Pending Finance Review</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Awaiting approval from finance department
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}