import { createTheme } from '@mui/material/styles';

import { StoreTheme } from '../protocols';

export const createMuiTheme = (storeTheme: StoreTheme) =>
  createTheme({
    palette: {
      primary: {
        main: storeTheme.primaryColor,
      },
      secondary: {
        main: storeTheme.secondaryColor,
      },
      background: {
        default: storeTheme.backgroundColor,
        paper: '#ffffff',
      },
      text: {
        primary: storeTheme.textColor,
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
      button: {
        fontWeight: 700,
        textTransform: 'none',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
          },
        },
      },
    },
  });
