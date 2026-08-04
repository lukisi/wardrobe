/** Brand e copy della landing post-login (Fase 4). */

export const BRAND_NAME = 'Wardrobe';

export const ORATORIO_NAME = 'Oratorio San Giuseppe';

export const HERO_HEADLINE = 'Il guardaroba sacro dell’Oratorio';

export const HERO_SUPPORT =
  'Inventario dei costumi per presepi viventi, santi e ricostruzioni storiche.';

/** Immagine hero: override con VITE_HERO_IMAGE_URL a build-time. */
export const DEFAULT_HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=2400&q=80';

export function getHeroImageUrl(): string {
  const fromEnv = import.meta.env.VITE_HERO_IMAGE_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.trim();
  }
  return DEFAULT_HERO_IMAGE_URL;
}
