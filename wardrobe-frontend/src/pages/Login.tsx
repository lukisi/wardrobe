import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { isAxiosError } from 'axios';
import { useAuth } from '../hooks/UseAuth';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!username || !password) {
      setError('Username e password obbligatori');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Credenziali non valide');
      } else {
        setError('Credenziali non valide');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Typography variant="h4" gutterBottom align="center" color="primary">
        Wardrobe App
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          maxWidth: 400,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          variant="outlined"
          autoComplete="username"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          variant="outlined"
          autoComplete="current-password"
        />

        {error && <Alert severity="error">{error}</Alert>}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          fullWidth
          size="large"
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
        </Button>
      </Box>
    </Container>
  );
}
