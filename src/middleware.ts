import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Get the canonical base URL for redirects
function getBaseUrl(req: NextRequest): string {
  // Prefer AUTH_URL if set (for production behind proxies/tunnels)
  if (process.env.AUTH_URL) {
    return process.env.AUTH_URL;
  }
  // Fallback to request URL (works in most cases)
  return req.nextUrl.origin;
}

// Locale middleware from next-intl
const intlMiddleware = createMiddleware({
  locales: ['en', 'ja'],
  defaultLocale: 'en',
  localePrefix: 'never',
  localeDetection: true,
});

// Public paths (accessible without auth). Keep minimal: only root for login UI.
function isRoot(pathname: string) {
  // Matches: "/"
  return pathname === '/';
}

// Public routes that should be accessible without authentication
function isPublicPath(pathname: string) {
  // Normalize trailing slash except for root
  const norm = pathname !== '/' ? pathname.replace(/\/$/, '') : '/';

  const publicPrefixes = [
    '/',
    '/members',
    '/projects',
    '/auth', // allow sign-in/up flows without an existing session
    '/my', // page itself handles showing sign-in prompt if needed
  ];

  return publicPrefixes.some((prefix) =>
    norm === prefix || norm.startsWith(prefix + '/')
  );
}

function hasAuthCookie(req: NextRequest) {
  const names = [
    // Auth.js v5
    'authjs.session-token',
    '__Secure-authjs.session-token',
    // NextAuth v4 legacy (in case)
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
  ];
  return names.some((n) => Boolean(req.cookies.get(n)?.value));
}

export default function middleware(req: NextRequest) {
  // First, apply locale handling
  const res = intlMiddleware(req);

  // Only enforce auth on protected routes. Public pages should render for unauthenticated users.
  if (!hasAuthCookie(req)) {
    const pathname = req.nextUrl.pathname;

    // Allow root and public paths without auth
    if (isRoot(pathname) || isPublicPath(pathname)) {
      return res;
    }

    // Otherwise redirect unauthenticated users to root (login UI)
    return NextResponse.redirect(new URL('/', getBaseUrl(req)));
  }

  return res;
}

export const config = {
  // Skip all paths that are not internationalized
  // Pattern from Next.js docs: exclude api, _next, and files with extensions
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
