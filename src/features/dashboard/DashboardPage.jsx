import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../auth/authSlice';

export const DashboardPage = ({ onNavigateToProfile }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {user?.name || 'User'}!</h1>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="card">
          <h3>Account Overview</h3>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role || 'Member'}</p>
          <button onClick={onNavigateToProfile}>Edit Profile</button>
        </div>

        <div className="card">
          <h3>Quick Stats</h3>
          <p><strong>Status:</strong> Active</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;