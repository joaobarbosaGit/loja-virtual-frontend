import { ApiCategory, ApiProduct, Category, Product, ProductsFilters, ProductsPage } from '../protocols';
import { environments } from '../environments';
import { api } from './api.service';

const fallbackImageUrl = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80';

const mapCategory = (category: ApiCategory): Category => ({
  id: String(category.codigo),
  code: category.codigo,
  name: category.descricao,
  icon: category.config.icone || 'Storefront',
  imageUrl: category.config.imagemUrl,
  featured: category.config.destaque,
});

const mapProduct = (product: ApiProduct): Product => {
  const promotionalPrice = product.precoPromocao && product.precoPromocao > 0
    ? product.precoPromocao
    : undefined;

  return {
    id: String(product.codigo),
    code: product.codigo,
    name: product.descricao,
    description: product.config.descricaoLoja || product.descricao,
    price: promotionalPrice ?? product.precoVenda ?? 0,
    originalPrice: promotionalPrice ? product.precoVenda ?? undefined : undefined,
    imageUrl: product.imagemDisponivel
      ? `${environments.apiBaseUrl}/loja/${environments.storeSlug}/produtos/${product.codigo}/imagem`
      : product.config.imagemUrl || fallbackImageUrl,
    highlightId: product.highlightId,
    highlightImageUrl: product.highlightImageAvailable && product.highlightId
      ? `${environments.apiBaseUrl}/loja/${environments.storeSlug}/destaques/${product.highlightId}/imagem`
      : product.highlightImageUrl || undefined,
    highlightedAt: product.highlightedAt,
    categoryId: product.grupo ? String(product.grupo) : '',
    categoryName: product.nomeGrupo ?? '',
    featured: product.config.destaque || Boolean(product.highlightId),
    stock: product.estoqueAtual ?? 0,
    allowOutOfStockSale: product.config.permiteVendaSemEstoque,
  };
};

export const productsService = {
  async listProducts(filters?: ProductsFilters): Promise<ProductsPage> {
    const { data } = await api.get<{
      page: number;
      limit: number;
      total: number;
      data: ApiProduct[];
    }>(`/loja/${environments.storeSlug}/produtos`, {
      params: {
        grupo: filters?.grupo,
        search: filters?.search,
        page: filters?.page,
        limit: filters?.limit,
        sort: filters?.sort,
      },
    });

    return {
      page: data.page,
      limit: data.limit,
      total: data.total,
      data: data.data.map(mapProduct),
    };
  },

  async listFeaturedProducts(): Promise<Product[]> {
    const { data } = await api.get<ApiProduct[]>(`/loja/${environments.storeSlug}/destaques`);
    return data.map(mapProduct);
  },

  async listCategories(): Promise<Category[]> {
    const { data } = await api.get<ApiCategory[]>(`/loja/${environments.storeSlug}/categorias`);
    return data.map(mapCategory);
  },

  async getProductById(productId: string): Promise<Product | undefined> {
    const { data } = await api.get<ApiProduct>(`/loja/${environments.storeSlug}/produtos/${productId}`);
    return mapProduct(data);
  },
};
