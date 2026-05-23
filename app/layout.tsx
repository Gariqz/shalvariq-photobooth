// app/layout.tsx
import './globals.css';
import FloatingTimer from '@/components/FloatingTimer';
import { Playfair_Display, Inter } from 'next/font/google';

// Font Serif untuk Heading & Aksen Retro
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  style: ['normal', 'italic'],
});

// Font Sans-serif untuk Teks Biasa & UI
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Zenith Polaroid Booth',
  description: 'Vintage Self-Photo Studio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      {/* bg-grid-paper: Background kotak-kotak retro 
        text-[#2c2c2c]: Warna teks abu-abu tua arang (charcoal) bukan hitam pekat
      */}
      <body className="bg-grid-paper text-[#2c2c2c] overflow-hidden antialiased font-sans">
        
        {/* Komponen Timer (Nanti stylenya kita ubah juga biar ga UI AI banget) */}
        <FloatingTimer />
        
        {children}
      </body>
    </html>
  );
}