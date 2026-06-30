import { ChangeEvent, useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  FormControl, FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Paper, Select, Stack, Switch,
  Tab, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Tabs, TextField, Tooltip, Typography,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import { StoreLayout } from '../../shared/layouts/StoreLayout';
import { api, resolveStoreAssetUrl } from '../../shared/services';
import { formatCurrency } from '../../shared/utils';
import { useStoreTheme } from '../../shared/hooks';

type AdminTab = 'produtos' | 'pedidos' | 'pagamentos' | 'destaques' | 'configuracoes';
type PageResponse<T> = { page: number; limit: number; total: number; data: T[] };
type ProductRow = { codigo: number; descricao: string; nomeGrupo?: string; precoVenda?: number; estoqueAtual?: number; lojaVisivel: boolean; imagemDisponivel?: boolean };
type GroupRow = { codigo: number; descricao: string };
type OrderRow = { id: number; status: string; total: number; createdAt: string; customerName?: string; itemsCount: number };
type Delivery = { street?: string; number?: string; complement?: string; district?: string; city?: string; state?: string; zipCode?: string };
type OrderDetail = OrderRow & {
  observation?: string;
  delivery?: Delivery | null;
  payment?: { type?: string; description?: string; brand?: string; last4?: string; installments?: number } | null;
  cancellation?: { reason: string; date: string } | null;
  items: { id: number; productId: number; productName: string; quantity: number; unitValue: number; total: number }[];
  logs: { id: number; adminUserId?: number; adminName?: string; previousStatus?: string; newStatus?: string; field?: string; justification?: string; createdAt: string }[];
};
type PaymentRow = { id: number; tipo: string; descricao: string; ativo: boolean; permiteParcelamento: boolean; maxParcelas: number; valorMinimoParcela: number; instrucoes?: string };
type HighlightRow = ProductRow & { id: number; productId: number; createdAt: string; highlightImageAvailable?: boolean; highlightImageUrl?: string };
type StoreSettings = {
  codigo: number;
  razaoSocial: string;
  fantasia: string;
  config: {
    nomeSite: string;
    corPrimaria: string;
    corSecundaria: string;
    corFundo: string;
    corTexto: string;
    logoUrl: string;
    iconeUrl: string;
    bannerUrl: string;
    descricao: string;
  };
};

const tabPaths: Record<AdminTab, string> = {
  produtos: '/admin/produtos-loja',
  pedidos: '/admin/pedidos',
  pagamentos: '/admin/pagamentos',
  destaques: '/admin/destaques',
  configuracoes: '/admin/configuracoes',
};

const statusLabels: Record<string, string> = {
  PEDIDO_EM_PROCESSO: 'Pedido em processo',
  PEDIDO_ENVIADO: 'Pedido enviado',
  PEDIDO_EM_ROTA_DE_ENTREGA: 'Pedido em rota de entrega',
  PEDIDO_ENTREGUE: 'Pedido entregue',
  PEDIDO_CANCELADO: 'Pedido cancelado',
};

const statusOptions = Object.keys(statusLabels);
const paymentTypes = ['DINHEIRO', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'OUTRO'];
const emptyPayment: PaymentRow = { id: 0, tipo: 'PIX', descricao: '', ativo: true, permiteParcelamento: false, maxParcelas: 1, valorMinimoParcela: 0, instrucoes: '' };
const emptySettings: StoreSettings = {
  codigo: 0,
  razaoSocial: '',
  fantasia: '',
  config: {
    nomeSite: '',
    corPrimaria: '#1976d2',
    corSecundaria: '#00b894',
    corFundo: '#f8fafc',
    corTexto: '#111827',
    logoUrl: '',
    iconeUrl: '',
    bannerUrl: '',
    descricao: '',
  },
};
const formatDate = (value?: string) => (value ? new Date(value).toLocaleString('pt-BR') : '-');
const normalizeHexColor = (value: string) => {
  const color = value.trim().replace(/^#/, '').replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
  return color ? `#${color}` : '';
};
const colorPickerValue = (value: string) => (/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000');
const pathToTab = (path: string): AdminTab => (
  path.includes('/admin/pedidos')
    ? 'pedidos'
    : path.includes('/admin/pagamentos')
      ? 'pagamentos'
      : path.includes('/admin/destaques')
        ? 'destaques'
        : path.includes('/admin/configuracoes')
          ? 'configuracoes'
          : 'produtos'
);

export const AdminStore = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateStoreTheme } = useStoreTheme();
  const tab = pathToTab(location.pathname);
  const [products, setProducts] = useState<PageResponse<ProductRow>>({ page: 1, limit: 10, total: 0, data: [] });
  const [orders, setOrders] = useState<PageResponse<OrderRow>>({ page: 1, limit: 10, total: 0, data: [] });
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [highlights, setHighlights] = useState<HighlightRow[]>([]);
  const [highlightProducts, setHighlightProducts] = useState<ProductRow[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(emptySettings);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [highlightDraft, setHighlightDraft] = useState<{ product: ProductRow; imageUrl: string } | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentRow>(emptyPayment);
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [deliveryEdit, setDeliveryEdit] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', visible: '', grupo: '', status: '', cliente: '', startDate: '', endDate: '' });
  const [page, setPage] = useState(0);

  const clearFeedback = () => { setMessage(''); setError(''); };
  const updateSettingsConfig = (config: Partial<StoreSettings['config']>) => {
    setSettings((current) => ({ ...current, config: { ...current.config, ...config } }));
  };

  const loadProducts = async (nextPage = page) => {
    setLoading(true); clearFeedback();
    try {
      const { data } = await api.get<PageResponse<ProductRow>>('/admin/produtos-loja', { params: { page: nextPage + 1, limit: products.limit, search: filters.search, visible: filters.visible, grupo: filters.grupo || undefined } });
      setProducts(data);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel carregar os produtos.');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async (nextPage = page) => {
    setLoading(true); clearFeedback();
    try {
      const { data } = await api.get<PageResponse<OrderRow>>('/admin/pedidos', { params: { page: nextPage + 1, limit: orders.limit, status: filters.status || undefined, cliente: filters.cliente || undefined, startDate: filters.startDate || undefined, endDate: filters.endDate || undefined } });
      setOrders(data);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel carregar os pedidos.');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    setLoading(true); clearFeedback();
    try {
      const { data } = await api.get<PaymentRow[]>('/admin/pagamentos');
      setPayments(data);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel carregar pagamentos.');
    } finally {
      setLoading(false);
    }
  };

  const loadHighlights = async () => {
    setLoading(true); clearFeedback();
    try {
      const { data } = await api.get<HighlightRow[]>('/admin/destaques');
      setHighlights(data);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel carregar destaques.');
    } finally {
      setLoading(false);
    }
  };

  const loadHighlightProducts = async () => {
    setLoading(true); clearFeedback();
    try {
      const limit = 200;
      let pageToLoad = 1;
      let total = 0;
      const allProducts: ProductRow[] = [];

      do {
        const { data } = await api.get<PageResponse<ProductRow>>('/admin/produtos-loja', {
          params: {
            page: pageToLoad,
            limit,
            search: filters.search,
            visible: 'visible',
            grupo: filters.grupo || undefined,
          },
        });
        total = data.total;
        allProducts.push(...data.data);
        pageToLoad += 1;
      } while (allProducts.length < total);

      setHighlightProducts(allProducts);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel carregar os produtos visiveis.');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    setLoading(true); clearFeedback();
    try {
      const { data } = await api.get<StoreSettings>('/admin/configuracoes');
      setSettings(data);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel carregar as configuracoes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void api.get<GroupRow[]>('/admin/produtos-loja/grupos').then(({ data }) => setGroups(data)).catch(() => undefined);
  }, []);

  useEffect(() => {
    setPage(0);
    if (tab === 'produtos') void loadProducts(0);
    if (tab === 'pedidos') void loadOrders(0);
    if (tab === 'pagamentos') void loadPayments();
    if (tab === 'destaques') { void loadHighlightProducts(); void loadHighlights(); }
    if (tab === 'configuracoes') void loadSettings();
  }, [tab]);

  const runSearch = () => {
    setPage(0);
    if (tab === 'pedidos') void loadOrders(0);
    else if (tab === 'destaques') void loadHighlightProducts();
    else void loadProducts(0);
  };
  const availableHighlightProducts = highlightProducts.filter((product) => product.lojaVisivel);
  const highlightedProductIds = new Set(highlights.map((highlight) => highlight.productId));

  const toggleVisibility = async (product: ProductRow) => {
    clearFeedback();
    try {
      await api.patch(`/admin/produtos-loja/${product.codigo}/visibilidade`, { visible: !product.lojaVisivel });
      setMessage('Visibilidade do produto atualizada.');
      await loadProducts();
      if (tab === 'destaques') { await loadHighlightProducts(); await loadHighlights(); }
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel atualizar o produto.');
    }
  };

  const openOrder = async (orderId: number) => {
    clearFeedback();
    try {
      const { data } = await api.get<OrderDetail>(`/admin/pedidos/${orderId}`);
      setSelectedOrder(data);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel abrir o pedido.');
    }
  };

  const updateOrderStatus = async (status: string) => {
    if (!selectedOrder) return;
    clearFeedback();
    try {
      const { data } = await api.patch<OrderDetail>(`/admin/pedidos/${selectedOrder.id}/status`, { status });
      setSelectedOrder(data);
      setMessage('Status do pedido atualizado.');
      await loadOrders();
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel alterar o status.');
    }
  };

  const saveDelivery = async () => {
    if (!selectedOrder || !deliveryEdit) return;
    clearFeedback();
    try {
      const { data } = await api.patch<OrderDetail>(`/admin/pedidos/${selectedOrder.id}/entrega`, deliveryEdit);
      setSelectedOrder(data);
      setDeliveryEdit(null);
      setMessage('Entrega atualizada.');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel salvar a entrega.');
    }
  };

  const cancelOrder = async () => {
    if (!cancelOrderId) return;
    clearFeedback();
    try {
      const { data } = await api.post<OrderDetail>(`/admin/pedidos/${cancelOrderId}/cancelar`, { justification: cancelReason });
      setSelectedOrder(data);
      setCancelOrderId(null);
      setCancelReason('');
      setMessage('Pedido cancelado.');
      await loadOrders();
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel cancelar o pedido.');
    }
  };

  const savePayment = async () => {
    clearFeedback();
    try {
      const payload = { ...paymentForm, maxParcelas: Number(paymentForm.maxParcelas), valorMinimoParcela: Number(paymentForm.valorMinimoParcela) };
      const { data } = paymentForm.id ? await api.put<PaymentRow[]>(`/admin/pagamentos/${paymentForm.id}`, payload) : await api.post<PaymentRow[]>('/admin/pagamentos', payload);
      setPayments(data);
      setPaymentForm(emptyPayment);
      setMessage('Forma de pagamento salva.');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel salvar a forma de pagamento.');
    }
  };

  const togglePayment = async (payment: PaymentRow) => {
    clearFeedback();
    try {
      const { data } = await api.patch<PaymentRow[]>(`/admin/pagamentos/${payment.id}/ativo`, { active: !payment.ativo });
      setPayments(data);
      setMessage('Forma de pagamento atualizada.');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel atualizar pagamento.');
    }
  };

  const addHighlight = async () => {
    if (!highlightDraft) return;
    clearFeedback();
    try {
      const { data } = await api.post<HighlightRow[]>('/admin/destaques', {
        productId: highlightDraft.product.codigo,
        imageUrl: highlightDraft.imageUrl,
      });
      setHighlights(data);
      setHighlightDraft(null);
      setMessage('Produto adicionado aos destaques.');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel destacar o produto.');
    }
  };

  const removeHighlight = async (highlightId: number) => {
    clearFeedback();
    try {
      const { data } = await api.delete<HighlightRow[]>(`/admin/destaques/${highlightId}`);
      setHighlights(data);
      setMessage('Destaque removido.');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel remover o destaque.');
    }
  };

  const saveSettings = async () => {
    clearFeedback();
    try {
      const { data } = await api.put<StoreSettings>('/admin/configuracoes', settings.config);
      setSettings(data);
      updateStoreTheme({
        siteName: data.config.nomeSite,
        primaryColor: data.config.corPrimaria,
        secondaryColor: data.config.corSecundaria,
        backgroundColor: data.config.corFundo,
        textColor: data.config.corTexto,
        logoUrl: resolveStoreAssetUrl(data.config.logoUrl),
        siteIconUrl: resolveStoreAssetUrl(data.config.iconeUrl),
        bannerUrl: resolveStoreAssetUrl(data.config.bannerUrl),
        description: data.config.descricao,
      });
      setMessage('Configuracoes da loja salvas.');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Nao foi possivel salvar as configuracoes.');
    }
  };

  const importLogoFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    clearFeedback();

    if (!file.type.startsWith('image/')) {
      setError('Importe um arquivo de imagem para a logo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => updateSettingsConfig({ logoUrl: String(reader.result ?? '') });
    reader.onerror = () => setError('Nao foi possivel importar a logo.');
    reader.readAsDataURL(file);
  };

  const importSiteIconFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    clearFeedback();

    if (!file.type.startsWith('image/')) {
      setError('Importe um arquivo de imagem para o icone do site.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => updateSettingsConfig({ iconeUrl: String(reader.result ?? '') });
    reader.onerror = () => setError('Nao foi possivel importar o icone do site.');
    reader.readAsDataURL(file);
  };

  const importHighlightFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !highlightDraft) return;
    clearFeedback();

    if (!file.type.startsWith('image/')) {
      setError('Importe um arquivo de imagem para o destaque.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setHighlightDraft({ ...highlightDraft, imageUrl: String(reader.result ?? '') });
    reader.onerror = () => setError('Nao foi possivel importar a imagem do destaque.');
    reader.readAsDataURL(file);
  };

  const pageData = tab === 'pedidos' ? orders : products;

  return (
    <StoreLayout>
      <Stack gap={3}>
        <Box>
          <Typography fontWeight={900} variant="h4">Administracao da loja</Typography>
          <Typography color="text.secondary">Catalogo, pedidos, pagamentos e destaques da empresa logada.</Typography>
        </Box>

        <Paper sx={{ borderRadius: 2 }}>
          <Tabs value={tab} variant="scrollable" onChange={(_, next) => navigate(tabPaths[next as AdminTab])}>
            <Tab icon={<Inventory2OutlinedIcon />} iconPosition="start" label="Produtos" value="produtos" />
            <Tab icon={<LocalShippingOutlinedIcon />} iconPosition="start" label="Pedidos" value="pedidos" />
            <Tab icon={<PaymentsOutlinedIcon />} iconPosition="start" label="Pagamentos" value="pagamentos" />
            <Tab icon={<StarBorderOutlinedIcon />} iconPosition="start" label="Destaques" value="destaques" />
            <Tab icon={<SettingsOutlinedIcon />} iconPosition="start" label="Configuracoes" value="configuracoes" />
          </Tabs>
        </Paper>

        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        {(tab === 'produtos' || tab === 'destaques') && (
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item md={5} xs={12}><TextField fullWidth label="Buscar produto" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /></Grid>
              <Grid item md={3} xs={12}><FormControl fullWidth><InputLabel>Status loja</InputLabel><Select disabled={tab === 'destaques'} label="Status loja" value={tab === 'destaques' ? 'visible' : filters.visible} onChange={(event) => setFilters({ ...filters, visible: event.target.value })}><MenuItem value="">Todos</MenuItem><MenuItem value="visible">Visiveis</MenuItem><MenuItem value="hidden">Ocultos</MenuItem></Select></FormControl></Grid>
              <Grid item md={3} xs={12}><FormControl fullWidth><InputLabel>Grupo</InputLabel><Select label="Grupo" value={filters.grupo} onChange={(event) => setFilters({ ...filters, grupo: event.target.value })}><MenuItem value="">Todos</MenuItem>{groups.map((group) => <MenuItem key={group.codigo} value={String(group.codigo)}>{group.descricao}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item md={1} xs={12}><Button fullWidth sx={{ height: '100%' }} variant="contained" onClick={runSearch}>Filtrar</Button></Grid>
            </Grid>
          </Paper>
        )}

        {tab === 'pedidos' && (
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item md={3} xs={12}><FormControl fullWidth><InputLabel>Status</InputLabel><Select label="Status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><MenuItem value="">Todos</MenuItem>{statusOptions.map((status) => <MenuItem key={status} value={status}>{statusLabels[status]}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item md={3} xs={12}><TextField fullWidth label="Cliente" value={filters.cliente} onChange={(event) => setFilters({ ...filters, cliente: event.target.value })} /></Grid>
              <Grid item md={2} xs={12}><TextField fullWidth InputLabelProps={{ shrink: true }} label="Inicio" type="date" value={filters.startDate} onChange={(event) => setFilters({ ...filters, startDate: event.target.value })} /></Grid>
              <Grid item md={2} xs={12}><TextField fullWidth InputLabelProps={{ shrink: true }} label="Fim" type="date" value={filters.endDate} onChange={(event) => setFilters({ ...filters, endDate: event.target.value })} /></Grid>
              <Grid item md={2} xs={12}><Button fullWidth sx={{ height: '100%' }} variant="contained" onClick={runSearch}>Filtrar</Button></Grid>
            </Grid>
          </Paper>
        )}

        {loading && <Box display="flex" justifyContent="center" py={3}><CircularProgress /></Box>}

        {tab === 'produtos' && !loading && (
          <Paper>
            <Table>
              <TableHead><TableRow><TableCell>Produto</TableCell><TableCell>Grupo</TableCell><TableCell>Preco</TableCell><TableCell>Estoque</TableCell><TableCell>Status loja</TableCell><TableCell align="right">Acao</TableCell></TableRow></TableHead>
              <TableBody>{products.data.map((product) => <TableRow key={product.codigo}><TableCell><Typography fontWeight={800}>{product.descricao}</Typography><Typography color="text.secondary" variant="body2">#{product.codigo}</Typography></TableCell><TableCell>{product.nomeGrupo ?? '-'}</TableCell><TableCell>{formatCurrency(Number(product.precoVenda ?? 0))}</TableCell><TableCell>{Number(product.estoqueAtual ?? 0)}</TableCell><TableCell><Chip color={product.lojaVisivel ? 'success' : 'default'} label={product.lojaVisivel ? 'Visivel' : 'Oculto'} /></TableCell><TableCell align="right"><Switch checked={product.lojaVisivel} onChange={() => void toggleVisibility(product)} /></TableCell></TableRow>)}</TableBody>
            </Table>
          </Paper>
        )}

        {tab === 'pedidos' && !loading && (
          <Paper>
            <Table>
              <TableHead><TableRow><TableCell>Pedido</TableCell><TableCell>Cliente</TableCell><TableCell>Status</TableCell><TableCell>Total</TableCell><TableCell>Data</TableCell><TableCell align="right">Acao</TableCell></TableRow></TableHead>
              <TableBody>{orders.data.map((order) => <TableRow key={order.id}><TableCell>#{order.id}<Typography color="text.secondary" variant="body2">{order.itemsCount} item(ns)</Typography></TableCell><TableCell>{order.customerName ?? '-'}</TableCell><TableCell><Chip label={statusLabels[order.status] ?? order.status} /></TableCell><TableCell>{formatCurrency(Number(order.total))}</TableCell><TableCell>{formatDate(order.createdAt)}</TableCell><TableCell align="right"><Button onClick={() => void openOrder(order.id)}>Detalhes</Button></TableCell></TableRow>)}</TableBody>
            </Table>
          </Paper>
        )}

        {(tab === 'produtos' || tab === 'pedidos') && <TablePagination component="div" count={pageData.total} page={page} rowsPerPage={pageData.limit} rowsPerPageOptions={[pageData.limit]} onPageChange={(_, nextPage) => { setPage(nextPage); if (tab === 'pedidos') void loadOrders(nextPage); else void loadProducts(nextPage); }} />}

        {tab === 'pagamentos' && !loading && (
          <Grid container spacing={3}>
            <Grid item md={5} xs={12}><Paper sx={{ p: 3 }}><Stack gap={2}><Typography fontWeight={800} variant="h6">{paymentForm.id ? 'Editar pagamento' : 'Nova forma de pagamento'}</Typography><FormControl fullWidth><InputLabel>Tipo</InputLabel><Select label="Tipo" value={paymentForm.tipo} onChange={(event) => setPaymentForm({ ...paymentForm, tipo: event.target.value })}>{paymentTypes.map((type) => <MenuItem key={type} value={type}>{type.replace(/_/g, ' ')}</MenuItem>)}</Select></FormControl><TextField label="Descricao" value={paymentForm.descricao} onChange={(event) => setPaymentForm({ ...paymentForm, descricao: event.target.value })} /><FormControlLabel control={<Switch checked={paymentForm.ativo} onChange={(event) => setPaymentForm({ ...paymentForm, ativo: event.target.checked })} />} label="Ativo no checkout" /><FormControlLabel control={<Switch checked={paymentForm.permiteParcelamento} onChange={(event) => setPaymentForm({ ...paymentForm, permiteParcelamento: event.target.checked, maxParcelas: event.target.checked ? paymentForm.maxParcelas : 1 })} />} label="Permite parcelamento" /><Grid container spacing={2}><Grid item sm={6} xs={12}><TextField fullWidth disabled={!paymentForm.permiteParcelamento} label="Max. parcelas" type="number" value={paymentForm.maxParcelas} onChange={(event) => setPaymentForm({ ...paymentForm, maxParcelas: Number(event.target.value) })} /></Grid><Grid item sm={6} xs={12}><TextField fullWidth label="Min. por parcela" type="number" value={paymentForm.valorMinimoParcela} onChange={(event) => setPaymentForm({ ...paymentForm, valorMinimoParcela: Number(event.target.value) })} /></Grid></Grid><TextField multiline minRows={3} label="Instrucoes" value={paymentForm.instrucoes} onChange={(event) => setPaymentForm({ ...paymentForm, instrucoes: event.target.value })} /><Button startIcon={<AddIcon />} variant="contained" onClick={() => void savePayment()}>Salvar</Button></Stack></Paper></Grid>
            <Grid item md={7} xs={12}><Paper><Table><TableHead><TableRow><TableCell>Forma</TableCell><TableCell>Parcelamento</TableCell><TableCell>Status</TableCell><TableCell align="right">Acoes</TableCell></TableRow></TableHead><TableBody>{payments.map((payment) => <TableRow key={payment.id}><TableCell><Typography fontWeight={800}>{payment.descricao}</Typography><Typography color="text.secondary" variant="body2">{payment.tipo.replace(/_/g, ' ')}</Typography></TableCell><TableCell>{payment.permiteParcelamento ? `Ate ${payment.maxParcelas}x` : 'Nao permite'}</TableCell><TableCell><Chip color={payment.ativo ? 'success' : 'default'} label={payment.ativo ? 'Ativo' : 'Inativo'} /></TableCell><TableCell align="right"><Tooltip title="Editar"><IconButton onClick={() => setPaymentForm(payment)}><EditOutlinedIcon /></IconButton></Tooltip><Switch checked={payment.ativo} onChange={() => void togglePayment(payment)} /></TableCell></TableRow>)}</TableBody></Table></Paper></Grid>
          </Grid>
        )}

        {tab === 'destaques' && !loading && (
          <Grid container spacing={3}>
            <Grid item md={5} xs={12}><Paper sx={{ p: 3 }}><Typography fontWeight={800} mb={2} variant="h6">Produtos disponiveis</Typography><Stack gap={1}>{availableHighlightProducts.map((product) => { const alreadyHighlighted = highlightedProductIds.has(product.codigo); return <Box alignItems="center" display="flex" gap={1} key={product.codigo}><Box flex={1}><Typography fontWeight={700}>{product.descricao}</Typography><Typography color="text.secondary" variant="body2">{formatCurrency(Number(product.precoVenda ?? 0))}</Typography></Box><Button disabled={alreadyHighlighted} startIcon={<AddIcon />} onClick={() => setHighlightDraft({ product, imageUrl: '' })}>{alreadyHighlighted ? 'Ja destacado' : 'Adicionar'}</Button></Box>; })}{!availableHighlightProducts.length && <Typography color="text.secondary">Nenhum produto marcado como visivel na loja foi encontrado.</Typography>}</Stack></Paper></Grid>
            <Grid item md={7} xs={12}><Paper sx={{ p: 3 }}><Typography fontWeight={800} mb={2} variant="h6">Destaques atuais</Typography><Stack divider={<Divider />} gap={1}>{highlights.map((highlight) => <Box alignItems="center" display="flex" gap={1} key={highlight.id}>{highlight.highlightImageUrl && <Box component="img" src={highlight.highlightImageUrl} sx={{ borderRadius: 1, height: 52, objectFit: 'cover', width: 72 }} />}<Box flex={1}><Typography fontWeight={800}>{highlight.descricao}</Typography><Typography color="text.secondary" variant="body2">Adicionado em {formatDate(highlight.createdAt)}</Typography>{highlight.highlightImageAvailable && <Typography color="text.secondary" variant="caption">Imagem importada</Typography>}</Box><IconButton aria-label="Remover destaque" onClick={() => void removeHighlight(highlight.id)}><DeleteOutlineIcon /></IconButton></Box>)}{!highlights.length && <Typography color="text.secondary">Nenhum produto em destaque.</Typography>}</Stack></Paper></Grid>
          </Grid>
        )}

        {tab === 'configuracoes' && !loading && (
          <Grid container spacing={3}>
            <Grid item md={7} xs={12}>
              <Paper sx={{ p: 3 }}>
                <Stack gap={2}>
                  <Typography fontWeight={800} variant="h6">Identidade do site</Typography>
                  <TextField
                    fullWidth
                    label="Nome oficial do site"
                    value={settings.config.nomeSite}
                    onChange={(event) => updateSettingsConfig({ nomeSite: event.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Logo oficial do site"
                    placeholder="https://..."
                    value={settings.config.logoUrl}
                    onChange={(event) => updateSettingsConfig({ logoUrl: event.target.value })}
                  />
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    <Button component="label" startIcon={<UploadFileOutlinedIcon />} variant="outlined">
                      Importar arquivo
                      <input hidden accept="image/*" type="file" onChange={importLogoFile} />
                    </Button>
                    {settings.config.logoUrl && (
                      <Button color="error" startIcon={<DeleteOutlineIcon />} onClick={() => updateSettingsConfig({ logoUrl: '' })}>
                        Remover logo
                      </Button>
                    )}
                  </Box>
                  <Typography color="text.secondary" variant="body2">
                    Voce pode informar um link ou importar PNG, JPG, WEBP, GIF ou SVG.
                  </Typography>
                  <TextField
                    fullWidth
                    label="Icone do site"
                    placeholder="https://..."
                    value={settings.config.iconeUrl}
                    onChange={(event) => updateSettingsConfig({ iconeUrl: event.target.value })}
                  />
                  <Box alignItems="center" display="flex" flexWrap="wrap" gap={1}>
                    <Button component="label" startIcon={<UploadFileOutlinedIcon />} variant="outlined">
                      Importar icone
                      <input hidden accept="image/*" type="file" onChange={importSiteIconFile} />
                    </Button>
                    {settings.config.iconeUrl && (
                      <Button color="error" startIcon={<DeleteOutlineIcon />} onClick={() => updateSettingsConfig({ iconeUrl: '' })}>
                        Remover icone
                      </Button>
                    )}
                    {settings.config.iconeUrl && (
                      <Box
                        component="img"
                        src={resolveStoreAssetUrl(settings.config.iconeUrl)}
                        alt="Icone do site"
                        sx={{ borderRadius: 1, height: 32, objectFit: 'contain', width: 32 }}
                      />
                    )}
                  </Box>
                  <Typography color="text.secondary" variant="body2">
                    Este icone aparece na aba do navegador. Use uma imagem quadrada, preferencialmente 32x32 ou 64x64.
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item sm={3} xs={12}>
                      <TextField
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        label="Cor primaria"
                        type="color"
                        value={colorPickerValue(settings.config.corPrimaria)}
                        onChange={(event) => updateSettingsConfig({ corPrimaria: event.target.value })}
                      />
                    </Grid>
                    <Grid item sm={3} xs={12}>
                      <TextField
                        fullWidth
                        label="Hex primaria"
                        value={settings.config.corPrimaria.replace(/^#/, '')}
                        onChange={(event) => updateSettingsConfig({ corPrimaria: normalizeHexColor(event.target.value) })}
                      />
                    </Grid>
                    <Grid item sm={3} xs={12}>
                      <TextField
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        label="Cor secundaria"
                        type="color"
                        value={colorPickerValue(settings.config.corSecundaria)}
                        onChange={(event) => updateSettingsConfig({ corSecundaria: event.target.value })}
                      />
                    </Grid>
                    <Grid item sm={3} xs={12}>
                      <TextField
                        fullWidth
                        label="Hex secundaria"
                        value={settings.config.corSecundaria.replace(/^#/, '')}
                        onChange={(event) => updateSettingsConfig({ corSecundaria: normalizeHexColor(event.target.value) })}
                      />
                    </Grid>
                  </Grid>
                  <Button variant="contained" onClick={() => void saveSettings()}>Salvar configuracoes</Button>
                </Stack>
              </Paper>
            </Grid>
            <Grid item md={5} xs={12}>
              <Paper sx={{ p: 3 }}>
                <Stack gap={2}>
                  <Typography fontWeight={800} variant="h6">Previa</Typography>
                  <Box
                    sx={{
                      alignItems: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      display: 'flex',
                      gap: 2,
                      p: 2,
                    }}
                  >
                    {settings.config.logoUrl ? (
                      <Box component="img" src={resolveStoreAssetUrl(settings.config.logoUrl)} alt={settings.config.nomeSite} sx={{ maxHeight: 56, maxWidth: 160, objectFit: 'contain' }} />
                    ) : (
                      <StorefrontIcon sx={{ color: colorPickerValue(settings.config.corPrimaria), fontSize: 40 }} />
                    )}
                    <Box>
                      <Typography fontWeight={900}>{settings.config.nomeSite || settings.fantasia || 'Nome do site'}</Typography>
                      <Typography color="text.secondary" variant="body2">{settings.razaoSocial || 'Empresa logada'}</Typography>
                    </Box>
                  </Box>
                  <Box display="flex" gap={1}>
                    <Chip label="Primaria" sx={{ bgcolor: colorPickerValue(settings.config.corPrimaria), color: '#fff' }} />
                    <Chip label="Secundaria" sx={{ bgcolor: colorPickerValue(settings.config.corSecundaria), color: '#fff' }} />
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Stack>

      <Dialog fullWidth maxWidth="sm" open={Boolean(highlightDraft)} onClose={() => setHighlightDraft(null)}>
        <DialogTitle>Adicionar destaque</DialogTitle>
        <DialogContent>
          {highlightDraft && (
            <Stack gap={2} sx={{ pt: 1 }}>
              <Box>
                <Typography fontWeight={800}>{highlightDraft.product.descricao}</Typography>
                <Typography color="text.secondary" variant="body2">{formatCurrency(Number(highlightDraft.product.precoVenda ?? 0))}</Typography>
              </Box>
              <TextField
                fullWidth
                label="Imagem do destaque"
                placeholder="https://..."
                value={highlightDraft.imageUrl.startsWith('data:image/') ? 'Imagem importada' : highlightDraft.imageUrl}
                onChange={(event) => setHighlightDraft({ ...highlightDraft, imageUrl: event.target.value })}
              />
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Button component="label" startIcon={<UploadFileOutlinedIcon />} variant="outlined">
                  Importar imagem
                  <input hidden accept="image/*" type="file" onChange={importHighlightFile} />
                </Button>
                {highlightDraft.imageUrl && (
                  <Button color="error" startIcon={<DeleteOutlineIcon />} onClick={() => setHighlightDraft({ ...highlightDraft, imageUrl: '' })}>
                    Remover imagem
                  </Button>
                )}
              </Box>
              {highlightDraft.imageUrl && (
                <Box
                  component="img"
                  src={highlightDraft.imageUrl}
                  alt={highlightDraft.product.descricao}
                  sx={{ aspectRatio: '16 / 9', borderRadius: 1, objectFit: 'cover', width: '100%' }}
                />
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHighlightDraft(null)}>Cancelar</Button>
          <Button disabled={!highlightDraft?.imageUrl} variant="contained" onClick={() => void addHighlight()}>
            Salvar destaque
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog fullWidth maxWidth="md" open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)}>
        <DialogTitle>{selectedOrder ? `Pedido #${selectedOrder.id}` : 'Pedido'}</DialogTitle>
        <DialogContent dividers>{selectedOrder && <Stack gap={3}><Box display="flex" flexWrap="wrap" gap={1}><Chip label={statusLabels[selectedOrder.status] ?? selectedOrder.status} /><Chip label={formatCurrency(Number(selectedOrder.total))} color="primary" /></Box><FormControl fullWidth><InputLabel>Status</InputLabel><Select label="Status" value={selectedOrder.status} onChange={(event) => void updateOrderStatus(event.target.value)}>{statusOptions.map((status) => <MenuItem key={status} value={status}>{statusLabels[status]}</MenuItem>)}</Select></FormControl><Box><Typography fontWeight={800} mb={1}>Itens</Typography><Stack divider={<Divider />}>{selectedOrder.items.map((item) => <Box display="flex" justifyContent="space-between" py={1} key={item.id}><Typography>{Number(item.quantity)}x {item.productName}</Typography><Typography fontWeight={800}>{formatCurrency(Number(item.total))}</Typography></Box>)}</Stack></Box><Box><Box alignItems="center" display="flex" justifyContent="space-between"><Typography fontWeight={800}>Entrega</Typography><Button startIcon={<EditOutlinedIcon />} onClick={() => setDeliveryEdit(selectedOrder.delivery ?? {})}>Editar</Button></Box>{selectedOrder.delivery ? <Typography color="text.secondary">{selectedOrder.delivery.street}, {selectedOrder.delivery.number}<br />{selectedOrder.delivery.district} - {selectedOrder.delivery.city}/{selectedOrder.delivery.state}<br />CEP {selectedOrder.delivery.zipCode}</Typography> : <Typography color="text.secondary">Nao informada.</Typography>}</Box><Box><Typography fontWeight={800}>Pagamento</Typography><Typography color="text.secondary">{selectedOrder.payment?.description ?? selectedOrder.payment?.brand ?? 'Nao informado'}{selectedOrder.payment?.installments ? ` - ${selectedOrder.payment.installments}x` : ''}</Typography></Box>{selectedOrder.cancellation && <Alert severity="warning">Cancelamento: {selectedOrder.cancellation.reason}</Alert>}<Box><Typography fontWeight={800} mb={1}>Historico</Typography><Stack gap={1}>{selectedOrder.logs.map((log) => <Paper variant="outlined" sx={{ p: 1.5 }} key={log.id}><Typography fontWeight={700}>{log.field ? `Alteracao em ${log.field}` : 'Alteracao de status'}</Typography><Typography color="text.secondary" variant="body2">{formatDate(log.createdAt)} - {log.adminName ?? `Usuario ${log.adminUserId ?? ''}`}</Typography><Typography variant="body2">{log.previousStatus || '-'}{' -> '}{log.newStatus || '-'}</Typography>{log.justification && <Typography color="text.secondary" variant="body2">Justificativa: {log.justification}</Typography>}</Paper>)}{!selectedOrder.logs.length && <Typography color="text.secondary">Nenhum log registrado.</Typography>}</Stack></Box></Stack>}</DialogContent>
        <DialogActions><Button color="error" startIcon={<CancelOutlinedIcon />} onClick={() => { setCancelOrderId(selectedOrder?.id ?? null); setCancelReason(''); }}>Cancelar pedido</Button><Button onClick={() => setSelectedOrder(null)}>Fechar</Button></DialogActions>
      </Dialog>

      <Dialog open={Boolean(cancelOrderId)} onClose={() => setCancelOrderId(null)}>
        <DialogTitle>Cancelar pedido</DialogTitle>
        <DialogContent><Stack gap={2} sx={{ pt: 1, minWidth: 360 }}><Alert severity="warning">Informe a justificativa que sera visivel ao cliente.</Alert><TextField autoFocus multiline minRows={3} label="Justificativa" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} /></Stack></DialogContent>
        <DialogActions><Button onClick={() => setCancelOrderId(null)}>Voltar</Button><Button color="error" disabled={!cancelReason.trim()} variant="contained" onClick={() => void cancelOrder()}>Confirmar cancelamento</Button></DialogActions>
      </Dialog>

      <Dialog fullWidth maxWidth="sm" open={Boolean(deliveryEdit)} onClose={() => setDeliveryEdit(null)}>
        <DialogTitle>Editar entrega</DialogTitle>
        <DialogContent>{deliveryEdit && <Stack gap={2} sx={{ pt: 1 }}><TextField label="Rua" value={deliveryEdit.street ?? ''} onChange={(event) => setDeliveryEdit({ ...deliveryEdit, street: event.target.value })} /><TextField label="Numero" value={deliveryEdit.number ?? ''} onChange={(event) => setDeliveryEdit({ ...deliveryEdit, number: event.target.value })} /><TextField label="Complemento" value={deliveryEdit.complement ?? ''} onChange={(event) => setDeliveryEdit({ ...deliveryEdit, complement: event.target.value })} /><TextField label="Bairro" value={deliveryEdit.district ?? ''} onChange={(event) => setDeliveryEdit({ ...deliveryEdit, district: event.target.value })} /><Grid container spacing={2}><Grid item sm={8} xs={12}><TextField fullWidth label="Cidade" value={deliveryEdit.city ?? ''} onChange={(event) => setDeliveryEdit({ ...deliveryEdit, city: event.target.value })} /></Grid><Grid item sm={4} xs={12}><TextField fullWidth label="UF" value={deliveryEdit.state ?? ''} onChange={(event) => setDeliveryEdit({ ...deliveryEdit, state: event.target.value.toUpperCase().slice(0, 2) })} /></Grid></Grid><TextField label="CEP" value={deliveryEdit.zipCode ?? ''} onChange={(event) => setDeliveryEdit({ ...deliveryEdit, zipCode: event.target.value })} /></Stack>}</DialogContent>
        <DialogActions><Button onClick={() => setDeliveryEdit(null)}>Cancelar</Button><Button variant="contained" onClick={() => void saveDelivery()}>Salvar entrega</Button></DialogActions>
      </Dialog>
    </StoreLayout>
  );
};
