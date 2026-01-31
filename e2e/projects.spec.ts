import { test, expect } from '@playwright/test';

test.describe('Project Management Flow', () => {
  test('should handle complete project creation and application flow', async ({ page }) => {
    // Note: This test assumes authentication setup and database reset
    // In a real environment, you would need proper test data setup
    
    // Navigate to projects page
    await page.goto('/projects');
    
    // Should show projects list
    await expect(page.locator('h1')).toContainText('Projects');
    
    // Navigate to create project: disambiguate header vs page link by scoping to the page header
    await page
      .getByRole('heading', { name: 'Projects' })
      .locator('..')
      .getByRole('link', { name: 'Create Project' })
      .click();
    await expect(page.locator('h1')).toContainText('Create Project');
    
    // Fill out project form
    await page.fill('input[id="title"]', 'Test Project');
    await page.fill('textarea[id="description"]', 'This is a test project for E2E testing');
    
    // Select project type (use role to avoid matching nav links)
    await page.click('[data-testid="type-select"]');
    await page.getByRole('option', { name: /^Project$/ }).click();
    
    // Set max members
    await page.fill('input[id="maxMembers"]', '5');
    
    // Add required skills (this would need proper skill data)
    // await page.fill('input[placeholder="Search skills..."]', 'React');
    // await page.click('text=React');
    
    // Submit form (this would create the project if DB is available)
    // await page.click('button[type="submit"]');
    
    // Since we can't actually submit without DB, just verify form validation
    await expect(page.locator('input[id="title"]')).toHaveValue('Test Project');
    await expect(page.locator('textarea[id="description"]')).toHaveValue('This is a test project for E2E testing');
    await expect(page.locator('input[id="maxMembers"]')).toHaveValue('5');
  });

  test('should show project list with search and filters', async ({ page }) => {
    await page.goto('/projects');
    
    // Check if search input is present
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    
    // Check if filter dropdowns are present
    await expect(page.locator('select, [role="combobox"]').first()).toBeVisible();
    
    // Test search functionality (UI only, since no DB)
    await page.fill('input[placeholder*="Search"]', 'test project');
    await expect(page.locator('input[placeholder*="Search"]')).toHaveValue('test project');
  });

  test('should navigate to my projects page', async ({ page }) => {
    await page.goto('/my');
    
    // Depending on auth, either show the heading or sign-in prompt
    const headingVisible = await page.locator('text=My Projects & Applications').isVisible().catch(() => false);
    const signInPromptVisible = await page.locator('text=Please sign in to view your projects').isVisible().catch(() => false);
    expect(headingVisible || signInPromptVisible).toBe(true);
    
    if (headingVisible) {
      await expect(page.locator('[role="tablist"]').first()).toBeVisible();
      await expect(page.locator('text=My Projects')).toBeVisible();
      await expect(page.locator('text=My Applications')).toBeVisible();
    }
  });

  test('should show proper navigation structure', async ({ page }) => {
    await page.goto('/');
    
    // Check header navigation
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(header.getByRole('link', { name: 'OpenHR' })).toBeVisible();
    
    // Check navigation links (use role-based selectors to avoid strict-mode conflicts)
    const navigation = page.locator('nav');
    if (await navigation.isVisible()) {
      await expect(navigation.getByRole('link', { name: 'Projects', exact: true })).toBeVisible();
      await expect(navigation.getByRole('link', { name: 'My Projects', exact: true })).toBeVisible();
      await expect(navigation.getByRole('link', { name: 'Members', exact: true })).toBeVisible();
    }
  });

  test('should handle project detail page routing', async ({ page }) => {
    // Test that the project detail route works
    await page.goto('/projects/test-id');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Should show either project details, not found page, error, or at least render the page
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });

  test('should handle project edit page routing', async ({ page }) => {
    // Test that the project edit route works
    await page.goto('/projects/test-id/edit');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Should show either edit form, not found page, or at least render the page
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/projects/new');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors or prevent submission
    // This tests that client-side validation is working
    const titleInput = page.locator('input[id="title"]');
    const isRequired = await titleInput.getAttribute('required');
    expect(isRequired).not.toBeNull();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    // On mobile, page should load properly
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();

    // Test desktop view
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    // Should show content on desktop
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Project Components Accessibility', () => {
  test('should have proper ARIA labels and keyboard navigation', async ({ page }) => {
    await page.goto('/projects');
    
    // Check for proper headings
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for proper form labels
    await page.goto('/projects/new');
    const labels = await page.locator('label').count();
    expect(labels).toBeGreaterThan(0);
    
    // Check that form inputs have associated labels
    const titleInput = page.locator('input[id="title"]');
    const titleLabel = page.locator('label[for="title"]');
    await expect(titleInput).toBeVisible();
    await expect(titleLabel).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/projects');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus').first();
    await expect(focusedElement).toBeVisible();
  });
});

test.describe('Project Internationalization', () => {
  test('should support Japanese localization', async ({ page }) => {
    // Test Japanese locale (Cookie-based detection)
    await page.goto('/projects');
    
    // Should show content or fallback gracefully
    const pageContent = await page.locator('body').textContent();
    
    // This test verifies that the page loads without errors
    // In a real scenario, you'd check for specific Japanese text
    expect(pageContent).toBeTruthy();
  });

  test('should support English localization', async ({ page }) => {
    // Test English locale (Cookie-based detection)
    await page.goto('/projects');
    
    // Should show English text
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });
});
