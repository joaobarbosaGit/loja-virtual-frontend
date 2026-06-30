import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

export const CategoryCardContainer = styled(RouterLink)(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  color: 'inherit',
  display: 'flex',
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  textDecoration: 'none',
  transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
    transform: 'translateY(-2px)',
  },
  '&:focus-visible': {
    outline: `3px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
}));

export const IconBox = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.palette.secondary.main,
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.secondary.contrastText,
  display: 'flex',
  height: 44,
  justifyContent: 'center',
  width: 44,
}));
