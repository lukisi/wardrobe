import api from './api';
import type {
  CostumeDisponibilita,
  Prenotazione,
  PrenotazioneCreatePayload,
  PrenotazioniListParams,
} from '../types';

function toQuery(params: PrenotazioniListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {};
  if (params.dal) query.dal = params.dal;
  if (params.al) query.al = params.al;
  if (params.costume != null) query.costume = params.costume;
  if (params.stato) query.stato = params.stato;
  if (params.taglia) query.taglia = params.taglia;
  return query;
}

export async function fetchPrenotazioni(
  params: PrenotazioniListParams = {},
): Promise<Prenotazione[]> {
  const { data } = await api.get<Prenotazione[]>('/api/prenotazioni/', {
    params: toQuery(params),
  });
  return data;
}

export async function createPrenotazione(
  payload: PrenotazioneCreatePayload,
): Promise<Prenotazione> {
  const { data } = await api.post<Prenotazione>('/api/prenotazioni/', payload);
  return data;
}

export async function fetchPrenotazione(id: number): Promise<Prenotazione> {
  const { data } = await api.get<Prenotazione>(`/api/prenotazioni/${id}/`);
  return data;
}

export async function annullaPrenotazione(id: number): Promise<Prenotazione> {
  const { data } = await api.post<Prenotazione>(`/api/prenotazioni/${id}/annulla/`);
  return data;
}

export async function fetchCostumeDisponibilita(
  costumeId: number,
  dal: string,
  al: string,
): Promise<CostumeDisponibilita> {
  const { data } = await api.get<CostumeDisponibilita>(
    `/api/costumi/${costumeId}/disponibilita/`,
    { params: { dal, al } },
  );
  return data;
}
