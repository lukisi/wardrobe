import { useState, useEffect, useCallback } from 'react';
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
import { isAxiosError } from 'axios';
import api from '../services/api';
import type { InventarioItem } from '../types';

export default function Costumi() {
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchInventario = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      const response = await api.get<InventarioItem[]>('/api/inventario/');
      setInventario(response.data);
    } catch (err: unknown) {
      console.error('Errore fetch inventario', err);
      if (isAxiosError(err) && err.response?.status === 401) {
        setError('Sessione scaduta. Effettua nuovamente il login.');
      } else {
        setError("Errore nel caricamento dell'inventario");
      }
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    void fetchInventario();
  }, [fetchInventario]);

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
      handleCloseModal();
      await fetchInventario();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setModalError(err.response?.data?.detail || 'Errore durante la creazione');
      } else {
        setModalError('Errore durante la creazione');
      }
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
        Inventario costumi
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {fetching ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : inventario.length === 0 ? (
        <Alert severity="info">Nessun articolo presente nell&apos;inventario.</Alert>
      ) : (
        <Grid container spacing={3} sx={{ width: '100%' }}>
          {inventario.map((item) => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
      )}

      <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }}>
        <Fab color="primary" aria-label="add" onClick={handleOpenModal}>
          <AddIcon />
        </Fab>
      </Box>

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
          <Button variant="contained" onClick={handleCreateItem} disabled={modalLoading}>
            {modalLoading ? <CircularProgress size={24} /> : 'Salva'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
