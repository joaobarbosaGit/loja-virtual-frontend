export interface Product {
  id: string;
  code: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  categoryId: string;
  categoryName: string;
  featured: boolean;
  stock: number;
  allowOutOfStockSale: boolean;
}

export interface Category {
  id: string;
  code: number;
  name: string;
  icon: string;
  imageUrl: string;
  featured: boolean;
}

export interface ApiCategory {
  codigo: number;
  descricao: string;
  config: {
    slug: string;
    icone: string;
    imagemUrl: string;
    ordem: number;
    destaque: boolean;
  };
}

export interface ApiProduct {
  codigo: number;
  empresa: number;
  descricao: string;
  grupo: number | null;
  nomeGrupo: string | null;
  precoVenda: number | null;
  precoPromocao: number | null;
  estoqueAtual: number | null;
  codigoBarra: string | null;
  ativo: string;
  imagemDisponivel: boolean;
  config: {
    imagemUrl: string;
    descricaoLoja: string;
    destaque: boolean;
    ordem: number;
    permiteVendaSemEstoque: boolean;
  };
}

export interface ProductsPage {
  page: number;
  limit: number;
  total: number;
  data: Product[];
}

export interface ProductsFilters {
  grupo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-desc';
}
