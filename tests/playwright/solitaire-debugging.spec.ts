/**
 * Playwright test script for debugging Solitaire game issues
 * This script tests the specific problems identified during debugging
 */

import { test, expect, Page } from '@playwright/test';

const GAME_URL = 'http://localhost:3000';

test.describe('Solitaire Game Debugging Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto(GAME_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should load the game without critical errors', async () => {
    // Check that the page loads
    await expect(page).toHaveTitle('Desktop Solitaire');
    
    // Check for basic game elements
    await expect(page.getByRole('heading', { name: /Desktop Solitaire/ })).toBeVisible();
    await expect(page.getByText('Foundation piles')).toBeVisible();
    await expect(page.getByText('Tableau columns')).toBeVisible();
  });

  test('should identify console errors and warnings', async () => {
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];

    // Listen for console messages
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      } else if (message.type() === 'warning') {
        consoleWarnings.push(message.text());
      }
    });

    // Wait for the page to fully load and render
    await page.waitForTimeout(2000);

    // Log the issues found
    console.log('Console Errors Found:', consoleErrors.length);
    console.log('Console Warnings Found:', consoleWarnings.length);
    
    if (consoleErrors.length > 0) {
      console.log('Error Details:', consoleErrors.slice(0, 5)); // Show first 5 errors
    }
    
    if (consoleWarnings.length > 0) {
      console.log('Warning Details:', consoleWarnings.slice(0, 5)); // Show first 5 warnings
    }

    // Store results for reporting
    test.info().annotations.push({
      type: 'console-errors',
      description: `Found ${consoleErrors.length} errors and ${consoleWarnings.length} warnings`,
    });
  });

  test('should test stock pile functionality and detect storage errors', async () => {
    const storageErrors: string[] = [];
    const renderErrors: string[] = [];

    // Monitor for specific error types
    page.on('console', (message) => {
      const text = message.text();
      if (text.includes('Failed to save game state') || text.includes('StorageServiceError')) {
        storageErrors.push(text);
      }
      if (text.includes('Maximum update depth exceeded')) {
        renderErrors.push(text);
      }
    });

    // Try to click the stock pile
    const stockPile = page.getByTestId('stock-pile-stock');
    await expect(stockPile).toBeVisible();

    try {
      await stockPile.click();
      await page.waitForTimeout(1000); // Wait for any errors to appear
    } catch (error) {
      console.log('Stock pile click failed:', error);
    }

    // Report the issues
    console.log('Storage Errors:', storageErrors.length);
    console.log('Render Loop Errors:', renderErrors.length);
    
    test.info().annotations.push({
      type: 'game-functionality',
      description: `Storage errors: ${storageErrors.length}, Render errors: ${renderErrors.length}`,
    });
  });

  test('should test card drag and drop functionality', async () => {
    const dragErrors: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error' && message.text().includes('drag')) {
        dragErrors.push(message.text());
      }
    });

    // Try to find a draggable card
    const cards = await page.getByRole('button', { name: /card/ }).all();
    
    if (cards.length > 0) {
      try {
        // Try to drag the first visible card
        const card = cards[0];
        const cardBox = await card.boundingBox();
        
        if (cardBox) {
          // Attempt drag operation
          await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
          await page.mouse.down();
          await page.mouse.move(cardBox.x + 100, cardBox.y + 100);
          await page.mouse.up();
        }
      } catch (error) {
        console.log('Drag operation failed:', error);
      }
    }

    console.log('Drag-related errors:', dragErrors.length);
    
    test.info().annotations.push({
      type: 'drag-drop',
      description: `Drag errors found: ${dragErrors.length}`,
    });
  });

  test('should check for styled-components prop warnings', async () => {
    const styledWarnings: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'warning' && message.text().includes('styled-components')) {
        styledWarnings.push(message.text());
      }
    });

    // Wait for components to render
    await page.waitForTimeout(2000);

    console.log('Styled-components warnings:', styledWarnings.length);
    
    if (styledWarnings.length > 0) {
      // Extract unique prop names from warnings
      const propNames = styledWarnings
        .map(warning => {
          const match = warning.match(/unknown prop "([^"]+)"/);
          return match ? match[1] : null;
        })
        .filter(Boolean);
      
      console.log('Problematic props:', [...new Set(propNames)]);
    }
    
    test.info().annotations.push({
      type: 'styled-components',
      description: `Found ${styledWarnings.length} styled-components warnings`,
    });
  });

  test('should capture game state and generate debugging report', async () => {
    // Take a screenshot for visual reference
    await page.screenshot({ 
      path: 'tests/playwright/screenshots/game-state-debug.png',
      fullPage: true 
    });

    // Get basic game state information
    const foundationPiles = await page.getByText('Foundation pile').count();
    const tableauColumns = await page.getByText('Tableau column').count();
    const gameControls = await page.getByRole('toolbar', { name: 'Game controls' }).isVisible();
    const statistics = await page.getByText('Statistics').isVisible();

    // Verify basic structure
    expect(foundationPiles).toBe(4);
    expect(tableauColumns).toBe(7);
    expect(gameControls).toBe(true);
    expect(statistics).toBe(true);

    // Generate summary for debugging
    test.info().annotations.push({
      type: 'game-structure',
      description: `Foundations: ${foundationPiles}, Tableau: ${tableauColumns}, Controls: ${gameControls}, Stats: ${statistics}`,
    });
  });

  test('should test New Game button functionality', async () => {
    const newGameErrors: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') {
        newGameErrors.push(message.text());
      }
    });

    // Click New Game button
    const newGameButton = page.getByRole('button', { name: /New Game/ });
    await expect(newGameButton).toBeVisible();
    
    try {
      await newGameButton.click();
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('New Game button click failed:', error);
    }

    console.log('New Game errors:', newGameErrors.length);
    
    test.info().annotations.push({
      type: 'new-game',
      description: `New game errors: ${newGameErrors.length}`,
    });
  });
});

/**
 * Additional utility test for manual debugging
 */
test.describe('Manual Debugging Utilities', () => {
  test('interactive debugging session', async ({ page }) => {
    await page.goto(GAME_URL);
    
    // Set up comprehensive error monitoring
    const allErrors: { type: string; message: string; timestamp: number }[] = [];
    
    page.on('console', (message) => {
      allErrors.push({
        type: message.type(),
        message: message.text(),
        timestamp: Date.now()
      });
    });

    page.on('pageerror', (error) => {
      allErrors.push({
        type: 'pageerror',
        message: error.message,
        timestamp: Date.now()
      });
    });

    // Wait for initial load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Perform common user interactions
    try {
      await page.getByTestId('stock-pile-stock').click();
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('Stock pile interaction failed');
    }

    try {
      await page.getByRole('button', { name: /New Game/ }).click();
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('New game interaction failed');
    }

    // Save complete error log
    const errorSummary = {
      totalErrors: allErrors.length,
      errorTypes: [...new Set(allErrors.map(e => e.type))],
      commonErrors: allErrors.reduce((acc, error) => {
        acc[error.message] = (acc[error.message] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    console.log('=== DEBUGGING SUMMARY ===');
    console.log('Total errors:', errorSummary.totalErrors);
    console.log('Error types:', errorSummary.errorTypes);
    console.log('Most common errors:', Object.entries(errorSummary.commonErrors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([msg, count]) => `${count}x: ${msg.substring(0, 100)}...`)
    );

    // Take final screenshot
    await page.screenshot({ 
      path: 'tests/playwright/screenshots/final-debug-state.png',
      fullPage: true 
    });
  });
});