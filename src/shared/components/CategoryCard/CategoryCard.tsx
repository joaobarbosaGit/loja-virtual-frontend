import ChairIcon from '@mui/icons-material/Chair';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import DevicesIcon from '@mui/icons-material/Devices';
import SpaIcon from '@mui/icons-material/Spa';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { Typography } from '@mui/material';

import { Category } from '../../protocols';
import { CategoryCardContainer, IconBox } from './styles';

interface CategoryCardProps {
  category: Category;
}

const iconMap = {
  Chair: <ChairIcon />,
  Checkroom: <CheckroomIcon />,
  Devices: <DevicesIcon />,
  Spa: <SpaIcon />,
};

export const CategoryCard = ({ category }: CategoryCardProps) => (
  <CategoryCardContainer to={`/products?grupo=${category.id}`}>
    <IconBox>{iconMap[category.icon as keyof typeof iconMap] ?? <StorefrontIcon />}</IconBox>
    <Typography fontWeight={700}>{category.name}</Typography>
  </CategoryCardContainer>
);
