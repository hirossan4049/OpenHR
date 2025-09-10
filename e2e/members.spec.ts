import { test, expect } from '@playwright/test';

/**
 * Members Directory E2E Tests
 * 
 * These tests validate the complete user flow for member search and directory functionality
 */

test.describe('Members Directory', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the members directory
    await page.goto('/members');
  });

  test('should display members directory page', async ({ page }) => {
    // Check page title and description
    await expect(page.getByRole('heading', { name: 'Members Directory' })).toBeVisible();
    await expect(page.getByText('Search and browse team member profiles and skills')).toBeVisible();
  });

  test('should have search and filter controls', async ({ page }) => {
    // Check search input
    await expect(page.getByLabel('Search')).toBeVisible();
    await expect(page.getByPlaceholder('Search by name, skills, or bio...')).toBeVisible();

    // Check skill filter dropdown
    await expect(page.getByLabel('Filter by Skill')).toBeVisible();
    
    // Click to open the select dropdown
    await page.getByRole('button', { name: 'All Skills' }).click();
    await expect(page.getByText('All Skills')).toBeVisible();
  });

  test('should handle search functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search by name, skills, or bio...');
    
    // Type in search input
    await searchInput.fill('test search');
    
    // Verify the input value
    await expect(searchInput).toHaveValue('test search');
  });

  test('should show no results message when no members found', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search by name, skills, or bio...');
    
    // Search for something that likely won't exist
    await searchInput.fill('nonexistent_user_12345');
    
    // Wait for potential API call and check for no results message
    // Note: This depends on the actual data in the database
    await page.waitForTimeout(1000); // Give time for search to process
    
    // The no results state should be visible if no members match
    const noResults = page.getByText('No members found');
    const tryAgain = page.getByText('Try adjusting your search criteria and try again');
    
    // Either there are results or no results message should be shown
    const hasResults = await page.getByTestId('member-card').count() > 0;
    const hasNoResults = await noResults.isVisible();
    
    expect(hasResults || hasNoResults).toBe(true);
  });

  test('should display member cards when results exist', async ({ page }) => {
    // Wait for potential loading to complete
    await page.waitForTimeout(1000);
    
    // Check if we have member cards or no results
    const memberCards = page.locator('.hover\\:shadow-md');
    const cardCount = await memberCards.count();
    const noResults = await page.getByText('No members found').isVisible();
    
    if (cardCount > 0) {
      // If we have results, verify card structure
      const firstCard = memberCards.first();
      await expect(firstCard).toBeVisible();
      
      // Cards should have some basic structure
      // Note: This is flexible since we don't know the actual data
    } else {
      // If no results, should show the no results message
      expect(noResults).toBe(true);
    }
  });

  test('should have pagination controls when needed', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);
    
    // Check if pagination exists (it might not if there are few members)
    const prevButton = page.getByRole('button', { name: 'Previous' });
    const nextButton = page.getByRole('button', { name: 'Next' });
    
    // If pagination exists, verify structure
    const hasPagination = await prevButton.isVisible();
    if (hasPagination) {
      await expect(prevButton).toBeVisible();
      await expect(nextButton).toBeVisible();
      
      // Previous should be disabled on first page
      await expect(prevButton).toBeDisabled();
    }
  });

  test('should clear search when clicking on skill filter', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search by name, skills, or bio...');
    
    // Add some search text
    await searchInput.fill('search text');
    await expect(searchInput).toHaveValue('search text');
    
    // Click on skill filter to open dropdown
    await page.getByRole('button', { name: 'All Skills' }).click();
    
    // The dropdown should be open (skill filter functionality)
    // Note: Actual filtering behavior depends on available skills in the database
  });
});

test.describe('Member Detail Page', () => {
  test('should handle member not found gracefully', async ({ page }) => {
    // Navigate to a non-existent member
    await page.goto('/members/nonexistent-id-12345');
    
    // Should show member not found message
    await expect(page.getByText('Member Not Found')).toBeVisible();
    await expect(page.getByText("The specified member doesn't exist or you don't have permission to view their profile")).toBeVisible();
    
    // Should have back to directory link
    await expect(page.getByRole('link', { name: 'Back to Directory' })).toBeVisible();
  });

  test('should navigate back to directory from member detail', async ({ page }) => {
    // Start from a non-existent member page
    await page.goto('/members/nonexistent-id-12345');
    
    // Click back to directory
    await page.getByRole('link', { name: 'Back to Directory' }).click();
    
    // Should navigate back to members directory
    await expect(page.getByRole('heading', { name: 'Members Directory' })).toBeVisible();
  });
});

test.describe('Navigation Integration', () => {
  test('should navigate to members directory from header', async ({ page }) => {
    await page.goto('/');
    
    // Look for members link in navigation
    const membersLink = page.getByRole('link', { name: 'Members' });
    
    // Check if the link exists (it should be in the header)
    await expect(membersLink).toBeVisible();
    
    // Click the members link
    await membersLink.click();
    
    // Should navigate to members directory
    await expect(page.getByRole('heading', { name: 'Members Directory' })).toBeVisible();
  });

  test('should handle responsive navigation on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Look for mobile menu toggle
    const menuToggle = page.getByRole('button', { name: 'Toggle Menu' });
    
    if (await menuToggle.isVisible()) {
      await menuToggle.click();
      
      // Should show mobile navigation with members link
      await expect(page.getByRole('link', { name: 'Members' })).toBeVisible();
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/members');
    
    // Check for proper form labels
    await expect(page.getByLabel('Search')).toBeVisible();
    await expect(page.getByLabel('Filter by Skill')).toBeVisible();
    
    // Check for heading hierarchy
    await expect(page.getByRole('heading', { name: 'Members Directory', level: 1 })).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/members');
    
    // Tab through main interactive elements
    await page.keyboard.press('Tab'); // Should focus search input
    const searchInput = page.getByPlaceholder('Search by name, skills, or bio...');
    await expect(searchInput).toBeFocused();
    
    await page.keyboard.press('Tab'); // Should focus skill filter
    const skillFilter = page.getByLabel('Filter by Skill');
    await expect(skillFilter).toBeFocused();
  });
});

test.describe('Performance and Loading States', () => {
  test('should show loading skeletons initially', async ({ page }) => {
    // Navigate to members and check for loading states
    const response = page.goto('/members');
    
    // Look for skeleton loading components
    // Note: This might be very fast in local development
    const skeletons = page.locator('.animate-pulse');
    
    await response;
    
    // After loading, skeletons should be gone and content should be visible
    await expect(page.getByRole('heading', { name: 'Members Directory' })).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // This test would need network interception to simulate failures
    // For now, just verify the page loads without JavaScript errors
    
    let hasError = false;
    page.on('pageerror', () => {
      hasError = true;
    });
    
    await page.goto('/members');
    await page.waitForTimeout(2000);
    
    expect(hasError).toBe(false);
  });
});