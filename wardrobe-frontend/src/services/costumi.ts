import api from './api';
import type {
  Costume,
  CostumeWritePayload,
  CostumiListParams,
  CostumiListResponse,
  CostumiMeta,
} from '../types';

function toQuery(params: CostumiListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {};

  if (params.q?.trim()) query.q = params.q.trim();
  if (params.categoria) query.categoria = params.categoria;
  if (params.disponibile === true) query.disponibile = 'true';
  if (params.disponibile === false) query.disponibile = 'false';
  if (params.taglia) query.taglia = params.taglia;
  if (params.page) query.page = params.page;
  if (params.page_size) query.page_size = params.page_size;

  return query;
}

export async function fetchCostumi(params: CostumiListParams = {}): Promise<CostumiListResponse> {
  const { data } = await api.get<CostumiListResponse>('/api/costumi/', {
    params: toQuery(params),
  });
  return data;
}

export async function fetchCostumiMeta(): Promise<CostumiMeta> {
  const { data } = await api.get<CostumiMeta>('/api/costumi/meta/');
  return data;
}

export async function fetchCostume(id: number): Promise<Costume> {
  const { data } = await api.get<Costume>(`/api/costumi/${id}/`);
  return data;
}

export async function createCostume(payload: CostumeWritePayload): Promise<Costume> {
  const { data } = await api.post<Costume>('/api/costumi/', payload);
  return data;
}

export async function updateCostume(
  id: number,
  payload: Partial<CostumeWritePayload>,
): Promise<Costume> {
  const { data } = await api.patch<Costume>(`/api/costumi/${id}/`, payload);
  return data;
}

export async function deleteCostume(id: number): Promise<void> {
  await api.delete(`/api/costumi/${id}/`);
}
