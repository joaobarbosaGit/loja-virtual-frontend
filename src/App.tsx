import { CssBaseline, ThemeProvider } from '@mui/material';

import { AppRoutes } from './routes';
import { AppRequestFeedback } from './shared/components/AppRequestFeedback';
import { useStoreTheme } from './shared/hooks';

export const App = () => {
  const { muiTheme } = useStoreTheme();

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  );
};

