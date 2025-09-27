// T002 Install Dependencies Test
// This test verifies that all required dependencies are properly installed

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('T002 Install Dependencies Test', () => {
  const projectRoot = path.resolve(__dirname, '../../../');
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const nodeModulesPath = path.join(projectRoot, 'node_modules');

  let packageJson;

  beforeAll(() => {
    // Read package.json
    if (fs.existsSync(packageJsonPath)) {
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
      packageJson = JSON.parse(packageJsonContent);
    }
  });

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
    expect(packageJson.devDependencies || packageJson.dependencies).toHaveProperty('typescript');
    expect(packageJson.devDependencies || packageJson.dependencies).toHaveProperty('@types/react');
    expect(packageJson.devDependencies || packageJson.dependencies).toHaveProperty('@types/react-dom');
  });

  test('Testing packages should be installed', () => {
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    expect(allDeps).toHaveProperty('@testing-library/react');
    expect(allDeps).toHaveProperty('@testing-library/jest-dom');
  });

  test('Playwright should be installed', () => {
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    expect(allDeps).toHaveProperty('@playwright/test');
  });

  test('Development tools should be installed', () => {
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
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
      '@playwright'
    ];

    requiredPackages.forEach(pkg => {
      const packagePath = path.join(nodeModulesPath, pkg);
      expect(fs.existsSync(packagePath)).toBe(true);
    });
  });

  test('Basic React import should work (syntax check)', () => {
    // This is a basic syntax check - actual functionality would require a more complex setup
    const reactImportTest = `
      const React = require('react');
      const ReactDOM = require('react-dom');
      expect(typeof React).toBe('object');
      expect(typeof ReactDOM).toBe('object');
    `;
    
    expect(() => {
      eval(reactImportTest);
    }).not.toThrow();
  });
});