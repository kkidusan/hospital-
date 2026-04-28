import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Even though the file is named proxy.ts, 
 * Next.js currently requires the function name to be 'middleware'.
 */
export function middleware(request: NextRequest) {
  // No more HTTPS redirects - keeping it simple for HTTP
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};