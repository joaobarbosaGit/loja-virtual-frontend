import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const PageHeader = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

export const ProductsToolbar = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  gap: theme.spacing(2),
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    alignItems: 'stretch',
    flexDirection: 'column',
  },
}));
