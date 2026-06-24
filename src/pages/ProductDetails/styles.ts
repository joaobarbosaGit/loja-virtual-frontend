import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const DetailsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(4),
  gridTemplateColumns: '1.1fr 0.9fr',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const ProductPhoto = styled('img')(({ theme }) => ({
  aspectRatio: '4 / 3',
  borderRadius: theme.shape.borderRadius,
  objectFit: 'cover',
  width: '100%',
}));
