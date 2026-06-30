import { alpha, styled } from '@mui/material/styles';
import { AppBar, Box, InputBase, Toolbar } from '@mui/material';

export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backdropFilter: 'blur(18px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.92),
  borderBottom: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
  boxShadow: '0 10px 32px rgba(15, 23, 42, 0.08)',
}));

export const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  gap: theme.spacing(2),
  minHeight: 72,
}));

export const Logo = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  color: theme.palette.primary.main,
  display: 'flex',
  fontSize: 24,
  fontWeight: 800,
  gap: theme.spacing(1),
  whiteSpace: 'nowrap',
}));

export const LogoImage = styled('img')(() => ({
  display: 'block',
  maxHeight: 40,
  maxWidth: 160,
  objectFit: 'contain',
}));

export const SearchBox = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: alpha(theme.palette.primary.main, 0.07),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
  borderRadius: 999,
  display: 'flex',
  flex: 1,
  gap: theme.spacing(1),
  maxWidth: 520,
  padding: theme.spacing(0.4, 1.5),
}));

export const SearchInput = styled(InputBase)(() => ({
  flex: 1,
  minHeight: 38,
}));
