import { Card, CardMedia } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ProductCardContainer = styled(Card)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  boxShadow: '0 10px 26px rgba(15, 23, 42, 0.07)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: '0 18px 44px rgba(15, 23, 42, 0.14)',
    transform: 'translateY(-4px)',
  },
}));

export const ProductImage = styled(CardMedia)(() => ({
  aspectRatio: '16 / 10',
  backgroundColor: '#eef2f7',
}));
