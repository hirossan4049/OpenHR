import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '~/server/auth';

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

export default auth(function middleware(req: NextRequest) {
  // First, apply locale handling
  const res = intlMiddleware(req);

  // If not authenticated and not on the locale root, redirect to the locale home (login UI)
  if (!req.auth && !isLocaleRoot(req.nextUrl.pathname)) {
    const segments = req.nextUrl.pathname.split('/').filter(Boolean);
    const maybeLocale = segments[0] && /^[a-z]{2}$/.test(segments[0]) ? segments[0] : undefined;
    const localePrefix = maybeLocale ? `/${maybeLocale}` : '/en';
    return NextResponse.redirect(new URL(`${localePrefix}`, req.nextUrl));
  }

  return res;
});

export const config = {
  // Skip all paths that are not internationalized
  // Pattern from Next.js docs: exclude api, _next, and files with extensions
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
