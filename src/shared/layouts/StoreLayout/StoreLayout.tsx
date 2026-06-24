import { ReactNode, useState } from 'react';
import { Drawer } from '@mui/material';

import { CartDrawer } from '../../components/CartDrawer';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { LayoutRoot, MainContent } from './styles';

interface StoreLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export const StoreLayout = ({ children, showHeader = true }: StoreLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <LayoutRoot>
      {showHeader && (
        <Header onCartClick={() => setIsCartOpen(true)} onMenuClick={() => setIsSidebarOpen(true)} />
      )}

      {showHeader && (
        <Drawer open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} sx={{ display: { md: 'none' } }}>
        <Sidebar />
        </Drawer>
      )}

      <MainContent component="main" withoutHeader={!showHeader}>{children}</MainContent>
      {showHeader && <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />}
    </LayoutRoot>
  );
};
