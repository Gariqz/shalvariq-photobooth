// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Cek apakah aplikasi sedang berjalan di server Vercel (Cloud)
  const isVercelCloud = process.env.VERCEL === '1';
  
  const { pathname } = request.nextUrl;

  // JIKA DI CLOUD (VERCEL):
  if (isVercelCloud) {
    // 1. Izinkan akses ke halaman /download
    // 2. Izinkan Next.js ngambil asset statis (css, js, gambar) di folder /_next/ atau berekstensi file
    if (
      pathname.startsWith('/download') ||
      pathname.startsWith('/_next') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    // 3. JIKA ADA YANG ISENG BUKA HALAMAN LAIN (Home, Packages, dll), LEMPAR KE INSTAGRAM!
    return NextResponse.redirect(new URL('https://instagram.com/shalvariq.photobooth', request.url));
  }

  // JIKA DI LOCALHOST (MESIN KIOSK FISIK):
  // Biarkan semua halaman terbuka normal
  return NextResponse.next();
}

// Konfigurasi ini ngasih tau Middleware untuk jalan di semua rute
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};