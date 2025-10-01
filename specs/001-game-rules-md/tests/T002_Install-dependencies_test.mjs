// T002 Install Dependencies Test
// This test verifies that all required dependencies are properly installed

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Running T002 Install Dependencies Test');
console.log('=========================================');

const projectRoot = path.resolve(__dirname, '../../../');
const packageJsonPath = path.join(projectRoot, 'package.json');
const nodeModulesPath = path.join(projectRoot, 'node_modules');

let testResults = [];
let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ ${name}`);
    testResults.push({ name, status: 'PASS' });
    passedTests++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    testResults.push({ name, status: 'FAIL', error: error.message });
  }
}

function expect(actual) {
  return {
    toBe: expected => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toBeGreaterThanOrEqual: expected => {
      if (actual < expected) {
        throw new Error(`Expected ${actual} to be >= ${expected}`);
      }
    },
    toHaveProperty: prop => {
      if (!actual || !actual.hasOwnProperty(prop)) {
        throw new Error(`Expected object to have property ${prop}`);
      }
    },
  };
}

// Read package.json
let packageJson;
try {
  if (fs.existsSync(packageJsonPath)) {
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    packageJson = JSON.parse(packageJsonContent);
  }
} catch (error) {
  console.log(`Error reading package.json: ${error.message}`);
}

// Run tests
test('package.json should exist', () => {
  expect(fs.existsSync(packageJsonPath)).toBe(true);
});

test('node_modules directory should exist', () => {
  expect(fs.existsSync(nodeModulesPath)).toBe(true);
});

test('React 18+ should be installed', () => {
  expect(packageJson.dependencies).toHaveProperty('react');
  expect(packageJson.dependencies).toHaveProperty('react-dom');

  // Check if React version is 18+
  const reactVersion = packageJson.dependencies.react;
  const versionNumber = reactVersion.replace(/[^\d.]/g, '');
  const majorVersion = parseInt(versionNumber.split('.')[0]);
  expect(majorVersion).toBeGreaterThanOrEqual(18);
});

test('React DnD should be installed', () => {
  expect(packageJson.dependencies).toHaveProperty('react-dnd');
  expect(packageJson.dependencies).toHaveProperty('react-dnd-html5-backend');
});

test('styled-components should be installed', () => {
  expect(packageJson.dependencies).toHaveProperty('styled-components');
});

test('TypeScript packages should be installed', () => {
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  expect(allDeps).toHaveProperty('typescript');
  expect(allDeps).toHaveProperty('@types/react');
  expect(allDeps).toHaveProperty('@types/react-dom');
});

test('Testing packages should be installed', () => {
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  expect(allDeps).toHaveProperty('@testing-library/react');
  expect(allDeps).toHaveProperty('@testing-library/jest-dom');
});

test('Playwright should be installed', () => {
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  expect(allDeps).toHaveProperty('@playwright/test');
});

test('Development tools should be installed', () => {
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  expect(allDeps).toHaveProperty('@types/styled-components');
  expect(allDeps).toHaveProperty('@vitejs/plugin-react');
});

test('Package installation directories should exist in node_modules', () => {
  const requiredPackages = [
    'react',
    'react-dom',
    'react-dnd',
    'react-dnd-html5-backend',
    'styled-components',
    'typescript',
    '@types',
    '@testing-library',
    '@playwright',
  ];

  requiredPackages.forEach(pkg => {
    const packagePath = path.join(nodeModulesPath, pkg);
    if (!fs.existsSync(packagePath)) {
      throw new Error(`Package ${pkg} not found in node_modules`);
    }
  });
});

// Summary
console.log('\n📊 Test Summary');
console.log('================');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${totalTests - passedTests}`);

if (passedTests === totalTests) {
  console.log('🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('💥 Some tests failed!');
  process.exit(1);
}
