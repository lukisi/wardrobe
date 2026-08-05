import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  type SelectChangeEvent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { isAxiosError } from 'axios';
import type { Costume, CostumeCategoria, CostumeTaglia, CostumeWritePayload } from '../../types';
import { CATEGORIA_LABELS, CATEGORIA_OPTIONS, TAGLIE_OPTIONS } from '../../constants/costumi';
import { IMMAGINE_ACCEPT, IMMAGINE_MAX_BYTES } from '../../constants/immagine';
import { useCostumeImageUrl } from '../../hooks/useCostumeImageUrl';

export interface CostumeFormSubmit {
  payload: CostumeWritePayload;
  imageFile?: File | null;
  removeImage?: boolean;
}

interface CostumeFormDialogProps {
  open: boolean;
  costume?: Costume | null;
  onClose: () => void;
  onSubmit: (data: CostumeFormSubmit) => Promise<void>;
}

interface FormState {
  nome: string;
  descrizione: string;
  categoria: CostumeCategoria;
  taglie: CostumeTaglia[];
  quantita: string;
  ultimo_utilizzo: string;
}

const emptyForm = (): FormState => ({
  nome: '',
  descrizione: '',
  categoria: 'presepe_vivente',
  taglie: ['M'],
  quantita: '1',
  ultimo_utilizzo: '',
});

function costumeToForm(costume: Costume): FormState {
  return {
    nome: costume.nome,
    descrizione: costume.descrizione ?? '',
    categoria: costume.categoria,
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
  for (const key of ['nome', 'categoria', 'taglie', 'quantita', 'file', 'non_field_errors']) {
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { url: existingUrl } = useCostumeImageUrl(
    open && isEdit && !removeImage && !imageFile ? costume?.id : null,
    Boolean(open && isEdit && costume?.has_immagine && !removeImage && !imageFile),
  );

  useEffect(() => {
    if (!open) return;
    setForm(costume ? costumeToForm(costume) : emptyForm());
    setImageFile(null);
    setPreviewUrl(null);
    setRemoveImage(false);
    setError(null);
    setLoading(false);
  }, [open, costume]);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleTaglieChange = (event: SelectChangeEvent<CostumeTaglia[]>) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      taglie: (typeof value === 'string' ? value.split(',') : value) as CostumeTaglia[],
    }));
  };

  const handleFileChange = (fileList: FileList | null) => {
    const file = fileList?.[0] ?? null;
    if (!file) {
      setImageFile(null);
      return;
    }
    if (!IMMAGINE_ACCEPT.split(',').includes(file.type)) {
      setError('Formato non ammesso. Usa JPEG, PNG o WebP.');
      return;
    }
    if (file.size > IMMAGINE_MAX_BYTES) {
      setError('Immagine troppo grande (max 2 MB).');
      return;
    }
    setError(null);
    setRemoveImage(false);
    setImageFile(file);
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
      taglie: form.taglie,
      quantita,
      ultimo_utilizzo: form.ultimo_utilizzo || null,
    };

    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        payload,
        imageFile,
        removeImage: isEdit && removeImage && !imageFile,
      });
      onClose();
    } catch (err: unknown) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  const shownPreview = previewUrl || existingUrl;

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

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Immagine
            </Typography>
            {shownPreview && (
              <Box
                component="img"
                src={shownPreview}
                alt="Anteprima"
                sx={{
                  display: 'block',
                  maxHeight: 160,
                  maxWidth: '100%',
                  objectFit: 'cover',
                  borderRadius: 1,
                  mb: 1.5,
                  bgcolor: 'grey.200',
                }}
              />
            )}
            <Button variant="outlined" component="label">
              {imageFile ? 'Cambia file' : 'Carica file'}
              <input
                hidden
                type="file"
                accept={IMMAGINE_ACCEPT}
                onChange={(e) => handleFileChange(e.target.files)}
              />
            </Button>
            {imageFile && (
              <Typography variant="caption" display="block" sx={{ mt: 0.75 }} color="text.secondary">
                {imageFile.name} ({Math.round(imageFile.size / 1024)} KB)
              </Typography>
            )}
            {isEdit && costume?.has_immagine && !imageFile && (
              <FormControlLabel
                sx={{ mt: 1, display: 'flex' }}
                control={
                  <Checkbox
                    checked={removeImage}
                    onChange={(e) => setRemoveImage(e.target.checked)}
                  />
                }
                label="Rimuovi immagine attuale"
              />
            )}
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>
              JPEG, PNG o WebP — max 2 MB
            </Typography>
          </Box>

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
