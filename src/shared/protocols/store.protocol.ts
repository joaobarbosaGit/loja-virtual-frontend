export interface StoreTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  logoUrl: string;
  bannerUrl: string;
  description: string;
}

export interface StoreConfig {
  codigo: number;
  razaoSocial: string;
  fantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  slug: string;
  config: {
    corPrimaria: string;
    corSecundaria: string;
    corFundo: string;
    corTexto: string;
    logoUrl: string;
    bannerUrl: string;
    descricao: string;
  };
}
