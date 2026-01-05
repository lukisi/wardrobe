import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: { username: string } | null; // tipo semplificato
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    // Persistenza: leggiamo dal localStorage all'avvio
    return localStorage.getItem('auth_token');
  });
  const [user, setUser] = useState<{ username: string } | null>(null);

  const isAuthenticated = !!token;

  const login = async (username: string, password: string) => {
    try {
      // Chiamata reale al backend (useremo axios dopo)
      const response = await fetch('/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) throw new Error('Login fallito');

      const data = await response.json();
      const newToken = data.access;

      setToken(newToken);
      setUser({ username });
      localStorage.setItem('auth_token', newToken);
    } catch (err) {
      console.error(err);
      throw err; // per poter mostrare errore nel form
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  const value: AuthState = {
    token,
    user,
    isAuthenticated,
    login,
    logout
  };

  // Il Provider di un contesto "pubblica" il value a tutti i discendenti
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizzato (più comodo e con type-safety)
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere usato dentro AuthProvider');
  }
  return context;
}
