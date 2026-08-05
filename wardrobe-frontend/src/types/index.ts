export interface AuthUser {
  username: string;
}

export type CostumeCategoria =
  | 'presepe_vivente'
  | 'profeti'
  | 'santi'
  | 'apostoli';

export type CostumeTaglia = 'S' | 'M' | 'L' | 'XL';

export interface TagliaStock {
  taglia: CostumeTaglia;
  quantita: number;
}

export interface InventarioItem {
  id: number;
  codice: string;
  nome: string;
  descrizione: string;
  categoria: CostumeCategoria;
  has_immagine: boolean;
  taglie_stock: TagliaStock[];
  disponibile: boolean;
  ultimo_utilizzo: string | null;
}

/** Alias esplicito per il dominio costumi (stesso payload API). */
export type Costume = InventarioItem;

export interface CostumeWritePayload {
  nome: string;
  descrizione?: string;
  categoria: CostumeCategoria;
  taglie_stock?: TagliaStock[];
  ultimo_utilizzo?: string | null;
}

export interface CostumiListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Costume[];
}

export interface CostumiMetaCategoria {
  categoria: CostumeCategoria;
  label: string;
  count: number;
}

export interface CostumiMeta {
  totale: number;
  disponibili: number;
  categorie: CostumiMetaCategoria[];
}

export interface CostumiListParams {
  q?: string;
  categoria?: CostumeCategoria | '';
  disponibile?: boolean | null;
  taglia?: CostumeTaglia | '';
  page?: number;
  page_size?: number;
}

/** @deprecated Usa CostumeWritePayload */
export type InventarioCreatePayload = CostumeWritePayload;

export interface LoginResponse {
  access: string;
}
