import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import './index.css';

// Until a real backend exists, every build (dev AND production) runs
// against an MSW mock API (see src/mocks/) instead of a live server —
// there's nothing else for '/api/*' calls to hit, including on the
// deployed Vercel build, which is also mode: production.
async function enableMocking() {
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
