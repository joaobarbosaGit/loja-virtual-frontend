import { Navigate, Route, Routes } from 'react-router-dom';

import { Cart } from '../pages/Cart';
import { Checkout } from '../pages/Checkout';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { AdminDashboard } from '../pages/AdminDashboard';
import { AdminStore } from '../pages/AdminStore';
import { Orders } from '../pages/Orders';
import { ProductDetails } from '../pages/ProductDetails';
import { Products } from '../pages/Products';
import { Profile } from '../pages/Profile';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../shared/hooks';

const InitialRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return <Navigate to={user.role === 'admin' ? '/admin' : '/home'} replace />;
};

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<InitialRoute />} />
    <Route path="/login" element={<Login />} />
    <Route
      path="/home"
      element={(
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/products"
      element={(
        <ProtectedRoute>
          <Products />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/products/:productId"
      element={(
        <ProtectedRoute>
          <ProductDetails />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/cart"
      element={(
        <ProtectedRoute>
          <Cart />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/checkout"
      element={(
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/profile"
      element={(
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/orders"
      element={(
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/admin"
      element={(
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/admin/produtos-loja"
      element={(
        <ProtectedRoute role="admin">
          <AdminStore />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/admin/pedidos"
      element={(
        <ProtectedRoute role="admin">
          <AdminStore />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/admin/pagamentos"
      element={(
        <ProtectedRoute role="admin">
          <AdminStore />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/admin/destaques"
      element={(
        <ProtectedRoute role="admin">
          <AdminStore />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/admin/configuracoes"
      element={(
        <ProtectedRoute role="admin">
          <AdminStore />
        </ProtectedRoute>
      )}
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
