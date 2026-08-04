import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import type { Costume } from '../../types';
import { CATEGORIA_LABELS } from '../../constants/costumi';
import { PLACEHOLDER_IMAGE } from '../../constants/immagine';
import { useCostumeImageUrl } from '../../hooks/useCostumeImageUrl';

interface CostumeCardProps {
  costume: Costume;
  onClick: (costume: Costume) => void;
}

export default function CostumeCard({ costume, onClick }: CostumeCardProps) {
  const { url, loading } = useCostumeImageUrl(costume.id, costume.has_immagine);

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
        {loading && costume.has_immagine ? (
          <Skeleton variant="rectangular" height={220} animation="wave" />
        ) : (
          <CardMedia
            component="img"
            height="220"
            image={url || PLACEHOLDER_IMAGE}
            alt={costume.nome}
            sx={{ objectFit: 'cover', bgcolor: 'grey.200' }}
            onError={(e) => {
              const img = e.currentTarget;
              if (img.src !== PLACEHOLDER_IMAGE) img.src = PLACEHOLDER_IMAGE;
            }}
          />
        )}
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
