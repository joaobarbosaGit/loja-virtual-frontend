import { useEffect, useState } from 'react';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { Alert, Box, Button, CircularProgress, LinearProgress, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { StoreLayout } from '../../shared/layouts/StoreLayout';
import { api } from '../../shared/services';
import { formatCurrency } from '../../shared/utils';
import { DashboardPanel, AdminShell, MetricCard, MetricsGrid } from './styles';

type DashboardMetrics = {
  todaySales: number;
  openOrders: number;
  visibleProducts: number;
  storeCustomers: number;
};

const initialMetrics: DashboardMetrics = {
  todaySales: 0,
  openOrders: 0,
  visibleProducts: 0,
  storeCustomers: 0,
};

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadMetrics = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { data } = await api.get<DashboardMetrics>('/admin/dashboard/indicadores');
      setMetrics(data);
    } catch (requestError: any) {
      setErrorMessage(requestError.response?.data?.message ?? 'Nao foi possivel carregar os indicadores.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadMetrics();
  }, []);

  const metricCards = [
    { label: 'Vendas hoje', value: formatCurrency(metrics.todaySales), icon: <TrendingUpOutlinedIcon color="primary" /> },
    { label: 'Pedidos abertos', value: String(metrics.openOrders), icon: <ReceiptLongOutlinedIcon color="primary" /> },
    { label: 'Produtos visiveis', value: String(metrics.visibleProducts), icon: <Inventory2OutlinedIcon color="primary" /> },
    { label: 'Clientes loja', value: String(metrics.storeCustomers), icon: <PeopleAltOutlinedIcon color="primary" /> },
  ];

  return (
    <StoreLayout>
      <AdminShell>
        <Box display="flex" flexWrap="wrap" gap={2} justifyContent="space-between">
          <Box>
            <Typography fontWeight={900} variant="h4">
              Dashboard da loja
            </Typography>
            <Typography color="text.secondary" mt={0.5}>
              Visao inicial para acompanhar vendas, catalogo e clientes.
            </Typography>
          </Box>
          <Button disabled={isLoading} variant="contained" onClick={() => void loadMetrics()}>
            {isLoading ? <CircularProgress color="inherit" size={22} /> : 'Atualizar indicadores'}
          </Button>
        </Box>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <MetricsGrid>
          {metricCards.map((metric) => (
            <MetricCard key={metric.label}>
              <Box alignItems="center" display="flex" gap={1.5} mb={1}>
                {metric.icon}
                <Typography color="text.secondary" fontWeight={700} variant="body2">
                  {metric.label}
                </Typography>
              </Box>
              <Typography fontWeight={900} variant="h5">
                {isLoading ? '-' : metric.value}
              </Typography>
            </MetricCard>
          ))}
        </MetricsGrid>

        <DashboardPanel>
          <Stack gap={2}>
            <Typography fontWeight={800} variant="h6">
              Operacao da loja
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              <Button component={RouterLink} to="/admin/produtos-loja" variant="outlined">Produtos da loja</Button>
              <Button component={RouterLink} to="/admin/pedidos" variant="outlined">Pedidos e entregas</Button>
              <Button component={RouterLink} to="/admin/pagamentos" variant="outlined">Pagamentos</Button>
              <Button component={RouterLink} to="/admin/destaques" variant="outlined">Destaques</Button>
            </Box>
            <Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography color="text.secondary">Produtos publicados na vitrine</Typography>
                <Typography fontWeight={800}>{isLoading ? '-' : metrics.visibleProducts}</Typography>
              </Box>
              <LinearProgress value={metrics.visibleProducts > 0 ? 100 : 0} variant="determinate" />
            </Box>
            <Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography color="text.secondary">Pedidos pendentes de acompanhamento</Typography>
                <Typography fontWeight={800}>{isLoading ? '-' : metrics.openOrders}</Typography>
              </Box>
              <LinearProgress value={metrics.openOrders > 0 ? 65 : 100} color={metrics.openOrders > 0 ? 'warning' : 'success'} variant="determinate" />
            </Box>
            <Typography color="text.secondary">
              Os indicadores usam os pedidos, produtos e clientes vinculados a empresa do usuario administrativo logado.
            </Typography>
          </Stack>
        </DashboardPanel>
      </AdminShell>
    </StoreLayout>
  );
};
