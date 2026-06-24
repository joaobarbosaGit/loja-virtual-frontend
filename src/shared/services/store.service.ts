import { StoreConfig, StoreTheme } from '../protocols';
import { environments } from '../environments';
import { api } from './api.service';

export const defaultStoreTheme: StoreTheme = {
  primaryColor: '#1976d2',
  secondaryColor: '#00b894',
  backgroundColor: '#f8fafc',
  textColor: '#111827',
  logoUrl: '',
  bannerUrl: '',
  description: '',
};

const mapStoreTheme = (storeConfig: StoreConfig): StoreTheme => ({
  primaryColor: storeConfig.config.corPrimaria || defaultStoreTheme.primaryColor,
  secondaryColor: storeConfig.config.corSecundaria || defaultStoreTheme.secondaryColor,
  backgroundColor: storeConfig.config.corFundo || defaultStoreTheme.backgroundColor,
  textColor: storeConfig.config.corTexto || defaultStoreTheme.textColor,
  logoUrl: storeConfig.config.logoUrl || defaultStoreTheme.logoUrl,
  bannerUrl: storeConfig.config.bannerUrl || defaultStoreTheme.bannerUrl,
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
