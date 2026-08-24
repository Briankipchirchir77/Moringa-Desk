import authReducer, { logout, clearAuthError } from './authSlice';

describe('authSlice reducer', () => {
  const initialState = {
    user: { id: 1, name: 'Alice' },
    token: 'fake-jwt-token',
    status: 'succeeded',
    error: 'Old error',
  };

  test('should return initial state when passed an empty action', () => {
    const result = authReducer(undefined, { type: '' });
    expect(result.status).toBe('idle');
    expect(result.user).toBeNull();
  });

  test('should handle logout action', () => {
    const nextState = authReducer(initialState, logout());
    expect(nextState.user).toBeNull();
    expect(nextState.token).toBeNull();
    expect(nextState.status).toBe('idle');
  });

  test('should handle clearAuthError action', () => {
    const nextState = authReducer(initialState, clearAuthError());
    expect(nextState.error).toBeNull();
    expect(nextState.user).toEqual({ id: 1, name: 'Alice' });
  });
});