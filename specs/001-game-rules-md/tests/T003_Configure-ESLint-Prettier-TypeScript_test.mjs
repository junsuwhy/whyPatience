#!/usr/bin/env node

/**
 * T003 Test: Configure ESLint, Prettier, and TypeScript Strict Mode
 *
 * This test verifies that ESLint, Prettier, and TypeScript strict mode
 * are properly configured according to the Constitution's Code Quality Excellence principle.
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// Test configuration
const PROJECT_ROOT = '/home/debian/Projects/whyPatience';
const TEST_NAME = 'T003 Configure ESLint, Prettier, TypeScript';

// Color codes for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTest() {
  log('blue', `🧪 Running ${TEST_NAME}`);
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  // Test 1: Check if ESLint configuration exists (flat config format)
  try {
    const eslintConfigPath = path.join(PROJECT_ROOT, 'eslint.config.mjs');
    if (existsSync(eslintConfigPath)) {
      const eslintConfigContent = readFileSync(eslintConfigPath, 'utf8');
      if (
        eslintConfigContent.includes('@typescript-eslint/parser') &&
        eslintConfigContent.includes('prettier') &&
        eslintConfigContent.includes('react')
      ) {
        log(
          'green',
          '✅ ESLint configuration file exists and has required properties'
        );
        passed++;
      } else {
        log('red', '❌ ESLint configuration missing required properties');
        failed++;
      }
    } else {
      log('red', '❌ ESLint configuration file (eslint.config.mjs) not found');
      failed++;
    }
  } catch (error) {
    log('red', `❌ Error checking ESLint config: ${error.message}`);
    failed++;
  }

  // Test 2: Check if Prettier configuration exists
  try {
    const prettierConfigPath = path.join(PROJECT_ROOT, '.prettierrc');
    if (existsSync(prettierConfigPath)) {
      log('green', '✅ Prettier configuration file exists');
      passed++;
    } else {
      log('red', '❌ Prettier configuration file (.prettierrc) not found');
      failed++;
    }
  } catch (error) {
    log('red', `❌ Error checking Prettier config: ${error.message}`);
    failed++;
  }

  // Test 3: Check TypeScript strict mode configuration
  try {
    const tsconfigPath = path.join(PROJECT_ROOT, 'tsconfig.json');
    if (existsSync(tsconfigPath)) {
      const tsconfigContent = readFileSync(tsconfigPath, 'utf8');
      // Simple string check since tsconfig.json supports comments which aren't valid JSON
      if (tsconfigContent.includes('"strict": true')) {
        log('green', '✅ TypeScript strict mode is enabled');
        passed++;
      } else {
        log('red', '❌ TypeScript strict mode is not enabled');
        failed++;
      }
    } else {
      log('red', '❌ TypeScript configuration file (tsconfig.json) not found');
      failed++;
    }
  } catch (error) {
    log('red', `❌ Error checking TypeScript config: ${error.message}`);
    failed++;
  }

  // Test 4: Check package.json scripts
  try {
    const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const scripts = packageJson.scripts || {};

      if (scripts.lint && scripts.format) {
        log('green', '✅ Package.json contains lint and format scripts');
        passed++;
      } else {
        log('red', '❌ Package.json missing lint or format scripts');
        failed++;
      }
    } else {
      log('red', '❌ Package.json not found');
      failed++;
    }
  } catch (error) {
    log('red', `❌ Error checking package.json: ${error.message}`);
    failed++;
  }

  // Test 5: Try to run ESLint command
  try {
    process.chdir(PROJECT_ROOT);
    execSync('npm run lint', { stdio: 'pipe' });
    log('green', '✅ ESLint command runs successfully');
    passed++;
  } catch (error) {
    log('red', '❌ ESLint command failed or not configured');
    failed++;
  }

  // Test 6: Try to run Prettier command
  try {
    process.chdir(PROJECT_ROOT);
    // Just check if prettier command exists and can run, ignore formatting issues
    execSync('npx prettier --version', { stdio: 'pipe' });
    log('green', '✅ Prettier command runs successfully');
    passed++;
  } catch (error) {
    log('red', '❌ Prettier command failed or not configured');
    failed++;
  }

  // Test 7: Check for required ESLint packages
  try {
    const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const devDeps = packageJson.devDependencies || {};

    const requiredPackages = [
      'eslint',
      '@typescript-eslint/parser',
      '@typescript-eslint/eslint-plugin',
      'prettier',
      'eslint-plugin-prettier',
      'eslint-config-prettier',
    ];

    const missingPackages = requiredPackages.filter(pkg => !devDeps[pkg]);

    if (missingPackages.length === 0) {
      log(
        'green',
        '✅ All required ESLint and Prettier packages are installed'
      );
      passed++;
    } else {
      log('red', `❌ Missing packages: ${missingPackages.join(', ')}`);
      failed++;
    }
  } catch (error) {
    log('red', `❌ Error checking required packages: ${error.message}`);
    failed++;
  }

  // Summary
  console.log('='.repeat(60));
  log('blue', `📊 Test Results Summary:`);
  log('green', `✅ Passed: ${passed}`);
  log('red', `❌ Failed: ${failed}`);
  log('yellow', `📈 Total: ${passed + failed}`);

  if (failed > 0) {
    log('red', `\n❌ ${TEST_NAME} - FAILED`);
    log(
      'yellow',
      "This is expected since the configuration hasn't been implemented yet."
    );
    process.exit(1);
  } else {
    log('green', `\n✅ ${TEST_NAME} - PASSED`);
    process.exit(0);
  }
}

// Run the test
runTest();
