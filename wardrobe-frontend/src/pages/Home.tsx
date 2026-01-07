import { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import api from '../services/api';

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [inventario, setInventario] = useState<any[]>([]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/login/', { username, password });
      const accessToken = response.data.access;
      localStorage.setItem('auth_token', accessToken);
      setToken(accessToken);
      setUsername('');
      setPassword('');
      fetchInventario(); // carica lista subito dopo login
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login fallito');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setInventario([]);
  };

  const fetchInventario = async () => {
    try {
      const response = await api.get('/api/inventario/');
      setInventario(response.data);
    } catch (err) {
      console.error('Errore fetch inventario', err);
    }
  };

  // Carica inventario se token già presente (reload pagina)
  useState(() => {
    if (token) fetchInventario();
  });

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom align="center">
        Wardrobe App
      </Typography>

      {!token ? (
        // Form Login
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button
            variant="contained"
            onClick={handleLogin}
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </Box>
      ) : (
        // Lista Inventario + Logout
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Inventario</Typography>
            <Button variant="outlined" color="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </Box>

          {inventario.length === 0 ? (
            <Typography>Nessun articolo presente</Typography>
          ) : (
            <List>
              {inventario.map((item: any) => (
                <div key={item.id}>
                  <ListItem>
                    <ListItemText
                      primary={`${item.codice} - ${item.descrizione}`}
                      secondary={`Quantità: ${item.quantita}`}
                    />
                  </ListItem>
                  <Divider />
                </div>
              ))}
            </List>
          )}
        </Box>
      )}
    </Container>
  );
}