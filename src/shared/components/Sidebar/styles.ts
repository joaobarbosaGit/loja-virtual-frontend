import { Box, ListItemButton } from '@mui/material';
import { styled } from '@mui/material/styles';

export const SidebarContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(2),
  width: 280,
}));

export const SidebarLogo = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  color: theme.palette.primary.main,
  display: 'flex',
  fontSize: 22,
  fontWeight: 800,
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  minHeight: 48,
}));

export const SidebarLogoImage = styled('img')(() => ({
  display: 'block',
  maxHeight: 40,
  maxWidth: 148,
  objectFit: 'contain',
}));

export const NavItem = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(0.5),
})) as typeof ListItemButton;
