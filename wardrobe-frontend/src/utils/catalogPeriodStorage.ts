import type { CatalogoFilterMode } from '../components/costumi/CostumeFilters';

const STORAGE_KEY = 'wardrobe.catalogPeriod';

export interface CatalogPeriodPreference {
  mode: CatalogoFilterMode;
  dal: string;
  al: string;
}

export function loadCatalogPeriodPreference(): CatalogPeriodPreference | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CatalogPeriodPreference>;
    if (parsed.mode !== 'tutti' && parsed.mode !== 'periodo') return null;
    return {
      mode: parsed.mode,
      dal: typeof parsed.dal === 'string' ? parsed.dal : '',
      al: typeof parsed.al === 'string' ? parsed.al : '',
    };
  } catch {
    return null;
  }
}

/** Salva l'ultimo periodo; in modalità «tutti» conserva le date precedenti. */
export function saveCatalogPeriodPreference(pref: CatalogPeriodPreference): void {
  try {
    const prev = loadCatalogPeriodPreference();
    const toStore: CatalogPeriodPreference = {
      mode: pref.mode,
      dal: pref.mode === 'periodo' ? pref.dal : pref.dal || prev?.dal || '',
      al: pref.mode === 'periodo' ? pref.al : pref.al || prev?.al || '',
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // sessionStorage non disponibile (privacy mode, ecc.)
  }
}
