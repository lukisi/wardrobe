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
}

/** Alias esplicito per il dominio costumi (stesso payload API). */
export type Costume = InventarioItem;

export interface CostumeWritePayload {
  nome: string;
  descrizione?: string;
  categoria: CostumeCategoria;
  taglie_stock?: TagliaStock[];
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
  categorie: CostumiMetaCategoria[];
}

export interface CostumiListParams {
  q?: string;
  categoria?: CostumeCategoria | '';
  taglia?: CostumeTaglia | '';
  dal?: string;
  al?: string;
  page?: number;
  page_size?: number;
}

/** @deprecated Usa CostumeWritePayload */
export type InventarioCreatePayload = CostumeWritePayload;

export interface LoginResponse {
  access: string;
}

export type PrenotazioneStato = 'attiva' | 'annullata';

export interface Prenotazione {
  id: number;
  costume: number;
  costume_codice: string;
  costume_nome: string;
  taglia: CostumeTaglia;
  data_inizio: string;
  data_fine: string;
  stato: PrenotazioneStato;
  note: string;
  creata_da: number;
  creata_da_username: string;
  creata_il: string;
}

export interface PrenotazioneCreatePayload {
  costume: number;
  taglia: CostumeTaglia;
  data_inizio: string;
  data_fine: string;
  note?: string;
}

export interface PrenotazioniListParams {
  dal?: string;
  al?: string;
  costume?: number;
  stato?: PrenotazioneStato | '';
  taglia?: CostumeTaglia | '';
}

export interface TagliaDisponibilita {
  taglia: CostumeTaglia;
  stock: number;
  impegnate: number;
  disponibili: number;
}

export interface CostumeDisponibilita {
  costume: number;
  dal: string;
  al: string;
  taglie: TagliaDisponibilita[];
}
