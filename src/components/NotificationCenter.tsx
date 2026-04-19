
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Gavel,
  CreditCard,
  FileText,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import type { NotificationType } from '../types';

const NOTIF_ICON: Record<NotificationType, React.ElementType> = {
  settlement: CreditCard,
  legal: Gavel,
  billing: FileText,
  program: Info,
  'action-required': AlertTriangle,
};

const NOTIF_COLOR: Record<NotificationType, string> = {
  settlement: 'text-emerald-600 bg-emerald-50',
  legal: 'text-rose-600 bg-rose-50',
  billing: 'text-navy-600 bg-navy-50',
  program: 'text-blue-600 bg-blue-50',
  'action-required': 'text-amber-600 bg-amber-50',
};

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { state, markNotificationRead, markAllNotificationsRead, setCurrentView } = useApp();

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  const { notifications } = state;
  const grouped = (() => {
    const today: typeof notifications = [];
    const thisWeek: typeof notifications = [];
    const earlier: typeof notifications = [];
    const now = new Date();

    notifications.forEach((n) => {
      const diff = now.getTime() - new Date(n.timestamp).getTime();
      if (diff < 86400000) today.push(n);
      else if (diff < 7 * 86400000) thisWeek.push(n);
      else earlier.push(n);
    });

    return { today, thisWeek, earlier };
  })();

  const handleClick = (n: (typeof state.notifications)[0]) => {
    markNotificationRead(n.id);
    if (n.actionView) {
      setCurrentView(n.actionView);
      onClose();
    }
  };

  return (
    <>
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => (isOpen ? onClose() : undefined)}
        className="relative p-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-navy-700 transition-colors"
      >
        <Bell className="w-5 h-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-3 w-80 max-w-[calc(100vw-2rem)] bg-cream-50 rounded-2xl border border-cream-300 shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-cream-200">
              <h3 className="text-sm font-bold text-navy-900">Notifications</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs font-medium text-navy-500 hover:text-navy-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-cream-100 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-cream-100 text-navy-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {grouped.today.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-navy-400 uppercase tracking-wider">Today</p>
                  {grouped.today.map((n) => (
                    <NotificationItem key={n.id} notification={n} onClick={() => handleClick(n)} />
                  ))}
                </div>
              )}
              {grouped.thisWeek.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-navy-400 uppercase tracking-wider">This Week</p>
                  {grouped.thisWeek.map((n) => (
                    <NotificationItem key={n.id} notification={n} onClick={() => handleClick(n)} />
                  ))}
                </div>
              )}
              {grouped.earlier.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-navy-400 uppercase tracking-wider">Earlier</p>
                  {grouped.earlier.map((n) => (
                    <NotificationItem key={n.id} notification={n} onClick={() => handleClick(n)} />
                  ))}
                </div>
              )}
              {state.notifications.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-navy-400">No notifications yet.</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NotificationItem({
  notification,
  onClick,
}: {
  notification: (typeof useApp extends () => infer R ? R : never)['state']['notifications'][0];
  onClick: () => void;
}) {
  const Icon = NOTIF_ICON[notification.type];
  const color = NOTIF_COLOR[notification.type];
  const time = new Date(notification.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-cream-100 transition-colors ${
        notification.read ? 'opacity-70' : ''
      }`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-navy-900">{notification.title}</p>
        <p className="text-xs text-navy-500 mt-0.5 line-clamp-2">{notification.body}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-navy-400">{time}</span>
          {notification.actionLabel && (
            <span className="text-[10px] font-bold text-gold-600">{notification.actionLabel}</span>
          )}
        </div>
      </div>
      {!notification.read && <span className="w-2 h-2 bg-gold-500 rounded-full shrink-0 mt-1.5" />}
    </button>
  );
}
