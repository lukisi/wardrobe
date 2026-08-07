import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { isAxiosError } from 'axios';
import { fetchCostumi } from '../../services/costumi';
import {
  createPrenotazione,
  fetchCostumeDisponibilita,
} from '../../services/prenotazioni';
import type { Costume, CostumeTaglia, PrenotazioneCreatePayload } from '../../types';
import { TAGLIE_OPTIONS } from '../../constants/costumi';

interface PrenotazioneFormDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  /** Prefill costume id (es. da dettaglio costume). */
  initialCostumeId?: number | null;
  /** Prefill date range (es. da filtri catalogo). */
  initialDal?: string | null;
  initialAl?: string | null;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatApiError(err: unknown): string {
  if (!isAxiosError(err) || !err.response?.data) {
    return 'Errore nella creazione della prenotazione';
  }
  const data = err.response.data as Record<string, unknown>;
  if (typeof data.detail === 'string') return data.detail;
  const parts: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) parts.push(`${key}: ${value.join(', ')}`);
    else if (typeof value === 'string') parts.push(`${key}: ${value}`);
  }
  return parts.join(' ') || 'Errore nella creazione della prenotazione';
}

export default function PrenotazioneFormDialog({
  open,
  onClose,
  onCreated,
  initialCostumeId = null,
  initialDal = null,
  initialAl = null,
}: PrenotazioneFormDialogProps) {
  const [costumi, setCostumi] = useState<Costume[]>([]);
  const [loadingCostumi, setLoadingCostumi] = useState(false);
  const [costume, setCostume] = useState<Costume | null>(null);
  const [taglia, setTaglia] = useState<CostumeTaglia | ''>('');
  const [dataInizio, setDataInizio] = useState(todayISO());
  const [dataFine, setDataFine] = useState(todayISO());
  const [note, setNote] = useState('');
  const [disponibiliHint, setDisponibiliHint] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setNote('');
    const dal = initialDal?.trim();
    const al = initialAl?.trim();
    const datesValid = Boolean(dal && al && al >= dal);
    setDataInizio(datesValid ? dal! : todayISO());
    setDataFine(datesValid ? al! : todayISO());
    setTaglia('');
    setDisponibiliHint(null);

    let cancelled = false;
    setLoadingCostumi(true);
    void (async () => {
      try {
        const data = await fetchCostumi({ page_size: 200 });
        if (cancelled) return;
        const withStock = data.results.filter((c) =>
          c.taglie_stock.some((r) => r.quantita > 0),
        );
        setCostumi(withStock);
        const prefill = initialCostumeId
          ? withStock.find((c) => c.id === initialCostumeId) ?? null
          : null;
        setCostume(prefill);
        if (prefill) {
          const first = prefill.taglie_stock.find((r) => r.quantita > 0);
          setTaglia(first?.taglia ?? '');
        } else {
          setCostume(null);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('Impossibile caricare i costumi');
      } finally {
        if (!cancelled) setLoadingCostumi(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, initialCostumeId, initialDal, initialAl]);

  const taglieOptions = useMemo(() => {
    if (!costume) return TAGLIE_OPTIONS;
    const withStock = costume.taglie_stock
      .filter((r) => r.quantita > 0)
      .map((r) => r.taglia);
    return withStock.length ? withStock : TAGLIE_OPTIONS;
  }, [costume]);

  useEffect(() => {
    if (!open || !costume || !dataInizio || !dataFine || dataInizio > dataFine) {
      setDisponibiliHint(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchCostumeDisponibilita(costume.id, dataInizio, dataFine);
        if (cancelled) return;
        const lines = data.taglie.map(
          (t) => `${t.taglia}: ${t.disponibili}/${t.stock} libere`,
        );
        setDisponibiliHint(lines.length ? lines.join(' · ') : 'Nessuna taglia in stock');
      } catch {
        if (!cancelled) setDisponibiliHint(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, costume, dataInizio, dataFine]);

  const handleSubmit = async () => {
    if (!costume || !taglia) {
      setError('Seleziona costume e taglia');
      return;
    }
    if (dataInizio > dataFine) {
      setError('La data fine deve essere ≥ data inizio');
      return;
    }
    setSubmitting(true);
    setError(null);
    const payload: PrenotazioneCreatePayload = {
      costume: costume.id,
      taglia,
      data_inizio: dataInizio,
      data_fine: dataFine,
      note: note.trim(),
    };
    try {
      await createPrenotazione(payload);
      onCreated();
      onClose();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Nuova prenotazione
        <IconButton aria-label="chiudi" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {loadingCostumi ? (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <>
              <Autocomplete
                options={costumi}
                value={costume}
                onChange={(_, value) => {
                  setCostume(value);
                  const first = value?.taglie_stock.find((r) => r.quantita > 0);
                  setTaglia(first?.taglia ?? '');
                }}
                getOptionLabel={(o) => `${o.codice} — ${o.nome}`}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={(params) => (
                  <TextField {...params} label="Costume" required />
                )}
              />

              <FormControl fullWidth required>
                <InputLabel id="prenota-taglia-label">Taglia</InputLabel>
                <Select
                  labelId="prenota-taglia-label"
                  label="Taglia"
                  value={taglia}
                  onChange={(e) => setTaglia(e.target.value as CostumeTaglia)}
                >
                  {taglieOptions.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Dal"
                  type="date"
                  fullWidth
                  required
                  value={dataInizio}
                  onChange={(e) => setDataInizio(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  label="Al"
                  type="date"
                  fullWidth
                  required
                  value={dataFine}
                  onChange={(e) => setDataFine(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Stack>

              {disponibiliHint && (
                <Typography variant="body2" color="text.secondary">
                  Disponibilità nel periodo: {disponibiliHint}
                </Typography>
              )}

              <TextField
                label="Note"
                multiline
                minRows={2}
                fullWidth
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Annulla
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={submitting || loadingCostumi}
        >
          {submitting ? 'Salvataggio…' : 'Prenota'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
