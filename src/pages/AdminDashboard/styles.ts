import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

export const AdminShell = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
}));

export const MetricsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const MetricCard = styled(Paper)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  padding: theme.spacing(2.5),
}));

export const DashboardPanel = styled(Paper)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  padding: theme.spacing(3),
}));
