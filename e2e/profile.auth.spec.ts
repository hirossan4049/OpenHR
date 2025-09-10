import { test, expect } from '@playwright/test';

test.describe('Profile (authenticated)', () => {
  test('should show profile link on home', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.getByRole('link', { name: 'My Profile' })).toBeVisible({ timeout: 10000 });
  });

  test('should show profile page for authenticated users', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' });
    await expect(page.getByRole('button', { name: 'Edit Profile' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Skills' })).toBeVisible();
  });

  test('should allow editing profile information', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Edit Profile' }).click({ timeout: 10000 });

    await expect(page.getByRole('heading', { name: 'Edit Profile' })).toBeVisible();

    await page.getByLabel('Name').fill('E2E User Updated');
    await page.getByLabel('Bio').fill('This is my updated bio via E2E.');
    await page.getByLabel('Grade/Year').fill('Senior');
    await page.getByLabel('Contact Information').fill('e2e@example.com');
    await page.getByLabel('GitHub Profile URL').fill('https://github.com/e2e-user');

    await page.getByRole('button', { name: 'Save Profile' }).click();
    
    // After save, should return to profile view and show updated data
    await expect(page.getByText('E2E User Updated')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('This is my updated bio via E2E.')).toBeVisible();
    await expect(page.getByText('Senior')).toBeVisible();
    await expect(page.getByText('e2e@example.com')).toBeVisible();
    await expect(page.getByText('https://github.com/e2e-user')).toBeVisible();
  });

  test('should allow adding and managing skills', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' });

    // Generate a unique skill name to avoid conflicts with existing data
    const uniqueId = Date.now().toString(36);
    const skillName = `TestSkill_${uniqueId}`;

    // Wait for skills section to load
    await expect(page.getByRole('heading', { name: 'Skills' })).toBeVisible({ timeout: 10000 });

    // Add skill
    await page.getByLabel('Skill Name').fill(skillName);
    await page.getByLabel('Level').selectOption('4');
    await page.getByLabel('Years').fill('3');
    await page.getByRole('button', { name: 'Add Skill' }).click();

    // Wait for skill to be added and visible
    await expect(page.getByText(skillName)).toBeVisible({ timeout: 5000 });
    
    // Find the specific skill row by its exact structure
    const skillRow = page.locator('.flex.items-center.justify-between.rounded-md.border.border-gray-200.p-3')
                         .filter({ hasText: skillName });
    
    // Verify initial skill data
    await expect(skillRow).toBeVisible();
    await expect(skillRow).toContainText('Level 4 (Advanced)');
    await expect(skillRow).toContainText('3 years experience');

    // Update level to 5 - find the select within this specific skill row
    await skillRow.locator('select').selectOption('5');
    
    // Wait for level update and verify
    await expect(skillRow).toContainText('Level 5 (Expert)', { timeout: 5000 });

    // Remove skill
    await skillRow.getByRole('button', { name: 'Remove skill' }).click();
    
    // Verify skill is removed
    await expect(page.getByText(skillName)).not.toBeVisible({ timeout: 5000 });
  });
});

