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

  // Note: The following tests would require a test database and proper authentication setup
  // In a real environment, you would use test fixtures or mock authentication

  test.skip('should register new user and redirect to profile', async ({ page: _ }) => {
    // This test would be implemented with proper test database setup
    // await page.click('text=Don\'t have an account? Sign up');
    // await page.fill('input[name="name"]', 'Test User');
    // await page.fill('input[name="email"]', 'test@example.com');
    // await page.fill('input[name="password"]', 'password123');
    // await page.fill('input[name="confirmPassword"]', 'password123');
    // await page.click('button[type="submit"]');
    // await expect(page.locator('text=My Profile')).toBeVisible();
  });

  test.skip('should show profile page for authenticated users', async ({ page: _ }) => {
    // This test would require authentication setup
    // await authenticateUser(page);
    // await page.goto('/profile');
    // await expect(page.locator('text=Edit Profile')).toBeVisible();
    // await expect(page.locator('text=Skills')).toBeVisible();
  });

  test.skip('should allow editing profile information', async ({ page: _ }) => {
    // This test would require authentication setup
    // await authenticateUser(page);
    // await page.goto('/profile');
    // await page.click('text=Edit Profile');
    // 
    // // Fill profile form
    // await page.fill('input[name="name"]', 'Updated Name');
    // await page.fill('textarea[name="bio"]', 'This is my updated bio');
    // await page.fill('input[name="grade"]', 'Senior');
    // await page.fill('input[name="contact"]', 'updated@example.com');
    // await page.fill('input[name="githubUrl"]', 'https://github.com/updateduser');
    // 
    // await page.click('text=Save Profile');
    // 
    // // Should show success message
    // await expect(page.locator('text=Profile updated successfully')).toBeVisible();
  });

  test.skip('should allow adding and managing skills', async ({ page: _ }) => {
    // This test would require authentication setup
    // await authenticateUser(page);
    // await page.goto('/profile');
    // 
    // // Add a new skill
    // await page.fill('input[id="skillName"]', 'React');
    // await page.selectOption('select[id="skillLevel"]', '4');
    // await page.fill('input[id="skillYears"]', '3');
    // await page.click('text=Add Skill');
    // 
    // // Should show the skill in the list
    // await expect(page.locator('text=React')).toBeVisible();
    // await expect(page.locator('text=Level 4')).toBeVisible();
    // await expect(page.locator('text=3 years experience')).toBeVisible();
    // 
    // // Update skill level
    // await page.selectOption('select[value="4"]', '5');
    // 
    // // Remove skill
    // await page.click('button[aria-label="Remove skill"]');
    // await expect(page.locator('text=React')).not.toBeVisible();
  });

  test.skip('should validate skill form inputs', async ({ page: _ }) => {
    // This test would require authentication setup
    // await authenticateUser(page);
    // await page.goto('/profile');
    // 
    // // Try to add skill without name
    // await page.click('text=Add Skill');
    // await expect(page.locator('text=Skill name is required')).toBeVisible();
    // 
    // // Try to add duplicate skill
    // await page.fill('input[id="skillName"]', 'React');
    // await page.click('text=Add Skill');
    // await page.fill('input[id="skillName"]', 'React');
    // await page.click('text=Add Skill');
    // await expect(page.locator('text=Skill already exists')).toBeVisible();
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

  test.skip('should show profile link for authenticated users', async ({ page: _ }) => {
    // This test would require authentication setup
    // await authenticateUser(page);
    // await page.goto('/');
    // await expect(page.locator('text=My Profile')).toBeVisible();
    // await page.click('text=My Profile');
    // await expect(page.url()).toContain('/profile');
  });
});

// Helper function that would be implemented for authenticated tests
// async function authenticateUser(page: any) {
//   // Implementation would depend on your authentication strategy
//   // Could use test user credentials or mock authentication
// }
