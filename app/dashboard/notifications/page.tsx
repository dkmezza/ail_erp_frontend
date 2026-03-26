'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NotificationCard } from './components/notification-card';
import {
  getAllNotifications,
  getUnreadNotifications,
  markAllNotificationsAsRead,
} from '@/lib/notifications';
import { Notification } from '@/types';
import { Bell, BellOff, CheckCheck, Loader2, AlertCircle, Inbox } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAll, setMarkingAll] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllNotifications();
      setNotifications(data);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await markAllNotificationsAsRead();
      await fetchNotifications();
    } catch (err: any) {
      console.error('Error marking all as read:', err);
      setError(err.message || 'Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  const displayedNotifications =
    activeTab === 'all'
      ? notifications
      : activeTab === 'unread'
      ? unreadNotifications
      : readNotifications;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Stay updated with all your activities</p>
        </div>

        {unreadNotifications.length > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            variant="outline"
            className="gap-2"
          >
            {markingAll ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Marking all...
              </>
            ) : (
              <>
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </>
            )}
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-gray-600 mt-1">All time notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <BellOff className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{unreadNotifications.length}</div>
            <p className="text-xs text-gray-600 mt-1">Notifications pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read</CardTitle>
            <CheckCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{readNotifications.length}</div>
            <p className="text-xs text-gray-600 mt-1">Already reviewed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            All
            <Badge variant="secondary" className="ml-1">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-2">
            Unread
            {unreadNotifications.length > 0 && (
              <Badge variant="default" className="ml-1 bg-blue-600">
                {unreadNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="read" className="gap-2">
            Read
            <Badge variant="secondary" className="ml-1">
              {readNotifications.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Content */}
        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            </Card>
          ) : displayedNotifications.length === 0 ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Inbox className="h-8 w-8 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900 mb-1">No notifications</p>
                  <p className="text-sm text-gray-600">
                    {activeTab === 'unread'
                      ? "You're all caught up! No unread notifications."
                      : activeTab === 'read'
                      ? 'No read notifications yet.'
                      : "You don't have any notifications yet."}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {displayedNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={fetchNotifications}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}