import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import { ProductCard } from '../../shared/components/ProductCard';
import { StoreLayout } from '../../shared/layouts/StoreLayout';
import { Category, Product, ProductsFilters } from '../../shared/protocols';
import { productsService } from '../../shared/services';
import { PageHeader, ProductsToolbar } from './styles';

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const grupo = searchParams.get('grupo') ?? undefined;
  const search = searchParams.get('search') ?? undefined;
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 12);
  const sort = (searchParams.get('sort') ?? 'name-asc') as ProductsFilters['sort'];
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  useEffect(() => {
    void productsService.listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    void productsService
      .listProducts({ grupo, search, page, limit, sort })
      .then((productsResponse) => {
        setProducts(productsResponse.data);
        setTotal(productsResponse.total);
        setErrorMessage('');
      })
      .catch(() => setErrorMessage('Nao foi possivel carregar os produtos.'))
      .finally(() => setIsLoading(false));
  }, [grupo, limit, page, search, sort]);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value);
      } else {
        nextParams.delete(key);
      }
    });

    setSearchParams(nextParams);
  };

  return (
    <StoreLayout>
      <PageHeader>
        <Box>
          <Typography fontWeight={900} variant="h4">
            Produtos
          </Typography>
          <Typography color="text.secondary" mt={0.5}>
            {search ? `Resultado para "${search}"` : 'Explore o catalogo disponivel para esta loja.'}
          </Typography>
        </Box>
      </PageHeader>
      <ProductsToolbar>
        <TextField
          label="Buscar"
          placeholder="Buscar por descricao"
          size="small"
          sx={{ flex: 1, minWidth: 240 }}
          value={search ?? ''}
          onChange={(event) => {
            const value = event.target.value;
            updateParams({ search: value.trim() || undefined, page: '1' });
          }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Categoria</InputLabel>
          <Select
            label="Categoria"
            value={grupo ?? ''}
            onChange={(event) => updateParams({ grupo: event.target.value || undefined, page: '1' })}
          >
            <MenuItem value="">Todas</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 190 }}>
          <InputLabel>Ordenar</InputLabel>
          <Select
            label="Ordenar"
            value={sort}
            onChange={(event) => updateParams({ sort: event.target.value, page: '1' })}
          >
            <MenuItem value="name-asc">Nome A-Z</MenuItem>
            <MenuItem value="name-desc">Nome Z-A</MenuItem>
            <MenuItem value="price-asc">Menor preco</MenuItem>
            <MenuItem value="price-desc">Maior preco</MenuItem>
            <MenuItem value="stock-desc">Maior estoque</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Por pagina</InputLabel>
          <Select
            label="Por pagina"
            value={String(limit)}
            onChange={(event) => updateParams({ limit: event.target.value, page: '1' })}
          >
            <MenuItem value="6">6</MenuItem>
            <MenuItem value="12">12</MenuItem>
            <MenuItem value="24">24</MenuItem>
          </Select>
        </FormControl>
      </ProductsToolbar>
      <Typography color="text.secondary" mb={2}>
        {total} produtos encontrados
      </Typography>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item key={product.id} lg={4} md={6} xs={12}>
              <ProductCard product={product} />
            </Grid>
          ))}
          {products.length === 0 && (
            <Grid item xs={12}>
              <Typography color="text.secondary">Nenhum produto encontrado.</Typography>
            </Grid>
          )}
          {products.length > 0 && (
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                  color="primary"
                  count={totalPages}
                  page={Math.min(page, totalPages)}
                  onChange={(_, nextPage) => updateParams({ page: String(nextPage) })}
                />
              </Box>
            </Grid>
          )}
        </Grid>
      )}
    </StoreLayout>
  );
};
