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
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../shared/hooks';
import { StoreLayout } from '../../shared/layouts/StoreLayout';
import { LoginCard } from '../Login/styles';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const [company, setCompany] = useState('1');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      await loginAdmin({ company: Number(company), username, password });
      navigate('/admin');
    } catch (requestError: any) {
      setErrorMessage(requestError.response?.data?.message ?? 'Nao foi possivel acessar a administracao.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StoreLayout showHeader={false}>
      <LoginCard>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack gap={3}>
            <Typography fontWeight={900} variant="h4">Acesso administrativo</Typography>
            <Typography color="text.secondary">
              Entre com empresa, usuario e senha administrativa.
            </Typography>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
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
              {isLoading ? <CircularProgress color="inherit" size={22} /> : 'Entrar'}
            </Button>
          </Stack>
        </Box>
      </LoginCard>
    </StoreLayout>
  );
};
