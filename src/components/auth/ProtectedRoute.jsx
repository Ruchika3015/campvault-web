import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/* ── Loading spinner ─────────────────────────────────────────────────────── */
function AuthSpinner({ label }) {
  return (
    <div className="min-h-screen grid place-items-center bg-bg-0">
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-amber anim-led-pulse" />
        <span className="font-technical text-[10px] text-ink-3">{label}</span>
      </div>
    </div>
  );
}

/**
 * ProtectedRoute — full 4-state route guard:
 *
 *   1. loading           → spinner (Clerk or sync not done yet)
 *   2. !isAuthenticated  → redirect to /login
 *   3. !profileComplete  → redirect to /complete-profile
 *   4. profileComplete   → render children
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, profileComplete, isDemoMode } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthSpinner label="VERIFYING ACCESS..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Demo mode bypasses profile completion (demo users are pre-complete)
  if (!isDemoMode && !profileComplete) {
    return <Navigate to="/complete-profile" replace state={{ from: location.pathname }} />;
  }

  return children;
}

/**
 * GuestRoute — redirects already-authenticated users away from auth pages.
 *
 * If profile is incomplete, send them to complete-profile, not dashboard.
 * If profile is complete, send them to dashboard.
 */
export function GuestRoute({ children }) {
  const { isAuthenticated, loading, profileComplete, isDemoMode } = useAuth();

  if (loading) {
    return <AuthSpinner label="CHECKING SESSION..." />;
  }

  if (isAuthenticated) {
    if (!isDemoMode && !profileComplete) {
      return <Navigate to="/complete-profile" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * RequireAuth — auth only, no profileComplete check.
 * Used to protect /complete-profile so unauthenticated users can't access it,
 * but authenticated users with incomplete profiles can.
 */
export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthSpinner label="VERIFYING ACCESS..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
