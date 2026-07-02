import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { useAuth, useCart } from '../../hooks';
import { api } from '../../services';
import { formatCurrency } from '../../utils';
import { DrawerContent } from './styles';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface DeliveryQuote {
  enabled: boolean;
  available: boolean;
  distanceKm: number;
  fee: number;
  free: boolean;
  reason?: string;
}

export const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const { user } = useAuth();
  const { items, removeItem, subtotal, updateItemQuantity } = useCart();
  const [itemPendingRemoval, setItemPendingRemoval] = useState<string | null>(null);
  const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuote | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  const canQuoteDelivery = Boolean(open && items.length && user?.role === 'customer');
  const deliveryUnavailable = Boolean(deliveryQuote?.enabled && !deliveryQuote.available);
  const deliveryFee = deliveryQuote?.available ? Number(deliveryQuote.fee) : 0;
  const total = subtotal + (deliveryUnavailable ? 0 : deliveryFee);
  const deliveryUnavailableReason = deliveryQuote?.reason?.toLowerCase().includes('localizar')
    ? 'Nao conseguimos localizar seu endereco para calcular a entrega.'
    : deliveryQuote?.reason ?? 'Entrega indisponivel para este endereco.';

  useEffect(() => {
    if (!canQuoteDelivery) {
      setDeliveryQuote(null);
      return;
    }

    let active = true;
    setDeliveryLoading(true);
    void api.post<DeliveryQuote>('/loja/entrega/cotacao', { subtotal })
      .then(({ data }) => { if (active) setDeliveryQuote(data); })
      .catch((requestError: any) => {
        if (active) setDeliveryQuote({ enabled: true, available: false, distanceKm: 0, fee: 0, free: false, reason: requestError.response?.data?.message ?? 'Nao foi possivel calcular a entrega.' });
      })
      .finally(() => { if (active) setDeliveryLoading(false); });

    return () => { active = false; };
  }, [canQuoteDelivery, subtotal]);

  const handleDecreaseQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 1) {
      setItemPendingRemoval(productId);
      return;
    }

    await updateItemQuantity(productId, quantity - 1);
  };

  const confirmRemoveItem = async () => {
    if (!itemPendingRemoval) return;
    await removeItem(itemPendingRemoval);
    setItemPendingRemoval(null);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <DrawerContent>
        <Box alignItems="center" display="flex" justifyContent="space-between">
          <Typography fontWeight={800} variant="h6">
            Carrinho
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Stack flex={1} gap={2} overflow="auto">
          {items.length === 0 && (
            <Typography color="text.secondary">Seu carrinho esta vazio.</Typography>
          )}
          {items.map((item) => (
            <Box display="flex" gap={2} key={item.product.id}>
              <Box
                component="img"
                src={item.product.imageUrl}
                sx={{ borderRadius: 1, height: 72, objectFit: 'cover', width: 72 }}
              />
              <Box flex={1}>
                <Typography fontWeight={700}>{item.product.name}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {item.quantity} x {formatCurrency(item.product.price)}
                </Typography>
                <Box alignItems="center" display="flex" gap={1} mt={1}>
                  <IconButton
                    aria-label="Diminuir quantidade"
                    size="small"
                    onClick={() => void handleDecreaseQuantity(item.product.id, item.quantity)}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography fontWeight={800} minWidth={24} textAlign="center" variant="body2">
                    {item.quantity}
                  </Typography>
                  <IconButton
                    aria-label="Aumentar quantidade"
                    disabled={!item.product.allowOutOfStockSale && item.quantity >= item.product.stock}
                    size="small"
                    onClick={() => void updateItemQuantity(item.product.id, item.quantity + 1)}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              <IconButton onClick={() => void removeItem(item.product.id)}>
                <DeleteOutlineIcon />
              </IconButton>
            </Box>
          ))}
        </Stack>

        <Divider />
        <Stack gap={1}>
          <Box alignItems="center" display="flex" justifyContent="space-between">
            <Typography color="text.secondary">Subtotal</Typography>
            <Typography fontWeight={800}>{formatCurrency(subtotal)}</Typography>
          </Box>
          <Box alignItems="center" display="flex" justifyContent="space-between">
            <Typography color="text.secondary">Frete</Typography>
            <Typography fontWeight={800}>
              {deliveryLoading ? <CircularProgress size={16} /> : deliveryUnavailable ? 'Retirada' : deliveryQuote ? (deliveryQuote.free ? 'Gratis' : formatCurrency(deliveryFee)) : 'No checkout'}
            </Typography>
          </Box>
          {deliveryQuote?.available && deliveryQuote.enabled && (
            <Typography color="text.secondary" variant="body2">Entrega estimada para {deliveryQuote.distanceKm} km da loja.</Typography>
          )}
          {deliveryUnavailable && (
            <Alert
              action={<Button component={RouterLink} to="/profile" color="inherit" size="small" onClick={onClose}>Atualizar</Button>}
              severity="warning"
            >
              {deliveryUnavailableReason} Voce ainda pode finalizar com retirada no local.
            </Alert>
          )}
          {!user && items.length > 0 && (
            <Alert severity="info">Entre na sua conta para calcular a entrega.</Alert>
          )}
          <Box alignItems="center" display="flex" justifyContent="space-between">
            <Typography>Total</Typography>
            <Typography fontWeight={900}>{formatCurrency(total)}</Typography>
          </Box>
        </Stack>
        <Button component={RouterLink} disabled={!items.length} to="/checkout" variant="contained" onClick={onClose}>
          Finalizar compra
        </Button>
      </DrawerContent>

      <Dialog open={Boolean(itemPendingRemoval)} onClose={() => setItemPendingRemoval(null)}>
        <DialogTitle>Remover item do carrinho?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Este item tem apenas uma unidade no carrinho. Deseja remove-lo?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemPendingRemoval(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={() => void confirmRemoveItem()}>
            Remover item
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};