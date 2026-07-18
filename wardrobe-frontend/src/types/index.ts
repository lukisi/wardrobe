export interface AuthUser {
  username: string;
}

export type CostumeCategoria =
  | 'presepe_vivente'
  | 'profeti'
  | 'santi'
  | 'apostoli';

export interface InventarioItem {
  id: number;
  codice: string;
  nome: string;
  descrizione: string;
  categoria: CostumeCategoria;
  immagine_url: string;
  taglie: string[];
  quantita: number;
  disponibile: boolean;
  ultimo_utilizzo: string | null;
}

export interface InventarioCreatePayload {
  nome: string;
  descrizione?: string;
  categoria: CostumeCategoria;
  immagine_url?: string;
  taglie?: string[];
  quantita?: number;
  ultimo_utilizzo?: string | null;
}

export interface LoginResponse {
  access: string;
}
