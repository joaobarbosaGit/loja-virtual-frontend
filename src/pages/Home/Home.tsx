import { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Grid, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { CategoryCard } from '../../shared/components/CategoryCard';
import { ProductCard } from '../../shared/components/ProductCard';
import { StoreLayout } from '../../shared/layouts/StoreLayout';
import { Category, Product } from '../../shared/protocols';
import { productsService } from '../../shared/services';
import { CategoryPill, CategoryRail, FeaturedBand, Hero, HeroContent, Section } from './styles';

export const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setIsLoading(true);
    void Promise.all([
      productsService.listCategories(),
      productsService.listFeaturedProducts(),
    ]).then(([categoriesResponse, featuredProductsResponse]) => {
      setCategories(categoriesResponse);
      setFeaturedProducts(featuredProductsResponse);
      setErrorMessage('');
    }).catch(() => {
      setErrorMessage('Nao foi possivel carregar os dados da loja.');
    }).finally(() => setIsLoading(false));
  }, []);

  return (
    <StoreLayout>
      <Hero>
        <HeroContent>
          <Typography fontWeight={900} maxWidth={680} variant="h2">
            Autopecas com compra rapida e atendimento direto
          </Typography>
          <Typography maxWidth={560} mt={2} variant="h6">
            Encontre pecas, revise detalhes e monte seu carrinho em poucos cliques.
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1.5} mt={4}>
            <Button component={RouterLink} to="/products" variant="contained" color="secondary" size="large">
              Ver produtos
            </Button>
            <Button component={RouterLink} to="/cart" variant="outlined" color="inherit" size="large">
              Meu carrinho
            </Button>
          </Box>
        </HeroContent>
      </Hero>

      {errorMessage && (
        <Section>
          <Alert severity="error">{errorMessage}</Alert>
        </Section>
      )}

      {isLoading && (
        <Section>
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        </Section>
      )}

      {!isLoading && (
        <Section>
          <CategoryRail>
            <CategoryPill clickable label="Todos" onClick={() => navigate('/products')} />
            {categories.map((category) => (
              <CategoryPill
                clickable
                key={category.id}
                label={category.name}
                onClick={() => navigate(`/products?grupo=${category.id}`)}
              />
            ))}
          </CategoryRail>

          <Typography fontWeight={800} mb={2} variant="h5">
            Categorias
          </Typography>
          <Grid container spacing={2}>
            {categories.map((category) => (
              <Grid item key={category.id} md={3} sm={6} xs={12}>
                <CategoryCard category={category} />
              </Grid>
            ))}
          </Grid>
        </Section>
      )}

      {!isLoading && featuredProducts.length > 0 && (
        <Section>
          <FeaturedBand>
          <Box alignItems="center" display="flex" justifyContent="space-between" mb={2}>
            <Typography fontWeight={800} variant="h5">
              Produtos em destaque
            </Typography>
            <Button component={RouterLink} to="/products">
              Ver todos
            </Button>
          </Box>
          <Grid container spacing={3}>
            {featuredProducts.map((product) => (
              <Grid item key={product.id} lg={4} md={6} xs={12}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
          </FeaturedBand>
        </Section>
      )}
    </StoreLayout>
  );
};
