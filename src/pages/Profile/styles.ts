import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ProfileCard = styled(Paper)(({ theme }) => ({
  maxWidth: 640,
  padding: theme.spacing(4),
}));
