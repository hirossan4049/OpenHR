import { expect, test, request } from '@playwright/test';

test.describe('Project Members Management (auth)', () => {
  test('organizer can add, set role (free-text), and remove a member', async ({ page, baseURL }) => {
    // Ensure a second user exists to add as member (idempotent API)
    const email = `member.e2e@example.com`;
    const req = await request.newContext({ baseURL: baseURL ?? 'http://localhost:3000' });
    await req.post('/api/auth/register', {
      data: { name: 'Member E2E', email, password: 'password123', confirmPassword: 'password123' },
    }).catch(() => {});

    // Create a new project as the authenticated organizer
    await page.goto('/projects/new', { waitUntil: 'networkidle' });

    await page.getByLabel('Title').fill('E2E Members Project');
    await page.getByLabel('Description').fill('Project for E2E members management test');

    // Type = Project (default); just submit
    await page.locator('button[type="submit"]').click();

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/projects\//);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('E2E Members Project');

    // Add member: search by name and click Add
    const searchInput = page.getByPlaceholder(/Search users|ユーザーを検索/);
    await searchInput.fill('Member E2E');

    // Wait for candidates to appear and click Add
    const addButton = page.getByRole('button', { name: /Add|追加/ }).first();
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Verify member appears in the list
    const memberRow = page.locator('div').filter({ hasText: 'Member E2E' }).first();
    await expect(memberRow).toBeVisible({ timeout: 10000 });

    // Update role to a free-text value
    const roleInput = memberRow.getByPlaceholder(/Role \(e\.g\., Frontend\)|担当/);
    await roleInput.fill('Frontend');
    await memberRow.getByRole('button', { name: /Save|保存/ }).click();

    // Verify the role input reflects the updated value
    await expect(roleInput).toHaveValue('Frontend');

    // Remove the member
    await memberRow.getByRole('button', { name: /Remove|削除/ }).click();

    // Verify the member row disappears
    await expect(page.locator('div').filter({ hasText: 'Member E2E' })).toHaveCount(0, { timeout: 10000 });
  });
});

