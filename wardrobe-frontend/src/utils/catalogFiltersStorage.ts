import type {
  CatalogoFilterMode,
  CostumeFiltersState,
} from '../components/costumi/CostumeFilters';
import { CATEGORIA_OPTIONS, TAGLIE_OPTIONS } from '../constants/costumi';
import type { CostumeCategoria, CostumeTaglia } from '../types';

const STORAGE_KEY = 'wardrobe.catalogFilters';
const LEGACY_STORAGE_KEY = 'wardrobe.catalogPeriod';

const FILTER_URL_KEYS = ['q', 'categoria', 'taglia', 'mode', 'dal', 'al'] as const;

export function hasCatalogFiltersInUrl(params: URLSearchParams): boolean {
  return FILTER_URL_KEYS.some((key) => params.has(key));
}

function parseMode(value: unknown): CatalogoFilterMode | null {
  if (value === 'tutti' || value === 'periodo') return value;
  return null;
}

function parseCategoria(value: unknown): CostumeCategoria | '' {
  if (typeof value === 'string' && (CATEGORIA_OPTIONS as string[]).includes(value)) {
    return value as CostumeCategoria;
  }
  return '';
}

function parseTaglia(value: unknown): CostumeTaglia | '' {
  const normalized = typeof value === 'string' ? value.toUpperCase() : '';
  if ((TAGLIE_OPTIONS as string[]).includes(normalized)) {
    return normalized as CostumeTaglia;
  }
  return '';
}

function normalizeStoredFilters(raw: Partial<CostumeFiltersState>): CostumeFiltersState | null {
  const mode = parseMode(raw.mode);
  if (!mode) return null;
  return {
    q: typeof raw.q === 'string' ? raw.q : '',
    categoria: parseCategoria(raw.categoria),
    taglia: parseTaglia(raw.taglia),
    mode,
    dal: typeof raw.dal === 'string' ? raw.dal : '',
    al: typeof raw.al === 'string' ? raw.al : '',
  };
}

function readRawStorage(): string | null {
  return sessionStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(LEGACY_STORAGE_KEY);
}

export function loadCatalogFiltersPreference(): CostumeFiltersState | null {
  try {
    const raw = readRawStorage();
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CostumeFiltersState>;
    return normalizeStoredFilters(parsed);
  } catch {
    return null;
  }
}

/** Salva l'ultimo set di filtri; in modalità «tutti» conserva le date del periodo precedenti. */
export function saveCatalogFiltersPreference(filters: CostumeFiltersState): void {
  try {
    const prev = loadCatalogFiltersPreference();
    const toStore: CostumeFiltersState = {
      q: filters.q,
      categoria: filters.categoria,
      taglia: filters.taglia,
      mode: filters.mode,
      dal: filters.mode === 'periodo' ? filters.dal : filters.dal || prev?.dal || '',
      al: filters.mode === 'periodo' ? filters.al : filters.al || prev?.al || '',
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    sessionStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // sessionStorage non disponibile (privacy mode, ecc.)
  }
}

export function mergeWithStoredPeriodDates(
  filters: CostumeFiltersState,
): CostumeFiltersState {
  if (filters.mode !== 'periodo' || (filters.dal && filters.al)) return filters;
  const stored = loadCatalogFiltersPreference();
  if (!stored) return filters;
  return {
    ...filters,
    dal: filters.dal || stored.dal,
    al: filters.al || stored.al,
  };
}
