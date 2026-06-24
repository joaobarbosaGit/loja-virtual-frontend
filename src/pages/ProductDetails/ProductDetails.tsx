import { useEffect, useState } from 'react';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Alert, Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

import { useCart } from '../../shared/hooks';
import { StoreLayout } from '../../shared/layouts/StoreLayout';
import { Product } from '../../shared/protocols';
import { productsService } from '../../shared/services';
import { formatCurrency } from '../../shared/utils';
import { DetailsGrid, ProductPhoto } from './styles';

export const ProductDetails = () => {
  const { productId } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      setProduct(undefined);
      void productsService
        .getProductById(productId)
        .then((productResponse) => {
          setProduct(productResponse);
          setErrorMessage('');
        })
        .catch(() => setErrorMessage('Produto nao encontrado.'))
        .finally(() => setIsLoading(false));
    }
  }, [productId]);

  return (
    <StoreLayout>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : !product ? (
        <Typography>Produto nao encontrado.</Typography>
      ) : (
        <DetailsGrid>
          <ProductPhoto alt={product.name} src={product.imageUrl} />
          <Paper sx={{ p: 4 }}>
            <Typography color="text.secondary" fontWeight={700} variant="overline">
              Produto
            </Typography>
            <Typography fontWeight={900} mt={1} variant="h4">
              {product.name}
            </Typography>
            <Typography color="text.secondary" mt={2}>
              {product.description}
            </Typography>
            <Typography color="primary" fontWeight={900} mt={3} variant="h4">
              {formatCurrency(product.price)}
            </Typography>
            <Button
              fullWidth
              size="large"
              startIcon={<AddShoppingCartIcon />}
              sx={{ mt: 4 }}
              variant="contained"
              onClick={() => void addItem(product)}
            >
              Adicionar ao carrinho
            </Button>
          </Paper>
        </DetailsGrid>
      )}
    </StoreLayout>
  );
};
