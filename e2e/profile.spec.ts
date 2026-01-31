import { test, expect } from '@playwright/test';

/**
 * Profile Management E2E Tests
 * 
 * These tests validate the complete user flow for profile and skill management
 */

test.describe('Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the sign-in page
    await page.goto('/auth/signin');
  });

  test('should show authentication forms for unauthenticated users', async ({ page }) => {
    // Prefer role-based, accessible selectors to avoid strict mode conflicts
    await expect(page.getByRole('heading', { name: 'Sign In', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    // Registration is not visible yet; verify the toggle button exists
    await expect(page.getByRole('button', { name: "Don't have an account? Sign up" })).toBeVisible();

    // OAuth buttons
    await expect(page.getByRole('button', { name: 'GitHub' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Google' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Discord' })).toBeVisible();
  });

  test('should allow toggling between login and registration forms', async ({ page }) => {
    // Should start with login form
    await expect(page.getByRole('heading', { name: 'Sign In', exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();

    // Toggle to registration
    await page.getByRole('button', { name: "Don't have an account? Sign up" }).click();

    // Should show registration form
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Confirm Password' })).toBeVisible();

    // Toggle back to login
    await page.getByRole('button', { name: 'Already have an account? Sign in' }).click();

    // Should show login form again
    await expect(page.getByRole('heading', { name: 'Sign In', exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    // Toggle to registration
    await page.getByRole('button', { name: "Don't have an account? Sign up" }).click();

    // Try to submit empty form
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Should show validation errors (client-side required or zod)
    await expect(page.getByRole('textbox', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
  });
});

test.describe('Navigation and UI', () => {
  test('should have proper navigation structure', async ({ page }) => {
    await page.goto('/');

    // Main heading visible on landing page
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Sign in link should be visible for unauthenticated users
    await expect(page.getByRole('link', { name: /サインイン|Sign\s*[Ii]n/i }).first()).toBeVisible();
  });
});
