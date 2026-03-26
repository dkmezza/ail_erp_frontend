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
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  getAllRetirementsSimple,
  getMyRetirements,
  searchRetirements,
  filterRetirementsByStatus,
} from '@/lib/retirements';
import { ExpenditureRetirement, RetirementStatus } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { RetirementsTable } from './components/retirements-table';
import { CreateRetirementDialog } from './components/create-retirement-dialog';

export default function RetirementsPage() {
  const user = useAuthStore((state) => state.user);
  const [retirements, setRetirements] = useState<ExpenditureRetirement[]>([]);
  const [filteredRetirements, setFilteredRetirements] = useState<ExpenditureRetirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RetirementStatus | 'all'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Determine if user can see all retirements or just their own
  const canViewAll = user?.role && ['FINANCE', 'ADMIN'].includes(user.role.toUpperCase());

  // Fetch retirements
  const fetchRetirements = async () => {
    try {
      setIsLoading(true);
      setError('');

      const data = canViewAll
        ? await getAllRetirementsSimple()
        : await getMyRetirements();

      // Ensure data is an array
      const retirementsArray = Array.isArray(data) ? data : [];

      setRetirements(retirementsArray);
      setFilteredRetirements(retirementsArray);
    } catch (err: any) {
      console.error('Error fetching retirements:', err);
      setError(err.message || 'Failed to load retirements');
      // Set empty arrays on error
      setRetirements([]);
      setFilteredRetirements([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRetirements();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = retirements;

    // Apply search
    result = searchRetirements(result, searchTerm);

    // Apply status filter
    result = filterRetirementsByStatus(result, statusFilter);

    setFilteredRetirements(result);
  }, [searchTerm, statusFilter, retirements]);

  const handleRetirementCreated = () => {
    fetchRetirements();
    setIsCreateDialogOpen(false);
  };

  const handleRetirementUpdated = () => {
    fetchRetirements();
  };

  // Calculate stats
  const stats = {
    total: retirements.length,
    pending: retirements.filter((r) => r.status === 'PENDING').length,
    approved: retirements.filter((r) => r.status === 'APPROVED').length,
    rejected: retirements.filter((r) => r.status === 'REJECTED').length,
    totalAmount: retirements.reduce((sum, r) => sum + r.amountExpensed, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenditure Retirements</h1>
          <p className="text-gray-600 mt-2">
            {canViewAll
              ? 'View and manage all expenditure retirements'
              : 'Submit and track your expenditure retirements'}
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Retirement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Retirements
            </CardTitle>
            <Receipt className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(stats.totalAmount)} spent
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
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Rejected
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-gray-500 mt-1">Need revision</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter retirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
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
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredRetirements.length} of {retirements.length} retirements
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

      {/* Retirements Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <RetirementsTable
          retirements={filteredRetirements}
          currentUserId={user?.id || 0}
          currentUserRole={user?.role || 'FIELD_STAFF'}
          onRetirementUpdated={handleRetirementUpdated}
        />
      )}

      {/* Create Retirement Dialog */}
      <CreateRetirementDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onRetirementCreated={handleRetirementCreated}
      />
    </div>
  );
}