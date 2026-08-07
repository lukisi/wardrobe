import {
  Box,
  Button,
  Chip,
  CircularProgress,
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
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import type { Costume } from '../../types';
import {
  CATEGORIA_LABELS,
  formatTaglieStock,
  hasStockInMagazzino,
} from '../../constants/costumi';
import { useCostumeImageUrl } from '../../hooks/useCostumeImageUrl';

interface CostumeDetailDialogProps {
  costume: Costume | null;
  open: boolean;
  onClose: () => void;
  onEdit: (costume: Costume) => void;
  onDelete: (costume: Costume) => void;
  onPrenota?: (costume: Costume) => void;
  deleting?: boolean;
}

export default function CostumeDetailDialog({
  costume,
  open,
  onClose,
  onEdit,
  onDelete,
  onPrenota,
  deleting = false,
}: CostumeDetailDialogProps) {
  const { url, loading } = useCostumeImageUrl(
    open ? costume?.id : null,
    Boolean(open && costume?.has_immagine),
  );

  if (!costume) return null;

  const taglieLabel = formatTaglieStock(costume.taglie_stock);

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
          {costume.has_immagine ? (
            <Box
              sx={{
                width: { xs: '100%', sm: 260 },
                minHeight: 220,
                borderRadius: 2,
                bgcolor: 'grey.200',
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
              }}
            >
              {loading || !url ? (
                <CircularProgress size={28} />
              ) : (
                <Box
                  component="img"
                  src={url}
                  alt={costume.nome}
                  sx={{
                    width: '100%',
                    maxHeight: 360,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              )}
            </Box>
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
            </Stack>

            <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
              {costume.descrizione?.trim() || 'Nessuna descrizione.'}
            </Typography>

            <Typography variant="body2">
              <strong>Taglie in magazzino:</strong>{' '}
              {taglieLabel ? (
                taglieLabel
              ) : (
                <Box component="span" sx={{ color: 'error.main' }}>
                  Non disponibile
                </Box>
              )}
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
        {onPrenota && (
          <Button
            variant="outlined"
            startIcon={<EventAvailableIcon />}
            onClick={() => onPrenota(costume)}
            disabled={!hasStockInMagazzino(costume.taglie_stock)}
          >
            Prenota
          </Button>
        )}
        <Button variant="contained" startIcon={<EditIcon />} onClick={() => onEdit(costume)}>
          Modifica
        </Button>
      </DialogActions>
    </Dialog>
  );
}
