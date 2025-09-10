import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'ja'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});
 
export const config = {
  // Skip all paths that are not internationalized
  matcher: ['/((?!api|_next|.*\..*).*)']
};