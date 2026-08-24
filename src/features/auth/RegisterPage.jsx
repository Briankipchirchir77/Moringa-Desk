import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  registerThunk,
  clearAuthError,
  selectAuthStatus,
  selectAuthError,
  selectIsAuthenticated,
} from './authSlice';
import Logo from '../../components/layout/Logo';

export const RegisterPage = ({ onNavigateToLogin, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationError, setValidationError] = useState('');

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
    if (onRegisterSuccess) onRegisterSuccess();
    else navigate('/dashboard');
  }, [isAuthenticated, onRegisterSuccess, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    setValidationError('');
    const { name, email, password } = formData;
    dispatch(registerThunk({ name, email, password }));
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
          <h2>Create your account</h2>
          <p>Join MoringaDesk with your Moringa School credentials</p>

          {(validationError || error) && (
            <div className="error-message">{validationError || error}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
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
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Creating Account…' : 'Register'}
            </button>
          </form>
          <p>
            Already have an account?{' '}
            {onNavigateToLogin ? (
              <button type="button" onClick={onNavigateToLogin}>
                Log in here
              </button>
            ) : (
              <Link to="/login">Log in here</Link>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
