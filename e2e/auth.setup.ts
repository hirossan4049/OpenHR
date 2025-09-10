import { chromium, expect, request, type FullConfig, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export default async function globalSetup(config: FullConfig) {
  const baseURL = (config.projects[0]?.use as any)?.baseURL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

  const authDir = path.resolve('e2e/.auth');
  fs.mkdirSync(authDir, { recursive: true });
  const storagePath = path.join(authDir, 'user.json');

  const email = 'e2e.user@example.com';
  const password = 'password123';

  console.log('[E2E Setup] Starting authentication setup...');

  // UI login to establish NextAuth session and save storage state
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Create user via API (idempotent)
    console.log('[E2E Setup] Creating user via API...');
    const req = await request.newContext({ baseURL });
    await req.post('/api/auth/register', {
      data: { name: 'E2E User', email, password, confirmPassword: password },
    }).catch(() => {
      console.log('[E2E Setup] User already exists, continuing...');
    });

    console.log('[E2E Setup] Navigating to login...');
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    
    // Check if already logged in
    const isLoggedIn = await page.getByRole('link', { name: 'My Profile' }).isVisible().catch(() => false);
    
    if (!isLoggedIn) {
      console.log('[E2E Setup] Logging in...');
      await ensureLoginForm(page);
      await page.getByLabel('Email', { exact: true }).fill(email);
      await page.getByLabel('Password', { exact: true }).fill(password);
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Wait for successful login
      await page.waitForURL('**/', { waitUntil: 'networkidle', timeout: 10000 });
      
      // Ensure profile link is visible after login
      await expect(page.getByRole('link', { name: 'My Profile' })).toBeVisible({ timeout: 10000 });
      console.log('[E2E Setup] Login successful!');
    } else {
      console.log('[E2E Setup] Already logged in!');
    }

    // Save the authenticated state
    await context.storageState({ path: storagePath });
    console.log('[E2E Setup] Auth state saved to:', storagePath);
  } catch (error) {
    console.error('[E2E Setup] Authentication setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function ensureLoginForm(page: Page) {
  const signInHeading = page.getByRole('heading', { name: 'Sign In' });
  const createHeading = page.getByRole('heading', { name: 'Create Account' });
  if (await createHeading.isVisible().catch(() => false)) {
    const toLogin = page.getByRole('button', { name: 'Already have an account? Sign in' });
    await toLogin.click();
    await expect(signInHeading).toBeVisible();
    return;
  }
  if (await signInHeading.isVisible().catch(() => false)) return;
  const toLogin = page.getByRole('button', { name: 'Already have an account? Sign in' });
  if (await toLogin.isVisible().catch(() => false)) {
    await toLogin.click();
    await expect(signInHeading).toBeVisible();
    return;
  }
  const toSignUp = page.getByRole('button', { name: "Don't have an account? Sign up" });
  if (await toSignUp.isVisible().catch(() => false)) {
    await toSignUp.click();
    await page.getByRole('button', { name: 'Already have an account? Sign in' }).click();
    await expect(signInHeading).toBeVisible();
  }
}
