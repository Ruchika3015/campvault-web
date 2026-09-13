import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';
import './index.css';

const THEME_KEY = 'campvault_theme';
const SETTINGS_KEY = 'campvault_settings';

function applyInitialTheme() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY) || localStorage.getItem('campusjugaad_settings');
    const theme = raw ? (JSON.parse(raw).appearance?.theme || 'dark') : (localStorage.getItem(THEME_KEY) || localStorage.getItem('campusjugaad_theme') || 'dark');
    const root = document.documentElement;
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else if (theme === 'system') {
      const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      root.setAttribute('data-theme', prefersLight ? 'light' : 'dark');
    } else root.setAttribute('data-theme', 'dark');
  } catch {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}
applyInitialTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
