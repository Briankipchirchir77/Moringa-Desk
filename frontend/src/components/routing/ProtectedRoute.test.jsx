import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import authReducer from '../../features/auth/authSlice';
import ProtectedRoute from './ProtectedRoute';

function renderProtected(authState) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: authState },
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/ask']}>
        <Routes>
          <Route path="/login" element={<p>Login page</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/ask" element={<p>Ask page</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe('ProtectedRoute', () => {
  test('renders the protected route when authenticated', () => {
    renderProtected({ token: 'abc', user: { id: '1', name: 'Test' } });
    expect(screen.getByText('Ask page')).toBeInTheDocument();
  });

  test('redirects to /login when not authenticated', () => {
    renderProtected({ token: null, user: null });
    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Ask page')).not.toBeInTheDocument();
  });
});