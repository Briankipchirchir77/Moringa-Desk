import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginThunk, clearAuthError, selectAuthStatus, selectAuthError, selectIsAuthenticated } from './authSlice';
import Logo from '../../components/layout/Logo';

export const LoginPage = ({ onNavigateToRegister, onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (onLoginSuccess) onLoginSuccess();
    else navigate('/dashboard');
  }, [isAuthenticated, onLoginSuccess, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginThunk(formData));
  };

  return (
    <div className="auth-split">
      <div className="auth-brand-panel">
        <div className="auth-brand-mark">
          <span className="logo-badge">
            <Logo tone="light" size={20} />
          </span>
          MoringaSchool
        </div>

        <div className="auth-brand-copy">
          <h1>Your Gateway to Moringa Programming Knowledge</h1>
          <p>Ask questions, vote on solutions, follow advanced software concepts, and grow with your fellow devs.</p>
        </div>

        <div className="auth-brand-stat">Over 10k+ Student Q&amp;As solved</div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-container">
          <h2>Welcome to MoringaDesk</h2>
          <p>Sign in with your Moringa School credentials</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Student Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="alex.kimani@moringaschool.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Signing In…' : 'Sign In'}
            </button>
          </form>
          <p>
            New to MoringaDesk?{' '}
            {onNavigateToRegister ? (
              <button type="button" onClick={onNavigateToRegister}>
                Create an account
              </button>
            ) : (
              <Link to="/register">Create an account</Link>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
