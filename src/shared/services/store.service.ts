import { StoreConfig, StoreTheme } from '../protocols';
import { environments } from '../environments';
import { api } from './api.service';

export const defaultStoreTheme: StoreTheme = {
  siteName: 'Loja B2C',
  primaryColor: '#1976d2',
  secondaryColor: '#00b894',
  backgroundColor: '#f8fafc',
  textColor: '#111827',
  logoUrl: '',
  siteIconUrl: '',
  bannerUrl: '',
  description: '',
};

export const resolveStoreAssetUrl = (url?: string) => {
  if (!url) return '';
  if (/^(data:|https?:\/\/)/i.test(url)) return url;
  if (url.startsWith('/')) return `${environments.apiBaseUrl}${url}`;
  return url;
};

const mapStoreTheme = (storeConfig: StoreConfig): StoreTheme => ({
  siteName: storeConfig.config.nomeSite || storeConfig.fantasia || defaultStoreTheme.siteName,
  primaryColor: storeConfig.config.corPrimaria || defaultStoreTheme.primaryColor,
  secondaryColor: storeConfig.config.corSecundaria || defaultStoreTheme.secondaryColor,
  backgroundColor: storeConfig.config.corFundo || defaultStoreTheme.backgroundColor,
  textColor: storeConfig.config.corTexto || defaultStoreTheme.textColor,
  logoUrl: resolveStoreAssetUrl(storeConfig.config.logoUrl) || defaultStoreTheme.logoUrl,
  siteIconUrl: resolveStoreAssetUrl(storeConfig.config.iconeUrl) || defaultStoreTheme.siteIconUrl,
  bannerUrl: resolveStoreAssetUrl(storeConfig.config.bannerUrl) || defaultStoreTheme.bannerUrl,
  description: storeConfig.config.descricao || defaultStoreTheme.description,
});

export const storeService = {
  async getConfig(): Promise<StoreConfig> {
    const { data } = await api.get<StoreConfig>(`/loja/${environments.storeSlug}/config`);
    return data;
  },

  async getTheme(): Promise<StoreTheme> {
    const config = await this.getConfig();
    return mapStoreTheme(config);
  },
};
