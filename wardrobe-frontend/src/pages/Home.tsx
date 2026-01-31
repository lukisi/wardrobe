import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api';

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [inventario, setInventario] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Carica inventario automaticamente se token presente
  useEffect(() => {
    if (token) {
      fetchInventario();
    }
  }, [token]);

  const fetchInventario = async () => {
    setFetching(true);
    setError(null);
    try {
      const response = await api.get('/api/inventario/');
      setInventario(response.data);
    } catch (err: any) {
      console.error('Errore fetch inventario', err);
      if (err.response?.status === 401) {
        handleLogout(); // Token scaduto → logout
        setError('Sessione scaduta. Effettua nuovamente il login.');
      } else {
        setError('Errore nel caricamento dell\'inventario');
      }
    } finally {
      setFetching(false);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Username e password obbligatori');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/api/login/', { username, password });
      const accessToken = response.data.access;
      localStorage.setItem('auth_token', accessToken);
      setToken(accessToken);
      setSuccess('Login effettuato con successo!');
      setUsername('');
      setPassword('');
      // fetchInventario() viene chiamato da useEffect
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Credenziali non valide');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setInventario([]);
    setSuccess(null);
    setError(null);
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setNewDescription('');
    setModalError(null);
    setModalLoading(false);
  };

  const handleCreateItem = async () => {
    if (!newDescription.trim()) {
      setModalError('La descrizione è obbligatoria');
      return;
    }

    setModalLoading(true);
    setModalError(null);

    try {
      await api.post('/api/inventario/create/', { descrizione: newDescription.trim() });
      setNewDescription('');
      handleCloseModal();
      fetchInventario(); // ricarica lista
    } catch (err: any) {
      setModalError(err.response?.data?.detail || 'Errore durante la creazione');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Typography variant="h4" gutterBottom align="center" color="primary">
        Wardrobe App
      </Typography>

      {!token ? (
        // Form Login
        <Box
          component="form"
          sx={{
            maxWidth: 400,
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            p: 4,
            boxShadow: 3,
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            variant="outlined"
          />

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            disabled={loading}
            fullWidth
            size="large"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </Box>
      ) : (
        // Area Inventario
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" component="h2">
              Inventario
            </Typography>
            <Button variant="outlined" color="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </Box>

          {fetching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : inventario.length === 0 ? (
            <Alert severity="info">Nessun articolo presente nell'inventario.</Alert>
          ) : (
            <>
              <Grid container spacing={3} sx={{ width: '100%' }}>
                {inventario.map((item: any) => (
                  <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="div">
                          {item.codice} - {item.descrizione}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Quantità: <strong>{item.quantita}</strong>
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }}>
                <Fab 
                  color="primary" 
                  aria-label="add" 
                  onClick={handleOpenModal}
                >
                  <AddIcon />
                </Fab>
              </Box>
            </>
          )}
        </Box>
      )}

      {/* Modale nuovo articolo */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          Nuovo articolo
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Descrizione"
            fullWidth
            variant="outlined"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            error={!!modalError}
            helperText={modalError}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseModal}>Annulla</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateItem} 
            disabled={modalLoading}
          >
            {modalLoading ? <CircularProgress size={24} /> : 'Salva'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}