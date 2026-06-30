import { useEffect, useMemo, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Stack, Typography } from '@mui/material';

import { Product } from '../../protocols';
import { useCart } from '../../hooks';
import { formatCurrency } from '../../utils';
import { ProductModalImage } from './styles';

interface ProductDetailsModalProps {
  open: boolean;
  product?: Product | null;
  onClose: () => void;
}

const getMaxQuantity = (product: Product) => (product.allowOutOfStockSale ? 999 : Math.max(Math.floor(product.stock), 0));

export const ProductDetailsModal = ({ open, product, onClose }: ProductDetailsModalProps) => {
  const { addItem, items, removeItem, updateItemQuantity } = useCart();
  const cartItem = product ? items.find((item) => item.product.id === product.id) : undefined;
  const maxQuantity = product ? getMaxQuantity(product) : 0;
  const currentQuantity = cartItem?.quantity ?? 0;
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) return;
    setQuantity(cartItem?.quantity || (maxQuantity > 0 ? 1 : 0));
  }, [cartItem?.quantity, maxQuantity, product]);

  const canBuy = Boolean(product && maxQuantity > 0);
  const actionLabel = currentQuantity > 0 ? 'Atualizar carrinho' : 'Adicionar ao carrinho';
  const total = useMemo(() => (product ? product.price * quantity : 0), [product, quantity]);

  if (!product) return null;

  const changeQuantity = (nextQuantity: number) => {
    setQuantity(Math.min(Math.max(Math.floor(nextQuantity), canBuy ? 1 : 0), maxQuantity));
  };

  const saveCart = async () => {
    if (!canBuy) return;
    if (currentQuantity > 0) await updateItemQuantity(product.id, quantity);
    else await addItem(product, quantity);
    onClose();
  };

  const removeFromCart = async () => {
    await removeItem(product.id);
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle>{product.name}</DialogTitle>
      <DialogContent dividers>
        <Box display="grid" gap={3} gridTemplateColumns={{ md: 'minmax(280px, 0.9fr) 1fr', xs: '1fr' }}>
          <ProductModalImage alt={product.name} src={product.highlightImageUrl || product.imageUrl} />
          <Stack gap={2}>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {product.categoryName && <Chip label={product.categoryName} size="small" />}
              {product.featured && <Chip color="secondary" label="Destaque" size="small" />}
              {currentQuantity > 0 && <Chip color="primary" label={`${currentQuantity} no carrinho`} size="small" />}
            </Box>
            <Typography color="text.secondary">{product.description}</Typography>
            <Box alignItems="baseline" display="flex" flexWrap="wrap" gap={1}>
              <Typography color="primary" fontWeight={900} variant="h4">
                {formatCurrency(product.price)}
              </Typography>
              {product.originalPrice && (
                <Typography color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                  {formatCurrency(product.originalPrice)}
                </Typography>
              )}
            </Box>
            <Typography color={product.stock <= 0 && !product.allowOutOfStockSale ? 'warning.main' : 'success.main'} fontWeight={800}>
              {product.allowOutOfStockSale ? 'Disponivel para encomenda' : product.stock > 0 ? `${product.stock} em estoque` : 'Sem estoque'}
            </Typography>
            <Divider />
            {canBuy ? (
              <Stack gap={2}>
                <Box alignItems="center" display="flex" gap={1}>
                  <IconButton aria-label="Diminuir quantidade" disabled={quantity <= 1} onClick={() => changeQuantity(quantity - 1)}>
                    <RemoveIcon />
                  </IconButton>
                  <Box flex={1} textAlign="center">
                    <Typography fontWeight={900} variant="h5">{quantity}</Typography>
                    <Typography color="text.secondary" variant="caption">quantidade</Typography>
                  </Box>
                  <IconButton aria-label="Aumentar quantidade" disabled={quantity >= maxQuantity} onClick={() => changeQuantity(quantity + 1)}>
                    <AddIcon />
                  </IconButton>
                </Box>
                <Box alignItems="center" display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Total</Typography>
                  <Typography fontWeight={900}>{formatCurrency(total)}</Typography>
                </Box>
              </Stack>
            ) : (
              <Typography color="text.secondary" fontWeight={800}>Produto indisponivel para compra.</Typography>
            )}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
        {currentQuantity > 0 && (
          <Button color="error" startIcon={<DeleteOutlineIcon />} onClick={() => void removeFromCart()}>
            Remover
          </Button>
        )}
        <Button onClick={onClose}>Fechar</Button>
        <Button disabled={!canBuy} startIcon={<AddShoppingCartIcon />} variant="contained" onClick={() => void saveCart()}>
          {actionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
