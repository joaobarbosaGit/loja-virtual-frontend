import { Alert, Box, Button, Chip, CircularProgress, Divider, FormControl, FormControlLabel, Paper, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { useCart } from '../../shared/hooks';
import { environments } from '../../shared/environments';
import { StoreLayout } from '../../shared/layouts/StoreLayout';
import { api, paymentService } from '../../shared/services';
import { formatCurrency } from '../../shared/utils';
import { CheckoutGrid } from './styles';

interface Profile { name: string; address: { street: string; number: string; district: string; city: string; state: string; zipCode: string }; paymentMethods: { id: string; brand: string; last4: string; isDefault: boolean }[] }
interface PaymentConfig { id: number; tipo: string; descricao: string; permiteParcelamento: boolean; maxParcelas: number; valorMinimoParcela: number; instrucoes?: string }

export const Checkout = () => {
  const navigate = useNavigate();
  const { clearCart, items, subtotal } = useCart();
  const [profile, setProfile] = useState<Profile>();
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);
  const [paymentConfigId, setPaymentConfigId] = useState<number | ''>('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [installments, setInstallments] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    void Promise.all([
      api.get<Profile>('/loja/perfil'),
      api.get<PaymentConfig[]>(`/loja/${environments.storeSlug}/pagamentos`),
    ]).then(([profileResponse, paymentsResponse]) => {
      setProfile(profileResponse.data);
      setPaymentConfigs(paymentsResponse.data);
      setPaymentMethodId(profileResponse.data.paymentMethods.find((method) => method.isDefault)?.id ?? profileResponse.data.paymentMethods[0]?.id ?? '');
      setPaymentConfigId(paymentsResponse.data[0]?.id ?? '');
    }).catch(() => setError('Nao foi possivel carregar os dados do checkout.')).finally(() => setLoading(false));
  }, []);
  const addressComplete = Boolean(profile?.address.street && profile.address.number && profile.address.city && profile.address.state && profile.address.zipCode);
  const selectedPayment = paymentConfigs.find((payment) => payment.id === paymentConfigId);
  const requiresSavedCard = selectedPayment?.tipo === 'CARTAO_CREDITO' || selectedPayment?.tipo === 'CARTAO_DEBITO';
  const installmentOptions = selectedPayment?.permiteParcelamento
    ? Array.from({ length: selectedPayment.maxParcelas }, (_, index) => index + 1).filter((option) => !selectedPayment.valorMinimoParcela || subtotal / option >= selectedPayment.valorMinimoParcela)
    : [1];
  const handleConfirmOrder = async () => {
    setIsSubmitting(true); setError('');
    try {
      const result = await paymentService.startPayment({
        items: items.map((item) => ({ productId: item.product.code, quantity: item.quantity })),
        paymentMethodId: requiresSavedCard ? paymentMethodId || undefined : undefined,
        paymentConfigId: selectedPayment?.id,
        paymentType: selectedPayment?.tipo,
        installments,
      });
      await clearCart();
      setMessage(`Pedido #${result.orderId} confirmado.`);
      setTimeout(() => navigate('/profile'), 1800);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel finalizar o pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return <StoreLayout><Typography fontWeight={900} mb={3} variant="h4">Finalizar compra</Typography>{loading ? <Box display="flex" justifyContent="center"><CircularProgress /></Box> : <CheckoutGrid>
    <Paper sx={{ p: 3 }}><Stack gap={2}><Typography fontWeight={800} variant="h6">Entrega</Typography>{profile && addressComplete ? <><Typography fontWeight={700}>{profile.name}</Typography><Typography color="text.secondary">{profile.address.street}, {profile.address.number}<br />{profile.address.district} - {profile.address.city}/{profile.address.state}<br />CEP {profile.address.zipCode}</Typography><Button component={RouterLink} to="/profile" variant="outlined">Alterar endereco</Button></> : <Alert action={<Button component={RouterLink} to="/profile" color="inherit" size="small">Completar</Button>} severity="warning">Complete seu endereco antes de finalizar.</Alert>}
      <Divider /><Typography fontWeight={800} variant="h6">Pagamento</Typography>{paymentConfigs.length ? <FormControl><RadioGroup value={paymentConfigId} onChange={(e) => { setPaymentConfigId(Number(e.target.value)); setInstallments(1); }}>{paymentConfigs.map((method) => <FormControlLabel control={<Radio />} key={method.id} label={method.descricao} value={method.id} />)}</RadioGroup></FormControl> : <Alert severity="warning">Nenhuma forma de pagamento ativa para esta loja.</Alert>}{selectedPayment?.instrucoes && <Typography color="text.secondary">{selectedPayment.instrucoes}</Typography>}{requiresSavedCard && (profile?.paymentMethods.length ? <FormControl><RadioGroup value={paymentMethodId} onChange={(e) => setPaymentMethodId(e.target.value)}>{profile.paymentMethods.map((method) => <FormControlLabel control={<Radio />} key={method.id} label={`${method.brand} **** ${method.last4}`} value={method.id} />)}</RadioGroup></FormControl> : <Alert action={<Button component={RouterLink} to="/profile" color="inherit" size="small">Adicionar</Button>} severity="info">Adicione um cartao para usar esta forma de pagamento.</Alert>)}{selectedPayment?.permiteParcelamento && <FormControl><RadioGroup value={String(installments)} onChange={(e) => setInstallments(Number(e.target.value))}>{installmentOptions.map((option) => <FormControlLabel control={<Radio />} key={option} label={`${option}x de ${formatCurrency(subtotal / option)}`} value={String(option)} />)}</RadioGroup></FormControl>}</Stack></Paper>
    <Paper sx={{ p: 3 }}><Stack gap={2}><Typography fontWeight={800} variant="h6">Resumo</Typography>{items.map((item) => <Box display="flex" justifyContent="space-between" key={item.product.id}><Typography>{item.quantity}x {item.product.name}</Typography><Typography>{formatCurrency(item.product.price * item.quantity)}</Typography></Box>)}<Divider /><Box display="flex" justifyContent="space-between"><Typography>Total</Typography><Typography fontWeight={900} variant="h6">{formatCurrency(subtotal)}</Typography></Box>{message && <Alert severity="success">{message}</Alert>}{error && <Alert severity="error">{error}</Alert>}<Button disabled={!items.length || !addressComplete || !selectedPayment || (requiresSavedCard && !paymentMethodId) || isSubmitting} size="large" variant="contained" onClick={() => void handleConfirmOrder()}>{isSubmitting ? <CircularProgress color="inherit" size={22} /> : 'Confirmar pedido'}</Button></Stack></Paper>
  </CheckoutGrid>}</StoreLayout>;
};
