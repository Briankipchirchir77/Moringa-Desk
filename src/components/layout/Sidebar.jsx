import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import Logo from './Logo';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/questions', label: 'Questions', icon: '?' },
  { to: '/ask', label: 'Ask Question', icon: '+' },
  { to: '/explore', label: 'Explore', icon: '🌐' },
  { to: '/faq', label: 'FAQ', icon: '📖' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export default function Sidebar() {
  const user = useSelector(selectCurrentUser);

  return (
    <aside className="sidebar">
      <NavLink to="/dashboard" className="sidebar-brand">
        <span className="logo-badge">
          <Logo tone="light" size={20} />
        </span>
        MoringaDesk
      </NavLink>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className="sidebar-link">
            <span className="sidebar-link-icon" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink to="/admin" className="sidebar-link">
            <span className="sidebar-link-icon" aria-hidden="true">
              ⚙
            </span>
            Admin
          </NavLink>
        )}
      </nav>

      <div className="sidebar-cohort-widget">
        <span>Weekly cohort target</span>
        <strong>94% Completion</strong>
        <div className="sidebar-progress">
          <div className="sidebar-progress-fill" style={{ width: '94%' }} />
        </div>
      </div>
    </aside>
  );
}