import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Costumi from './pages/Costumi';
import Guida from './pages/Guida';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/costumi"
            element={
              <ProtectedRoute>
                <Costumi />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guida"
            element={
              <ProtectedRoute>
                <Guida />
              </ProtectedRoute>
            }
          />
          <Route path="/inventario" element={<Navigate to="/costumi" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

export default App;
