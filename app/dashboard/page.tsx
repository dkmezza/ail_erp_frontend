'use client';

import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Receipt, Bell, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || 'User';

  const stats = [
    {
      title: 'Pending Requisitions',
      value: '0',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Approved Requisitions',
      value: '0',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Retirements',
      value: '0',
      icon: Receipt,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Unread Notifications',
      value: '0',
      icon: Bell,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userName}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your cash management activities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks you can perform
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button asChild variant="outline" className="h-auto flex-col items-start p-4">
            <Link href="/dashboard/requisitions">
              <FileText className="h-5 w-5 mb-2 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold">View Requisitions</div>
                <div className="text-xs text-gray-500">
                  Browse all cash requisitions
                </div>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto flex-col items-start p-4">
            <Link href="/dashboard/retirements">
              <Receipt className="h-5 w-5 mb-2 text-green-600" />
              <div className="text-left">
                <div className="font-semibold">View Retirements</div>
                <div className="text-xs text-gray-500">
                  Browse expenditure retirements
                </div>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto flex-col items-start p-4">
            <Link href="/dashboard/notifications">
              <Bell className="h-5 w-5 mb-2 text-purple-600" />
              <div className="text-left">
                <div className="font-semibold">Notifications</div>
                <div className="text-xs text-gray-500">
                  Check your notifications
                </div>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Your Role:</span>
            <span className="font-medium">{user?.role.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Department:</span>
            <span className="font-medium">{user?.department || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Account Status:</span>
            <span className="font-medium text-green-600">Active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}