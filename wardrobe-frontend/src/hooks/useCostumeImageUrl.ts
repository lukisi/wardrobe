import { useEffect, useState } from 'react';
import { fetchCostumeImageBlob } from '../services/costumi';

/**
 * Scarica l'immagine costume con JWT e espone un object URL revocato al cleanup.
 */
export function useCostumeImageUrl(
  costumeId: number | null | undefined,
  hasImmagine: boolean,
): { url: string | null; loading: boolean } {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!costumeId || !hasImmagine) {
      setUrl(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    let objectUrl: string | undefined;
    setLoading(true);
    setUrl(null);

    void fetchCostumeImageBlob(costumeId)
      .then((blob) => {
        const next = URL.createObjectURL(blob);
        if (cancelled) {
          URL.revokeObjectURL(next);
          return;
        }
        objectUrl = next;
        setUrl(next);
      })
      .catch((err: unknown) => {
        console.error('Errore caricamento immagine costume', err);
        if (!cancelled) setUrl(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [costumeId, hasImmagine]);

  return { url, loading };
}
