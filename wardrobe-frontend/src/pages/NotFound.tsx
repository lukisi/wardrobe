import { Container, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function NotFound() {
  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom>
        404
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Pagina non trovata.
      </Typography>
      <Box>
        <Button component={RouterLink} to="/" variant="contained">
          Torna alla home
        </Button>
      </Box>
    </Container>
  );
}
