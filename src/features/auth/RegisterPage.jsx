import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerThunk, clearAuthError } from './authSlice';

export const RegisterPage = ({ onNavigateToLogin, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationError, setValidationError] = useState('');
  
  const dispatch = useDispatch();
  const { status, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && onRegisterSuccess) {
      onRegisterSuccess();
    }
  }, [isAuthenticated, onRegisterSuccess]);

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
    <div className="auth-container">
      <h2>Create Account</h2>
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
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
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
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Creating Account...' : 'Register'}
        </button>
      </form>
      <p>
        Already have an account?{' '}
        <button type="button" onClick={onNavigateToLogin}>
          Log in here
        </button>
      </p>
    </div>
  );
};

export default RegisterPage;