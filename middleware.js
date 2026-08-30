import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'super-secret-jwt-key-for-marketplace-mvp-must-be-at-least-32-chars-long';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = 'auth_token';

// Paths configuration
const PUBLIC_AUTH_PATHS = ['/login', '/register'];
const BUYER_PATHS = ['/marketplace', '/my-orders'];
const SELLER_PATHS = ['/seller'];
const ADMIN_PATHS = ['/admin'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Read auth token from cookie
  const tokenCookie = request.cookies.get(COOKIE_NAME);
  const token = tokenCookie?.value;

  let payload = null;
  if (token) {
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      payload = verified.payload;
    } catch (err) {
      payload = null;
    }
  }

  const isAuthenticated = !!payload;
  const userRole = payload?.role;

  // 1. If visiting /login or /register while already authenticated, redirect to appropriate role dashboard
  if (PUBLIC_AUTH_PATHS.some((path) => pathname.startsWith(path))) {
    if (isAuthenticated) {
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      if (userRole === 'seller') {
        return NextResponse.redirect(new URL('/seller', request.url));
      }
      return NextResponse.redirect(new URL('/marketplace', request.url));
    }
    return NextResponse.next();
  }

  // 2. Protected routes check
  const isBuyerRoute = BUYER_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'));
  const isSellerRoute = SELLER_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'));
  const isAdminRoute = ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'));

  if (isBuyerRoute || isSellerRoute || isAdminRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role enforcement
    if (isAdminRoute && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }

    if (isSellerRoute && userRole !== 'seller' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }

    // Buyer routes are accessible by buyer, seller, and admin for browsing/testing
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/marketplace/:path*',
    '/my-orders/:path*',
    '/seller/:path*',
    '/admin/:path*',
  ],
};
