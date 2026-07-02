import CloseIcon from '@mui/icons-material/Close';
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  Switch,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { useCart } from '../../shared/hooks';
import { environments } from '../../shared/environments';
import { StoreLayout } from '../../shared/layouts/StoreLayout';
import { api, paymentService } from '../../shared/services';
import { formatCurrency } from '../../shared/utils';
import { CheckoutGrid } from './styles';

interface Profile {
  name: string;
  address: { street: string; number: string; district: string; city: string; state: string; zipCode: string };
  paymentMethods: { id: string; brand: string; last4: string; isDefault: boolean }[];
}

interface DeliveryQuote {
  enabled: boolean;
  available: boolean;
  distanceKm: number;
  fee: number;
  free: boolean;
  reason?: string;
}

interface PaymentConfig {
  id: number;
  tipo: string;
  descricao: string;
  permiteParcelamento: boolean;
  maxParcelas: number;
  valorMinimoParcela: number;
  recebeNaEntrega: boolean;
  instrucoes?: string;
}

type DeliveryMode = 'delivery' | 'pickup';

type CompletedOrder = {
  id: number;
  status: string;
  total: number;
  paymentDescription?: string;
  installments: number;
  deliveryFee: number;
  deliveryDistanceKm: number;
  deliveryMode: DeliveryMode;
  items: { id: string; name: string; quantity: number; total: number }[];
};

const celebrationPieces = Array.from({ length: 18 }, (_, index) => index);

const statusLabels: Record<string, string> = {
  PEDIDO_EM_PROCESSO: 'Pedido em processo',
  PEDIDO_ENVIADO: 'Pedido enviado',
  PEDIDO_EM_ROTA_DE_ENTREGA: 'Pedido em rota de entrega',
  PEDIDO_ENTREGUE: 'Pedido entregue',
  PEDIDO_CANCELADO: 'Pedido cancelado',
};

export const Checkout = () => {
  const navigate = useNavigate();
  const { clearCart, items, subtotal } = useCart();
  const [profile, setProfile] = useState<Profile>();
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);
  const [paymentConfigId, setPaymentConfigId] = useState<number | ''>('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [installments, setInstallments] = useState(1);
  const [receiveOnDelivery, setReceiveOnDelivery] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);
  const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuote | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);

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
  const deliveryUnavailable = Boolean(deliveryQuote?.enabled && !deliveryQuote.available);
  const deliveryFee = deliveryMode === 'delivery' && deliveryQuote?.available ? Number(deliveryQuote.fee) : 0;
  const orderTotal = subtotal + deliveryFee;
  const needsDeliveryAddress = deliveryMode === 'delivery';
  const selectedPayment = paymentConfigs.find((payment) => payment.id === paymentConfigId);
  const canReceiveOnDelivery = Boolean(selectedPayment?.recebeNaEntrega);
  const willReceiveOnDelivery = canReceiveOnDelivery && receiveOnDelivery;
  const requiresSavedCard = !willReceiveOnDelivery && (selectedPayment?.tipo === 'CARTAO_CREDITO' || selectedPayment?.tipo === 'CARTAO_DEBITO');
  const installmentOptions = selectedPayment?.permiteParcelamento
    ? Array.from({ length: selectedPayment.maxParcelas }, (_, index) => index + 1).filter((option) => !selectedPayment.valorMinimoParcela || orderTotal / option >= selectedPayment.valorMinimoParcela)
    : [1];

  useEffect(() => {
    if (loading) return;
    if (!addressComplete) {
      setDeliveryQuote(null);
      return;
    }
    let active = true;
    setDeliveryLoading(true);
    void api.post<DeliveryQuote>('/loja/entrega/cotacao', { subtotal })
      .then(({ data }) => {
        if (!active) return;
        setDeliveryQuote(data);
        if (data.enabled && !data.available) setDeliveryMode('pickup');
      })
      .catch((requestError: any) => {
        if (!active) return;
        setDeliveryQuote({ enabled: true, available: false, distanceKm: 0, fee: 0, free: false, reason: requestError.response?.data?.message ?? 'Nao foi possivel calcular a entrega.' });
        setDeliveryMode('pickup');
      })
      .finally(() => { if (active) setDeliveryLoading(false); });
    return () => { active = false; };
  }, [addressComplete, loading, subtotal]);

  const closeCompletedOrderDialog = () => {
    setCompletedOrder(null);
    navigate('/home');
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    setError('');

    const orderItems = items.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      total: item.product.price * item.quantity,
    }));

    try {
      const result = await paymentService.startPayment({
        items: items.map((item) => ({ productId: item.product.code, quantity: item.quantity })),
        paymentMethodId: requiresSavedCard ? paymentMethodId || undefined : undefined,
        paymentConfigId: selectedPayment?.id,
        paymentType: selectedPayment?.tipo,
        installments,
        receiveOnDelivery: willReceiveOnDelivery,
        deliveryMode,
      });
      await clearCart();
      setCompletedOrder({
        id: result.orderId,
        status: result.status,
        total: result.total,
        deliveryFee,
        deliveryDistanceKm: deliveryMode === 'delivery' ? deliveryQuote?.distanceKm ?? 0 : 0,
        deliveryMode,
        paymentDescription: selectedPayment?.descricao ? `${selectedPayment.descricao}${willReceiveOnDelivery ? (deliveryMode === 'pickup' ? ' - receber na retirada' : ' - receber na entrega') : ''}` : undefined,
        installments,
        items: orderItems,
      });
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel finalizar o pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StoreLayout>
      <Typography fontWeight={900} mb={3} variant="h4">Finalizar compra</Typography>
      {loading ? (
        <Box display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : (
        <CheckoutGrid>
          <Paper sx={{ p: 3 }}>
            <Stack gap={2}>
              <Typography fontWeight={800} variant="h6">Entrega</Typography>
              {profile && addressComplete ? (
                <>
                  <Typography fontWeight={700}>{profile.name}</Typography>
                  <Typography color="text.secondary">
                    {profile.address.street}, {profile.address.number}<br />
                    {profile.address.district} - {profile.address.city}/{profile.address.state}<br />
                    CEP {profile.address.zipCode}
                  </Typography>
                  <Button component={RouterLink} to="/profile" variant="outlined">Alterar endereco</Button>
                  {deliveryLoading && <Alert severity="info">Calculando entrega...</Alert>}
                  {deliveryQuote?.enabled && deliveryQuote.available && (
                    <Alert severity="success">
                      Entrega disponivel: {deliveryQuote.free ? 'gratis' : formatCurrency(deliveryQuote.fee)}{deliveryQuote.distanceKm ? ` - ${deliveryQuote.distanceKm} km da loja` : ''}.
                    </Alert>
                  )}
                  {deliveryUnavailable && (
                    <Alert severity="warning">
                      {deliveryQuote?.reason ?? 'Entrega indisponivel para este endereco.'} Sera possivel finalizar apenas com retirada no local.
                    </Alert>
                  )}
                </>
              ) : (
                <Alert action={<Button component={RouterLink} to="/profile" color="inherit" size="small">Completar</Button>} severity="warning">
                  Complete seu endereco para calcular a entrega. A retirada no local continua disponivel.
                </Alert>
              )}

              <FormControl>
                <RadioGroup value={deliveryMode} onChange={(event) => setDeliveryMode(event.target.value as DeliveryMode)}>
                  <FormControlLabel control={<Radio />} disabled={!addressComplete || deliveryLoading || deliveryUnavailable} label="Entrega no endereco" value="delivery" />
                  <FormControlLabel control={<Radio />} label="Retirada no local" value="pickup" />
                </RadioGroup>
              </FormControl>

              <Divider />
              <Typography fontWeight={800} variant="h6">Pagamento</Typography>
              {paymentConfigs.length ? (
                <FormControl>
                  <RadioGroup value={paymentConfigId} onChange={(event) => { setPaymentConfigId(Number(event.target.value)); setInstallments(1); setReceiveOnDelivery(false); }}>
                    {paymentConfigs.map((method) => <FormControlLabel control={<Radio />} key={method.id} label={method.descricao} value={method.id} />)}
                  </RadioGroup>
                </FormControl>
              ) : (
                <Alert severity="warning">Nenhuma forma de pagamento ativa para esta loja.</Alert>
              )}
              {selectedPayment?.instrucoes && <Typography color="text.secondary">{selectedPayment.instrucoes}</Typography>}
              {canReceiveOnDelivery && (
                <FormControlLabel
                  control={<Switch checked={receiveOnDelivery} onChange={(event) => setReceiveOnDelivery(event.target.checked)} />}
                  label={deliveryMode === 'pickup' ? 'Receber pagamento na retirada' : 'Receber pagamento na entrega'}
                />
              )}
              {requiresSavedCard && (profile?.paymentMethods.length ? (
                <FormControl>
                  <RadioGroup value={paymentMethodId} onChange={(event) => setPaymentMethodId(event.target.value)}>
                    {profile.paymentMethods.map((method) => <FormControlLabel control={<Radio />} key={method.id} label={`${method.brand} **** ${method.last4}`} value={method.id} />)}
                  </RadioGroup>
                </FormControl>
              ) : (
                <Alert action={<Button component={RouterLink} to="/profile" color="inherit" size="small">Adicionar</Button>} severity="info">
                  Adicione um cartao para usar esta forma de pagamento.
                </Alert>
              ))}
              {selectedPayment?.permiteParcelamento && (
                <FormControl>
                  <RadioGroup value={String(installments)} onChange={(event) => setInstallments(Number(event.target.value))}>
                    {installmentOptions.map((option) => <FormControlLabel control={<Radio />} key={option} label={`${option}x de ${formatCurrency(orderTotal / option)}`} value={String(option)} />)}
                  </RadioGroup>
                </FormControl>
              )}
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Stack gap={2}>
              <Typography fontWeight={800} variant="h6">Resumo</Typography>
              {items.map((item) => (
                <Box display="flex" justifyContent="space-between" key={item.product.id}>
                  <Typography>{item.quantity}x {item.product.name}</Typography>
                  <Typography>{formatCurrency(item.product.price * item.quantity)}</Typography>
                </Box>
              ))}
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography fontWeight={800}>{formatCurrency(subtotal)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">{deliveryMode === 'pickup' ? 'Retirada' : 'Frete'}</Typography>
                <Typography fontWeight={800}>{deliveryMode === 'pickup' ? 'Gratis' : deliveryLoading ? 'Calculando...' : formatCurrency(deliveryFee)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography>Total</Typography>
                <Typography fontWeight={900} variant="h6">{formatCurrency(orderTotal)}</Typography>
              </Box>
              {error && <Alert severity="error">{error}</Alert>}
              <Button
                disabled={!items.length || (needsDeliveryAddress && (!addressComplete || deliveryLoading || deliveryUnavailable)) || !selectedPayment || (requiresSavedCard && !paymentMethodId) || isSubmitting}
                size="large"
                variant="contained"
                onClick={() => void handleConfirmOrder()}
              >
                {isSubmitting ? <CircularProgress color="inherit" size={22} /> : 'Confirmar pedido'}
              </Button>
            </Stack>
          </Paper>
        </CheckoutGrid>
      )}

      <Dialog fullWidth maxWidth="sm" open={Boolean(completedOrder)} onClose={closeCompletedOrderDialog}>
        <DialogTitle sx={{ alignItems: 'center', display: 'flex', gap: 1, pr: 6 }}>
          <CelebrationOutlinedIcon color="primary" />
          Pedido confirmado
          <IconButton aria-label="Fechar" onClick={closeCompletedOrderDialog} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {completedOrder && (
            <Stack gap={3} sx={{ overflow: 'hidden', pb: 1, position: 'relative' }}>
              <Box
                sx={{
                  '@keyframes confettiFall': {
                    '0%': { opacity: 0, transform: 'translateY(-36px) rotate(0deg)' },
                    '15%': { opacity: 1 },
                    '100%': { opacity: 0, transform: 'translateY(140px) rotate(240deg)' },
                  },
                  height: 120,
                  position: 'relative',
                }}
              >
                {celebrationPieces.map((piece) => (
                  <Box
                    key={piece}
                    sx={{
                      animation: `confettiFall ${1.4 + (piece % 5) * 0.16}s ease-out infinite`,
                      animationDelay: `${piece * 0.05}s`,
                      bgcolor: ['primary.main', 'secondary.main', 'success.main', 'warning.main'][piece % 4],
                      borderRadius: piece % 2 ? '50%' : 0.5,
                      height: piece % 3 ? 10 : 14,
                      left: `${8 + piece * 5}%`,
                      position: 'absolute',
                      top: 0,
                      width: piece % 3 ? 10 : 6,
                    }}
                  />
                ))}
                <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: 1, height: '100%', justifyContent: 'center' }}>
                  <Typography fontWeight={900} textAlign="center" variant="h5">Compra realizada com sucesso</Typography>
                  <Chip color="success" label={`Pedido #${completedOrder.id}`} />
                </Box>
              </Box>

              <Stack gap={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Status</Typography>
                  <Typography fontWeight={800}>{statusLabels[completedOrder.status] ?? completedOrder.status}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Entrega</Typography>
                  <Typography fontWeight={800}>{completedOrder.deliveryMode === 'pickup' ? 'Retirada no local' : 'Entrega no endereco'}</Typography>
                </Box>
                {completedOrder.paymentDescription && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography color="text.secondary">Pagamento</Typography>
                    <Typography fontWeight={800}>{completedOrder.paymentDescription}</Typography>
                  </Box>
                )}
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Parcelas</Typography>
                  <Typography fontWeight={800}>{completedOrder.installments}x</Typography>
                </Box>
              </Stack>

              <Divider />
              <Stack gap={1}>
                {completedOrder.items.map((item) => (
                  <Box display="flex" justifyContent="space-between" key={item.id}>
                    <Typography>{item.quantity}x {item.name}</Typography>
                    <Typography fontWeight={700}>{formatCurrency(item.total)}</Typography>
                  </Box>
                ))}
              </Stack>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Frete</Typography>
                <Typography fontWeight={800}>{completedOrder.deliveryMode === 'pickup' ? 'Gratis' : formatCurrency(completedOrder.deliveryFee)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography>Total</Typography>
                <Typography fontWeight={900} variant="h6">{formatCurrency(completedOrder.total)}</Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </StoreLayout>
  );
};