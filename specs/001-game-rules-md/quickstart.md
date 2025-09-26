# Quickstart Guide: Desktop Solitaire Web Application

## Development Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)

### Initial Setup
```bash
# Clone and setup project
cd whyPatience
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Project Structure
```
src/
├── components/          # React components
│   ├── Card/           # Card component and variants
│   ├── TableauColumn/ # Tableau column component
│   ├── FoundationPile/ # Foundation pile component
│   ├── StockPile/     # Stock pile component
│   ├── GameBoard/     # Main game board
│   └── GameControls/  # Game controls and UI
├── hooks/              # Custom React hooks
├── services/           # Game logic and storage
├── types/              # TypeScript type definitions
├── utils/              # Helper functions
└── styles/             # Styled-components and themes
```

## Core User Flows Testing

### Flow 1: New Game Setup
**Objective**: Verify initial game state is properly created

**Steps**:
1. Open application in browser
2. Click "New Game" button
3. Verify game board layout:
   - 7 tableau columns with 1-7 cards each
   - Top cards face-up, others face-down
   - 4 empty foundation piles
   - Stock pile with remaining cards
   - Game timer starts

**Expected Result**: 
- 52 cards total distributed correctly
- Game status shows "In Progress"
- All interactive elements respond to hover

### Flow 2: Basic Card Movement
**Objective**: Test drag-and-drop card movement

**Steps**:
1. Start new game
2. Find a red card that can be placed on a black card
3. Drag the red card to the black card
4. Release to drop
5. Verify move is executed and recorded

**Expected Result**:
- Card moves to new position
- Move counter increments
- Undo button becomes enabled
- Card positions update correctly

### Flow 3: Foundation Building
**Objective**: Test building foundation piles

**Steps**:
1. Start new game
2. Find an Ace card in tableau or stock
3. Drag Ace to foundation area
4. Find corresponding 2 of same suit
5. Drag 2 on top of Ace

**Expected Result**:
- Foundation pile started with Ace
- 2 placed on Ace successfully  
- Score increases appropriately
- Visual feedback shows valid drop zones

### Flow 4: Stock Pile Operations
**Objective**: Test stock pile drawing modes

**Steps**:
1. Start new game with 1-card draw mode
2. Click stock pile to draw card
3. Use drawn card if possible
4. Switch to 3-card draw mode in settings
5. Test drawing 3 cards at once
6. Test cycling through entire stock

**Expected Result**:
- Cards drawn according to selected mode
- Waste pile shows drawn cards correctly
- Stock cycling works when stock is empty
- Draw mode persists between games

### Flow 5: Game Victory
**Objective**: Test win condition detection

**Steps**:
1. Load a nearly-won game state (cheat/debug mode)
2. Move final cards to foundation piles
3. Verify win condition triggers
4. Check victory animation and stats

**Expected Result**:
- Game detects completion immediately
- Victory message displays
- Final statistics shown (time, moves, score)
- Option to start new game appears

### Flow 6: Undo Functionality
**Objective**: Test move reversal

**Steps**:
1. Start new game and make several moves
2. Click undo button
3. Verify last move is reversed
4. Test multiple undos in sequence
5. Verify undo limit if implemented

**Expected Result**:
- Cards return to previous positions
- Move counter decreases
- Game state accurately restored
- Undo button disabled when no moves to undo

### Flow 7: Local Storage Persistence
**Objective**: Test game state saving/loading

**Steps**:
1. Start game and make several moves
2. Close browser tab
3. Reopen application
4. Verify game state restored
5. Test preferences persistence

**Expected Result**:
- Exact game state restored
- All card positions maintained
- Timer continues from saved state
- User preferences loaded correctly

### Flow 8: Accessibility Navigation
**Objective**: Test keyboard and screen reader support

**Steps**:
1. Load game with screen reader active
2. Navigate using Tab key only
3. Use Enter/Space to interact with cards
4. Test arrow keys for card selection
5. Verify ARIA labels are announced

**Expected Result**:
- All interactive elements reachable by keyboard
- Screen reader announces card states clearly
- Focus indicators visible and clear
- Keyboard shortcuts work as expected

### Flow 9: Performance Validation
**Objective**: Test animation performance and responsiveness

**Steps**:
1. Open browser dev tools performance tab
2. Start performance recording
3. Perform rapid card movements
4. Deal new game multiple times
5. Check frame rate during animations

**Expected Result**:
- Animations maintain 60fps
- No dropped frames during card movements
- Memory usage remains stable
- CPU usage reasonable during gameplay

### Flow 10: Responsive Design
**Objective**: Test different screen sizes

**Steps**:
1. Load game at various browser window sizes
2. Test minimum supported resolution
3. Test very large screens
4. Check card scaling and spacing
5. Verify UI elements remain accessible

**Expected Result**:
- Game remains playable at all sizes
- Cards scale proportionally
- UI elements don't overlap
- Text remains readable
- Touch targets adequate size (future mobile support)

## Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing  
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run end-to-end tests
npm run test:coverage # Generate coverage report

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run typecheck    # Run TypeScript compiler
npm run format       # Run Prettier

# Performance
npm run analyze      # Analyze bundle size
npm run perf         # Run performance tests
```

## Debugging Tips

### Common Issues
1. **Cards not dragging**: Check if `isDraggable` prop is set correctly
2. **Invalid moves accepted**: Verify game logic in `canPlaceOnTableau/Foundation`
3. **Performance issues**: Use React DevTools Profiler to identify re-renders
4. **State not persisting**: Check localStorage permissions and quota
5. **TypeScript errors**: Ensure all interfaces are properly implemented

### Browser Dev Tools
- Use React DevTools for component inspection
- Performance tab for animation analysis
- Application tab for localStorage inspection
- Console for error messages and debug logs

### Testing Utilities
- Jest snapshots for component rendering
- React Testing Library for user interactions
- Playwright for cross-browser testing
- Lighthouse for performance auditing