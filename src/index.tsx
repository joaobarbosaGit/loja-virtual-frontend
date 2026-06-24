import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { App } from './App';
import { AuthProvider } from './shared/contexts/AuthContext';
import { CartProvider } from './shared/contexts/CartContext';
import { StoreThemeProvider } from './shared/contexts/StoreThemeContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreThemeProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </StoreThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
