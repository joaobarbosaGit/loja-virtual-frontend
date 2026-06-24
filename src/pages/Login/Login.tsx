import { FormEvent, useState } from 'react';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  Tabs,
  Tab,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../shared/hooks';
import { StoreLayout } from '../../shared/layouts/StoreLayout';
import { LoginCard } from './styles';

export const Login = () => {
  const navigate = useNavigate();
  const { login, loginAdmin, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>('login');
  const [company, setCompany] = useState('1');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const authenticatedUser = mode === 'admin'
        ? await loginAdmin({ company: Number(company), username, password })
        : mode === 'login'
          ? await login({ email, password })
          : await register({ name, email, password });
      navigate(authenticatedUser.role === 'admin' ? '/admin' : '/home');
    } catch (requestError: any) {
      setErrorMessage(requestError.response?.data?.message ?? 'Nao foi possivel acessar sua conta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StoreLayout showHeader={false}>
      <LoginCard>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack gap={3}>
            <Typography fontWeight={900} variant="h4">
              {mode === 'admin' ? 'Acesso administrativo' : mode === 'login' ? 'Acessar conta' : 'Criar conta'}
            </Typography>
            <Typography color="text.secondary">
              {mode === 'admin'
                ? 'Entre com empresa, usuario e senha administrativa.'
                : mode === 'login'
                  ? 'Entre com o e-mail e senha cadastrados para acessar a loja.'
                  : 'Cadastre-se para comprar, acompanhar pedidos e gerenciar seu perfil.'}
            </Typography>
            <Tabs value={mode} onChange={(_, value) => setMode(value)}>
              <Tab label="Entrar" value="login" />
              <Tab label="Cadastrar" value="register" />
              <Tab label="Administrador" value="admin" />
            </Tabs>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            {mode === 'register' && (
              <TextField
                fullWidth
                required
                label="Nome completo"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            )}
            {mode === 'admin' ? (
              <>
                <TextField
                  fullWidth
                  required
                  label="Empresa"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />
                <TextField
                  fullWidth
                  required
                  label="Usuario"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </>
            ) : (
              <TextField
                fullWidth
                required
                label="E-mail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            )}
            <TextField
              fullWidth
              required
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      onClick={() => setShowPassword((current) => !current)}
                    >
                      {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button size="large" type="submit" variant="contained">
              {isLoading ? <CircularProgress color="inherit" size={22} /> : mode === 'register' ? 'Criar conta' : 'Entrar'}
            </Button>
          </Stack>
        </Box>
      </LoginCard>
    </StoreLayout>
  );
};
