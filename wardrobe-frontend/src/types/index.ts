export interface AuthUser {
  username: string;
}

export interface InventarioItem {
  id: number;
  codice: string;
  descrizione: string;
  quantita: number;
}

export interface InventarioCreatePayload {
  descrizione: string;
}

export interface LoginResponse {
  access: string;
}
