import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { Costume } from '../../types';
import { CATEGORIA_LABELS } from '../../constants/costumi';

interface CostumeDetailDialogProps {
  costume: Costume | null;
  open: boolean;
  onClose: () => void;
  onEdit: (costume: Costume) => void;
  onDelete: (costume: Costume) => void;
  deleting?: boolean;
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('it-IT');
}

export default function CostumeDetailDialog({
  costume,
  open,
  onClose,
  onEdit,
  onDelete,
  deleting = false,
}: CostumeDetailDialogProps) {
  if (!costume) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        {costume.nome}
        <IconButton aria-label="chiudi" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        >
          {costume.immagine_url ? (
            <Box
              component="img"
              src={costume.immagine_url}
              alt={costume.nome}
              sx={{
                width: { xs: '100%', sm: 260 },
                maxHeight: 360,
                objectFit: 'cover',
                borderRadius: 2,
                bgcolor: 'grey.200',
              }}
            />
          ) : (
            <Box
              sx={{
                width: { xs: '100%', sm: 260 },
                height: 260,
                borderRadius: 2,
                bgcolor: 'grey.200',
                display: 'grid',
                placeItems: 'center',
                color: 'text.secondary',
              }}
            >
              Nessuna immagine
            </Box>
          )}

          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Codice {costume.codice}
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 2 }}>
              <Chip
                size="small"
                label={CATEGORIA_LABELS[costume.categoria] ?? costume.categoria}
                color="primary"
                variant="outlined"
              />
              <Chip
                size="small"
                label={costume.disponibile ? 'Disponibile' : 'Non disponibile'}
                color={costume.disponibile ? 'success' : 'default'}
              />
            </Stack>

            <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
              {costume.descrizione?.trim() || 'Nessuna descrizione.'}
            </Typography>

            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Quantità:</strong> {costume.quantita}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Taglie:</strong>{' '}
              {costume.taglie?.length ? costume.taglie.join(', ') : '—'}
            </Typography>
            <Typography variant="body2">
              <strong>Ultimo utilizzo:</strong> {formatDate(costume.ultimo_utilizzo)}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          color="error"
          startIcon={<DeleteOutlineIcon />}
          onClick={() => onDelete(costume)}
          disabled={deleting}
        >
          Elimina
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Chiudi</Button>
        <Button variant="contained" startIcon={<EditIcon />} onClick={() => onEdit(costume)}>
          Modifica
        </Button>
      </DialogActions>
    </Dialog>
  );
}
