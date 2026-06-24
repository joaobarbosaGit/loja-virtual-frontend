import { Box, Chip } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';

export const Hero = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  background:
    'linear-gradient(90deg, rgba(5, 12, 26, 0.84), rgba(5, 12, 26, 0.28)), url("https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=1800&q=85") center/cover',
  borderRadius: 8,
  color: theme.palette.common.white,
  display: 'flex',
  marginBottom: theme.spacing(4),
  minHeight: 360,
  overflow: 'hidden',
  padding: theme.spacing(7),
  position: 'relative',
  '&::after': {
    background: `linear-gradient(180deg, transparent, ${alpha(theme.palette.common.black, 0.18)})`,
    bottom: 0,
    content: '""',
    height: '40%',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  [theme.breakpoints.down('sm')]: {
    minHeight: 420,
    padding: theme.spacing(4, 3),
  },
}));

export const HeroContent = styled(Box)(() => ({
  maxWidth: 680,
  position: 'relative',
  zIndex: 1,
}));

export const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(5),
}));

export const FeaturedBand = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(theme.palette.secondary.main, 0.16)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
  borderRadius: 8,
  padding: theme.spacing(3),
}));

export const CategoryRail = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(4),
  overflowX: 'auto',
  paddingBottom: theme.spacing(1),
}));

export const CategoryPill = styled(Chip)(({ theme }) => ({
  borderRadius: 999,
  fontWeight: 800,
  padding: theme.spacing(2.4, 0.4),
  transition: 'transform 160ms ease, box-shadow 160ms ease',
  '&:hover': {
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.14)',
    transform: 'translateY(-2px)',
  },
}));
