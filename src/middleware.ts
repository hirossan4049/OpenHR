import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'ja'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});
 
export const config = {
  // Skip all paths that are not internationalized
  // Pattern from Next.js docs: exclude api, _next, and files with extensions
  matcher: ['/((?!api|_next|.*\\..*).*)']
};