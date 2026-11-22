import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MyWallet',
    short_name: 'MyWallet',
    description: 'Personal income, expense and net-worth tracker',
    start_url: '/',
    display: 'standalone',
    background_color: '#E0F2F1',
    theme_color: '#1C1C1C',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
