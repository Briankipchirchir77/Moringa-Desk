import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import './index.css';

// A real Flask + PostgreSQL backend now exists (see /backend). When
// VITE_API_URL points to it, use it directly and skip the mock entirely.
// When it's unset (e.g. the deployed Vercel build before the backend is
// deployed too), fall back to the MSW mock API (see src/mocks/) so the
// app still works standalone.
async function enableMocking() {
  if (import.meta.env.VITE_API_URL) return;
  const { worker } = await import('./mocks/browser');
  return worker.start({ onUnhandledRequest: 'bypass' });
}

const root = ReactDOM.createRoot(document.getElementById('root'));

enableMocking().then(() => {
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
  );
});
