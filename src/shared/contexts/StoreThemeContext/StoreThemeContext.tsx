import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { Theme } from '@mui/material/styles';

import { StoreTheme } from '../../protocols';
import { createMuiTheme } from '../../themes';
import { defaultStoreTheme, storeService } from '../../services';

interface StoreThemeContextValue {
  storeTheme: StoreTheme;
  muiTheme: Theme;
  updateStoreTheme: (theme: StoreTheme) => void;
}

export const StoreThemeContext = createContext<StoreThemeContextValue | undefined>(undefined);

interface StoreThemeProviderProps {
  children: ReactNode;
}

export const StoreThemeProvider = ({ children }: StoreThemeProviderProps) => {
  const [storeTheme, setStoreTheme] = useState<StoreTheme>(defaultStoreTheme);

  useEffect(() => {
    void storeService
      .getTheme()
      .then(setStoreTheme)
      .catch(() => setStoreTheme(defaultStoreTheme));
  }, []);

  useEffect(() => {
    document.title = storeTheme.siteName || defaultStoreTheme.siteName;

    let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }

    if (storeTheme.siteIconUrl) {
      favicon.href = storeTheme.siteIconUrl;
    } else {
      favicon.removeAttribute('href');
    }
  }, [storeTheme.siteIconUrl, storeTheme.siteName]);

  const value = useMemo(
    () => ({
      storeTheme,
      muiTheme: createMuiTheme(storeTheme),
      updateStoreTheme: setStoreTheme,
    }),
    [storeTheme],
  );

  return <StoreThemeContext.Provider value={value}>{children}</StoreThemeContext.Provider>;
};
