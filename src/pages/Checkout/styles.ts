import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const CheckoutGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  gridTemplateColumns: '1fr 360px',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));
