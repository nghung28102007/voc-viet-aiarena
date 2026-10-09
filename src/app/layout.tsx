import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Playfair_Display } from 'next/font/google';
import './globals.css';

const beVietnam = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-be-vietnam',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sắc Việt — Co-Mix Studio',
  description:
    'Phối đồ Việt phục hiện đại với AI đánh giá văn hóa realtime. Dành cho Gen Z yêu di sản Việt.',
  keywords: ['Việt phục', 'Áo Dài', 'AI styling', 'VNU', 'Google', 'AI Arena', 'Sắc Việt'],
  openGraph: {
    title: 'Sắc Việt — Co-Mix Studio',
    description: 'AI-powered Vietnamese traditional garment styling platform',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${beVietnam.variable} ${playfair.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#FDFBF7" />
      </head>
      <body className="font-[family-name:var(--font-be-vietnam)] bg-[#FDFBF7] text-[#1F1E1D] overflow-hidden h-dvh">
        {children}
      </body>
    </html>
  );
}
