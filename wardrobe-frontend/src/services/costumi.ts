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
  if (params.taglia) query.taglia = params.taglia;
  if (params.dal) query.dal = params.dal;
  if (params.al) query.al = params.al;
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

export async function fetchCostumeImageBlob(id: number): Promise<Blob> {
  const { data } = await api.get<Blob>(`/api/costumi/${id}/immagine/`, {
    responseType: 'blob',
  });
  return data;
}

export async function uploadCostumeImage(id: number, file: File): Promise<Costume> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.put<Costume>(`/api/costumi/${id}/immagine/`, formData, {
    timeout: 60000,
  });
  return data;
}

export async function deleteCostumeImage(id: number): Promise<void> {
  await api.delete(`/api/costumi/${id}/immagine/`);
}
