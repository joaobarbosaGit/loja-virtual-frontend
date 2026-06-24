import { Box, Drawer } from '@mui/material';
import { styled } from '@mui/material/styles';

export const LayoutRoot = styled(Box)(() => ({
  minHeight: '100vh',
}));

export const DesktopDrawer = styled(Drawer)(() => ({
  '& .MuiDrawer-paper': {
    boxSizing: 'border-box',
    marginTop: 72,
    width: 280,
  },
}));

export const MainContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'withoutHeader',
})<{ withoutHeader?: boolean }>(({ theme, withoutHeader }) => ({
  margin: '0 auto',
  maxWidth: 1440,
  padding: withoutHeader ? theme.spacing(5, 3) : theme.spacing(11, 3, 5),
  width: '100%',
  [theme.breakpoints.up('md')]: {
    padding: withoutHeader ? theme.spacing(7, 4) : theme.spacing(12, 4, 6),
  },
}));
