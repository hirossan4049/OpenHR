import { expect, test } from '@playwright/test';

test.describe('Profile (authenticated)', () => {
  test('should show profile link on home', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('profile-link')).toBeVisible({ timeout: 10000 });
  });

  test('should show profile page for authenticated users', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' });
    await expect(page.getByRole('button', { name: 'Edit Profile' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Skills', level: 3 })).toBeVisible();
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

    await expect(page.getByRole('heading', { name: 'E2E User Updated' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('This is my updated bio via E2E.')).toBeVisible();
    await expect(page.getByText('Senior')).toBeVisible();
    await expect(page.getByText('e2e@example.com')).toBeVisible();

    const githubLink = page.getByRole('link', { name: 'GitHub Profile' });
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/e2e-user');
  });

  test('should allow adding and managing skills', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' });

    const uniqueId = Date.now().toString(36);
    const skillName = `TestSkill_${uniqueId}`;

    await expect(page.getByRole('heading', { name: 'Skills', level: 3 })).toBeVisible({ timeout: 10000 });

    // Open Skill select and type to search/create
    await page.getByRole('combobox', { name: 'Skill' }).click();
    const searchInput = page.getByPlaceholder('Search skills...');
    await searchInput.fill(skillName);
    // Press Enter to select the first item (Create "<skillName>")
    await searchInput.press('Enter');

    // Set Level
    await page.getByRole('combobox', { name: 'Level' }).click();
    await page.getByRole('option', { name: 'Advanced' }).click();

    await page.getByPlaceholder('Years').fill('3');
    await expect(page.getByRole('button', { name: 'Add Skill' })).toBeEnabled();
    await page.getByRole('button', { name: 'Add Skill' }).click();

    const skillRow = page.locator('tr').filter({ hasText: skillName });
    await expect(skillRow).toBeVisible({ timeout: 5000 });

    await expect(skillRow.locator('[role=combobox]')).toHaveText('Advanced');
    await expect(skillRow.getByRole('spinbutton')).toHaveValue('3');

    await skillRow.locator('[role=combobox]').click();
    await page.getByRole('option', { name: 'Expert' }).click();

    await expect(skillRow.locator('[role=combobox]')).toHaveText('Expert', { timeout: 5000 });

    await skillRow.getByRole('button', { name: 'Remove skill' }).click();
    // 新しい確認ボタンをクリック
    await skillRow.getByRole('button', { name: 'Confirm' }).click();
    // Scope to table rows to avoid matching the combobox ghost text
    await expect(page.locator('tr').filter({ hasText: skillName })).toHaveCount(0, { timeout: 5000 });
  });
});
