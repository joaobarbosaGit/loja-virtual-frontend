import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Box, Button, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { useCart } from '../../hooks';
import { formatCurrency } from '../../utils';
import { DrawerContent } from './styles';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const { items, removeItem, subtotal } = useCart();

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
    </Drawer>
  );
};
