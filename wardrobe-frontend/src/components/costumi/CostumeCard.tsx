import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Typography,
  Box,
} from '@mui/material';
import type { Costume } from '../../types';
import { CATEGORIA_LABELS } from '../../constants/costumi';

interface CostumeCardProps {
  costume: Costume;
  onClick: (costume: Costume) => void;
}

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
      <rect fill="#e7e5e4" width="600" height="800"/>
      <text x="50%" y="50%" text-anchor="middle" fill="#78716c" font-family="sans-serif" font-size="28">Nessuna immagine</text>
    </svg>`,
  );

export default function CostumeCard({ costume, onClick }: CostumeCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
    >
      <CardActionArea
        onClick={() => onClick(costume)}
        sx={{ height: '100%', alignItems: 'stretch', display: 'flex', flexDirection: 'column' }}
      >
        <CardMedia
          component="img"
          height="220"
          image={costume.immagine_url || PLACEHOLDER}
          alt={costume.nome}
          sx={{ objectFit: 'cover', bgcolor: 'grey.200' }}
          onError={(e) => {
            const img = e.currentTarget;
            if (img.src !== PLACEHOLDER) img.src = PLACEHOLDER;
          }}
        />
        <CardContent sx={{ flexGrow: 1, width: '100%' }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.6 }}>
            {costume.codice}
          </Typography>
          <Typography variant="h6" component="h2" sx={{ lineHeight: 1.25, mb: 1 }}>
            {costume.nome}
          </Typography>
          <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap', mb: 1.5 }}>
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
          {costume.taglie?.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Taglie: {costume.taglie.join(' · ')}
              </Typography>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
