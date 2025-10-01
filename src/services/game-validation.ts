/**
 * Game validation service for the Desktop Solitaire game.
 * This service provides comprehensive validation logic for all game operations
 * including card movement rules, game state integrity, and victory conditions.
 *
 * Following Constitution Principle I (Code Quality Excellence) and II (Test-Driven Development),
 * this service includes comprehensive validation logic, clear error handling,
 * and JSDoc documentation for all functions.
 */

import { Card, Rank } from '../types/card';
import { GameState, GamePhase, Position } from '../types/game-state';
import { TableauColumn } from '../models/tableau-column';
import { FoundationPile } from '../models/foundation-pile';
import { StockPile } from '../models/stock-pile';

/**
 * Validation error class for game validation specific errors.
 */
export class GameValidationError extends Error {
  constructor(
    message: string,
    public readonly validationData?: {
      cards?: Card[];
      position?: Position;
      gameState?: Partial<GameState>;
    }
  ) {
    super(message);
    this.name = 'GameValidationError';
  }
}

/**
 * Validation result interface for detailed validation feedback.
 */
export interface ValidationResult {
  /** Whether the validation passed */
  valid: boolean;
  /** Error message if validation failed */
  error?: string;
  /** Additional context about the validation */
  context?: Record<string, unknown>;
}

/**
 * Validates a move between tableau columns.
 * Checks if cards can be moved from one tableau column to another following Solitaire rules.
 *
 * @param cards - Array of cards to move (must be in valid sequence)
 * @param sourceColumn - Source tableau column
 * @param targetColumn - Target tableau column
 * @returns Validation result with success status and details
 * @throws {GameValidationError} If validation parameters are invalid
 */
export function validateTableauMove(
  cards: Card[],
  sourceColumn: TableauColumn,
  targetColumn: TableauColumn
): ValidationResult {
  if (!cards || cards.length === 0) {
    throw new GameValidationError('Cards array cannot be empty');
  }

  if (!sourceColumn || !targetColumn) {
    throw new GameValidationError('Source and target columns must be provided');
  }

  try {
    // Validate that the cards form a valid sequence
    const sequenceResult = isValidCardSequence(cards);
    if (!sequenceResult.valid) {
      return {
        valid: false,
        error: `Invalid card sequence: ${sequenceResult.error}`,
        context: { cards: cards.map(c => c.toString()) },
      };
    }

    // Check if the first card can be placed on the target column
    const firstCard = cards[0];
    if (!canPlaceOnTableau(firstCard, targetColumn.getTopCard())) {
      const targetCard = targetColumn.getTopCard();
      return {
        valid: false,
        error: `Cannot place ${firstCard.toString()} on ${
          targetCard ? targetCard.toString() : 'empty column'
        }`,
        context: {
          cardToPlace: firstCard.toString(),
          targetCard: targetCard?.toString() || 'empty',
        },
      };
    }

    // Verify that the cards can actually be removed from the source column
    if (!sourceColumn.canRemoveSequence(firstCard)) {
      return {
        valid: false,
        error: `Cannot remove sequence starting with ${firstCard.toString()} from source column`,
        context: { sourceColumn: sourceColumn.id },
      };
    }

    return { valid: true };
  } catch (error) {
    throw new GameValidationError(
      `Tableau move validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { cards }
    );
  }
}

/**
 * Validates a move to a foundation pile.
 * Checks if a card can be placed on a foundation pile following Solitaire rules.
 *
 * @param card - Card to place on foundation
 * @param foundationPile - Target foundation pile
 * @returns Validation result with success status and details
 * @throws {GameValidationError} If validation parameters are invalid
 */
export function validateFoundationMove(
  card: Card,
  foundationPile: FoundationPile
): ValidationResult {
  if (!card) {
    throw new GameValidationError('Card cannot be null or undefined');
  }

  if (!foundationPile) {
    throw new GameValidationError(
      'Foundation pile cannot be null or undefined'
    );
  }

  try {
    // Use the foundation pile's built-in validation
    if (!foundationPile.canAddCard(card)) {
      const expectedRank = foundationPile.getExpectedNextRank();
      const pilesuit = foundationPile.suit;

      return {
        valid: false,
        error: `Cannot place ${card.toString()} on foundation pile. Expected: ${
          expectedRank ? `${expectedRank} of ${pilesuit}` : 'Ace (empty pile)'
        }`,
        context: {
          cardRank: card.rank,
          cardSuit: card.suit,
          expectedRank,
          pileSuit: pilesuit,
        },
      };
    }

    return { valid: true };
  } catch (error) {
    throw new GameValidationError(
      `Foundation move validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { cards: [card] }
    );
  }
}

/**
 * Validates stock pile operations (drawing cards, cycling).
 * Checks if stock pile operations are valid according to game rules.
 *
 * @param operation - Type of operation ('draw' | 'cycle' | 'reset')
 * @param stockPile - Stock pile to validate operation on
 * @returns Validation result with success status and details
 * @throws {GameValidationError} If validation parameters are invalid
 */
export function validateStockPileOperation(
  operation: 'draw' | 'cycle' | 'reset',
  stockPile: StockPile
): ValidationResult {
  if (!stockPile) {
    throw new GameValidationError('Stock pile cannot be null or undefined');
  }

  if (!['draw', 'cycle', 'reset'].includes(operation)) {
    throw new GameValidationError(`Invalid stock pile operation: ${operation}`);
  }

  try {
    switch (operation) {
      case 'draw':
        if (!stockPile.canDraw()) {
          return {
            valid: false,
            error: 'Cannot draw: stock pile is empty',
            context: {
              stockCards: stockPile.stock.length,
              wasteCards: stockPile.waste.length,
            },
          };
        }
        break;

      case 'cycle':
        if (stockPile.stock.length > 0) {
          return {
            valid: false,
            error: 'Cannot cycle: stock pile still has cards to draw',
            context: { stockCards: stockPile.stock.length },
          };
        }
        if (stockPile.waste.length === 0) {
          return {
            valid: false,
            error: 'Cannot cycle: waste pile is empty',
            context: { wasteCards: stockPile.waste.length },
          };
        }
        break;

      case 'reset':
        // Reset is always valid - it moves waste back to stock
        break;
    }

    return { valid: true };
  } catch (error) {
    throw new GameValidationError(
      `Stock pile operation validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validates if a sequence of cards follows Solitaire tableau rules.
 * Cards must be in descending rank order with alternating colors.
 *
 * @param cards - Array of cards to validate as a sequence
 * @returns Validation result with success status and details
 * @throws {GameValidationError} If cards array is invalid
 */
export function isValidCardSequence(cards: Card[]): ValidationResult {
  if (!Array.isArray(cards)) {
    throw new GameValidationError('Cards must be provided as an array');
  }

  if (cards.length === 0) {
    return { valid: true }; // Empty sequence is valid
  }

  if (cards.length === 1) {
    return { valid: true }; // Single card is always valid
  }

  try {
    // Validate each card in the sequence
    for (let i = 1; i < cards.length; i++) {
      const currentCard = cards[i];
      const previousCard = cards[i - 1];

      // Check descending rank order
      if (currentCard.rank !== previousCard.rank - 1) {
        return {
          valid: false,
          error: `Cards not in descending order: ${previousCard.toString()} followed by ${currentCard.toString()}`,
          context: {
            position: i,
            expectedRank: previousCard.rank - 1,
            actualRank: currentCard.rank,
          },
        };
      }

      // Check alternating colors
      if (currentCard.color === previousCard.color) {
        return {
          valid: false,
          error: `Cards have same color: ${previousCard.toString()} and ${currentCard.toString()}`,
          context: {
            position: i,
            color: currentCard.color,
          },
        };
      }
    }

    return { valid: true };
  } catch (error) {
    throw new GameValidationError(
      `Card sequence validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { cards }
    );
  }
}

/**
 * Checks if a card can be placed on a foundation pile.
 * Foundation piles must be built in ascending order by suit (Ace to King).
 *
 * @param card - Card to check for foundation placement
 * @param foundationPile - Foundation pile to check placement on
 * @returns True if the card can be placed on the foundation pile
 * @throws {GameValidationError} If parameters are invalid
 */
export function canPlaceOnFoundation(
  card: Card,
  foundationPile: FoundationPile
): boolean {
  if (!card) {
    throw new GameValidationError('Card cannot be null or undefined');
  }

  if (!foundationPile) {
    throw new GameValidationError(
      'Foundation pile cannot be null or undefined'
    );
  }

  try {
    return foundationPile.canAddCard(card);
  } catch (error) {
    throw new GameValidationError(
      `Foundation placement check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { cards: [card] }
    );
  }
}

/**
 * Checks if a card can be placed on a tableau column.
 * Tableau columns must be built in descending order with alternating colors.
 *
 * @param card - Card to check for tableau placement
 * @param targetCard - Top card of the target tableau column (null if empty)
 * @returns True if the card can be placed on the tableau column
 * @throws {GameValidationError} If card parameter is invalid
 */
export function canPlaceOnTableau(
  card: Card,
  targetCard: Card | null
): boolean {
  if (!card) {
    throw new GameValidationError('Card cannot be null or undefined');
  }

  try {
    // Empty column: only Kings can be placed
    if (!targetCard) {
      return card.rank === Rank.KING;
    }

    // Use the Card model's canPlaceOn method for validation
    return card.canPlaceOn(targetCard);
  } catch (error) {
    throw new GameValidationError(
      `Tableau placement check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { cards: [card] }
    );
  }
}

/**
 * Checks if the game has been won.
 * Game is won when all foundation piles are complete (Ace to King).
 *
 * @param foundationPiles - Array of all four foundation piles
 * @returns True if all foundation piles are complete
 * @throws {GameValidationError} If foundation piles array is invalid
 */
export function isGameWon(foundationPiles: FoundationPile[]): boolean {
  if (!Array.isArray(foundationPiles)) {
    throw new GameValidationError(
      'Foundation piles must be provided as an array'
    );
  }

  if (foundationPiles.length !== 4) {
    throw new GameValidationError(
      `Expected 4 foundation piles, got ${foundationPiles.length}`
    );
  }

  try {
    return foundationPiles.every(pile => pile.isComplete());
  } catch (error) {
    throw new GameValidationError(
      `Game won check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validates the complete game state for consistency and rule compliance.
 * Performs comprehensive validation of all game components and their relationships.
 *
 * @param gameState - Complete game state to validate
 * @returns Validation result with success status and details
 * @throws {GameValidationError} If game state parameter is invalid
 */
export function validateGameState(gameState: GameState): ValidationResult {
  if (!gameState) {
    throw new GameValidationError('Game state cannot be null or undefined');
  }

  try {
    // Validate basic game state structure
    if (!gameState.id || typeof gameState.id !== 'string') {
      return {
        valid: false,
        error: 'Game state must have a valid ID',
        context: { id: gameState.id },
      };
    }

    if (!Object.values(GamePhase).includes(gameState.phase)) {
      return {
        valid: false,
        error: `Invalid game phase: ${gameState.phase}`,
        context: { phase: gameState.phase },
      };
    }

    // Validate tableau structure
    if (!Array.isArray(gameState.tableau) || gameState.tableau.length !== 7) {
      return {
        valid: false,
        error: `Tableau must have exactly 7 columns, got ${gameState.tableau?.length}`,
        context: { tableauLength: gameState.tableau?.length },
      };
    }

    // Validate foundation structure
    if (
      !Array.isArray(gameState.foundation) ||
      gameState.foundation.length !== 4
    ) {
      return {
        valid: false,
        error: `Foundation must have exactly 4 piles, got ${gameState.foundation?.length}`,
        context: { foundationLength: gameState.foundation?.length },
      };
    }

    // Validate stock pile structure
    if (!gameState.stock) {
      return {
        valid: false,
        error: 'Game state must have a stock pile',
        context: { stock: gameState.stock },
      };
    }

    // Count total cards to ensure we have exactly 52
    let totalCards = 0;

    // Count tableau cards
    for (const column of gameState.tableau) {
      if (!Array.isArray(column.cards)) {
        return {
          valid: false,
          error: `Tableau column ${column.id} must have cards array`,
          context: { columnId: column.id },
        };
      }
      totalCards += column.cards.length;
    }

    // Count foundation cards
    for (const pile of gameState.foundation) {
      if (!Array.isArray(pile.cards)) {
        return {
          valid: false,
          error: `Foundation pile ${pile.id} must have cards array`,
          context: { pileId: pile.id },
        };
      }
      totalCards += pile.cards.length;
    }

    // Count stock and waste cards
    if (Array.isArray(gameState.stock.cards)) {
      totalCards += gameState.stock.cards.length;
    }
    if (Array.isArray(gameState.stock.wasteCards)) {
      totalCards += gameState.stock.wasteCards.length;
    }

    if (totalCards !== 52) {
      return {
        valid: false,
        error: `Game must have exactly 52 cards, found ${totalCards}`,
        context: { totalCards },
      };
    }

    // Validate game statistics
    if (!gameState.statistics) {
      return {
        valid: false,
        error: 'Game state must have statistics',
        context: { statistics: gameState.statistics },
      };
    }

    if (
      typeof gameState.statistics.moveCount !== 'number' ||
      gameState.statistics.moveCount < 0
    ) {
      return {
        valid: false,
        error: 'Move count must be a non-negative number',
        context: { moveCount: gameState.statistics.moveCount },
      };
    }

    // Validate timestamps
    if (typeof gameState.startTime !== 'number' || gameState.startTime <= 0) {
      return {
        valid: false,
        error: 'Start time must be a positive number',
        context: { startTime: gameState.startTime },
      };
    }

    if (
      gameState.endTime !== undefined &&
      (typeof gameState.endTime !== 'number' ||
        gameState.endTime < gameState.startTime)
    ) {
      return {
        valid: false,
        error: 'End time must be after start time',
        context: { startTime: gameState.startTime, endTime: gameState.endTime },
      };
    }

    return { valid: true };
  } catch (error) {
    throw new GameValidationError(
      `Game state validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { gameState }
    );
  }
}

// Export all validation functions
export {
  validateTableauMove,
  validateFoundationMove,
  validateStockPileOperation,
  isValidCardSequence,
  canPlaceOnFoundation,
  canPlaceOnTableau,
  isGameWon,
  validateGameState,
  GameValidationError,
  type ValidationResult,
};
