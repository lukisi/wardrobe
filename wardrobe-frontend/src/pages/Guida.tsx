import { Box, Container, Divider, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { BRAND_NAME, ORATORIO_NAME } from '../constants/brand';

const SECTIONS = [
  {
    title: 'Prima dell’allestimento',
    body: 'Sfoglia il database per idea e categoria, oppure filtra i costumi disponibili in un periodo (Dal / Al) se stai preparando una rappresentazione. Controlla le taglie in magazzino e le quantità.',
  },
  {
    title: 'Scelta e preparazione',
    body: 'Preferisci pezzi in buono stato e della taglia corretta. Se per una data non c’è disponibilità, cerca un’alternativa nella stessa categoria o scegli un altro periodo.',
  },
  {
    title: 'Durante le prove',
    body: 'Segna mentalmente (o in un foglio di lavoro) chi indossa cosa. Dopo le prove, riponi i costumi e aggiorna l’inventario se qualcosa risulta danneggiato o mancante.',
  },
  {
    title: 'Dopo l’evento',
    body: 'Riporta i costumi in magazzino. Usa Prenotazioni per bloccare costume e taglia nel periodo dell’evento: lo stock fisico non cambia, la disponibilità nel catalogo filtrato per periodo è calcolata sulle prenotazioni attive sovrapposte.',
  },
] as const;

export default function Guida() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 }, mb: 6 }}>
      <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.2 }}>
        {BRAND_NAME} · {ORATORIO_NAME}
      </Typography>
      <Typography variant="h3" component="h1" sx={{ mt: 1, mb: 1.5 }}>
        Guida allestimenti
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 640 }}>
        Indicazioni pratiche per usare l’inventario costumi nelle ricostruzioni e nei presepi
        viventi. Contenuto di riferimento — verrà arricchito con procedure dell’oratorio.
      </Typography>

      <Stack spacing={3} divider={<Divider flexItem />}>
        {SECTIONS.map((section) => (
          <Box key={section.title} component="article">
            <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
              {section.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 680 }}>
              {section.body}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Box sx={{ mt: 5, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Link component={RouterLink} to="/costumi" underline="hover" color="primary" fontWeight={600}>
          Apri il database costumi →
        </Link>
        <Link
          component={RouterLink}
          to="/prenotazioni"
          underline="hover"
          color="primary"
          fontWeight={600}
        >
          Vai alle prenotazioni →
        </Link>
      </Box>
    </Container>
  );
}
