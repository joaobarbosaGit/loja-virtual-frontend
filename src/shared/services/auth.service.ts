import { AdminLoginCredentials, ApiLoginResponse, LoginCredentials, RegisterCredentials, User } from '../protocols';
import { environments } from '../environments';
import { api } from './api.service';

const mapUser = (response: ApiLoginResponse): User => ({
  id: String(response.user.codigo),
  name: response.user.nome,
  email: response.user.email ?? '',
  role: response.user.role,
});

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const { data } = await api.post<ApiLoginResponse>(`/loja/${environments.storeSlug}/login`, {
      email: credentials.email,
      senha: credentials.password,
    });
    const user = mapUser(data);

    localStorage.setItem('auth.token', data.token);
    localStorage.setItem('auth.user', JSON.stringify(user));

    return user;
  },

  async loginAdmin(credentials: AdminLoginCredentials): Promise<User> {
    const { data } = await api.post<ApiLoginResponse>('/auth/login', {
      empresa: credentials.company,
      usuario: credentials.username,
      senha: credentials.password,
    });
    const user = mapUser(data);

    localStorage.setItem('auth.token', data.token);
    localStorage.setItem('auth.user', JSON.stringify(user));

    return user;
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    const { data } = await api.post<ApiLoginResponse>(`/loja/${environments.storeSlug}/cadastro`, credentials);
    const user = mapUser(data);

    localStorage.setItem('auth.token', data.token);
    localStorage.setItem('auth.user', JSON.stringify(user));

    return user;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('auth.token');
    localStorage.removeItem('auth.user');
  },

  getStoredUser(): User | null {
    const storedUser = localStorage.getItem('auth.user');

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      localStorage.removeItem('auth.user');
      localStorage.removeItem('auth.token');
      return null;
    }
  },
};
