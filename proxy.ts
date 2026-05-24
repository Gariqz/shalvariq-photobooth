// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const isVercelCloud = process.env.VERCEL === '1';
  const { pathname } = request.nextUrl;

  if (isVercelCloud) {
    // TAMBAHKAN /custom DAN /api/custom DI SINI BIAR NGAK DILEMPAR KE IG
    if (
      pathname.startsWith('/download') ||
      pathname.startsWith('/custom') ||
      pathname.startsWith('/api/custom') ||
      pathname.startsWith('/_next') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    // JIKA BUKA HALAMAN LAIN, BARU LEMPAR KE INSTAGRAM
    return NextResponse.redirect(new URL('https://instagram.com/shalvariq.photobooth', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};