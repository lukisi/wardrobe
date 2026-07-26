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
