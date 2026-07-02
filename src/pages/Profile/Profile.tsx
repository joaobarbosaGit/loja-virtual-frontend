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
    latitude?: number;
    longitude?: number;
  };
  paymentMethods: PaymentMethod[];
}

const hasCoordinates = (address: ProfileData['address']) => Boolean(address.latitude && address.longitude);

const buildAddressSearch = (address: ProfileData['address']) => [
  `${address.street} ${address.number}`.trim(),
  address.district,
  address.city,
  address.state,
  address.zipCode,
  'Brasil',
].filter(Boolean).join(', ');

const geocodeAddress = async (address: ProfileData['address']) => {
  const params = new URLSearchParams({
    format: 'jsonv2',
    limit: '1',
    countrycodes: 'br',
    q: buildAddressSearch(address),
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
  if (!response.ok) return null;
  const [result] = await response.json() as { lat?: string; lon?: string }[];
  const latitude = Number(result?.lat);
  const longitude = Number(result?.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude: Number(latitude.toFixed(6)), longitude: Number(longitude.toFixed(6)) };
};
const emptyProfile: ProfileData = {
  name: '',
  email: '',
  cpf: '',
  phone: '',
  address: { street: '', number: '', complement: '', district: '', city: '', state: '', zipCode: '', latitude: 0, longitude: 0 },
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
  const [locating, setLocating] = useState(false);
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

  const address = (field: keyof ProfileData['address'], value: string | number) => {
    setProfile((current) => {
      if (field === 'latitude' || field === 'longitude') {
        return { ...current, address: { ...current.address, [field]: value } };
      }
      return { ...current, address: { ...current.address, [field]: value, latitude: 0, longitude: 0 } };
    });
  };

  const locateByCurrentPosition = () => {
    setMessage('');
    setError('');
    if (!navigator.geolocation) {
      setError('Seu navegador nao permite usar a localizacao atual.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setProfile((current) => ({
          ...current,
          address: {
            ...current.address,
            latitude: Number(position.coords.latitude.toFixed(6)),
            longitude: Number(position.coords.longitude.toFixed(6)),
          },
        }));
        setMessage('Localizacao atual vinculada ao endereco. Confira os dados e salve o perfil.');
        setLocating(false);
      },
      () => {
        setError('Nao foi possivel acessar sua localizacao atual.');
        setLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 },
    );
  };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      let nextProfile = profile;
      let coordinatesWereFound = hasCoordinates(profile.address);
      if (!coordinatesWereFound) {
        const coordinates = await geocodeAddress(profile.address);
        if (coordinates) {
          coordinatesWereFound = true;
          nextProfile = { ...profile, address: { ...profile.address, ...coordinates } };
        }
      }

      const { data } = await api.put<ProfileData>('/loja/perfil', nextProfile);
      setProfile(normalizeProfile(data));
      setMessage(coordinatesWereFound ? 'Perfil e endereco salvos.' : 'Perfil salvo. Nao conseguimos localizar o endereco automaticamente; no checkout use retirada no local ou tente usar sua localizacao atual.');
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
                <Alert severity={hasCoordinates(profile.address) ? 'success' : 'info'}>
                  {hasCoordinates(profile.address)
                    ? 'Endereco localizado para calculo de entrega.'
                    : 'Ao salvar, vamos tentar localizar seu endereco automaticamente para calcular a entrega.'}
                </Alert>
                <Button disabled={saving || locating} onClick={locateByCurrentPosition} variant="outlined">
                  {locating ? <CircularProgress size={20} /> : 'Usar minha localizacao atual'}
                </Button>
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

