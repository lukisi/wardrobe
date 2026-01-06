import { Container, Typography } from '@mui/material';

function App() {
  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Wardrobe App
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Benvenuto! Inizia con il login.
      </Typography>
    </Container>
  );
}

export default App;