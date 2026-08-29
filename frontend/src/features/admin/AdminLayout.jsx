import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div>
            <h1>Admin</h1>
            <p>Manage accounts, moderate content, curate FAQs, and track activity.</p>
          </div>
        </div>
      </div>

      <div className="page page-tight admin-page">
        <nav className="admin-tabs">
          <NavLink to="/admin/users">Users</NavLink>
          <NavLink to="/admin/content">Flagged content</NavLink>
          <NavLink to="/admin/faqs">FAQs</NavLink>
          <NavLink to="/admin/reports">Reports</NavLink>
        </nav>
        <div className="admin-panel">
          <Outlet />
        </div>
      </div>
    </>
  );
}