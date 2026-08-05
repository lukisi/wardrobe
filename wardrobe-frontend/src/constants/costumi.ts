import type { CostumeCategoria, CostumeTaglia } from '../types';

export const CATEGORIA_LABELS: Record<CostumeCategoria, string> = {
  presepe_vivente: 'Presepe Vivente',
  profeti: 'Profeti',
  santi: 'Santi',
  apostoli: 'Apostoli',
};

export const CATEGORIA_OPTIONS = Object.keys(CATEGORIA_LABELS) as CostumeCategoria[];

export const TAGLIE_OPTIONS: CostumeTaglia[] = ['S', 'M', 'L', 'XL'];

export const PAGE_SIZE = 12;

/** Formatta stock per taglia, es. "S×1 · M×2". */
export function formatTaglieStock(
  stock: { taglia: string; quantita: number }[] | undefined | null,
): string {
  const rows = (stock ?? []).filter((r) => r.quantita > 0);
  if (!rows.length) return '';
  return rows.map((r) => `${r.taglia}×${r.quantita}`).join(' · ');
}
