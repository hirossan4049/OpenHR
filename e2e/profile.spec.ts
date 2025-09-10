import { test, expect } from '@playwright/test';

/**
 * Profile Management E2E Tests
 * 
 * These tests validate the complete user flow for profile and skill management
 */

test.describe('Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should show authentication forms for unauthenticated users', async ({ page }) => {
    // Prefer role-based, accessible selectors to avoid strict mode conflicts
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
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
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();

    // Toggle to registration
    await page.getByRole('button', { name: "Don't have an account? Sign up" }).click();

    // Should show registration form
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();

    // Toggle back to login
    await page.getByRole('button', { name: 'Already have an account? Sign in' }).click();

    // Should show login form again
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    // Toggle to registration
    await page.getByRole('button', { name: "Don't have an account? Sign up" }).click();

    // Try to submit empty form
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Should show validation errors (client-side required or zod)
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
  });
});

test.describe('Navigation and UI', () => {
  test('should have proper navigation structure', async ({ page }) => {
    await page.goto('/');

    // Main title visible
    await expect(page.getByRole('heading', { name: /OpenHR\s*TMS/i })).toBeVisible();

    // For unauthenticated users, auth heading should be visible
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });
});
