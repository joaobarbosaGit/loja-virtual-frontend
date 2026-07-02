import { FormEvent, useEffect, useState } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../shared/hooks';
import { StoreLayout } from '../../shared/layouts/StoreLayout';
import { api } from '../../shared/services/api.service';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  isDefault: boolean;
}

interface ProfileData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address: {
    street: string;
    number: string;
    complement: string;
    district: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethods: PaymentMethod[];
}

const emptyProfile: ProfileData = {
  name: '',
  email: '',
  cpf: '',
  phone: '',
  address: { street: '', number: '', complement: '', district: '', city: '', state: '', zipCode: '' },
  paymentMethods: [],
};

const ufs = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const onlyDigits = (value: string, maxLength?: number) => {
  const digits = value.replace(/\D/g, '');
  return maxLength ? digits.slice(0, maxLength) : digits;
};

const maskCpf = (value: string) => onlyDigits(value, 11)
  .replace(/(\d{3})(\d)/, '$1.$2')
  .replace(/(\d{3})(\d)/, '$1.$2')
  .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

const maskPhone = (value: string) => {
  const digits = onlyDigits(value, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
};

const maskCep = (value: string) => onlyDigits(value, 8).replace(/(\d{5})(\d)/, '$1-$2');
const maskExpiry = (value: string) => onlyDigits(value, 4).replace(/(\d{2})(\d)/, '$1/$2');
const isValidExpiry = (value: string) => {
  const digits = onlyDigits(value, 4);
  if (digits.length !== 4) return false;
  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2, 4));
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return year > currentYear || (year === currentYear && month >= currentMonth);
};

const normalizeProfile = (profile: ProfileData): ProfileData => ({
  ...profile,
  cpf: maskCpf(profile.cpf),
  phone: maskPhone(profile.phone),
  address: {
    ...profile.address,
    state: profile.address.state.toUpperCase(),
    zipCode: maskCep(profile.address.zipCode),
  },
});

export const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [card, setCard] = useState({ cardNumber: '', holder: '', expiry: '', cvc: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const profileResponse = await api.get<ProfileData>('/loja/perfil');
      setProfile(normalizeProfile(profileResponse.data));
      setError('');
    } catch {
      setError('Nao foi possivel carregar seu perfil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const address = (field: keyof ProfileData['address'], value: string) => {
    setProfile((current) => ({ ...current, address: { ...current.address, [field]: value } }));
  };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const { data } = await api.put<ProfileData>('/loja/perfil', profile);
      setProfile(normalizeProfile(data));
      setMessage('Perfil e endereco salvos.');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel salvar o perfil.');
    } finally {
      setSaving(false);
    }
  };

  const addCard = async () => {
    const expiryDigits = onlyDigits(card.expiry, 4);
    const expiryMonth = Number(expiryDigits.slice(0, 2));
    const expiryYear = 2000 + Number(expiryDigits.slice(2, 4));

    setSaving(true);
    setMessage('');
    setError('');

    try {
      await api.post('/loja/perfil/pagamentos', {
        cardNumber: card.cardNumber,
        holder: card.holder,
        expiryMonth,
        expiryYear,
        cvc: onlyDigits(card.cvc, 4),
      });
      setCard({ cardNumber: '', holder: '', expiry: '', cvc: '' });
      await load();
      setMessage('Cartao tokenizado e salvo no ambiente mock.');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Cartao invalido.');
    } finally {
      setSaving(false);
    }
  };

  const removeCard = async (id: string) => {
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await api.delete(`/loja/perfil/pagamentos/${id}`);
      await load();
      setMessage('Cartao removido.');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel remover o cartao.');
    } finally {
      setSaving(false);
    }
  };

  const confirmLogout = async () => {
    await logout();
    setLogoutDialogOpen(false);
    navigate('/login', { replace: true });
  };

  const expiryDigits = onlyDigits(card.expiry, 4);
  const cvcDigits = onlyDigits(card.cvc, 4);
  const showExpiryError = expiryDigits.length === 4 && !isValidExpiry(card.expiry);
  const canAddCard = Boolean(card.cardNumber && card.holder && isValidExpiry(card.expiry) && cvcDigits.length >= 3);

  return (
    <StoreLayout>
      <Typography fontWeight={900} mb={3} variant="h4">Minha conta</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item md={7} xs={12}>
            <Paper component="form" onSubmit={saveProfile} sx={{ p: 3 }}>
              <Stack gap={2}>
                <Typography fontWeight={800} variant="h6">Dados pessoais e entrega</Typography>
                <TextField required label="Nome completo" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
                <TextField disabled label="E-mail" value={profile.email} />
                <Grid container spacing={2}>
                  <Grid item sm={6} xs={12}>
                    <TextField fullWidth label="CPF" placeholder="000.000.000-00" value={profile.cpf} onChange={(event) => setProfile({ ...profile, cpf: maskCpf(event.target.value) })} />
                  </Grid>
                  <Grid item sm={6} xs={12}>
                    <TextField fullWidth label="Telefone" placeholder="(00) 00000-0000" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: maskPhone(event.target.value) })} />
                  </Grid>
                </Grid>

                <Divider />
                <Typography fontWeight={700}>Endereco principal</Typography>
                <TextField required label="Rua" value={profile.address.street} onChange={(event) => address('street', event.target.value)} />
                <Grid container spacing={2}>
                  <Grid item sm={4} xs={12}>
                    <TextField required fullWidth label="Numero" value={profile.address.number} onChange={(event) => address('number', event.target.value)} />
                  </Grid>
                  <Grid item sm={8} xs={12}>
                    <TextField fullWidth label="Complemento" value={profile.address.complement} onChange={(event) => address('complement', event.target.value)} />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item sm={6} xs={12}>
                    <TextField required fullWidth label="Bairro" value={profile.address.district} onChange={(event) => address('district', event.target.value)} />
                  </Grid>
                  <Grid item sm={6} xs={12}>
                    <TextField required fullWidth label="Cidade" value={profile.address.city} onChange={(event) => address('city', event.target.value)} />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item sm={4} xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel id="profile-state-label">UF</InputLabel>
                      <Select label="UF" labelId="profile-state-label" value={profile.address.state} onChange={(event) => address('state', event.target.value)}>
                        {ufs.map((uf) => <MenuItem key={uf} value={uf}>{uf}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item sm={8} xs={12}>
                    <TextField required fullWidth label="CEP" placeholder="00000-000" value={profile.address.zipCode} onChange={(event) => address('zipCode', maskCep(event.target.value))} />
                  </Grid>
                </Grid>
                <Button disabled={saving} type="submit" variant="contained">
                  {saving ? <CircularProgress color="inherit" size={22} /> : 'Salvar perfil'}
                </Button>
              </Stack>
            </Paper>
          </Grid>

          <Grid item md={5} xs={12}>
            <Stack gap={3}>
              <Paper sx={{ p: 3 }}>
                <Stack gap={2}>
                  <Typography fontWeight={800} variant="h6">Meios de pagamento</Typography>
                  <Alert severity="info">Ambiente mock: o numero e transformado em token; apenas os ultimos 4 digitos ficam visiveis.</Alert>
                  {!profile.paymentMethods.length && <Typography color="text.secondary">Nenhum cartao salvo.</Typography>}
                  {profile.paymentMethods.map((method) => (
                    <Box alignItems="center" display="flex" gap={1} key={method.id}>
                      <Box flex={1}>
                        <Typography fontWeight={700}>{method.brand} final {method.last4}</Typography>
                      </Box>
                      <IconButton aria-label="Remover cartao" onClick={() => void removeCard(method.id)}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <TextField label="Numero do cartao de teste" value={card.cardNumber} onChange={(event) => setCard({ ...card, cardNumber: onlyDigits(event.target.value, 19) })} />
                  <TextField label="Nome no cartao" value={card.holder} onChange={(event) => setCard({ ...card, holder: event.target.value })} />
                  <Grid container spacing={2}>
                    <Grid item sm={6} xs={12}>
                      <TextField
                        error={showExpiryError}
                        fullWidth
                        helperText={showExpiryError ? 'Informe um mes entre 01 e 12 e uma data futura.' : ' '}
                        label="Vencimento"
                        placeholder="##/##"
                        value={card.expiry}
                        onChange={(event) => setCard({ ...card, expiry: maskExpiry(event.target.value) })}
                      />
                    </Grid>
                    <Grid item sm={6} xs={12}>
                      <TextField
                        fullWidth
                        helperText=" "
                        label="CVC"
                        value={card.cvc}
                        onChange={(event) => setCard({ ...card, cvc: onlyDigits(event.target.value, 4) })}
                      />
                    </Grid>
                  </Grid>
                  <Button disabled={saving || !canAddCard} onClick={() => void addCard()} variant="outlined">
                    Adicionar cartao
                  </Button>
                </Stack>
              </Paper>

              <Button color="error" onClick={() => setLogoutDialogOpen(true)} variant="text">Sair da conta</Button>
            </Stack>
          </Grid>
        </Grid>
      )}

      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
        <DialogTitle>Sair da conta?</DialogTitle>
        <DialogContent>
          <DialogContentText>Confirme se deseja encerrar sua sessao nesta loja.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>Cancelar</Button>
          <Button color="error" onClick={() => void confirmLogout()} variant="contained">Sair</Button>
        </DialogActions>
      </Dialog>
    </StoreLayout>
  );
};

