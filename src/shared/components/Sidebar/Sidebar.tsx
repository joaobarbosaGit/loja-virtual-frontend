import { useEffect, useState } from 'react';
import CategoryIcon from '@mui/icons-material/Category';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { Divider, Link, List, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { Category } from '../../protocols';
import { productsService } from '../../services';
import { useStoreTheme } from '../../hooks';
import { NavItem, SidebarContainer, SidebarLogo, SidebarLogoImage } from './styles';

export const Sidebar = () => {
  const { storeTheme } = useStoreTheme();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    void productsService.listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  return (
    <SidebarContainer>
      <SidebarLogo>
        {storeTheme.logoUrl ? (
          <SidebarLogoImage alt={storeTheme.siteName} src={storeTheme.logoUrl} />
        ) : (
          <StorefrontIcon color="primary" />
        )}
        <Link color="inherit" component={RouterLink} to="/home" underline="none">
          {storeTheme.siteName}
        </Link>
      </SidebarLogo>

      <Typography color="text.secondary" fontWeight={700} mb={1} variant="overline">
        Navegacao
      </Typography>
      <List disablePadding>
        <NavItem component={RouterLink} to="/home">
          <ListItemIcon>
            <HomeOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </NavItem>
        <NavItem component={RouterLink} to="/products">
          <ListItemIcon>
            <ShoppingBagOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Produtos" />
        </NavItem>
        <NavItem component={RouterLink} to="/profile">
          <ListItemIcon>
            <PersonOutlineIcon />
          </ListItemIcon>
          <ListItemText primary="Perfil" />
        </NavItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography color="text.secondary" fontWeight={700} mb={1} variant="overline">
        Categorias
      </Typography>
      <List disablePadding>
        {categories.map((category) => (
          <NavItem component={RouterLink} key={category.id} to={`/products?grupo=${category.id}`}>
            <ListItemIcon>
              <CategoryIcon />
            </ListItemIcon>
            <ListItemText primary={category.name} />
          </NavItem>
        ))}
      </List>
    </SidebarContainer>
  );
};
