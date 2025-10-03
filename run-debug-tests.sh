#!/bin/bash

# Solitaire Game Debugging Test Runner
# This script runs the Playwright debugging tests for the Solitaire game

set -e

echo "🎮 Starting Solitaire Game Debugging Tests"
echo "=========================================="

# Check if Playwright is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx is not available. Please install Node.js and npm."
    exit 1
fi

# Create screenshots directory if it doesn't exist
mkdir -p tests/playwright/screenshots

# Start the development server in the background
echo "🚀 Starting development server..."
npm run dev &
DEV_SERVER_PID=$!

# Wait for the server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Function to cleanup
cleanup() {
    echo "🧹 Cleaning up..."
    kill $DEV_SERVER_PID 2>/dev/null || true
    exit $1
}

# Set up cleanup on script exit
trap 'cleanup $?' EXIT

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Development server failed to start"
    exit 1
fi

echo "✅ Development server is running"

# Install Playwright if needed
echo "🔧 Ensuring Playwright is installed..."
npx playwright install chromium --with-deps

# Run the debugging tests
echo "🧪 Running debugging tests..."
npx playwright test tests/playwright/solitaire-debugging.spec.ts --reporter=html --output=tests/playwright/test-results

# Check test results
if [ $? -eq 0 ]; then
    echo "✅ Tests completed successfully"
    echo "📊 Test report available at: tests/playwright/test-results/playwright-report/index.html"
    echo "📸 Screenshots saved in: tests/playwright/screenshots/"
else
    echo "⚠️  Tests completed with issues (this is expected for debugging)"
    echo "📊 Test report available at: tests/playwright/test-results/playwright-report/index.html"
    echo "📸 Screenshots saved in: tests/playwright/screenshots/"
fi

echo ""
echo "🎯 Quick Start Commands:"
echo "  View test report: npx playwright show-report tests/playwright/test-results/playwright-report"
echo "  View screenshots: ls -la tests/playwright/screenshots/"
echo "  Re-run tests: bash run-debug-tests.sh"
echo ""
echo "📋 Debugging Summary:"
echo "  1. Check the test report for detailed error analysis"
echo "  2. Review screenshots for visual issues"
echo "  3. Console logs contain specific error details"
echo "  4. Focus on storage service and render loop errors first"