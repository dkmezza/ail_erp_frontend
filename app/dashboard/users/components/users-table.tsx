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
import { User } from '@/types';
import { formatDate } from '@/lib/utils';
import { getRoleDisplayName } from '@/lib/auth';
import { UserActions } from './user-actions';
import { ArrowUpDown } from 'lucide-react';

interface UsersTableProps {
  users: User[];
  currentUserId: number;
  onUserUpdated: () => void;
  onUserDeleted: () => void;
}

type SortField = 'name' | 'email' | 'role' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export function UsersTable({
  users,
  currentUserId,
  onUserUpdated,
  onUserDeleted,
}: UsersTableProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Sort users
  const sortedUsers = [...users].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

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

  const getRoleBadgeVariant = (role: User['role']) => {
    const variants: Record<User['role'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
      ADMIN: 'destructive',
      APPROVER: 'default',
      FINANCE: 'secondary',
      FIELD_STAFF: 'outline',
    };
    return variants[role];
  };

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
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
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Name
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('email')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Email
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('role')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Role
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Created
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name}
                    {user.id === currentUserId && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        You
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-gray-600">
                    {user.phone || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {user.department || '-'}
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserActions
                      user={user}
                      isCurrentUser={user.id === currentUserId}
                      onUserUpdated={onUserUpdated}
                      onUserDeleted={onUserDeleted}
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