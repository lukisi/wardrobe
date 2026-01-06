import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// Hook personalizzato (più comodo e con type-safety)
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere usato dentro AuthProvider');
  }
  return context;
}
