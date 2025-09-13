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
  '/projects/[id]': {
    en: '/projects/[id]',
    ja: '/projects/[id]'
  },
  '/projects/[id]/edit': {
    en: '/projects/[id]/edit',
    ja: '/projects/[id]/edit'
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
  '/members/[id]': {
    en: '/members/[id]',
    ja: '/members/[id]'
  },
  '/my': {
    en: '/my',
    ja: '/my'
  },
  '/admin': {
    en: '/admin',
    ja: '/admin'
  },
  '/auth/signin': {
    en: '/auth/signin',
    ja: '/auth/signin'
  }
} satisfies Record<string, Record<typeof locales[number], string>>;
 
export const {Link, redirect, usePathname, useRouter} = createNavigation({
  locales,
  pathnames
});
