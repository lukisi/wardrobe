import { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  CircularProgress,
  type SelectChangeEvent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { isAxiosError } from 'axios';
import type { Costume, CostumeCategoria, CostumeTaglia, CostumeWritePayload } from '../../types';
import { CATEGORIA_LABELS, CATEGORIA_OPTIONS, TAGLIE_OPTIONS } from '../../constants/costumi';

interface CostumeFormDialogProps {
  open: boolean;
  costume?: Costume | null;
  onClose: () => void;
  onSubmit: (payload: CostumeWritePayload) => Promise<void>;
}

interface FormState {
  nome: string;
  descrizione: string;
  categoria: CostumeCategoria;
  immagine_url: string;
  taglie: CostumeTaglia[];
  quantita: string;
  ultimo_utilizzo: string;
}

const emptyForm = (): FormState => ({
  nome: '',
  descrizione: '',
  categoria: 'presepe_vivente',
  immagine_url: '',
  taglie: ['M'],
  quantita: '1',
  ultimo_utilizzo: '',
});

function costumeToForm(costume: Costume): FormState {
  return {
    nome: costume.nome,
    descrizione: costume.descrizione ?? '',
    categoria: costume.categoria,
    immagine_url: costume.immagine_url ?? '',
    taglie: (costume.taglie ?? []).filter((t): t is CostumeTaglia =>
      TAGLIE_OPTIONS.includes(t as CostumeTaglia),
    ),
    quantita: String(costume.quantita ?? 1),
    ultimo_utilizzo: costume.ultimo_utilizzo ?? '',
  };
}

function extractError(err: unknown): string {
  if (!isAxiosError(err)) return 'Errore durante il salvataggio';
  const data = err.response?.data;
  if (!data) return 'Errore durante il salvataggio';
  if (typeof data.detail === 'string') return data.detail;
  for (const key of ['nome', 'categoria', 'taglie', 'quantita', 'immagine_url', 'non_field_errors']) {
    const value = data[key];
    if (Array.isArray(value) && value[0]) return String(value[0]);
    if (typeof value === 'string') return value;
  }
  return 'Errore durante il salvataggio';
}

export default function CostumeFormDialog({
  open,
  costume = null,
  onClose,
  onSubmit,
}: CostumeFormDialogProps) {
  const isEdit = Boolean(costume);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(costume ? costumeToForm(costume) : emptyForm());
    setError(null);
    setLoading(false);
  }, [open, costume]);

  const handleTaglieChange = (event: SelectChangeEvent<CostumeTaglia[]>) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      taglie: (typeof value === 'string' ? value.split(',') : value) as CostumeTaglia[],
    }));
  };

  const handleSubmit = async () => {
    if (!form.nome.trim()) {
      setError('Il nome è obbligatorio');
      return;
    }

    const quantita = Number.parseInt(form.quantita, 10);
    if (Number.isNaN(quantita) || quantita < 0) {
      setError('La quantità deve essere un numero ≥ 0');
      return;
    }

    const payload: CostumeWritePayload = {
      nome: form.nome.trim(),
      descrizione: form.descrizione.trim(),
      categoria: form.categoria,
      immagine_url: form.immagine_url.trim(),
      taglie: form.taglie,
      quantita,
      ultimo_utilizzo: form.ultimo_utilizzo || null,
    };

    setLoading(true);
    setError(null);
    try {
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        {isEdit ? 'Modifica costume' : 'Nuovo costume'}
        <IconButton aria-label="chiudi" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <TextField
            autoFocus
            label="Nome"
            fullWidth
            value={form.nome}
            onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
          />
          <TextField
            select
            label="Categoria"
            fullWidth
            value={form.categoria}
            onChange={(e) =>
              setForm((p) => ({ ...p, categoria: e.target.value as CostumeCategoria }))
            }
          >
            {CATEGORIA_OPTIONS.map((key) => (
              <MenuItem key={key} value={key}>
                {CATEGORIA_LABELS[key]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Descrizione"
            fullWidth
            multiline
            minRows={3}
            value={form.descrizione}
            onChange={(e) => setForm((p) => ({ ...p, descrizione: e.target.value }))}
          />
          <TextField
            label="URL immagine"
            fullWidth
            value={form.immagine_url}
            onChange={(e) => setForm((p) => ({ ...p, immagine_url: e.target.value }))}
            placeholder="https://…"
          />
          <FormControl fullWidth>
            <InputLabel id="taglie-label">Taglie</InputLabel>
            <Select
              labelId="taglie-label"
              multiple
              value={form.taglie}
              onChange={handleTaglieChange}
              input={<OutlinedInput label="Taglie" />}
              renderValue={(selected) => selected.join(', ')}
            >
              {TAGLIE_OPTIONS.map((taglia) => (
                <MenuItem key={taglia} value={taglia}>
                  <Checkbox checked={form.taglie.includes(taglia)} />
                  <ListItemText primary={taglia} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Quantità"
            type="number"
            fullWidth
            inputProps={{ min: 0 }}
            value={form.quantita}
            onChange={(e) => setForm((p) => ({ ...p, quantita: e.target.value }))}
          />
          <TextField
            label="Ultimo utilizzo"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={form.ultimo_utilizzo}
            onChange={(e) => setForm((p) => ({ ...p, ultimo_utilizzo: e.target.value }))}
          />
          {error && <FormHelperText error>{error}</FormHelperText>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Annulla
        </Button>
        <Button variant="contained" onClick={() => void handleSubmit()} disabled={loading}>
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Salva'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
