export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AdminLoginCredentials {
  company: number;
  username: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  cpf?: string;
  phone?: string;
}

export interface ApiLoginResponse {
  token: string;
  user: {
    codigo: number;
    empresa: number;
    nome: string;
    email?: string;
    administrador?: string;
    role: 'customer' | 'admin';
  };
}
