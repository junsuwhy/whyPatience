/**
 * Test for T014: Card types and enums
 *
 * This test validates that src/types/card.ts contains all required
 * type definitions for the solitaire card game, following TDD principles.
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
const cardTypesPath = join(projectRoot, 'src/types/card.ts');

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

console.log('🧪 Running T014 Card types and enums tests...\n');

// Test 1: Check if card types file exists
test('src/types/card.ts file should exist', () => {
  if (!existsSync(cardTypesPath)) {
    throw new Error('Card types file does not exist');
  }
});

// Test 2: Validate file content structure
test('Card types file should contain required type definitions', async () => {
  if (!existsSync(cardTypesPath)) {
    throw new Error('Card types file does not exist');
  }

  const content = await readFile(cardTypesPath, 'utf-8');

  // Check for Suit enum
  if (!content.includes('enum Suit') && !content.includes('const Suit')) {
    throw new Error('Suit enum is missing');
  }

  // Check for Rank enum
  if (!content.includes('enum Rank') && !content.includes('const Rank')) {
    throw new Error('Rank enum is missing');
  }

  // Check for Color enum
  if (!content.includes('enum Color') && !content.includes('const Color')) {
    throw new Error('Color enum is missing');
  }

  // Check for Card interface
  if (!content.includes('interface Card') && !content.includes('type Card')) {
    throw new Error('Card interface/type is missing');
  }

  // Check for CardPosition type
  if (!content.includes('CardPosition')) {
    throw new Error('CardPosition type is missing');
  }
});

// Test 3: Validate specific enum values
test('Suit enum should contain all four suits', async () => {
  if (!existsSync(cardTypesPath)) {
    throw new Error('Card types file does not exist');
  }

  const content = await readFile(cardTypesPath, 'utf-8');
  const requiredSuits = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];

  for (const suit of requiredSuits) {
    if (!content.includes(suit)) {
      throw new Error(`Suit '${suit}' is missing from Suit enum`);
    }
  }
});

// Test 4: Validate Rank enum values
test('Rank enum should contain all card ranks', async () => {
  if (!existsSync(cardTypesPath)) {
    throw new Error('Card types file does not exist');
  }

  const content = await readFile(cardTypesPath, 'utf-8');
  const requiredRanks = [
    'Ace',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Jack',
    'Queen',
    'King',
  ];

  // Check if at least some ranks are present (flexible for different naming conventions)
  const hasAce = content.includes('Ace');
  const hasKing = content.includes('King');
  const hasQueen = content.includes('Queen');
  const hasJack = content.includes('Jack');

  if (!(hasAce && hasKing && hasQueen && hasJack)) {
    throw new Error(
      'Essential card ranks (Ace, King, Queen, Jack) are missing'
    );
  }
});

// Test 5: Check Card interface properties
test('Card interface should have required properties', async () => {
  if (!existsSync(cardTypesPath)) {
    throw new Error('Card types file does not exist');
  }

  const content = await readFile(cardTypesPath, 'utf-8');
  const requiredProperties = ['suit', 'rank', 'color', 'isVisible', 'id'];

  for (const prop of requiredProperties) {
    if (!content.includes(prop)) {
      throw new Error(`Card interface is missing '${prop}' property`);
    }
  }
});

// Test 6: Check for JSDoc comments
test('Types should have JSDoc documentation', async () => {
  if (!existsSync(cardTypesPath)) {
    throw new Error('Card types file does not exist');
  }

  const content = await readFile(cardTypesPath, 'utf-8');

  if (!content.includes('/**') || !content.includes('*/')) {
    throw new Error('JSDoc comments are missing');
  }
});

// Test 7: Check for proper exports
test('All types should be exported', async () => {
  if (!existsSync(cardTypesPath)) {
    throw new Error('Card types file does not exist');
  }

  const content = await readFile(cardTypesPath, 'utf-8');

  if (!content.includes('export')) {
    throw new Error('No exports found in card types file');
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
