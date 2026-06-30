import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveIcon from '@mui/icons-material/Remove';
import { Alert, Box, Button, CardActions, CardContent, Chip, IconButton, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { Product } from '../../protocols';
import { useCart } from '../../hooks';
import { formatCurrency } from '../../utils';
import { ProductCardContainer, ProductImage } from './styles';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem, items } = useCart();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState('');
  const cartItem = items.find((item) => item.product.id === product.id);
  const quantityInCart = cartItem?.quantity ?? 0;
  const maxQuantity = product.allowOutOfStockSale ? 999 : Math.max(product.stock, 0);
  const isOutOfStock = product.stock <= 0 && !product.allowOutOfStockSale;
  const availableToAdd = Math.max(maxQuantity - quantityInCart, 0);
  const reachedStockLimit = availableToAdd <= 0;

  const handleAddToCart = async () => {
    await addItem(product, selectedQuantity);
    setAddedMessage(`${selectedQuantity} item(ns) adicionado(s) ao carrinho.`);
    setSelectedQuantity(1);
    window.setTimeout(() => setAddedMessage(''), 2500);
  };

  return (
    <ProductCardContainer>
      <ProductImage image={product.imageUrl} title={product.name} />
      <CardContent sx={{ flex: 1 }}>
        <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
          {product.categoryName && <Chip label={product.categoryName} size="small" />}
          {product.featured && <Chip color="secondary" label="Destaque" size="small" />}
        </Box>
        <Typography
          color="text.primary"
          component={RouterLink}
          fontWeight={700}
          sx={{ textDecoration: 'none' }}
          to={`/products/${product.id}`}
        >
          {product.name}
        </Typography>
        <Typography color="text.secondary" mt={1} variant="body2">
          {product.description}
        </Typography>
        <Box alignItems="baseline" display="flex" flexWrap="wrap" gap={1} mt={2}>
          <Typography color="primary" fontWeight={900} variant="h5">
            {formatCurrency(product.price)}
          </Typography>
          {product.originalPrice && (
            <Typography color="text.secondary" sx={{ textDecoration: 'line-through' }} variant="body2">
              {formatCurrency(product.originalPrice)}
            </Typography>
          )}
        </Box>
        <Typography color={isOutOfStock ? 'warning.main' : 'success.main'} fontWeight={700} mt={1} variant="caption">
          {product.allowOutOfStockSale ? 'Disponivel para encomenda' : isOutOfStock ? 'Sem estoque' : `${product.stock} em estoque`}
        </Typography>
        {quantityInCart > 0 && (
          <Typography color="text.secondary" display="block" mt={0.5} variant="caption">
            {quantityInCart} no carrinho
          </Typography>
        )}
        {addedMessage && <Alert severity="success" sx={{ mt: 1 }}>{addedMessage}</Alert>}
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        {isOutOfStock ? (
          <Typography color="text.secondary" fontWeight={800} textAlign="center" width="100%">
            Indisponivel
          </Typography>
        ) : (
          <Box display="flex" flexDirection="column" gap={1} width="100%">
            <Box alignItems="center" display="flex" gap={1} width="100%">
              <IconButton
                color="primary"
                disabled={selectedQuantity <= 1}
                onClick={() => setSelectedQuantity((current) => Math.max(current - 1, 1))}
              >
                <RemoveIcon />
              </IconButton>
              <Box flex={1} textAlign="center">
                <Typography fontWeight={900}>{selectedQuantity}</Typography>
                <Typography color="text.secondary" variant="caption">
                  quantidade
                </Typography>
              </Box>
              <IconButton
                color="primary"
                disabled={selectedQuantity >= availableToAdd}
                onClick={() => setSelectedQuantity((current) => Math.min(current + 1, availableToAdd))}
              >
                <AddIcon />
              </IconButton>
            </Box>
            <Button
              fullWidth
              disabled={reachedStockLimit}
              startIcon={<AddShoppingCartIcon />}
              variant="contained"
              onClick={() => void handleAddToCart()}
            >
              {reachedStockLimit ? 'Estoque no carrinho' : 'Adicionar ao carrinho'}
            </Button>
          </Box>
        )}
      </CardActions>
    </ProductCardContainer>
  );
};
