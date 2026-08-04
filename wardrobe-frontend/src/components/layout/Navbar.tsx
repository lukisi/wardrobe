import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
} from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/UseAuth';

const navLinkSx = (active: boolean) => ({
  color: active ? 'primary.main' : 'text.primary',
  fontWeight: active ? 600 : 500,
  textTransform: 'none' as const,
});

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            color: 'primary.main',
            textDecoration: 'none',
            fontFamily: '"Libre Baskerville", Georgia, serif',
            fontWeight: 700,
            mr: 1,
          }}
        >
          Wardrobe
        </Typography>

        <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }} useFlexGap flexWrap="wrap">
          <Button component={RouterLink} to="/" sx={navLinkSx(location.pathname === '/')}>
            Home
          </Button>
          <Button
            component={RouterLink}
            to="/costumi"
            sx={navLinkSx(location.pathname.startsWith('/costumi'))}
          >
            Database Costumi
          </Button>
          <Button
            component={RouterLink}
            to="/guida"
            sx={navLinkSx(location.pathname.startsWith('/guida'))}
          >
            Guida
          </Button>
          <Button disabled sx={{ textTransform: 'none' }}>
            Prenotazioni
          </Button>
          <Chip label="Prossimamente" size="small" variant="outlined" sx={{ alignSelf: 'center' }} />
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {user && (
            <Typography variant="body2" color="text.secondary">
              {user.username}
            </Typography>
          )}
          <Button variant="outlined" color="secondary" size="small" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
