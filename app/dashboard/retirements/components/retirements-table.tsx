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
import { ExpenditureRetirement } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { getRetirementStatusBadgeVariant, getRetirementStatusDisplayText } from '@/lib/retirements';
import { RetirementActions } from './retirement-actions';
import { ArrowUpDown } from 'lucide-react';

interface RetirementsTableProps {
  retirements: ExpenditureRetirement[];
  currentUserId: number;
  currentUserRole: string;
  onRetirementUpdated: () => void;
}

type SortField = 'retirementNumber' | 'requisitionNumber' | 'amountExpensed' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export function RetirementsTable({
  retirements,
  currentUserId,
  currentUserRole,
  onRetirementUpdated,
}: RetirementsTableProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Sort retirements
  const sortedRetirements = [...retirements].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    // Handle nested requisition number
    if (sortField === 'requisitionNumber') {
      aValue = a.requisition.requisitionNumber;
      bValue = b.requisition.requisitionNumber;
    } else {
      aValue = a[sortField];
      bValue = b[sortField];
    }

    // Handle date sorting
    if (sortField === 'createdAt') {
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

  if (retirements.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">No retirements found</p>
            <p className="text-sm mt-1">
              {sortField === 'status'
                ? 'Try adjusting your filters'
                : 'Create your first retirement to get started'}
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
                    onClick={() => handleSort('retirementNumber')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Retirement #
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('requisitionNumber')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Requisition #
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>Submitter</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('amountExpensed')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Amount Expensed
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>Line Items</TableHead>
                <TableHead>Attachments</TableHead>
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
              {sortedRetirements.map((retirement) => (
                <TableRow key={retirement.id}>
                  <TableCell className="font-medium">
                    {retirement.retirementNumber}
                    {retirement.submittedBy?.id === currentUserId && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        You
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {retirement.requisition.requisitionNumber}
                  </TableCell>
                  <TableCell>{retirement.submittedBy?.name || 'N/A'}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(retirement.amountExpensed)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-gray-600">
                    {retirement.lineItems.length} item(s)
                  </TableCell>
                  <TableCell>
                    {retirement.attachments.length > 0 ? (
                      <Badge variant="outline" className="text-xs">
                        {retirement.attachments.length} file(s)
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRetirementStatusBadgeVariant(retirement.status)}>
                      {getRetirementStatusDisplayText(retirement.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <RetirementActions
                      retirement={retirement}
                      currentUserId={currentUserId}
                      currentUserRole={currentUserRole}
                      onRetirementUpdated={onRetirementUpdated}
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