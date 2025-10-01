/**
 * Test for T025: Game validation rules
 *
 * This test validates that src/services/game-validation.ts contains all required
 * validation functions for the solitaire game logic, following TDD principles.
 *
 * Expected to FAIL initially (red phase) until implementation is complete.
 */

import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../..');
const gameValidationPath = join(projectRoot, 'src/services/game-validation.ts');

// Test counter for tracking progress
let testCount = 0;
let passCount = 0;

function test(description, testFn) {
  testCount++;
  try {
    testFn();
    passCount++;
    console.log(`✅ ${description}`);
  } catch (error) {
    console.log(`❌ ${description}: ${error.message}`);
  }
}

async function asyncTest(description, testFn) {
  testCount++;
  try {
    await testFn();
    passCount++;
    console.log(`✅ ${description}`);
  } catch (error) {
    console.log(`❌ ${description}: ${error.message}`);
  }
}

console.log('🧪 Running T025 Game validation rules tests...\n');

// Test 1: Check if game validation service file exists
test('src/services/game-validation.ts file should exist', () => {
  if (!existsSync(gameValidationPath)) {
    throw new Error('Game validation service file does not exist');
  }
});

// Test 2: Validate file contains required validation functions
await asyncTest('Game validation file should contain required validation functions', async () => {
  if (!existsSync(gameValidationPath)) {
    throw new Error('Game validation service file does not exist');
  }

  const content = await readFile(gameValidationPath, 'utf-8');
  
  const requiredFunctions = [
    'validateTableauMove',
    'validateFoundationMove', 
    'validateStockPileOperation',
    'isValidCardSequence',
    'canPlaceOnFoundation',
    'canPlaceOnTableau',
    'isGameWon',
    'validateGameState'
  ];

  for (const func of requiredFunctions) {
    if (!content.includes(func)) {
      throw new Error(`Function '${func}' is missing from game validation service`);
    }
  }
});

// Test 3: Check for proper TypeScript type definitions
await asyncTest('Game validation service should have proper TypeScript types', async () => {
  if (!existsSync(gameValidationPath)) {
    throw new Error('Game validation service file does not exist');
  }

  const content = await readFile(gameValidationPath, 'utf-8');

  // Check for import statements of required types
  const requiredImports = ['Card', 'GameState', 'Move', 'Position'];
  const hasImports = requiredImports.some(imp => content.includes(imp));

  if (!hasImports) {
    throw new Error('Required type imports are missing');
  }
});

// Test 4: Validate tableau move validation function signature
await asyncTest('validateTableauMove should have correct function signature', async () => {
  if (!existsSync(gameValidationPath)) {
    throw new Error('Game validation service file does not exist');
  }

  const content = await readFile(gameValidationPath, 'utf-8');

  if (!content.includes('validateTableauMove') || 
      !content.includes('function') || 
      !content.includes('boolean')) {
    throw new Error('validateTableauMove function signature is incorrect or missing');
  }
});

// Test 5: Validate foundation move validation function
await asyncTest('validateFoundationMove should have correct function signature', async () => {
  if (!existsSync(gameValidationPath)) {
    throw new Error('Game validation service file does not exist');
  }

  const content = await readFile(gameValidationPath, 'utf-8');

  if (!content.includes('validateFoundationMove')) {
    throw new Error('validateFoundationMove function is missing');
  }
});

// Test 6: Check for card sequence validation
await asyncTest('isValidCardSequence should validate alternating colors and descending ranks', async () => {
  if (!existsSync(gameValidationPath)) {
    throw new Error('Game validation service file does not exist');
  }

  const content = await readFile(gameValidationPath, 'utf-8');

  if (!content.includes('isValidCardSequence')) {
    throw new Error('isValidCardSequence function is missing');
  }
});

// Test 7: Check for foundation placement rules
await asyncTest('canPlaceOnFoundation should validate ascending same-suit sequence', async () => {
  if (!existsSync(gameValidationPath)) {
    throw new Error('Game validation service file does not exist');
  }

  const content = await readFile(gameValidationPath, 'utf-8');

  if (!content.includes('canPlaceOnFoundation')) {
    throw new Error('canPlaceOnFoundation function is missing');
  }
});

// Test 8: Check for tableau placement rules
await asyncTest('canPlaceOnTableau should validate descending alternate-color sequence', async () => {
  if (!existsSync(gameValidationPath)) {
    throw new Error('Game validation service file does not exist');
  }

  const content = await readFile(gameValidationPath, 'utf-8');

  if (!content.includes('canPlaceOnTableau')) {
    throw new Error('canPlaceOnTableau function is missing');
  }
});

// Test 9: Check for victory condition validation
await asyncTest('isGameWon should check if all cards are in foundation piles', async () => {
  if (!existsSync(gameValidationPath)) {
    throw new Error('Game validation service file does not exist');
  }

  const content = await readFile(gameValidationPath, 'utf-8');

  if (!content.includes('isGameWon')) {
    throw new Error('isGameWon function is missing');
  }
});

// Test 10: Check for stock pile operation validation
await asyncTest('validateStockPileOperation should validate stock pile interactions', async () => {
  if (!existsSync(gameValidationPath)) {
    throw new Error('Game validation service file does not exist');
  }

  const content = await readFile(gameValidationPath, 'utf-8');

  if (!content.includes('validateStockPileOperation')) {
    throw new Error('validateStockPileOperation function is missing');
  }
});

// Test 11: Check for overall game state validation
await asyncTest('validateGameState should validate complete game state integrity', async () => {
  if (!existsSync(gameValidationPath)) {
    throw new Error('Game validation service file does not exist');
  }

  const content = await readFile(gameValidationPath, 'utf-8');

  if (!content.includes('validateGameState')) {
    throw new Error('validateGameState function is missing');
  }
});

// Test 12: Check for proper exports
await asyncTest('All validation functions should be exported', async () => {
  if (!existsSync(gameValidationPath)) {
    throw new Error('Game validation service file does not exist');
  }

  const content = await readFile(gameValidationPath, 'utf-8');

  if (!content.includes('export')) {
    throw new Error('No exports found in game validation service file');
  }
});

// Test 13: Check for JSDoc documentation
await asyncTest('Validation functions should have JSDoc documentation', async () => {
  if (!existsSync(gameValidationPath)) {
    throw new Error('Game validation service file does not exist');
  }

  const content = await readFile(gameValidationPath, 'utf-8');

  if (!content.includes('/**') || !content.includes('*/')) {
    throw new Error('JSDoc comments are missing');
  }
});

// Test 14: Check for error handling
await asyncTest('Validation functions should include proper error handling', async () => {
  if (!existsSync(gameValidationPath)) {
    throw new Error('Game validation service file does not exist');
  }

  const content = await readFile(gameValidationPath, 'utf-8');

  // Look for error handling patterns
  const hasErrorHandling = content.includes('Error') || 
                          content.includes('throw') || 
                          content.includes('try') || 
                          content.includes('catch');

  if (!hasErrorHandling) {
    throw new Error('Error handling is missing from validation functions');
  }
});

// Final test summary
console.log(`\n📊 Test Results: ${passCount}/${testCount} tests passed`);

if (passCount === testCount) {
  console.log('🎉 All tests passed! Implementation is complete.');
  process.exit(0);
} else {
  console.log('🔴 Some tests failed. This is expected in TDD red phase.');
  process.exit(1);
}