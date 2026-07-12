import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '@/lib/auth';

interface ProtectedRouteProps {
  /** If provided, only users with one of these roles can access this route */
  roles?: UserRole[];
}

/**
 * Wraps routes that require authentication.
 * - Unauthenticated → redirect to /login
 * - Authenticated but wrong role → redirect to /unauthorized
 * - Authenticated + correct role → render child routes
 */
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !hasRole(...roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
