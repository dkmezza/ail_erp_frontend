'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Notification } from '@/types';
import { formatDateTime } from '@/lib/utils';
import {
  getNotificationIcon,
  getNotificationColor,
  formatNotificationType,
  markNotificationAsRead,
} from '@/lib/notifications';
import { Check, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: () => void;
}

export function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
  const router = useRouter();
  const [isMarking, setIsMarking] = useState(false);

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.isRead) return;

    try {
      setIsMarking(true);
      await markNotificationAsRead(notification.id);
      onMarkAsRead?.();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setIsMarking(false);
    }
  };

  const handleNavigate = () => {
    // Navigate to related entity if available
    if (notification.relatedEntityId) {
      if (notification.type.includes('REQUISITION')) {
        router.push(`/dashboard/requisitions`);
      } else if (notification.type.includes('RETIREMENT')) {
        router.push(`/dashboard/retirements`);
      }
    }

    // Mark as read when navigating
    if (!notification.isRead) {
      markNotificationAsRead(notification.id).catch(console.error);
      onMarkAsRead?.();
    }
  };

  const colorClass = getNotificationColor(notification.type);
  const icon = getNotificationIcon(notification.type);

  return (
    <Card
      className={`p-4 transition-all hover:shadow-md cursor-pointer ${
        !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
      }`}
      onClick={handleNavigate}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl ${colorClass}`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{notification.title}</h3>
            {!notification.isRead && (
              <Badge variant="default" className="bg-blue-600 text-xs shrink-0">
                New
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="font-medium">{formatNotificationType(notification.type)}</span>
              <span>•</span>
              <span>{formatDateTime(notification.createdAt)}</span>
            </div>

            <div className="flex items-center gap-2">
              {notification.relatedEntityId && (
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              )}

              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAsRead}
                  disabled={isMarking}
                  className="text-xs h-7"
                >
                  <Check className="h-3 w-3 mr-1" />
                  {isMarking ? 'Marking...' : 'Mark read'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}