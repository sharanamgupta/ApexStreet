import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '../dashboard/DashboardIcon.jsx';
import { getStoredToken } from '../../utils/auth.js';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Critical Fault Detected',
    message: 'Lamp SL003 in Park Zone reported complete light element failure.',
    time: '10:12 PM',
    type: 'critical', // critical, warning, info, success
    read: false,
    category: 'Alerts',
    link: '/street-lights',
  },
  {
    id: 'notif-2',
    title: 'Communication Delay',
    message: 'Grid controller SL027 in Main Road is experiencing latency.',
    time: '09:48 PM',
    type: 'warning',
    read: false,
    category: 'Alerts',
    link: '/street-lights',
  },
  {
    id: 'notif-[#notif-3]',
    title: 'Night Dimming Activated',
    message: 'System automation initiated 50% brightness reduction for night cycle.',
    time: '10:00 PM',
    type: 'info',
    read: false,
    category: 'Automation',
    link: '/automation',
  },
  {
    id: 'notif-4',
    title: 'Energy Target Achieved',
    message: 'Daily power reduction target exceeded by 18.6% across 6 city zones.',
    time: '08:30 PM',
    type: 'success',
    read: true,
    category: 'System',
    link: '/reports',
  },
  {
    id: 'notif-5',
    title: 'Zone Maintenance Required',
    message: 'Market Zone health dropped below 95%. Inspection recommended.',
    time: '07:15 PM',
    type: 'warning',
    read: true,
    category: 'Alerts',
    link: '/areas',
  },
];

const STORAGE_KEY = 'apexstreet-notifications';
const NOTIFICATIONS_UPDATED_EVENT = 'apexstreet-notifications-updated';

export function addNotification(notification) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const notifications = stored ? JSON.parse(stored) : DEFAULT_NOTIFICATIONS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([notification, ...notifications]));
    window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
  } catch (error) {
    console.error('Failed to add notification:', error);
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (err) {
      console.error('Failed to store notifications:', err);
    }
  }, [notifications]);

  useEffect(() => {
    const refreshNotifications = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setNotifications(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to refresh notifications:', error);
      }
    };

    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, refreshNotifications);
    return () => window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, refreshNotifications);
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/notifications', { headers: { Authorization: `Bearer ${getStoredToken()}` } })
      .then((response) => response.ok ? response.json() : [])
      .then((items) => { if (active && Array.isArray(items)) setNotifications(items.map((item) => ({ ...item, id: String(item.id), time: new Date(item.createdAt).toLocaleString(), category: 'Maintenance' }))); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    fetch(`/api/notifications/${id}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${getStoredToken()}` } }).catch(() => {});
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}

function NotificationsDrawer({ isOpen, onClose, notificationState }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');

  if (!isOpen) return null;

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = notificationState;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'Unread') return !n.read;
    if (activeTab === 'Alerts') return n.type === 'critical' || n.type === 'warning';
    return true;
  });

  const getTone = (type) => {
    switch (type) {
      case 'critical':
        return {
          badge: 'bg-[#ff9b8d]/15 text-[#ffb4a8] border-[#ff9b8d]/30',
          icon: 'warning',
          iconColor: 'text-[#ff9b8d]',
        };
      case 'warning':
        return {
          badge: 'bg-[#ffd36d]/15 text-[#ffe4a4] border-[#ffd36d]/30',
          icon: 'alert',
          iconColor: 'text-[#ffd36d]',
        };
      case 'success':
        return {
          badge: 'bg-[#73ffba]/15 text-[#b1ffd3] border-[#73ffba]/30',
          icon: 'check',
          iconColor: 'text-[#73ffba]',
        };
      default:
        return {
          badge: 'bg-[#72e7ff]/15 text-[#a8f2ff] border-[#72e7ff]/30',
          icon: 'bolt',
          iconColor: 'text-[#72e7ff]',
        };
    }
  };

  function handleItemClick(notif) {
    if (!notif.read) markAsRead(notif.id);
    if (notif.link) {
      onClose();
      navigate(notif.link);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-200">
      {/* Backdrop overlay */}
      <button
        className="fixed inset-0 cursor-default border-none bg-transparent"
        type="button"
        onClick={onClose}
        aria-label="Close notifications panel"
      />

      {/* Drawer Container */}
      <aside
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-cyan-200/14 bg-[#06111b]/98 p-6 shadow-[-20px_0_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-transform duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Notifications panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-200/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <DashboardIcon className="size-5 text-[#72e7ff]" name="bell" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-[#72e7ff] shadow-[0_0_12px_#72e7ff] animate-ping" />
              )}
            </div>
            <h2 className="text-lg font-black text-slate-50">System Notifications</h2>
            {unreadCount > 0 && (
              <span className="rounded-full border border-cyan-200/20 bg-cyan-300/15 px-2.5 py-0.5 text-xs font-black text-[#72e7ff]">
                {unreadCount} New
              </span>
            )}
          </div>
          <button
            className="grid size-9 place-items-center rounded-md border border-cyan-200/14 bg-cyan-300/8 text-[#91dff3] transition hover:scale-105 hover:bg-cyan-300/20"
            type="button"
            onClick={onClose}
            aria-label="Close panel"
          >
            <DashboardIcon className="size-5" name="x" />
          </button>
        </div>

        {/* Filter Tabs & Bulk Actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b border-cyan-200/10 pb-3">
          <div className="flex items-center gap-1 rounded-md border border-cyan-200/10 bg-[#05101a] p-1">
            {['All', 'Unread', 'Alerts'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded px-3 py-1 text-xs font-black transition ${
                  activeTab === tab
                    ? 'bg-cyan-300/15 text-[#72e7ff] shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-bold text-[#72e7ff] hover:underline"
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-bold text-slate-400 hover:text-[#ff9b8d] hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="grid h-64 place-content-center text-center">
              <DashboardIcon className="mx-auto size-12 text-slate-600 mb-2" name="bell" />
              <p className="text-sm font-extrabold text-slate-400">No notifications found</p>
              <p className="text-xs text-slate-500 mt-1">You are all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const tone = getTone(item.type);
              return (
                <div
                  key={item.id}
                  className={`group relative flex gap-3.5 rounded-lg border p-4 transition-all duration-150 ${
                    item.read
                      ? 'border-cyan-200/8 bg-[#05101a]/50 opacity-80'
                      : 'border-cyan-200/20 bg-[#071726]/90 shadow-md ring-1 ring-cyan-200/10'
                  }`}
                >
                  <div className={`grid size-9 shrink-0 place-items-center rounded-md border ${tone.badge}`}>
                    <DashboardIcon className={`size-4 ${tone.iconColor}`} name={tone.icon} />
                  </div>

                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => handleItemClick(item)}>
                    <div className="flex items-center justify-between gap-2">
                      <strong className="truncate text-sm font-black text-slate-100">{item.title}</strong>
                      <time className="shrink-0 text-[0.7rem] font-bold text-slate-400">{item.time}</time>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">{item.message}</p>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[0.68rem] font-black uppercase text-[#72e7ff]">
                        {item.category}
                      </span>
                      {!item.read && (
                        <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-[#72e7ff]">
                          <span className="size-1.5 rounded-full bg-[#72e7ff]" /> Unread
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-[#ff9b8d] transition p-1"
                    aria-label="Delete notification"
                  >
                    <DashboardIcon className="size-3.5" name="x" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}

export default NotificationsDrawer;
