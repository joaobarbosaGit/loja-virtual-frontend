import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

import { useAuth } from '../shared/hooks';

interface ProtectedRouteProps {
  children: ReactNode;
  role?: 'customer' | 'admin';
}

export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

