import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItemButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { StoreLayout } from '../../shared/layouts/StoreLayout';
import { api } from '../../shared/services/api.service';
import { formatCurrency } from '../../shared/utils';

interface OrderSummary {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  finishedAt?: string;
  observation?: string;
  itemsCount: number;
}

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitValue: number;
  total: number;
}

interface OrderDetail extends Omit<OrderSummary, 'itemsCount'> {
  items: OrderItem[];
  delivery?: {
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    zipCode: string;
  } | null;
  payment?: {
    brand?: string;
    last4?: string;
    status?: string;
  } | null;
  cancellation?: {
    reason: string;
    date: string;
  } | null;
}

const statusLabels: Record<string, string> = {
  PEDIDO_EM_PROCESSO: 'Pedido em processo',
  PEDIDO_ENVIADO: 'Pedido enviado',
  PEDIDO_EM_ROTA_DE_ENTREGA: 'Pedido em rota de entrega',
  PEDIDO_ENTREGUE: 'Pedido entregue',
  PEDIDO_CANCELADO: 'Pedido cancelado',
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR');
};

export const Orders = () => {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get<OrderSummary[]>('/loja/pedidos');
      setOrders(data);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel carregar seus pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadOrders(); }, []);

  const openOrder = async (orderId: number) => {
    setDetailLoading(true);
    setError('');
    try {
      const { data } = await api.get<OrderDetail>(`/loja/pedidos/${orderId}`);
      setSelectedOrder(data);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel carregar o pedido.');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <StoreLayout>
      <Typography fontWeight={900} mb={3} variant="h4">Meus pedidos</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
        ) : !orders.length ? (
          <Typography color="text.secondary">Nenhum pedido encontrado.</Typography>
        ) : (
          <List disablePadding>
            {orders.map((order) => (
              <ListItemButton
                key={order.id}
                divider
                sx={{ alignItems: 'flex-start', gap: 2, py: 2 }}
                onClick={() => void openOrder(order.id)}
              >
                <Box flex={1}>
                  <Typography fontWeight={800}>Pedido #{order.id}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {order.itemsCount} item(ns) - {formatDate(order.createdAt)}
                  </Typography>
                </Box>
                <Stack alignItems="flex-end" gap={1}>
                  <Chip color={order.status === 'PEDIDO_ENTREGUE' || order.status === 'FINALIZADO' ? 'success' : order.status === 'PEDIDO_CANCELADO' ? 'error' : 'warning'} label={statusLabels[order.status] ?? order.status} size="small" />
                  <Typography fontWeight={900}>{formatCurrency(Number(order.total))}</Typography>
                </Stack>
              </ListItemButton>
            ))}
          </List>
        )}
      </Paper>

      <Dialog fullWidth maxWidth="md" open={Boolean(selectedOrder) || detailLoading} onClose={() => setSelectedOrder(null)}>
        <DialogTitle>{selectedOrder ? `Pedido #${selectedOrder.id}` : 'Carregando pedido'}</DialogTitle>
        <DialogContent dividers>
          {detailLoading || !selectedOrder ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
          ) : (
            <Stack gap={3}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Chip color={selectedOrder.status === 'PEDIDO_ENTREGUE' || selectedOrder.status === 'FINALIZADO' ? 'success' : selectedOrder.status === 'PEDIDO_CANCELADO' ? 'error' : 'warning'} label={statusLabels[selectedOrder.status] ?? selectedOrder.status} />
                <Chip label={`Criado em ${formatDate(selectedOrder.createdAt)}`} variant="outlined" />
                {selectedOrder.finishedAt && <Chip label={`Finalizado em ${formatDate(selectedOrder.finishedAt)}`} variant="outlined" />}
              </Box>

              <Box>
                <Typography fontWeight={800} mb={1}>Produtos</Typography>
                <Stack divider={<Divider />} gap={1}>
                  {selectedOrder.items.map((item) => (
                    <Box display="flex" gap={2} justifyContent="space-between" key={item.id}>
                      <Box>
                        <Typography fontWeight={700}>{item.productName}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          Produto #{item.productId} - {Number(item.quantity)} x {formatCurrency(Number(item.unitValue))}
                        </Typography>
                      </Box>
                      <Typography fontWeight={800}>{formatCurrency(Number(item.total))}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Box>
                <Typography fontWeight={800} mb={1}>Entrega</Typography>
                {selectedOrder.delivery ? (
                  <Typography color="text.secondary">
                    {selectedOrder.delivery.street}, {selectedOrder.delivery.number}
                    {selectedOrder.delivery.complement ? ` - ${selectedOrder.delivery.complement}` : ''}
                    <br />
                    {selectedOrder.delivery.district} - {selectedOrder.delivery.city}/{selectedOrder.delivery.state}
                    <br />
                    CEP {selectedOrder.delivery.zipCode}
                  </Typography>
                ) : (
                  <Typography color="text.secondary">Endereco nao registrado neste pedido.</Typography>
                )}
              </Box>

              <Box>
                <Typography fontWeight={800} mb={1}>Pagamento</Typography>
                {selectedOrder.payment ? (
                  <Typography color="text.secondary">
                    {selectedOrder.payment.brand ?? 'Cartao'} final {selectedOrder.payment.last4 ?? '----'} - {selectedOrder.payment.status ?? selectedOrder.status}
                  </Typography>
                ) : (
                  <Typography color="text.secondary">Forma de pagamento nao registrada neste pedido.</Typography>
                )}
              </Box>

              {selectedOrder.observation && (
                <Box>
                  <Typography fontWeight={800} mb={1}>Observacao</Typography>
                  <Typography color="text.secondary">{selectedOrder.observation}</Typography>
                </Box>
              )}

              {selectedOrder.cancellation && (
                <Alert severity="warning">
                  Pedido cancelado: {selectedOrder.cancellation.reason}
                </Alert>
              )}

              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight={800}>Total</Typography>
                <Typography fontWeight={900}>{formatCurrency(Number(selectedOrder.total))}</Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedOrder(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </StoreLayout>
  );
};
