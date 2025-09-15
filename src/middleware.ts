import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Locale middleware from next-intl
const intlMiddleware = createMiddleware({
  locales: ['en', 'ja'],
  defaultLocale: 'en',
});

// Public paths (accessible without auth). Keep minimal: only locale root for login UI.
function isLocaleRoot(pathname: string) {
  // Matches: "/en" or "/ja" (optionally with trailing slash)
  return /^\/(?:[a-z]{2})(?:\/)?$/.test(pathname);
}

function stripLocale(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] && /^[a-z]{2}$/.test(segments[0] ?? '')) {
    segments.shift();
  }
  return '/' + segments.join('/');
}

// Public routes that should be accessible without authentication
function isPublicPath(pathname: string) {
  const p = stripLocale(pathname);
  // Normalize trailing slash except for root
  const norm = p !== '/' ? p.replace(/\/$/, '') : '/';

  const publicPrefixes = [
    '/',
    '/members',
    '/projects',
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

    // Allow locale roots and public paths without auth
    if (isLocaleRoot(pathname) || isPublicPath(pathname)) {
      return res;
    }

    // Otherwise redirect unauthenticated users to the locale root (login UI)
    const segments = pathname.split('/').filter(Boolean);
    const maybeLocale = segments[0] && /^[a-z]{2}$/.test(segments[0]) ? segments[0] : undefined;
    const localePrefix = maybeLocale ? `/${maybeLocale}` : '/en';
    return NextResponse.redirect(new URL(`${localePrefix}`, req.nextUrl));
  }

  return res;
}

export const config = {
  // Skip all paths that are not internationalized
  // Pattern from Next.js docs: exclude api, _next, and files with extensions
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
