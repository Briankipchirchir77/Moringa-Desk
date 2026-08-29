import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import { useGetNotificationsQuery } from './notificationsApi';

export default function NotificationBell() {
  const user = useSelector(selectCurrentUser);

  const { data: notifications = [] } = useGetNotificationsQuery(user?.id, {
    skip: !user,
    pollingInterval: 15000,
  });

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NavLink to="/notifications" className="notification-bell" aria-label="Notifications">
      🔔
      {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
    </NavLink>
  );
}
