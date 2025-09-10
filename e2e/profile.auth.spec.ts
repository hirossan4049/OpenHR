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
    await expect(page.getByText('Profile updated successfully!')).toBeVisible({ timeout: 10000 });
  });

  test('should allow adding and managing skills', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' });

    const skillName = `React E2E ${Date.now()}`;

    // Wait for skills section to load
    await expect(page.getByRole('heading', { name: 'Skills' })).toBeVisible({ timeout: 10000 });

    // Add skill
    await page.getByLabel('Skill Name').fill(skillName);
    await page.getByLabel('Level').selectOption('4');
    await page.getByLabel('Years').fill('3');
    await page.getByRole('button', { name: 'Add Skill' }).click();

    await expect(page.getByText(skillName)).toBeVisible();
    
    // Find the skill row and check its content
    const skillRow = page.locator('div', { hasText: skillName }).first();
    await expect(skillRow.getByText('Level 4 (Advanced)')).toBeVisible();
    await expect(skillRow.getByText('3 years experience')).toBeVisible();

    // Update level to 5
    await skillRow.locator('select').selectOption('5');
    await expect(skillRow.getByText('Level 5 (Expert)')).toBeVisible();

    // Remove skill
    await skillRow.getByRole('button', { name: 'Remove skill' }).click();
    await expect(page.getByText(skillName)).not.toBeVisible();
  });
});

