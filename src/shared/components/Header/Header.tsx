import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import {
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { MouseEvent, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { useCart } from '../../hooks';
import { useAuth } from '../../hooks';
import { Logo, StyledAppBar, StyledToolbar } from './styles';

interface HeaderProps {
  onCartClick: () => void;
  onMenuClick: () => void;
}

export const Header = ({ onCartClick, onMenuClick }: HeaderProps) => {
  const { itemsCount } = useCart();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const isUserMenuOpen = Boolean(userMenuAnchor);

  const handleOpenUserMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };

  const handleAskLogout = () => {
    handleCloseUserMenu();
    setIsLogoutDialogOpen(true);
  };

  const handleConfirmLogout = async () => {
    await logout();
    setIsLogoutDialogOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <StyledAppBar position="fixed">
      <StyledToolbar>
        <Tooltip title="Abrir menu">
          <IconButton edge="start" onClick={onMenuClick} sx={{ display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
        </Tooltip>

        <Logo>
          <StorefrontIcon color="primary" />
          <Link color="inherit" component={RouterLink} to={user?.role === 'admin' ? '/admin' : '/home'} underline="none">
            Loja B2C
          </Link>
        </Logo>

        <Box sx={{ flex: 1 }} />

        {user?.role === 'admin' && (
          <Tooltip title="Dashboard admin">
            <IconButton color="primary" component={RouterLink} to="/admin">
              <DashboardOutlinedIcon />
            </IconButton>
          </Tooltip>
        )}

        {user?.role !== 'admin' && (
          <Tooltip title="Carrinho">
            <IconButton color="primary" onClick={onCartClick}>
              <Badge badgeContent={itemsCount} color="secondary">
                <ShoppingCartOutlinedIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        )}

        <Button
          aria-controls={isUserMenuOpen ? 'user-menu' : undefined}
          aria-expanded={isUserMenuOpen ? 'true' : undefined}
          aria-haspopup="true"
          color="primary"
          endIcon={<ExpandMoreIcon />}
          startIcon={<AccountCircleOutlinedIcon />}
          sx={{ ml: 'auto' }}
          variant="outlined"
          onClick={handleOpenUserMenu}
        >
          {user ? user.name.split(' ')[0] : 'Conta'}
        </Button>

        <Menu
          anchorEl={userMenuAnchor}
          id="user-menu"
          open={isUserMenuOpen}
          onClose={handleCloseUserMenu}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        >
          {user?.role === 'admin' ? (
            <>
              <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/admin'); }}>
                <ListItemIcon>
                  <DashboardOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Dashboard</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/admin/produtos-loja'); }}>
                <ListItemIcon>
                  <StorefrontIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Produtos da loja</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/admin/pedidos'); }}>
                <ListItemIcon>
                  <ReceiptLongOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Pedidos e entregas</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/admin/pagamentos'); }}>
                <ListItemIcon>
                  <SettingsOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Pagamentos</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/admin/destaques'); }}>
                <ListItemIcon>
                  <SettingsOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Destaques</ListItemText>
              </MenuItem>
            </>
          ) : (
            <>
              <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
                <ListItemIcon>
                  <PersonOutlineOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Perfil</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/orders'); }}>
                <ListItemIcon>
                  <ReceiptLongOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Meus pedidos</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
                <ListItemIcon>
                  <SettingsOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Configuracoes</ListItemText>
              </MenuItem>
            </>
          )}
          <MenuItem onClick={handleAskLogout}>
            <ListItemIcon>
              <LogoutOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>

        <Dialog open={isLogoutDialogOpen} onClose={() => setIsLogoutDialogOpen(false)}>
          <DialogTitle>Sair da conta?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Voce sera levado para a tela de login e precisara entrar novamente para acessar a loja.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsLogoutDialogOpen(false)}>Cancelar</Button>
            <Button color="error" variant="contained" onClick={handleConfirmLogout}>
              Sair
            </Button>
          </DialogActions>
        </Dialog>
      </StyledToolbar>
    </StyledAppBar>
  );
};
