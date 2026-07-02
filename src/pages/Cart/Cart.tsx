import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { useCart } from '../../shared/hooks';
import { StoreLayout } from '../../shared/layouts/StoreLayout';
import { formatCurrency } from '../../shared/utils';
import { CartPanel } from './styles';

export const Cart = () => {
  const { items, removeItem, subtotal, updateItemQuantity } = useCart();
  const [itemPendingRemoval, setItemPendingRemoval] = useState<string | null>(null);

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
    <StoreLayout>
      <Typography fontWeight={900} mb={3} variant="h4">
        Carrinho
      </Typography>
      <CartPanel>
        <Stack gap={2}>
          {items.length === 0 && <Typography color="text.secondary">Seu carrinho esta vazio.</Typography>}
          {items.map((item) => (
            <Box alignItems="center" display="flex" gap={2} key={item.product.id}>
              <Box
                component="img"
                src={item.product.imageUrl}
                sx={{ borderRadius: 1, height: 88, objectFit: 'cover', width: 88 }}
              />
              <Box flex={1}>
                <Typography fontWeight={700}>{item.product.name}</Typography>
                <Typography color="text.secondary">
                  {item.quantity} x {formatCurrency(item.product.price)}
                </Typography>
              </Box>
              <Box alignItems="center" display="flex" gap={1}>
                <IconButton
                  aria-label="Diminuir quantidade"
                  onClick={() => void handleDecreaseQuantity(item.product.id, item.quantity)}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography fontWeight={800} minWidth={24} textAlign="center">{item.quantity}</Typography>
                <IconButton
                  aria-label="Aumentar quantidade"
                  disabled={!item.product.allowOutOfStockSale && item.quantity >= item.product.stock}
                  onClick={() => void updateItemQuantity(item.product.id, item.quantity + 1)}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              <IconButton onClick={() => void removeItem(item.product.id)}>
                <DeleteOutlineIcon />
              </IconButton>
            </Box>
          ))}
          <Divider />
          <Box alignItems="center" display="flex" justifyContent="space-between">
            <Typography color="text.secondary">Subtotal</Typography>
            <Typography fontWeight={900} variant="h6">
              {formatCurrency(subtotal)}
            </Typography>
          </Box>
          <Button component={RouterLink} disabled={!items.length} to="/checkout" variant="contained">
            Ir para checkout
          </Button>
        </Stack>
      </CartPanel>

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
    </StoreLayout>
  );
};
