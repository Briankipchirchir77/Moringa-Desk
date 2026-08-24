import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginThunk, clearAuthError, selectAuthStatus, selectAuthError, selectIsAuthenticated } from './authSlice';
import Logo from '../../components/layout/Logo';

export const LoginPage = ({ onNavigateToRegister, onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotHint, setShowForgotHint] = useState(false);
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
          MoringaDesk
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
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Signing In…' : 'Sign In'}
            </button>
          </form>

          <button type="button" className="link-button" onClick={() => setShowForgotHint((v) => !v)}>
            Forgot your password?
          </button>
          {showForgotHint && (
            <p className="auth-inline-hint">
              Password resets aren't available in this demo — ask your instructor, or use one of the demo accounts below.
            </p>
          )}

          {onNavigateToRegister ? (
            <p>
              New to MoringaDesk?{' '}
              <button type="button" onClick={onNavigateToRegister}>
                Create an account
              </button>
            </p>
          ) : (
            <div className="auth-role-links">
              <span>New to MoringaDesk?</span>
              <div className="auth-role-links-row">
                <Link to="/register?role=student" className="auth-role-link auth-role-link-student">
                  Create student account
                </Link>
                <Link to="/register?role=admin" className="auth-role-link auth-role-link-admin">
                  Create admin account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
