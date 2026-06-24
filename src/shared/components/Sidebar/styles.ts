import { Box, ListItemButton } from '@mui/material';
import { styled } from '@mui/material/styles';

export const SidebarContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(2),
  width: 280,
}));

export const NavItem = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(0.5),
})) as typeof ListItemButton;
