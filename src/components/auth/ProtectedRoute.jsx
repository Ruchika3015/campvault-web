import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Wraps a page that requires authentication.
 * Redirects unauthenticated users to /login, preserving the intended destination.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-bg-0">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-amber anim-led-pulse" />
          <span className="font-technical text-[10px] text-ink-3">VERIFYING ACCESS...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

/**
 * Wraps a page meant only for guests (login, signup).
 * Redirects already-authenticated users to /dashboard.
 */
export function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-bg-0">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-mint anim-led-pulse" />
          <span className="font-technical text-[10px] text-ink-3">CHECKING SESSION...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
