import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Space_Mono, Nunito } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FAFAF8',
};

const BASE_URL = 'https://loveyourhand.app';
const OG_IMAGE = `${BASE_URL}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Loveyourhand — Turn your handwriting into a font',
    template: '%s — Loveyourhand',
  },
  description: 'Turn your handwriting into a personal font and beautiful shareable content. Love your hand.',
  keywords: ['handwriting font', 'personal font', 'handwriting app', '손글씨 폰트', '나만의 폰트', 'font maker', '폰트 만들기'],
  authors: [{ name: 'Loveyourhand', url: BASE_URL }],
  creator: 'Loveyourhand',
  publisher: 'Loveyourhand',
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    alternateLocale: 'en_US',
    url: BASE_URL,
    siteName: 'Loveyourhand',
    title: 'Loveyourhand — Turn your handwriting into a font',
    description: 'Turn your handwriting into a personal font and beautiful shareable content.',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Loveyourhand — Love your hand.' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loveyourhand',
    creator: '@loveyourhand',
    title: 'Loveyourhand — Turn your handwriting into a font',
    description: 'Turn your handwriting into a personal font and beautiful shareable content.',
    images: [OG_IMAGE],
  },
  // Kakao Open Graph (uses standard OG — no extra tags needed)
  other: {
    'kakao:title': 'Loveyourhand',
    'kakao:description': '나만의 손글씨 폰트를 만들어보세요.',
    'kakao:image': OG_IMAGE,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      className={`${ibmPlexMono.variable} ${spaceMono.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAFAF8] text-[#1A1A1A]">
        {/* Skip to main content (keyboard / screen reader) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#1A1A1A] focus:text-[#FAFAF8] focus:rounded-lg focus:text-sm"
        >
          Skip to main content
        </a>
        <div id="main-content" tabIndex={-1} className="outline-none">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
