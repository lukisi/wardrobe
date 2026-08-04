import { Box, Button, Stack, Typography, keyframes } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  BRAND_NAME,
  HERO_HEADLINE,
  HERO_SUPPORT,
  ORATORIO_NAME,
  getHeroImageUrl,
} from '../constants/brand';

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const kenBurns = keyframes`
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.06);
  }
`;

export default function Home() {
  const heroImage = getHeroImageUrl();

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        minHeight: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
        color: '#fafaf9',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: `${kenBurns} 28s ease-out forwards`,
          willChange: 'transform',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(180deg, rgba(28, 25, 23, 0.25) 0%, rgba(28, 25, 23, 0.55) 45%, rgba(28, 25, 23, 0.88) 100%),
            radial-gradient(ellipse at 20% 80%, rgba(180, 83, 9, 0.28), transparent 55%)
          `,
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          px: { xs: 3, sm: 5, md: 8 },
          pb: { xs: 6, md: 8 },
          pt: { xs: 10, md: 12 },
          maxWidth: 960,
        }}
      >
        <Typography
          component="p"
          sx={{
            fontFamily: '"Libre Baskerville", Georgia, serif',
            fontSize: { xs: '2.4rem', sm: '3.2rem', md: '3.75rem' },
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            mb: 1,
            animation: `${fadeUp} 0.7s ease-out both`,
          }}
        >
          {BRAND_NAME}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'rgba(250, 250, 249, 0.78)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 600,
            mb: { xs: 2.5, md: 3 },
            animation: `${fadeUp} 0.7s ease-out 0.08s both`,
          }}
        >
          {ORATORIO_NAME}
        </Typography>

        <Typography
          component="h1"
          sx={{
            fontFamily: '"Libre Baskerville", Georgia, serif',
            fontSize: { xs: '1.55rem', sm: '1.9rem', md: '2.15rem' },
            fontWeight: 400,
            lineHeight: 1.25,
            maxWidth: 640,
            mb: 1.5,
            animation: `${fadeUp} 0.75s ease-out 0.16s both`,
          }}
        >
          {HERO_HEADLINE}
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: '1rem', md: '1.1rem' },
            color: 'rgba(250, 250, 249, 0.86)',
            maxWidth: 520,
            mb: 3.5,
            animation: `${fadeUp} 0.75s ease-out 0.24s both`,
          }}
        >
          {HERO_SUPPORT}
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ animation: `${fadeUp} 0.8s ease-out 0.32s both` }}
        >
          <Button
            component={RouterLink}
            to="/costumi"
            variant="contained"
            size="large"
            sx={{
              px: 3,
              py: 1.25,
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            Inizia la ricerca
          </Button>
          <Button
            component={RouterLink}
            to="/guida"
            variant="outlined"
            size="large"
            sx={{
              px: 3,
              py: 1.25,
              color: '#fafaf9',
              borderColor: 'rgba(250, 250, 249, 0.45)',
              '&:hover': {
                borderColor: '#fafaf9',
                bgcolor: 'rgba(250, 250, 249, 0.08)',
              },
            }}
          >
            Guida allestimenti
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
