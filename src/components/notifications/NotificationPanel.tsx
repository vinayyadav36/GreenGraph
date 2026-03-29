import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState, type AppDispatch } from '../../store';
import {
  setNotifications,
  markRead,
  markAllRead,
  removeNotification,
} from '../../store/notificationsSlice';
import api from '../../lib/api';

const TYPE_STYLES: Record<string, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error: 'bg-red-50 border-red-200 text-red-800',
};

const TYPE_ICONS: Record<string, string> = {
  success: '✅',
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { items, unreadCount } = useSelector((state: RootState) => state.notifications);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleMarkRead = async (id: string) => {
    dispatch(markRead(id));
    try { await api.put(`/notifications/${id}/read`); } catch { /* offline ok */ }
  };

  const handleMarkAllRead = async () => {
    dispatch(markAllRead());
    try { await api.put('/notifications/read-all'); } catch { /* offline ok */ }
  };

  const handleDelete = async (id: string) => {
    dispatch(removeNotification(id));
    try { await api.delete(`/notifications/${id}`); } catch { /* offline ok */ }
  };

  const handleRefresh = async () => {
    try {
      const res = await api.get('/notifications');
      dispatch(setNotifications(res.data));
    } catch { /* offline ok */ }
  };

  useEffect(() => {
    handleRefresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-gray-900 text-sm">Notifications</h2>
          {unreadCount > 0 && (
            <span className="text-xs bg-blue-600 text-white rounded-full px-2 py-0.5 font-semibold">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            aria-label="Close notifications"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
        {items.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-3xl mb-3">🔔</div>
            <p className="text-sm text-gray-500">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">Subscribe to exams to get updates</p>
          </div>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${!n.read ? 'bg-blue-50/30' : ''}`}
              onClick={() => !n.read && handleMarkRead(n.id)}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg shrink-0">{TYPE_ICONS[n.type] || 'ℹ️'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-semibold truncate ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="shrink-0 w-2 h-2 bg-blue-600 rounded-full" aria-label="Unread" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">{timeAgo(n.createdAt)}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Delete notification"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
              {/* Category badge */}
              {n.examName && (
                <div className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full border ${TYPE_STYLES[n.type] || TYPE_STYLES.info}`}>
                  {n.examName}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-400 text-center">
          Subscribe to exams to receive live updates and reminders
        </p>
      </div>
    </div>
  );
}

export default NotificationPanel;
