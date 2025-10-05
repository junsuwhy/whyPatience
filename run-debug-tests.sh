#!/bin/bash

# Solitaire Game Debugging Test Runner
# This script starts the development server and runs comprehensive debugging tests

echo "🎮 Solitaire Game Debugging Test Suite"
echo "======================================"

# Create screenshots directory if it doesn't exist
mkdir -p tests/playwright/screenshots
mkdir -p debug-screenshots

# Function to cleanup background processes
cleanup() {
    echo "🧹 Cleaning up background processes..."
    if [ ! -z "$DEV_SERVER_PID" ]; then
        kill $DEV_SERVER_PID 2>/dev/null
    fi
    exit
}

# Set up trap to cleanup on script exit
trap cleanup EXIT INT TERM

echo "🚀 Starting development server..."
npm run dev &
DEV_SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start (30 seconds)..."
sleep 30

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Development server failed to start or is not accessible"
    echo "🔍 Checking if server is running on different port..."
    
    # Try alternative ports
    for PORT in 3001 3002 4173 5173; do
        if curl -s http://localhost:$PORT > /dev/null; then
            echo "✅ Found server running on port $PORT"
            # Update the playwright config or test URLs if needed
            break
        fi
    done
else
    echo "✅ Development server is running on http://localhost:3000"
fi

echo "🎭 Running Playwright debugging tests..."

# Run the debugging tests with detailed output
npx playwright test tests/playwright/debug-issues.spec.ts \
    --reporter=line \
    --output=tests/playwright/test-results \
    --project=chromium \
    --timeout=60000 \
    --retries=0 \
    --workers=1

TEST_EXIT_CODE=$?

echo ""
echo "📊 Test Results Summary:"
echo "======================="

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All debugging tests passed!"
else
    echo "❌ Some tests failed or detected issues"
fi

echo ""
echo "📸 Screenshots and artifacts saved to:"
echo "- tests/playwright/screenshots/"
echo "- debug-screenshots/"
echo "- tests/playwright/test-results/"

echo ""
echo "🔍 Next Steps:"
echo "1. Review test output above for specific error details"
echo "2. Check screenshots for visual issues"
echo "3. Look at debug-screenshots/ for detailed visual debugging"
echo "4. Address any console errors or warnings reported"

# Keep the server running for manual testing if desired
echo ""
echo "💡 Server is still running at http://localhost:3000"
echo "   Press Ctrl+C to stop the server and exit"

# Wait for user to stop the script
wait $DEV_SERVER_PID