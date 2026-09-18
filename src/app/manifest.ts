import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AgroFinance RWA & Crédito Agro',
    short_name: 'AgroFinance',
    description: 'Plataforma financeira de custódia, crédito e derivativos tokenizados (RWA) do agronegócio com suporte a Modo Campo offline.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0D2818',
    theme_color: '#164E2A',
    icons: [
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  };
}
