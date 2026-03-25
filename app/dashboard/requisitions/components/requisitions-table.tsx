'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CashRequisition } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { getStatusBadgeVariant, getStatusDisplayText } from '@/lib/requisitions';
import { RequisitionActions } from './requisition-actions';
import { ArrowUpDown } from 'lucide-react';

interface RequisitionsTableProps {
  requisitions: CashRequisition[];
  currentUserId: number;
  currentUserRole: string;
  onRequisitionUpdated: () => void;
}

type SortField = 'requisitionNumber' | 'date' | 'amountRequested' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export function RequisitionsTable({
  requisitions,
  currentUserId,
  currentUserRole,
  onRequisitionUpdated,
}: RequisitionsTableProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Sort requisitions
  const sortedRequisitions = [...requisitions].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle date sorting
    if (sortField === 'createdAt' || sortField === 'date') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // Handle string sorting
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (requisitions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">No requisitions found</p>
            <p className="text-sm mt-1">
              {sortField === 'status'
                ? 'Try adjusting your filters'
                : 'Create your first requisition to get started'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => handleSort('requisitionNumber')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Requisition #
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('amountRequested')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Amount
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Status
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRequisitions.map((requisition) => (
                <TableRow key={requisition.id}>
                  <TableCell className="font-medium">
                    {requisition.requisitionNumber}
                    {requisition.requestedBy.id === currentUserId && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        You
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(requisition.date)}</TableCell>
                  <TableCell>{requisition.requestedBy.name}</TableCell>
                  <TableCell className="text-gray-600">
                    {requisition.department}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(requisition.amountRequested)}
                    {requisition.approvedAmount &&
                      requisition.approvedAmount !== requisition.amountRequested && (
                        <div className="text-xs text-green-600">
                          Approved: {formatCurrency(requisition.approvedAmount)}
                        </div>
                      )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-gray-600">
                    {requisition.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(requisition.status)}>
                      {getStatusDisplayText(requisition.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <RequisitionActions
                      requisition={requisition}
                      currentUserId={currentUserId}
                      currentUserRole={currentUserRole}
                      onRequisitionUpdated={onRequisitionUpdated}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}