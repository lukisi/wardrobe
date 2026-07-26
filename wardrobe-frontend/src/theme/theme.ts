import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#b45309',
      light: '#d97706',
      dark: '#92400e',
      contrastText: '#fffbeb',
    },
    secondary: {
      main: '#57534e',
      light: '#78716c',
      dark: '#44403c',
    },
    success: {
      main: '#3f6212',
    },
    background: {
      default: '#f5f5f4',
      paper: '#ffffff',
    },
    text: {
      primary: '#1c1917',
      secondary: '#57534e',
    },
    divider: '#e7e5e4',
  },
  typography: {
    fontFamily: '"Source Sans 3", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Libre Baskerville", Georgia, serif', fontWeight: 700 },
    h2: { fontFamily: '"Libre Baskerville", Georgia, serif', fontWeight: 700 },
    h3: { fontFamily: '"Libre Baskerville", Georgia, serif', fontWeight: 700 },
    h4: { fontFamily: '"Libre Baskerville", Georgia, serif', fontWeight: 700 },
    h5: { fontFamily: '"Libre Baskerville", Georgia, serif', fontWeight: 700 },
    h6: { fontFamily: '"Libre Baskerville", Georgia, serif', fontWeight: 600 },
    button: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
