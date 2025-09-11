export type ToastOptions = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'info';
};

// Minimal fallback toast implementation for non-UI environments/tests
export function toast(options: ToastOptions) {
  const message = options.title || options.description || '';
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.log('[toast]', options.variant || 'default', message);
  }
}

export function useToast() {
  return { toast };
}

