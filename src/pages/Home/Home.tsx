import { useEffect, useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Alert, Box, Button, CircularProgress, Grid, IconButton, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { CategoryCard } from '../../shared/components/CategoryCard';
import { ProductDetailsModal } from '../../shared/components/ProductDetailsModal';
import { StoreLayout } from '../../shared/layouts/StoreLayout';
import { Category, Product } from '../../shared/protocols';
import { productsService } from '../../shared/services';
import { formatCurrency } from '../../shared/utils';
import { Hero, HeroCarousel, HeroCarouselTrack, HeroContent, HeroDot, HeroDots, HeroHighlightSlide, HeroNav, Section } from './styles';

export const Home = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0);
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

  const moveFeatured = (direction: number) => {
    if (!featuredProducts.length) return;
    setActiveFeaturedIndex((current) => (current + direction + featuredProducts.length) % featuredProducts.length);
  };

  return (
    <StoreLayout>
      {isLoading ? (
        <Section>
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        </Section>
      ) : featuredProducts.length > 0 ? (
        <HeroCarousel>
          <HeroCarouselTrack sx={{ transform: `translateX(-${activeFeaturedIndex * 100}%)` }}>
            {featuredProducts.map((product) => (
              <HeroHighlightSlide
                component="button"
                imageUrl={product.highlightImageUrl || product.imageUrl}
                key={`${product.highlightId ?? product.id}-${product.id}`}
                onClick={() => setSelectedProduct(product)}
              >
                <HeroContent>
                  <Typography fontWeight={900} maxWidth={760} variant="h2">
                    {product.name}
                  </Typography>
                  <Typography maxWidth={560} mt={2} variant="h6">
                    {product.description}
                  </Typography>
                  <Box alignItems="baseline" display="flex" flexWrap="wrap" gap={1.5} mt={4}>
                    <Typography color="secondary" fontWeight={900} variant="h4">
                      {formatCurrency(product.price)}
                    </Typography>
                    {product.originalPrice && (
                      <Typography sx={{ textDecoration: 'line-through' }} variant="h6">
                        {formatCurrency(product.originalPrice)}
                      </Typography>
                    )}
                  </Box>
                </HeroContent>
              </HeroHighlightSlide>
            ))}
          </HeroCarouselTrack>
          {featuredProducts.length > 1 && (
            <>
              <HeroNav>
                <IconButton aria-label="Destaque anterior" color="inherit" onClick={() => moveFeatured(-1)}>
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton aria-label="Proximo destaque" color="inherit" onClick={() => moveFeatured(1)}>
                  <ChevronRightIcon />
                </IconButton>
              </HeroNav>
              <HeroDots>
                {featuredProducts.map((product, index) => (
                  <HeroDot active={index === activeFeaturedIndex} key={`${product.id}-${index}`} />
                ))}
              </HeroDots>
            </>
          )}
        </HeroCarousel>
      ) : (
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
      )}

      {errorMessage && (
        <Section>
          <Alert severity="error">{errorMessage}</Alert>
        </Section>
      )}



      {!isLoading && (
        <Section>
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

      <ProductDetailsModal open={Boolean(selectedProduct)} product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </StoreLayout>
  );
};
