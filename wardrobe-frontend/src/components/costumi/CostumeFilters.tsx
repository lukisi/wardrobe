import {
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type { CostumeCategoria, CostumeTaglia, CostumiMeta } from '../../types';
import { CATEGORIA_LABELS, CATEGORIA_OPTIONS, TAGLIE_OPTIONS } from '../../constants/costumi';

export type CatalogoFilterMode = 'tutti' | 'periodo';

export interface CostumeFiltersState {
  q: string;
  categoria: CostumeCategoria | '';
  mode: CatalogoFilterMode;
  dal: string;
  al: string;
  taglia: CostumeTaglia | '';
}

interface CostumeFiltersProps {
  value: CostumeFiltersState;
  meta: CostumiMeta | null;
  onChange: (next: CostumeFiltersState) => void;
}

export default function CostumeFilters({ value, meta, onChange }: CostumeFiltersProps) {
  const countFor = (categoria: CostumeCategoria) =>
    meta?.categorie.find((c) => c.categoria === categoria)?.count ?? 0;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Cerca
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Nome o descrizione…"
          value={value.q}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Categoria
        </Typography>
        <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Chip
            label={`Tutte${meta ? ` (${meta.totale})` : ''}`}
            color={value.categoria === '' ? 'primary' : 'default'}
            variant={value.categoria === '' ? 'filled' : 'outlined'}
            onClick={() => onChange({ ...value, categoria: '' })}
          />
          {CATEGORIA_OPTIONS.map((categoria) => (
            <Chip
              key={categoria}
              label={`${CATEGORIA_LABELS[categoria]}${meta ? ` (${countFor(categoria)})` : ''}`}
              color={value.categoria === categoria ? 'primary' : 'default'}
              variant={value.categoria === categoria ? 'filled' : 'outlined'}
              onClick={() => onChange({ ...value, categoria })}
            />
          ))}
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Taglia
        </Typography>
        <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Chip
            label="Tutte"
            color={value.taglia === '' ? 'primary' : 'default'}
            variant={value.taglia === '' ? 'filled' : 'outlined'}
            onClick={() => onChange({ ...value, taglia: '' })}
          />
          {TAGLIE_OPTIONS.map((taglia) => (
            <Chip
              key={taglia}
              label={taglia}
              color={value.taglia === taglia ? 'primary' : 'default'}
              variant={value.taglia === taglia ? 'filled' : 'outlined'}
              onClick={() => onChange({ ...value, taglia })}
            />
          ))}
        </Stack>
      </Box>

      <FormControl>
        <FormLabel id="catalogo-mode-label" sx={{ typography: 'subtitle2', mb: 0.5, color: 'text.primary' }}>
          Visualizzazione
        </FormLabel>
        <RadioGroup
          aria-labelledby="catalogo-mode-label"
          value={value.mode}
          onChange={(e) =>
            onChange({ ...value, mode: e.target.value as CatalogoFilterMode })
          }
        >
          <FormControlLabel value="tutti" control={<Radio size="small" />} label="Tutto il catalogo" />
          <FormControlLabel
            value="periodo"
            control={<Radio size="small" />}
            label="Disponibili nel periodo"
          />
        </RadioGroup>
      </FormControl>

      {value.mode === 'periodo' && (
        <Stack spacing={1.5}>
          <TextField
            label="Dal"
            type="date"
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={value.dal}
            onChange={(e) => onChange({ ...value, dal: e.target.value })}
          />
          <TextField
            label="Al"
            type="date"
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={value.al}
            onChange={(e) => onChange({ ...value, al: e.target.value })}
            error={Boolean(value.dal && value.al && value.al < value.dal)}
            helperText={
              value.dal && value.al && value.al < value.dal
                ? 'La data fine deve essere ≥ data inizio'
                : 'Mostra solo costumi con almeno una taglia libera nel periodo'
            }
          />
        </Stack>
      )}
    </Stack>
  );
}
