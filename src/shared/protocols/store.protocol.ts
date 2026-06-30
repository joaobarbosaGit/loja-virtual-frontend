export interface StoreTheme {
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  logoUrl: string;
  siteIconUrl: string;
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
}
