import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetNotificationsQuery } from '../../features/notifications/notificationsApi';

const TAB_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/questions', label: 'Questions', icon: '?' },
  { to: '/ask', label: 'Ask', icon: '+' },
  { to: '/notifications', label: 'Alerts', icon: '🔔' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export default function MobileTabBar() {
  const user = useSelector(selectCurrentUser);
  const { data: notifications = [] } = useGetNotificationsQuery(user?.id, { skip: !user });
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="mobile-tabbar">
      {TAB_ITEMS.map((item) => (
        <NavLink key={item.to} to={item.to} className="mobile-tabbar-link">
          <span className="mobile-tabbar-icon" aria-hidden="true">
            {item.icon}
            {item.to === '/notifications' && unreadCount > 0 && (
              <span className="mobile-tabbar-dot" />
            )}
          </span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}