import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const DrawerContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  height: '100%',
  padding: theme.spacing(3),
  width: 360,
}));
