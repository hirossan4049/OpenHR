import {createNavigation} from 'next-intl/navigation';
 
export const locales = ['en', 'ja'] as const;
export const pathnames = {
  '/': {
    en: '/',
    ja: '/'
  },
  '/profile': {
    en: '/profile',
    ja: '/profile'
  },
  '/projects': {
    en: '/projects',
    ja: '/projects'
  },
  '/projects/new': {
    en: '/projects/new',
    ja: '/projects/new'
  },
  '/dashboard': {
    en: '/dashboard',
    ja: '/dashboard'
  },
  '/members': {
    en: '/members',
    ja: '/members'
  },
  '/admin': {
    en: '/admin',
    ja: '/admin'
  }
} satisfies Record<string, Record<typeof locales[number], string>>;
 
export const {Link, redirect, usePathname, useRouter} = createNavigation({
  locales,
  pathnames
});