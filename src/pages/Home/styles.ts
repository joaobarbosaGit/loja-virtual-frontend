import { Box } from '@mui/material';
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

export const HeroCarousel = styled(Box)(({ theme }) => ({
  borderRadius: 8,
  color: theme.palette.common.white,
  marginBottom: theme.spacing(4),
  minHeight: 360,
  overflow: 'hidden',
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    minHeight: 420,
  },
}));

export const HeroCarouselTrack = styled(Box)(() => ({
  display: 'flex',
  height: '100%',
  minHeight: 'inherit',
  transition: 'transform 360ms ease',
}));

export const HeroHighlightSlide = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'imageUrl',
})<{ imageUrl: string }>(({ imageUrl, theme }) => ({
  alignItems: 'center',
  appearance: 'none',
  background: `linear-gradient(90deg, rgba(5, 12, 26, 0.86), rgba(5, 12, 26, 0.24)), url("${imageUrl}") center/cover`,
  border: 0,
  color: 'inherit',
  cursor: 'pointer',
  display: 'flex',
  flex: '0 0 100%',
  minHeight: 'inherit',
  padding: theme.spacing(7),
  position: 'relative',
  textAlign: 'left',
  '&::after': {
    background: `linear-gradient(180deg, transparent, ${alpha(theme.palette.common.black, 0.2)})`,
    bottom: 0,
    content: '""',
    height: '42%',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4, 3),
  },
}));

export const HeroNav = styled(Box)(({ theme }) => ({
  bottom: theme.spacing(3),
  display: 'flex',
  gap: theme.spacing(1),
  position: 'absolute',
  right: theme.spacing(3),
  zIndex: 2,
}));

export const HeroDots = styled(Box)(({ theme }) => ({
  bottom: theme.spacing(3.5),
  display: 'flex',
  gap: theme.spacing(0.75),
  left: theme.spacing(7),
  position: 'absolute',
  zIndex: 2,
  [theme.breakpoints.down('sm')]: {
    left: theme.spacing(3),
  },
}));

export const HeroDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ active, theme }) => ({
  backgroundColor: active ? theme.palette.common.white : alpha(theme.palette.common.white, 0.45),
  borderRadius: 999,
  height: 8,
  transition: 'background-color 160ms ease, width 160ms ease',
  width: active ? 28 : 8,
}));

export const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(5),
}));

export const FeaturedBand = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 0),
}));

export const FeaturedCarousel = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  gridAutoColumns: 'minmax(280px, 34%)',
  gridAutoFlow: 'column',
  overflowX: 'auto',
  padding: theme.spacing(0.5, 0, 2),
  scrollBehavior: 'smooth',
  scrollSnapType: 'x mandatory',
  [theme.breakpoints.down('md')]: {
    gridAutoColumns: 'minmax(260px, 72%)',
  },
  [theme.breakpoints.down('sm')]: {
    gridAutoColumns: 'minmax(240px, 88%)',
  },
}));

export const FeaturedSlide = styled(Box)(({ theme }) => ({
  appearance: 'none',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  boxShadow: '0 14px 34px rgba(15, 23, 42, 0.09)',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 360,
  overflow: 'hidden',
  padding: 0,
  scrollSnapAlign: 'start',
  textAlign: 'left',
  transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: '0 20px 48px rgba(15, 23, 42, 0.15)',
    transform: 'translateY(-3px)',
  },
}));

export const FeaturedImage = styled('img')(({ theme }) => ({
  aspectRatio: '16 / 10',
  backgroundColor: theme.palette.grey[100],
  objectFit: 'cover',
  width: '100%',
}));
