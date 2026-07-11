import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/UseAuth';

export default function Home() {
  const { user } = useAuth();

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 8 }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Benvenuto{user ? `, ${user.username}` : ''}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 520 }}>
          Gestisci l&apos;inventario costumi dell&apos;oratorio. Apri il database per consultare gli
          articoli disponibili.
        </Typography>
        <Box>
          <Button component={RouterLink} to="/costumi" variant="contained" size="large">
            Vai al database costumi
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
