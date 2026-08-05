import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { isAxiosError } from 'axios';
import { useSearchParams } from 'react-router-dom';
import PrenotazioneFormDialog from '../components/prenotazioni/PrenotazioneFormDialog';
import { TAGLIE_OPTIONS } from '../constants/costumi';
import { annullaPrenotazione, fetchPrenotazioni } from '../services/prenotazioni';
import type { CostumeTaglia, Prenotazione, PrenotazioneStato } from '../types';

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('it-IT');
}

export default function Prenotazioni() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCostumeParam = searchParams.get('costume');
  const initialCostumeId = initialCostumeParam ? Number(initialCostumeParam) : null;

  const [items, setItems] = useState<Prenotazione[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stato, setStato] = useState<PrenotazioneStato | ''>('attiva');
  const [taglia, setTaglia] = useState<CostumeTaglia | ''>('');
  const [dal, setDal] = useState('');
  const [al, setAl] = useState('');
  const [formOpen, setFormOpen] = useState(Boolean(initialCostumeId));
  const [annullingId, setAnnullingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPrenotazioni({
        stato,
        taglia,
        dal: dal || undefined,
        al: al || undefined,
      });
      setItems(data);
    } catch (err: unknown) {
      console.error(err);
      if (isAxiosError(err) && err.response?.status === 401) {
        setError('Sessione scaduta. Effettua nuovamente il login.');
      } else {
        setError('Errore nel caricamento delle prenotazioni');
      }
    } finally {
      setLoading(false);
    }
  }, [stato, taglia, dal, al]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAnnulla = async (p: Prenotazione) => {
    if (p.stato !== 'attiva') return;
    if (!window.confirm(`Annullare la prenotazione di ${p.costume_nome} (${p.taglia})?`)) {
      return;
    }
    setAnnullingId(p.id);
    try {
      await annullaPrenotazione(p.id);
      await load();
    } catch (err) {
      console.error(err);
      setError('Impossibile annullare la prenotazione');
    } finally {
      setAnnullingId(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    if (searchParams.has('costume')) {
      searchParams.delete('costume');
      setSearchParams(searchParams, { replace: true });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 }, mb: 6 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            Prenotazioni
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tutti gli utenti autenticati possono creare e annullare qualsiasi prenotazione.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormOpen(true)}
        >
          Nuova prenotazione
        </Button>
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ mb: 3 }}
        useFlexGap
        flexWrap="wrap"
      >
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="filtro-stato">Stato</InputLabel>
          <Select
            labelId="filtro-stato"
            label="Stato"
            value={stato}
            onChange={(e) => setStato(e.target.value as PrenotazioneStato | '')}
          >
            <MenuItem value="">Tutti</MenuItem>
            <MenuItem value="attiva">Attive</MenuItem>
            <MenuItem value="annullata">Annullate</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="filtro-taglia">Taglia</InputLabel>
          <Select
            labelId="filtro-taglia"
            label="Taglia"
            value={taglia}
            onChange={(e) => setTaglia(e.target.value as CostumeTaglia | '')}
          >
            <MenuItem value="">Tutte</MenuItem>
            {TAGLIE_OPTIONS.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          label="Dal"
          type="date"
          value={dal}
          onChange={(e) => setDal(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          size="small"
          label="Al"
          type="date"
          value={al}
          onChange={(e) => setAl(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4 }}>
          Nessuna prenotazione trovata.
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Costume</TableCell>
                <TableCell>Taglia</TableCell>
                <TableCell>Periodo</TableCell>
                <TableCell>Stato</TableCell>
                <TableCell>Creata da</TableCell>
                <TableCell>Note</TableCell>
                <TableCell align="right">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {p.costume_codice}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.costume_nome}
                    </Typography>
                  </TableCell>
                  <TableCell>{p.taglia}</TableCell>
                  <TableCell>
                    {formatDate(p.data_inizio)} → {formatDate(p.data_fine)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={p.stato === 'attiva' ? 'Attiva' : 'Annullata'}
                      color={p.stato === 'attiva' ? 'success' : 'default'}
                      variant={p.stato === 'attiva' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>{p.creata_da_username}</TableCell>
                  <TableCell sx={{ maxWidth: 180 }}>
                    <Typography variant="body2" noWrap title={p.note}>
                      {p.note || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {p.stato === 'attiva' && (
                      <Button
                        size="small"
                        color="error"
                        disabled={annullingId === p.id}
                        onClick={() => void handleAnnulla(p)}
                      >
                        Annulla
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <PrenotazioneFormDialog
        open={formOpen}
        onClose={handleFormClose}
        onCreated={() => void load()}
        initialCostumeId={
          Number.isFinite(initialCostumeId) && initialCostumeId! > 0
            ? initialCostumeId
            : null
        }
      />
    </Container>
  );
}
