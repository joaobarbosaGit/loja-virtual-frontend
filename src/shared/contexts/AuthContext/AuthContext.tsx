import { createContext, ReactNode, useMemo, useState } from 'react';

import { authService } from '../../services';
import { AdminLoginCredentials, LoginCredentials, RegisterCredentials, User } from '../../protocols';

interface AuthContextValue {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  loginAdmin: (credentials: AdminLoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser());

  const login = async (credentials: LoginCredentials) => {
    const authenticatedUser = await authService.login(credentials);
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const loginAdmin = async (credentials: AdminLoginCredentials) => {
    const authenticatedUser = await authService.loginAdmin(credentials);
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const register = async (credentials: RegisterCredentials) => {
    const authenticatedUser = await authService.register(credentials);
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      loginAdmin,
      register,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
