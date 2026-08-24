import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} from './notificationsApi';
import { Loading, ErrorMessage } from '../../components/common/StatusMessage';
import { timeAgo } from '../../utils/timeAgo';

// Every notification `type` the backend can emit, mapped to how it renders:
// which icon/tone it gets and which filter tab(s) it belongs under.
const TYPE_META = {
  vote: { icon: '🏅', label: 'UPVOTE', tone: 'accent', group: 'votes' },
  answer: { icon: '💬', label: 'REPLY', tone: 'navy', group: 'answers' },
  follow_response: { icon: '💬', label: 'FOLLOW', tone: 'navy', group: 'answers' },
  accepted: { icon: '✓', label: 'ACCEPTED', tone: 'solved', group: 'votes' },
  badge: { icon: '🏅', label: 'BADGE', tone: 'accent', group: 'votes' },
  system: { icon: '🔔', label: 'SYSTEM', tone: 'muted', group: 'system' },
};
const DEFAULT_META = { icon: '🔔', label: 'UPDATE', tone: 'muted', group: 'system' };

const FILTERS = [
  { id: 'all', label: 'All Notifications', mobileLabel: 'All' },
  { id: 'unread', label: 'Unread', mobileLabel: 'Unread' },
  { id: 'answers', label: 'Answers & Replies', mobileLabel: 'Answers' },
  { id: 'votes', label: 'Votes & Badges', mobileLabel: 'Votes' },
];

export default function NotificationsPage() {
  const user = useSelector(selectCurrentUser);
  const { data: notifications = [], isLoading, error } = useGetNotificationsQuery(user?.id, {
    skip: !user,
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [filter, setFilter] = useState('all');

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const visible = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.read);
    if (filter === 'answers' || filter === 'votes') {
      return notifications.filter((n) => (TYPE_META[n.type] ?? DEFAULT_META).group === filter);
    }
    return notifications;
  }, [notifications, filter]);

  const handleMarkAllRead = () => {
    notifications.filter((n) => !n.read).forEach((n) => markRead(n.id));
  };

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div>
            <h1>Your Notifications</h1>
            <p>Stay updated with replies to your questions, upvotes, and technical challenges.</p>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            Mark All Read
          </button>
        </div>
      </div>

      <div className="page page-tight">
        {isLoading && <Loading label="Loading notifications…" />}
        {error && <ErrorMessage error={error} fallback="Couldn't load notifications." />}

        {!isLoading && (
          <div className="questions-toolbar">
            <div className="filter-tabs">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`filter-tab${filter === f.id ? ' active' : ''}`}
                  onClick={() => setFilter(f.id)}
                >
                  <span className="filter-tab-full">{f.label}</span>
                  <span className="filter-tab-short">{f.mobileLabel}</span>
                </button>
              ))}
            </div>
            <p className="questions-count">
              Showing <strong>{unreadCount}</strong> unread notification{unreadCount === 1 ? '' : 's'}
            </p>
          </div>
        )}

        {!isLoading && visible.length === 0 && (
          <p className="empty-state">Nothing here yet.</p>
        )}

        <ul className="notification-list">
          {visible.map((notification) => {
            const meta = TYPE_META[notification.type] ?? DEFAULT_META;
            return (
              <li
                key={notification.id}
                className={`notification-card${notification.read ? '' : ' notification-card-unread'}`}
              >
                <span className={`notification-card-icon notification-card-icon-${meta.tone}`} aria-hidden="true">
                  {meta.icon}
                </span>
                <div className="notification-card-body">
                  <div className="notification-card-head">
                    <span className="badge notification-type-badge">{meta.label}</span>
                    {!notification.read && <span className="notification-dot" aria-hidden="true" />}
                  </div>
                  <p>{notification.message}</p>
                </div>
                <div className="notification-card-footer">
                  <span className="notification-card-time">{timeAgo(notification.createdAt)}</span>
                  {!notification.read && (
                    <button
                      type="button"
                      className="notification-read-btn"
                      onClick={() => markRead(notification.id)}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
