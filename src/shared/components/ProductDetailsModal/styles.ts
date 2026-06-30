import { styled } from '@mui/material/styles';

export const ProductModalImage = styled('img')(({ theme }) => ({
  aspectRatio: '4 / 3',
  backgroundColor: theme.palette.grey[100],
  borderRadius: 8,
  height: 'auto',
  objectFit: 'cover',
  width: '100%',
}));
