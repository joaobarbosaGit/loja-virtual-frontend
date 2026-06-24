import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

export const CategoryCardContainer = styled(Paper)(({ theme }) => ({
  alignItems: 'center',
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
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
