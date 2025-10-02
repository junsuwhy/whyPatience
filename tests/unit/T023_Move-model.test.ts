/**
 * Test file for T023: Move model and history in src/models/move.ts
 *
 * This test file validates the Move and MoveHistory model implementation according to TDD principles.
 * All tests should FAIL initially as the Move model has not been implemented yet.
 *
 * Following Constitution Principle II (Test-Driven Development), these tests must be written
 * before the actual implementation and should guide the development process.
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import Card from '@/models/card';
import { Suit, Rank } from '@/types/card';
import { GameArea, MoveType } from '@/types/game-state';
import { createNewGameState } from '@/types/game-state';

// Move and MoveHistory are not implemented yet - this will cause the tests to fail as expected
import { Move, MoveHistory } from '@/models/move';

describe('T023: Move Model and History', () => {
  let move: Move;
  let moveHistory: MoveHistory;
  let gameState: any;
  let testCard: Card;

  beforeEach(() => {
    // Initialize test data
    gameState = createNewGameState();
    testCard = new Card(Suit.HEARTS, Rank.KING, true);

    move = new Move({
      cardId: testCard.id,
      from: { area: GameArea.TABLEAU, index: 0, stackIndex: 0 },
      to: { area: GameArea.FOUNDATION, index: 0 },
      moveType: MoveType.TABLEAU_TO_FOUNDATION,
    });

    moveHistory = new MoveHistory();
  });

  describe('Move Class - Basic Structure and Properties', () => {
    test('should create a move with required properties', () => {
      expect(move).toBeDefined();
      expect(move.cardId).toBe(testCard.id);
      expect(move.from).toEqual({
        area: GameArea.TABLEAU,
        index: 0,
        stackIndex: 0,
      });
      expect(move.to).toEqual({ area: GameArea.FOUNDATION, index: 0 });
      expect(move.moveType).toBe(MoveType.TABLEAU_TO_FOUNDATION);
      expect(move.timestamp).toBeDefined();
      expect(move.id).toBeDefined();
    });

    test('should auto-generate unique ID and timestamp', () => {
      const move1 = new Move({
        cardId: testCard.id,
        from: { area: GameArea.TABLEAU, index: 0 },
        to: { area: GameArea.FOUNDATION, index: 0 },
        moveType: MoveType.TABLEAU_TO_FOUNDATION,
      });

      const move2 = new Move({
        cardId: testCard.id,
        from: { area: GameArea.TABLEAU, index: 1 },
        to: { area: GameArea.FOUNDATION, index: 1 },
        moveType: MoveType.TABLEAU_TO_FOUNDATION,
      });

      expect(move1.id).not.toBe(move2.id);
      expect(move1.timestamp).toBeLessThanOrEqual(move2.timestamp);
    });

    test('should handle optional cards property', () => {
      const multiCardMove = new Move({
        cardId: testCard.id,
        cards: [testCard, new Card(Suit.SPADES, Rank.QUEEN, true)],
        from: { area: GameArea.TABLEAU, index: 0 },
        to: { area: GameArea.TABLEAU, index: 1 },
        moveType: MoveType.TABLEAU_TO_TABLEAU,
      });

      expect(multiCardMove.cards).toHaveLength(2);
      expect(multiCardMove.cards![0]).toBe(testCard);
    });
  });

  describe('Move Class - Move Type Validation', () => {
    test('should validate tableau to tableau moves', () => {
      const tableauMove = new Move({
        cardId: testCard.id,
        from: { area: GameArea.TABLEAU, index: 0 },
        to: { area: GameArea.TABLEAU, index: 1 },
        moveType: MoveType.TABLEAU_TO_TABLEAU,
      });

      expect(tableauMove.validate(gameState)).toBe(true);
    });

    test('should validate tableau to foundation moves', () => {
      const foundationMove = new Move({
        cardId: testCard.id,
        from: { area: GameArea.TABLEAU, index: 0 },
        to: { area: GameArea.FOUNDATION, index: 0 },
        moveType: MoveType.TABLEAU_TO_FOUNDATION,
      });

      expect(foundationMove.validate(gameState)).toBe(true);
    });

    test('should validate stock to waste moves', () => {
      const stockMove = new Move({
        cardId: testCard.id,
        from: { area: GameArea.STOCK, index: 0 },
        to: { area: GameArea.WASTE, index: 0 },
        moveType: MoveType.STOCK_TO_WASTE,
      });

      expect(stockMove.validate(gameState)).toBe(true);
    });

    test('should validate waste to tableau moves', () => {
      const wasteMove = new Move({
        cardId: testCard.id,
        from: { area: GameArea.WASTE, index: 0 },
        to: { area: GameArea.TABLEAU, index: 0 },
        moveType: MoveType.WASTE_TO_TABLEAU,
      });

      expect(wasteMove.validate(gameState)).toBe(true);
    });

    test('should reject invalid move types', () => {
      const invalidMove = new Move({
        cardId: testCard.id,
        from: { area: GameArea.FOUNDATION, index: 0 },
        to: { area: GameArea.STOCK, index: 0 },
        moveType: MoveType.TABLEAU_TO_FOUNDATION, // Mismatched move type
      });

      expect(invalidMove.validate(gameState)).toBe(false);
    });
  });

  describe('Move Class - Execute Method', () => {
    test('should execute valid move and update game state', () => {
      const result = move.execute(gameState);

      expect(result.success).toBe(true);
      expect(result.gameState).toBeDefined();
      expect(result.cardRevealed).toBeDefined();
    });

    test('should fail to execute invalid move', () => {
      const invalidMove = new Move({
        cardId: 'non-existent-card',
        from: { area: GameArea.TABLEAU, index: 0 },
        to: { area: GameArea.FOUNDATION, index: 0 },
        moveType: MoveType.TABLEAU_TO_FOUNDATION,
      });

      const result = invalidMove.execute(gameState);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should capture previous state for undo', () => {
      const result = move.execute(gameState);

      expect(result.previousState).toBeDefined();
      expect(result.previousState).not.toBe(gameState);
    });
  });

  describe('Move Class - Undo Method', () => {
    test('should undo move and restore previous state', () => {
      const executeResult = move.execute(gameState);
      const undoResult = move.undo(executeResult.gameState);

      expect(undoResult.success).toBe(true);
      expect(undoResult.gameState).toEqual(gameState);
    });

    test('should fail to undo without previous state', () => {
      const moveWithoutPreviousState = new Move({
        cardId: testCard.id,
        from: { area: GameArea.TABLEAU, index: 0 },
        to: { area: GameArea.FOUNDATION, index: 0 },
        moveType: MoveType.TABLEAU_TO_FOUNDATION,
      });

      const result = moveWithoutPreviousState.undo(gameState);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should handle card reveal/hide during undo', () => {
      const executeResult = move.execute(gameState);
      executeResult.cardRevealed = testCard;

      const undoResult = move.undo(executeResult.gameState);

      expect(undoResult.success).toBe(true);
      expect(undoResult.cardHidden).toBe(testCard);
    });
  });

  describe('Move Class - Serialization', () => {
    test('should serialize to JSON correctly', () => {
      const json = move.toJSON();

      expect(json.id).toBe(move.id);
      expect(json.cardId).toBe(move.cardId);
      expect(json.from).toEqual(move.from);
      expect(json.to).toEqual(move.to);
      expect(json.moveType).toBe(move.moveType);
      expect(json.timestamp).toBe(move.timestamp);
    });

    test('should deserialize from JSON correctly', () => {
      const json = move.toJSON();
      const deserializedMove = Move.fromJSON(json);

      expect(deserializedMove.id).toBe(move.id);
      expect(deserializedMove.cardId).toBe(move.cardId);
      expect(deserializedMove.from).toEqual(move.from);
      expect(deserializedMove.to).toEqual(move.to);
      expect(deserializedMove.moveType).toBe(move.moveType);
      expect(deserializedMove.timestamp).toBe(move.timestamp);
    });

    test('should handle serialization with cards array', () => {
      const multiCardMove = new Move({
        cardId: testCard.id,
        cards: [testCard],
        from: { area: GameArea.TABLEAU, index: 0 },
        to: { area: GameArea.TABLEAU, index: 1 },
        moveType: MoveType.TABLEAU_TO_TABLEAU,
      });

      const json = multiCardMove.toJSON();
      const deserializedMove = Move.fromJSON(json);

      expect(deserializedMove.cards).toHaveLength(1);
      expect(deserializedMove.cards![0].id).toBe(testCard.id);
    });
  });

  describe('MoveHistory Class - Basic Structure and Properties', () => {
    test('should create empty move history', () => {
      expect(moveHistory).toBeDefined();
      expect(moveHistory.isEmpty()).toBe(true);
      expect(moveHistory.size()).toBe(0);
      expect(moveHistory.canUndo()).toBe(false);
      expect(moveHistory.canRedo()).toBe(false);
    });

    test('should track current position correctly', () => {
      expect(moveHistory.getCurrentPosition()).toBe(-1);

      moveHistory.addMove(move);
      expect(moveHistory.getCurrentPosition()).toBe(0);
    });
  });

  describe('MoveHistory Class - Adding Moves', () => {
    test('should add move to history', () => {
      moveHistory.addMove(move);

      expect(moveHistory.isEmpty()).toBe(false);
      expect(moveHistory.size()).toBe(1);
      expect(moveHistory.canUndo()).toBe(true);
      expect(moveHistory.canRedo()).toBe(false);
    });

    test('should add multiple moves in sequence', () => {
      const move1 = new Move({
        cardId: testCard.id,
        from: { area: GameArea.TABLEAU, index: 0 },
        to: { area: GameArea.FOUNDATION, index: 0 },
        moveType: MoveType.TABLEAU_TO_FOUNDATION,
      });

      const move2 = new Move({
        cardId: testCard.id,
        from: { area: GameArea.TABLEAU, index: 1 },
        to: { area: GameArea.FOUNDATION, index: 1 },
        moveType: MoveType.TABLEAU_TO_FOUNDATION,
      });

      moveHistory.addMove(move1);
      moveHistory.addMove(move2);

      expect(moveHistory.size()).toBe(2);
      expect(moveHistory.getCurrentPosition()).toBe(1);
    });

    test('should clear redo history when adding new move after undo', () => {
      moveHistory.addMove(move);
      const move2 = new Move({
        cardId: testCard.id,
        from: { area: GameArea.TABLEAU, index: 1 },
        to: { area: GameArea.FOUNDATION, index: 1 },
        moveType: MoveType.TABLEAU_TO_FOUNDATION,
      });
      moveHistory.addMove(move2);

      // Undo last move
      moveHistory.undoLastMove();
      expect(moveHistory.canRedo()).toBe(true);

      // Add new move should clear redo history
      const move3 = new Move({
        cardId: testCard.id,
        from: { area: GameArea.TABLEAU, index: 2 },
        to: { area: GameArea.FOUNDATION, index: 2 },
        moveType: MoveType.TABLEAU_TO_FOUNDATION,
      });
      moveHistory.addMove(move3);

      expect(moveHistory.canRedo()).toBe(false);
    });
  });

  describe('MoveHistory Class - Undo Operations', () => {
    beforeEach(() => {
      moveHistory.addMove(move);
    });

    test('should undo last move successfully', () => {
      const result = moveHistory.undoLastMove();

      expect(result.success).toBe(true);
      expect(result.move).toBe(move);
      expect(moveHistory.canUndo()).toBe(false);
      expect(moveHistory.canRedo()).toBe(true);
    });

    test('should fail to undo when no moves available', () => {
      moveHistory.undoLastMove(); // First undo
      const result = moveHistory.undoLastMove(); // Second undo should fail

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should maintain history integrity after undo', () => {
      const originalSize = moveHistory.size();
      moveHistory.undoLastMove();

      expect(moveHistory.size()).toBe(originalSize); // Size shouldn't change
      expect(moveHistory.getCurrentPosition()).toBe(-1);
    });
  });

  describe('MoveHistory Class - Redo Operations', () => {
    beforeEach(() => {
      moveHistory.addMove(move);
      moveHistory.undoLastMove(); // Setup for redo
    });

    test('should redo move successfully', () => {
      const result = moveHistory.redoMove();

      expect(result.success).toBe(true);
      expect(result.move).toBe(move);
      expect(moveHistory.canUndo()).toBe(true);
      expect(moveHistory.canRedo()).toBe(false);
    });

    test('should fail to redo when no moves available', () => {
      moveHistory.redoMove(); // First redo
      const result = moveHistory.redoMove(); // Second redo should fail

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should handle multiple undo/redo cycles', () => {
      // Redo
      moveHistory.redoMove();
      expect(moveHistory.canUndo()).toBe(true);
      expect(moveHistory.canRedo()).toBe(false);

      // Undo again
      moveHistory.undoLastMove();
      expect(moveHistory.canUndo()).toBe(false);
      expect(moveHistory.canRedo()).toBe(true);
    });
  });

  describe('MoveHistory Class - History Navigation', () => {
    beforeEach(() => {
      // Add multiple moves for navigation testing
      for (let i = 0; i < 3; i++) {
        const testMove = new Move({
          cardId: `card-${i}`,
          from: { area: GameArea.TABLEAU, index: i },
          to: { area: GameArea.FOUNDATION, index: i },
          moveType: MoveType.TABLEAU_TO_FOUNDATION,
        });
        moveHistory.addMove(testMove);
      }
    });

    test('should get move at specific position', () => {
      const move = moveHistory.getMoveAt(1);
      expect(move).toBeDefined();
      expect(move!.cardId).toBe('card-1');
    });

    test('should return null for invalid position', () => {
      expect(moveHistory.getMoveAt(-1)).toBeNull();
      expect(moveHistory.getMoveAt(10)).toBeNull();
    });

    test('should get current move correctly', () => {
      const currentMove = moveHistory.getCurrentMove();
      expect(currentMove).toBeDefined();
      expect(currentMove!.cardId).toBe('card-2');
    });

    test('should get all moves as array', () => {
      const allMoves = moveHistory.getAllMoves();
      expect(allMoves).toHaveLength(3);
      expect(allMoves[0].cardId).toBe('card-0');
      expect(allMoves[2].cardId).toBe('card-2');
    });
  });

  describe('MoveHistory Class - Clear Operations', () => {
    beforeEach(() => {
      moveHistory.addMove(move);
    });

    test('should clear all history', () => {
      moveHistory.clear();

      expect(moveHistory.isEmpty()).toBe(true);
      expect(moveHistory.size()).toBe(0);
      expect(moveHistory.canUndo()).toBe(false);
      expect(moveHistory.canRedo()).toBe(false);
      expect(moveHistory.getCurrentPosition()).toBe(-1);
    });

    test('should reset position after clear', () => {
      moveHistory.undoLastMove(); // Set position to -1
      moveHistory.clear();

      expect(moveHistory.getCurrentPosition()).toBe(-1);
    });
  });

  describe('MoveHistory Class - Serialization', () => {
    beforeEach(() => {
      moveHistory.addMove(move);
      const move2 = new Move({
        cardId: 'card-2',
        from: { area: GameArea.TABLEAU, index: 1 },
        to: { area: GameArea.FOUNDATION, index: 1 },
        moveType: MoveType.TABLEAU_TO_FOUNDATION,
      });
      moveHistory.addMove(move2);
    });

    test('should serialize to JSON correctly', () => {
      const json = moveHistory.toJSON();

      expect(json.moves).toHaveLength(2);
      expect(json.currentPosition).toBe(1);
      expect(json.moves[0].cardId).toBe(move.cardId);
    });

    test('should deserialize from JSON correctly', () => {
      const json = moveHistory.toJSON();
      const deserializedHistory = MoveHistory.fromJSON(json);

      expect(deserializedHistory.size()).toBe(2);
      expect(deserializedHistory.getCurrentPosition()).toBe(1);
      expect(deserializedHistory.getCurrentMove()!.cardId).toBe('card-2');
    });

    test('should handle empty history serialization', () => {
      const emptyHistory = new MoveHistory();
      const json = emptyHistory.toJSON();
      const deserializedHistory = MoveHistory.fromJSON(json);

      expect(deserializedHistory.isEmpty()).toBe(true);
      expect(deserializedHistory.getCurrentPosition()).toBe(-1);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle null move in addMove', () => {
      expect(() => moveHistory.addMove(null as any)).toThrow();
    });

    test('should handle invalid JSON in deserialization', () => {
      expect(() => Move.fromJSON({} as any)).toThrow();
      expect(() => MoveHistory.fromJSON({} as any)).toThrow();
    });

    test('should validate move constructor parameters', () => {
      expect(() => new Move({} as any)).toThrow();
      expect(
        () =>
          new Move({
            cardId: '',
            from: {} as any,
            to: {} as any,
            moveType: 'invalid' as any,
          })
      ).toThrow();
    });

    test('should handle concurrent access scenarios', () => {
      // Test for potential race conditions in history management
      const moves = Array.from(
        { length: 10 },
        (_, i) =>
          new Move({
            cardId: `card-${i}`,
            from: { area: GameArea.TABLEAU, index: i },
            to: { area: GameArea.FOUNDATION, index: i },
            moveType: MoveType.TABLEAU_TO_FOUNDATION,
          })
      );

      moves.forEach(m => moveHistory.addMove(m));

      // Perform multiple operations
      moveHistory.undoLastMove();
      moveHistory.undoLastMove();
      moveHistory.redoMove();

      expect(moveHistory.size()).toBe(10);
      expect(moveHistory.getCurrentPosition()).toBe(8);
    });
  });
});
