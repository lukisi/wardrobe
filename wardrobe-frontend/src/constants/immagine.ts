export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
      <rect fill="#e7e5e4" width="600" height="800"/>
      <text x="50%" y="50%" text-anchor="middle" fill="#78716c" font-family="sans-serif" font-size="28">Nessuna immagine</text>
    </svg>`,
  );

export const IMMAGINE_MAX_BYTES = 2 * 1024 * 1024;

export const IMMAGINE_ACCEPT = 'image/jpeg,image/png,image/webp';
