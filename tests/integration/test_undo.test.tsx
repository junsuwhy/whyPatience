/**
 * T012 Integration Test: Undo Functionality
 *
 * This test verifies that players can undo their game actions and restore
 * the game state to previous states. Tests move history storage, undo operation
 * execution, and correct game state restoration following Constitution Principle II (TDD).
 * This test MUST be written before implementation and MUST fail.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Game engine and components that will be implemented
import { GameEngine } from '../../src/services/game-engine';
import { GameState } from '../../src/models/game-state';
import { Move } from '../../src/models/move';
import { Card } from '../../src/models/card';
import { GameBoard } from '../../src/components/GameBoard/GameBoard';
import { UndoProvider } from '../../src/hooks/useUndoHistory';

// Test configuration
const TEST_NAME = 'T012 Integration Test: Undo Functionality';

describe('Undo Functionality Integration Tests', () => {
  let gameEngine: GameEngine;
  let initialGameState: GameState;
  let user: any;

  beforeEach(() => {
    // This will fail until GameEngine is implemented
    gameEngine = new GameEngine();
    initialGameState = gameEngine.initializeNewGame();
    user = userEvent.setup();
  });

  describe('Basic Undo Operations', () => {
    test('should undo single move operation', async () => {
      // Arrange: Setup game with initial state
      const { container } = render(
        <UndoProvider>
          <GameBoard gameEngine={gameEngine} />
        </UndoProvider>
      );

      // Act: Make a move (move card from tableau to foundation)
      const sourceCard = screen.getByTestId('tableau-card-0-0');
      const targetFoundation = screen.getByTestId('foundation-pile-0');
      
      // Perform drag and drop
      await user.click(sourceCard);
      await user.click(targetFoundation);

      // Get state after move
      const stateAfterMove = gameEngine.getCurrentGameState();

      // Act: Perform undo
      const undoButton = screen.getByTestId('undo-button');
      await user.click(undoButton);

      // Assert: Game state should be restored to initial state
      const stateAfterUndo = gameEngine.getCurrentGameState();
      expect(stateAfterUndo).toEqual(initialGameState);
      expect(gameEngine.getMoveHistory()).toHaveLength(0);
    });

    test('should undo multiple consecutive moves', async () => {
      // Arrange: Setup game and make multiple moves
      const { container } = render(
        <UndoProvider>
          <GameBoard gameEngine={gameEngine} />
        </UndoProvider>
      );

      // Act: Make three different moves
      const moves = [
        { from: 'tableau-0', to: 'foundation-0' },
        { from: 'stock', to: 'tableau-1' },
        { from: 'tableau-2', to: 'tableau-3' }
      ];

      const statesAfterEachMove: GameState[] = [initialGameState];

      for (const move of moves) {
        const sourceElement = screen.getByTestId(move.from);
        const targetElement = screen.getByTestId(move.to);
        
        await user.click(sourceElement);
        await user.click(targetElement);
        
        statesAfterEachMove.push(gameEngine.getCurrentGameState());
      }

      // Act & Assert: Undo each move and verify state restoration
      const undoButton = screen.getByTestId('undo-button');
      
      for (let i = moves.length - 1; i >= 0; i--) {
        await user.click(undoButton);
        const currentState = gameEngine.getCurrentGameState();
        expect(currentState).toEqual(statesAfterEachMove[i]);
        expect(gameEngine.getMoveHistory()).toHaveLength(i);
      }
    });

    test('should handle undo when no moves available', async () => {
      // Arrange: Fresh game with no moves
      const { container } = render(
        <UndoProvider>
          <GameBoard gameEngine={gameEngine} />
        </UndoProvider>
      );

      // Act: Try to undo when no moves exist
      const undoButton = screen.getByTestId('undo-button');
      
      // Assert: Undo button should be disabled
      expect(undoButton).toBeDisabled();
      
      // Act: Click disabled button
      await user.click(undoButton);
      
      // Assert: Game state unchanged
      expect(gameEngine.getCurrentGameState()).toEqual(initialGameState);
      expect(gameEngine.getMoveHistory()).toHaveLength(0);
    });
  });

  describe('Complex Undo Scenarios', () => {
    test('should undo tableau to foundation move correctly', async () => {
      // Arrange: Setup specific game scenario
      const { container } = render(
        <UndoProvider>
          <GameBoard gameEngine={gameEngine} />
        </UndoProvider>
      );

      // Act: Move card from tableau to foundation
      const tableauCard = screen.getByTestId('tableau-column-0-card-0');
      const foundationPile = screen.getByTestId('foundation-pile-hearts');
      
      await user.click(tableauCard);
      await user.click(foundationPile);
      
      const stateAfterMove = gameEngine.getCurrentGameState();
      
      // Act: Undo the move
      const undoButton = screen.getByTestId('undo-button');
      await user.click(undoButton);
      
      // Assert: Card should be back in tableau, foundation should be empty
      const restoredState = gameEngine.getCurrentGameState();
      expect(restoredState.foundations.hearts).toHaveLength(0);
      expect(restoredState.tableau[0]).toContain(tableauCard);
      expect(restoredState.score).toBe(initialGameState.score);
    });

    test('should undo stock to tableau move with card reveal', async () => {
      // Arrange: Game with stock pile actions
      const { container } = render(
        <UndoProvider>
          <GameBoard gameEngine={gameEngine} />
        </UndoProvider>
      );

      // Act: Draw from stock and place on tableau
      const stockPile = screen.getByTestId('stock-pile');
      const tableauColumn = screen.getByTestId('tableau-column-1');
      
      await user.click(stockPile); // Draw card
      const drawnCard = screen.getByTestId('waste-pile-top-card');
      await user.click(drawnCard);
      await user.click(tableauColumn);
      
      // Act: Undo the move
      const undoButton = screen.getByTestId('undo-button');
      await user.click(undoButton);
      
      // Assert: Card should be back in waste pile, tableau unchanged
      const restoredState = gameEngine.getCurrentGameState();
      expect(screen.getByTestId('waste-pile-top-card')).toBeInTheDocument();
      expect(restoredState.stock.wasteIndex).toBe(1);
    });

    test('should undo card flip action correctly', async () => {
      // Arrange: Game with face-down cards in tableau
      const { container } = render(
        <UndoProvider>
          <GameBoard gameEngine={gameEngine} />
        </UndoProvider>
      );

      // Act: Make move that reveals a face-down card
      const faceDownCard = screen.getByTestId('tableau-face-down-card');
      const targetColumn = screen.getByTestId('tableau-column-3');
      
      // Move top card to reveal the face-down card
      const topCard = screen.getByTestId('tableau-top-card-0');
      await user.click(topCard);
      await user.click(targetColumn);
      
      // Verify card was flipped
      await waitFor(() => {
        expect(screen.getByTestId('tableau-revealed-card')).toBeInTheDocument();
      });
      
      // Act: Undo the move
      const undoButton = screen.getByTestId('undo-button');
      await user.click(undoButton);
      
      // Assert: Card should be face-down again
      expect(screen.getByTestId('tableau-face-down-card')).toBeInTheDocument();
      expect(screen.queryByTestId('tableau-revealed-card')).not.toBeInTheDocument();
    });

    test('should restore score correctly after undo', async () => {
      // Arrange: Game with scoring moves
      const { container } = render(
        <UndoProvider>
          <GameBoard gameEngine={gameEngine} />
        </UndoProvider>
      );

      const initialScore = gameEngine.getCurrentGameState().score;
      
      // Act: Make scoring move (tableau to foundation = +10 points)
      const aceCard = screen.getByTestId('ace-of-hearts');
      const foundationPile = screen.getByTestId('foundation-pile-hearts');
      
      await user.click(aceCard);
      await user.click(foundationPile);
      
      const scoreAfterMove = gameEngine.getCurrentGameState().score;
      expect(scoreAfterMove).toBe(initialScore + 10);
      
      // Act: Undo the move
      const undoButton = screen.getByTestId('undo-button');
      await user.click(undoButton);
      
      // Assert: Score should be restored
      const scoreAfterUndo = gameEngine.getCurrentGameState().score;
      expect(scoreAfterUndo).toBe(initialScore);
    });
  });

  describe('Move History Management', () => {
    test('should store move records correctly', async () => {
      // Arrange
      const { container } = render(
        <UndoProvider>
          <GameBoard gameEngine={gameEngine} />
        </UndoProvider>
      );

      // Act: Make a move
      const sourceCard = screen.getByTestId('tableau-card-0');
      const targetLocation = screen.getByTestId('foundation-pile-0');
      
      await user.click(sourceCard);
      await user.click(targetLocation);
      
      // Assert: Move should be recorded in history
      const moveHistory = gameEngine.getMoveHistory();
      expect(moveHistory).toHaveLength(1);
      
      const lastMove = moveHistory[0];
      expect(lastMove.type).toBe('TABLEAU_TO_FOUNDATION');
      expect(lastMove.fromPosition).toBeDefined();
      expect(lastMove.toPosition).toBeDefined();
      expect(lastMove.timestamp).toBeInstanceOf(Date);
    });

    test('should update history after undo', async () => {
      // Arrange: Make multiple moves
      const { container } = render(
        <UndoProvider>
          <GameBoard gameEngine={gameEngine} />
        </UndoProvider>
      );

      // Make 3 moves
      for (let i = 0; i < 3; i++) {
        const sourceCard = screen.getByTestId(`tableau-card-${i}`);
        const targetLocation = screen.getByTestId(`foundation-pile-${i % 4}`);
        await user.click(sourceCard);
        await user.click(targetLocation);
      }
      
      expect(gameEngine.getMoveHistory()).toHaveLength(3);
      
      // Act: Undo 2 moves
      const undoButton = screen.getByTestId('undo-button');
      await user.click(undoButton);
      await user.click(undoButton);
      
      // Assert: History should be updated
      expect(gameEngine.getMoveHistory()).toHaveLength(1);
    });

    test('should respect move history capacity limit', async () => {
      // Arrange: Game with history limit
      const { container } = render(
        <UndoProvider maxHistorySize={5}>
          <GameBoard gameEngine={gameEngine} />
        </UndoProvider>
      );

      // Act: Make more moves than the limit
      for (let i = 0; i < 7; i++) {
        const sourceCard = screen.getByTestId(`move-source-${i}`);
        const targetLocation = screen.getByTestId(`move-target-${i}`);
        await user.click(sourceCard);
        await user.click(targetLocation);
      }
      
      // Assert: History should be limited to 5 moves
      const moveHistory = gameEngine.getMoveHistory();
      expect(moveHistory).toHaveLength(5);
      
      // The oldest moves should be removed
      expect(moveHistory[0].moveNumber).toBe(3); // Moves 0, 1, 2 removed
    });
  });

  describe('User Interface Undo Tests', () => {
    test('should enable/disable undo button correctly', async () => {
      // Arrange
      const { container } = render(
        <UndoProvider>
          <GameBoard gameEngine={gameEngine} />
        </UndoProvider>
      );

      const undoButton = screen.getByTestId('undo-button');
      
      // Assert: Initially disabled (no moves)
      expect(undoButton).toBeDisabled();
      
      // Act: Make a move
      const sourceCard = screen.getByTestId('tableau-card-0');
      const targetLocation = screen.getByTestId('foundation-pile-0');
      await user.click(sourceCard);
      await user.click(targetLocation);
      
      // Assert: Should be enabled after move
      expect(undoButton).toBeEnabled();
      
      // Act: Undo the move
      await user.click(undoButton);
      
      // Assert: Should be disabled again
      expect(undoButton).toBeDisabled();
    });

    test('should provide visual feedback during undo', async () => {
      // Arrange
      const { container } = render(
        <UndoProvider>
          <GameBoard gameEngine={gameEngine} />
        </UndoProvider>
      );

      // Make a move
      const sourceCard = screen.getByTestId('tableau-card-0');
      const targetLocation = screen.getByTestId('foundation-pile-0');
      await user.click(sourceCard);
      await user.click(targetLocation);
      
      // Act: Undo with visual feedback
      const undoButton = screen.getByTestId('undo-button');
      await user.click(undoButton);
      
      // Assert: Should show undo animation/feedback
      await waitFor(() => {
        expect(screen.getByTestId('undo-animation')).toBeInTheDocument();
      });
      
      // Should disappear after animation
      await waitFor(() => {
        expect(screen.queryByTestId('undo-animation')).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });

    test('should support keyboard shortcut (Ctrl+Z) for undo', async () => {
      // Arrange
      const { container } = render(
        <UndoProvider>
          <GameBoard gameEngine={gameEngine} />
        </UndoProvider>
      );

      // Make a move
      const sourceCard = screen.getByTestId('tableau-card-0');
      const targetLocation = screen.getByTestId('foundation-pile-0');
      await user.click(sourceCard);
      await user.click(targetLocation);
      
      const stateAfterMove = gameEngine.getCurrentGameState();
      
      // Act: Use keyboard shortcut
      await user.keyboard('{Control>}z{/Control}');
      
      // Assert: Move should be undone
      const stateAfterUndo = gameEngine.getCurrentGameState();
      expect(stateAfterUndo).toEqual(initialGameState);
    });

    test('should show move count and undo availability in UI', async () => {
      // Arrange
      const { container } = render(
        <UndoProvider>
          <GameBoard gameEngine={gameEngine} />
        </UndoProvider>
      );

      // Assert: Initial state
      expect(screen.getByTestId('move-counter')).toHaveTextContent('Moves: 0');
      expect(screen.getByTestId('undo-count')).toHaveTextContent('Undo: 0 available');
      
      // Act: Make moves
      for (let i = 0; i < 3; i++) {
        const sourceCard = screen.getByTestId(`move-source-${i}`);
        const targetLocation = screen.getByTestId(`move-target-${i}`);
        await user.click(sourceCard);
        await user.click(targetLocation);
      }
      
      // Assert: Counters updated
      expect(screen.getByTestId('move-counter')).toHaveTextContent('Moves: 3');
      expect(screen.getByTestId('undo-count')).toHaveTextContent('Undo: 3 available');
      
      // Act: Undo one move
      const undoButton = screen.getByTestId('undo-button');
      await user.click(undoButton);
      
      // Assert: Counters updated after undo
      expect(screen.getByTestId('move-counter')).toHaveTextContent('Moves: 2');
      expect(screen.getByTestId('undo-count')).toHaveTextContent('Undo: 2 available');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle corrupted move history gracefully', async () => {
      // Arrange: Simulate corrupted history
      const { container } = render(
        <UndoProvider>
          <GameBoard gameEngine={gameEngine} />
        </UndoProvider>
      );

      // Simulate corruption in move history
      gameEngine.corruptMoveHistory(); // This will fail until implemented
      
      // Act: Try to undo
      const undoButton = screen.getByTestId('undo-button');
      await user.click(undoButton);
      
      // Assert: Should handle gracefully without crashing
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Unable to undo: Move history corrupted'
      );
    });

    test('should handle rapid undo clicks correctly', async () => {
      // Arrange: Make multiple moves
      const { container } = render(
        <UndoProvider>
          <GameBoard gameEngine={gameEngine} />
        </UndoProvider>
      );

      for (let i = 0; i < 5; i++) {
        const sourceCard = screen.getByTestId(`move-source-${i}`);
        const targetLocation = screen.getByTestId(`move-target-${i}`);
        await user.click(sourceCard);
        await user.click(targetLocation);
      }
      
      // Act: Rapid undo clicks
      const undoButton = screen.getByTestId('undo-button');
      
      // Click rapidly multiple times
      await Promise.all([
        user.click(undoButton),
        user.click(undoButton),
        user.click(undoButton),
        user.click(undoButton),
        user.click(undoButton),
        user.click(undoButton), // More clicks than moves available
      ]);
      
      // Assert: Should not crash and handle gracefully
      expect(gameEngine.getMoveHistory()).toHaveLength(0);
      expect(undoButton).toBeDisabled();
    });
  });
});