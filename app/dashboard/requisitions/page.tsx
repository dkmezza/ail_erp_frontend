'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  Plus,
  Search,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import {
  getAllRequisitionsSimple,
  getMyRequisitions,
  searchRequisitions,
  filterRequisitionsByStatus,
  filterRequisitionsByDepartment,
} from '@/lib/requisitions';
import { CashRequisition, RequisitionStatus } from '@/types';
import { DEPARTMENTS } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { RequisitionsTable } from './components/requisitions-table';
import { CreateRequisitionDialog } from './components/create-requisition-dialog';

export default function RequisitionsPage() {
  const user = useAuthStore((state) => state.user);
  const [requisitions, setRequisitions] = useState<CashRequisition[]>([]);
  const [filteredRequisitions, setFilteredRequisitions] = useState<CashRequisition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequisitionStatus | 'all'>('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Determine if user can see all requisitions or just their own
  const canViewAll = user?.role && ['APPROVER', 'FINANCE', 'ADMIN'].includes(user.role.toUpperCase());

  // Fetch requisitions
  const fetchRequisitions = async () => {
    try {
      setIsLoading(true);
      setError('');

      const data = canViewAll
        ? await getAllRequisitionsSimple()
        : await getMyRequisitions();

      // Ensure data is an array
      const requisitionsArray = Array.isArray(data) ? data : [];
      
      setRequisitions(requisitionsArray);
      setFilteredRequisitions(requisitionsArray);
    } catch (err: any) {
      console.error('Error fetching requisitions:', err);
      setError(err.message || 'Failed to load requisitions');
      // Set empty arrays on error
      setRequisitions([]);
      setFilteredRequisitions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = requisitions;

    // Apply search
    result = searchRequisitions(result, searchTerm);

    // Apply status filter
    result = filterRequisitionsByStatus(result, statusFilter);

    // Apply department filter
    result = filterRequisitionsByDepartment(result, departmentFilter);

    setFilteredRequisitions(result);
  }, [searchTerm, statusFilter, departmentFilter, requisitions]);

  const handleRequisitionCreated = () => {
    fetchRequisitions();
    setIsCreateDialogOpen(false);
  };

  const handleRequisitionUpdated = () => {
    fetchRequisitions();
  };

  // Calculate stats
  const stats = {
    total: requisitions.length,
    pending: requisitions.filter((r) => r.status === 'PENDING').length,
    approved: requisitions.filter((r) => r.status === 'APPROVED').length,
    rejected: requisitions.filter((r) => r.status === 'REJECTED').length,
    disbursed: requisitions.filter((r) => r.status === 'DISBURSED').length,
    totalAmount: requisitions.reduce((sum, r) => sum + r.amountRequested, 0),
    approvedAmount: requisitions
      .filter((r) => r.approvedAmount)
      .reduce((sum, r) => sum + (r.approvedAmount || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cash Requisitions</h1>
          <p className="text-gray-600 mt-2">
            {canViewAll
              ? 'View and manage all cash requisitions'
              : 'View and create your cash requisitions'}
          </p>
        </div>
        {user?.role && ['FIELD_STAFF', 'ADMIN'].includes(user.role) && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Requisition
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Requisitions
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(stats.totalAmount)} requested
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Approved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(stats.approvedAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Disbursed
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.disbursed}</div>
            <p className="text-xs text-gray-500 mt-1">Funds released</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter requisitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by number, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="DISBURSED">Disbursed</SelectItem>
              </SelectContent>
            </Select>

            {/* Department Filter */}
            {canViewAll && (
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredRequisitions.length} of {requisitions.length}{' '}
            requisitions
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Requisitions Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <RequisitionsTable
          requisitions={filteredRequisitions}
          currentUserId={user?.id || 0}
          currentUserRole={user?.role || 'FIELD_STAFF'}
          onRequisitionUpdated={handleRequisitionUpdated}
        />
      )}

      {/* Create Requisition Dialog */}
      <CreateRequisitionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onRequisitionCreated={handleRequisitionCreated}
      />
    </div>
  );
}