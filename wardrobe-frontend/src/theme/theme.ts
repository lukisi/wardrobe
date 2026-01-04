import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // puoi cambiare in 'dark' per modalità scura
    primary: {
      main: '#1976d2', // blu MUI di default, puoi cambiarlo
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem' },
    h2: { fontSize: '2rem' },
    body1: { fontSize: '1rem' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // niente MAIUSCOLO forzato
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;