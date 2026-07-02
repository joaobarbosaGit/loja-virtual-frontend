import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { useCart } from '../../hooks';
import { formatCurrency } from '../../utils';
import { DrawerContent } from './styles';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
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
        <Box alignItems="center" display="flex" justifyContent="space-between">
          <Typography color="text.secondary">Subtotal</Typography>
          <Typography fontWeight={800}>{formatCurrency(subtotal)}</Typography>
        </Box>
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
