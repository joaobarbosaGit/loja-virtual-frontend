import { useContext } from 'react';

import { StoreThemeContext } from '../contexts/StoreThemeContext';

export const useStoreTheme = () => {
  const context = useContext(StoreThemeContext);

  if (!context) {
    throw new Error('useStoreTheme must be used within StoreThemeProvider');
  }

  return context;
};
