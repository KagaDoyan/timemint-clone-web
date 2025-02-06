import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = "secret";
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;

  // Public routes that don't require authentication
  const publicPaths = ['/login', '/set-password'];

  // Check if the current path is public
  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // If no session exists, redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify the session token
  try {
    await jwtVerify(session, key, {
      algorithms: ['HS256']
    });
    return NextResponse.next();
  } catch (error) {
    // Invalid token, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/((?!login|_next/static|_next/image|favicon.ico).*)', '/']
}
