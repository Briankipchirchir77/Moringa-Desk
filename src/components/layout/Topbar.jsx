import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../../features/auth/authSlice';
import NotificationBell from '../../features/notifications/NotificationBell';
import Avatar from '../common/Avatar';
import Logo from './Logo';

const MENU_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/questions', label: 'Questions' },
  { to: '/ask', label: 'Ask Question' },
  { to: '/explore', label: 'Explore' },
  { to: '/faq', label: 'FAQ' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/profile', label: 'Profile' },
];

export default function Topbar() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setMenuOpen(false);
    if (search.trim()) {
      navigate(`/questions?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/questions');
    }
  };

  const handleLogout = () => {
    setMenuOpen(false);
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="topbar">
      <NavLink to="/dashboard" className="topbar-mobile-brand">
        <span className="logo-badge">
          <Logo tone="light" size={20} />
        </span>
        MoringaDesk
      </NavLink>

      <button
        type="button"
        className="topbar-hamburger"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-expanded={menuOpen}
        aria-label="Menu"
      >
        ☰
      </button>

      <form className="topbar-search" onSubmit={handleSearchSubmit} role="search">
        <span className="topbar-search-icon" aria-hidden="true">
          🔍
        </span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for questions, tags, or topics…"
          aria-label="Search"
        />
      </form>

      <div className="topbar-actions">
        {user ? (
          <>
            <NotificationBell />
            <NavLink to="/profile" className="topbar-user">
              <span className="topbar-user-text">
                <strong>{user.name}</strong>
                <small>{user.cohort || (user.role === 'admin' ? 'Admin' : 'Student')}</small>
              </span>
              <Avatar name={user.name} size={36} />
            </NavLink>
            <button type="button" className="btn btn-ghost topbar-logout" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="btn btn-ghost">
              Log in
            </NavLink>
            <NavLink to="/register" className="btn btn-primary">
              Sign up
            </NavLink>
          </>
        )}
      </div>

      {menuOpen && (
        <div className="topbar-mobile-menu">
          {MENU_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>
              {item.label}
            </NavLink>
          ))}
          {user ? (
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              Log out
            </button>
          ) : (
            <NavLink to="/login" onClick={() => setMenuOpen(false)}>
              Log in
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
}