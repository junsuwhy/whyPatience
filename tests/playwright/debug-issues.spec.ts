/**
 * Playwright test script for debugging solitaire game issues
 * Tests for:
 * - Card flipping animation (should not be continuous)
 * - Drag and drop functionality
 * - Console errors
 * - General game flow issues
 */

import { test, expect } from '@playwright/test';

test.describe('Solitaire Game Debugging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('should not have continuous card flipping animations', async ({ page }) => {
    // Wait for the game to load
    await page.waitForSelector('[data-testid*="card-"]', { timeout: 10000 });
    
    // Check if any cards are continuously animating
    const animatingCards = await page.locator('[data-animation="flip"]').count();
    console.log(`Found ${animatingCards} cards with flip animations`);
    
    // Wait a bit and check again - should not be continuously flipping
    await page.waitForTimeout(2000);
    const animatingCardsAfter = await page.locator('[data-animation="flip"]').count();
    console.log(`Found ${animatingCardsAfter} cards with flip animations after wait`);
    
    // If cards are still animating after 2 seconds, there might be an issue
    expect(animatingCardsAfter).toBeLessThanOrEqual(1); // Allow for one card to be animating
  });

  test('should not have console errors on page load', async ({ page }) => {
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    // Reload to capture all console messages from start
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    console.log('Console Errors Found:', consoleErrors.length);
    console.log('Console Warnings Found:', consoleWarnings.length);
    
    if (consoleErrors.length > 0) {
      console.log('Error Details:', consoleErrors.slice(0, 5)); // Show first 5 errors
    }
    
    if (consoleWarnings.length > 0) {
      console.log('Warning Details:', consoleWarnings.slice(0, 5)); // Show first 5 warnings
    }
    
    // Allow some expected warnings but no errors
    expect(consoleErrors.length).toBe(0);
  });

  test('should allow drag and drop operations', async ({ page }) => {
    // Wait for cards to be loaded
    await page.waitForSelector('[data-testid*="card-"]', { timeout: 10000 });
    
    // Try to find a draggable card in tableau
    const tableauCards = await page.locator('[data-testid*="tableau"] [data-testid*="card-"]').all();
    
    if (tableauCards.length > 0) {
      const firstCard = tableauCards[0];
      const boundingBox = await firstCard.boundingBox();
      
      if (boundingBox) {
        // Try to start a drag operation
        await page.mouse.move(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
        await page.mouse.down();
        
        // Move mouse to simulate drag
        await page.mouse.move(boundingBox.x + 100, boundingBox.y + 100);
        
        // Check if the card shows dragging state
        const isDragging = await firstCard.getAttribute('data-dragging');
        expect(isDragging).toBeTruthy();
        
        // Complete the drag
        await page.mouse.up();
        
        console.log('Drag operation test completed successfully');
      }
    } else {
      console.log('No tableau cards found for drag test');
    }
  });

  test('should handle stock pile clicks without errors', async ({ page }) => {
    const stockPile = page.locator('[data-testid="stock-pile"]');
    await expect(stockPile).toBeVisible();
    
    // Try clicking the stock pile
    try {
      await stockPile.click();
      console.log('Stock pile click successful');
    } catch (error) {
      console.log('Stock pile click failed:', error);
      throw error;
    }
  });

  test('should not have infinite render loops', async ({ page }) => {
    const renderErrors: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Maximum update depth exceeded') || 
          text.includes('Cannot update a component') ||
          text.includes('Warning: Cannot update during an existing state transition')) {
        renderErrors.push(text);
      }
    });

    await page.waitForTimeout(5000); // Wait to catch any render loop errors
    
    console.log('Render Loop Errors:', renderErrors.length);
    expect(renderErrors.length).toBe(0);
  });

  test('should have proper game controls functionality', async ({ page }) => {
    // Check if game controls are present
    const newGameButton = page.locator('button:has-text("New Game"), button[aria-label*="New"], button[title*="New"]');
    const undoButton = page.locator('button:has-text("Undo"), button[aria-label*="Undo"], button[title*="Undo"]');
    
    await expect(newGameButton).toBeVisible();
    await expect(undoButton).toBeVisible();
    
    // Try clicking new game
    await newGameButton.click();
    
    // Verify the game restarted (check for fresh tableau)
    const tableauColumns = await page.locator('[data-testid*="tableau"]').count();
    expect(tableauColumns).toBe(7); // Should have 7 tableau columns
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Focus the game board
    await page.locator('[role="main"]').focus();
    
    // Try arrow key navigation
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowUp');
    
    // Check if focus moves properly (no errors should occur)
    console.log('Keyboard navigation test completed');
  });

  test('should display game statistics', async ({ page }) => {
    // Look for statistics display
    const statistics = page.getByText('Statistics');
    const gameTime = page.getByText('Time', { exact: false });
    const moveCount = page.getByText('Moves', { exact: false });
    
    // At least one of these should be visible
    const isStatsVisible = await statistics.isVisible() || 
                          await gameTime.isVisible() || 
                          await moveCount.isVisible();
    
    expect(isStatsVisible).toBeTruthy();
  });

  test('should handle game completion properly', async ({ page }) => {
    // This test checks if the game can theoretically handle win conditions
    // We'll simulate by checking if victory overlay exists in DOM
    const victoryOverlay = page.locator('[data-testid="victory-overlay"], .victory-overlay');
    
    // Should exist but not be visible initially
    if (await victoryOverlay.count() > 0) {
      expect(await victoryOverlay.isVisible()).toBeFalsy();
    }
    
    console.log('Victory overlay test completed');
  });
});