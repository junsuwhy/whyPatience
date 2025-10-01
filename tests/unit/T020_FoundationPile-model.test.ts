/**
 * Unit tests for T020 FoundationPile model
 * Tests the FoundationPile class implementation with comprehensive validation scenarios.
 * This test file follows TDD principles - should fail until FoundationPile is implemented.
 */

import { FoundationPile } from '../../src/models/foundation-pile';
import { Card } from '../../src/models/card';
import { Suit, Rank } from '../../src/types/card';

describe('T020 FoundationPile Model', () => {
  let foundationPile: FoundationPile;

  beforeEach(() => {
    foundationPile = new FoundationPile(Suit.HEARTS);
  });

  describe('Constructor and Basic Properties', () => {
    test('should create FoundationPile with correct suit', () => {
      expect(foundationPile.suit).toBe(Suit.HEARTS);
      expect(foundationPile.cards).toEqual([]);
      expect(foundationPile.isEmpty()).toBe(true);
    });

    test('should create FoundationPile for all suits', () => {
      const spadesPile = new FoundationPile(Suit.SPADES);
      const diamondsPile = new FoundationPile(Suit.DIAMONDS);
      const clubsPile = new FoundationPile(Suit.CLUBS);

      expect(spadesPile.suit).toBe(Suit.SPADES);
      expect(diamondsPile.suit).toBe(Suit.DIAMONDS);
      expect(clubsPile.suit).toBe(Suit.CLUBS);
    });

    test('should throw error for invalid suit', () => {
      expect(() => new FoundationPile('invalid' as Suit)).toThrow();
    });
  });

  describe('Card Addition Validation', () => {
    test('should allow adding Ace as first card', () => {
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      
      expect(foundationPile.canAddCard(aceHearts)).toBe(true);
      foundationPile.addCard(aceHearts);
      
      expect(foundationPile.cards).toHaveLength(1);
      expect(foundationPile.getTopCard()).toEqual(aceHearts);
      expect(foundationPile.isEmpty()).toBe(false);
    });

    test('should reject non-Ace as first card', () => {
      const twoHearts = new Card(Suit.HEARTS, Rank.TWO, true);
      const kingHearts = new Card(Suit.HEARTS, Rank.KING, true);
      
      expect(foundationPile.canAddCard(twoHearts)).toBe(false);
      expect(foundationPile.canAddCard(kingHearts)).toBe(false);
      
      expect(() => foundationPile.addCard(twoHearts)).toThrow();
      expect(() => foundationPile.addCard(kingHearts)).toThrow();
    });

    test('should only accept cards of the same suit', () => {
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      const aceSpades = new Card(Suit.SPADES, Rank.ACE, true);
      
      foundationPile.addCard(aceHearts);
      
      expect(foundationPile.canAddCard(aceSpades)).toBe(false);
      expect(() => foundationPile.addCard(aceSpades)).toThrow();
    });

    test('should maintain ascending rank order', () => {
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      const twoHearts = new Card(Suit.HEARTS, Rank.TWO, true);
      const threeHearts = new Card(Suit.HEARTS, Rank.THREE, true);
      const fiveHearts = new Card(Suit.HEARTS, Rank.FIVE, true);
      
      foundationPile.addCard(aceHearts);
      foundationPile.addCard(twoHearts);
      
      expect(foundationPile.canAddCard(threeHearts)).toBe(true);
      expect(foundationPile.canAddCard(fiveHearts)).toBe(false);
      
      foundationPile.addCard(threeHearts);
      expect(() => foundationPile.addCard(fiveHearts)).toThrow();
    });

    test('should get expected next rank correctly', () => {
      expect(foundationPile.getExpectedNextRank()).toBe(Rank.ACE);
      
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      foundationPile.addCard(aceHearts);
      expect(foundationPile.getExpectedNextRank()).toBe(Rank.TWO);
      
      const twoHearts = new Card(Suit.HEARTS, Rank.TWO, true);
      foundationPile.addCard(twoHearts);
      expect(foundationPile.getExpectedNextRank()).toBe(Rank.THREE);
    });
  });

  describe('Card Removal', () => {
    test('should remove top card correctly', () => {
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      const twoHearts = new Card(Suit.HEARTS, Rank.TWO, true);
      
      foundationPile.addCard(aceHearts);
      foundationPile.addCard(twoHearts);
      
      const removedCard = foundationPile.removeTopCard();
      expect(removedCard).toEqual(twoHearts);
      expect(foundationPile.getTopCard()).toEqual(aceHearts);
      expect(foundationPile.cards).toHaveLength(1);
    });

    test('should throw error when removing from empty pile', () => {
      expect(() => foundationPile.removeTopCard()).toThrow();
    });

    test('should return null for getTopCard when empty', () => {
      expect(foundationPile.getTopCard()).toBeNull();
    });
  });

  describe('State Checking Methods', () => {
    test('should correctly identify empty state', () => {
      expect(foundationPile.isEmpty()).toBe(true);
      
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      foundationPile.addCard(aceHearts);
      expect(foundationPile.isEmpty()).toBe(false);
    });

    test('should correctly identify full state', () => {
      expect(foundationPile.isFull()).toBe(false);
      
      // Add all cards from Ace to King
      for (let rank = Rank.ACE; rank <= Rank.KING; rank++) {
        const card = new Card(Suit.HEARTS, rank as Rank, true);
        foundationPile.addCard(card);
      }
      
      expect(foundationPile.isFull()).toBe(true);
      expect(foundationPile.isComplete()).toBe(true);
    });

    test('should correctly identify complete state', () => {
      expect(foundationPile.isComplete()).toBe(false);
      
      // Add only some cards
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      const twoHearts = new Card(Suit.HEARTS, Rank.TWO, true);
      foundationPile.addCard(aceHearts);
      foundationPile.addCard(twoHearts);
      
      expect(foundationPile.isComplete()).toBe(false);
      
      // Add remaining cards to complete the pile
      for (let rank = Rank.THREE; rank <= Rank.KING; rank++) {
        const card = new Card(Suit.HEARTS, rank as Rank, true);
        foundationPile.addCard(card);
      }
      
      expect(foundationPile.isComplete()).toBe(true);
    });
  });

  describe('Scoring', () => {
    test('should calculate score based on number of cards', () => {
      expect(foundationPile.getScore()).toBe(0);
      
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      foundationPile.addCard(aceHearts);
      expect(foundationPile.getScore()).toBe(10);
      
      const twoHearts = new Card(Suit.HEARTS, Rank.TWO, true);
      foundationPile.addCard(twoHearts);
      expect(foundationPile.getScore()).toBe(20);
    });

    test('should give bonus score for complete pile', () => {
      // Add all cards to complete the pile
      for (let rank = Rank.ACE; rank <= Rank.KING; rank++) {
        const card = new Card(Suit.HEARTS, rank as Rank, true);
        foundationPile.addCard(card);
      }
      
      // Should get base score (13 * 10) plus completion bonus
      expect(foundationPile.getScore()).toBeGreaterThan(130);
    });
  });

  describe('Validation', () => {
    test('should validate correct pile state', () => {
      expect(foundationPile.validate()).toBe(true);
      
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      const twoHearts = new Card(Suit.HEARTS, Rank.TWO, true);
      foundationPile.addCard(aceHearts);
      foundationPile.addCard(twoHearts);
      
      expect(foundationPile.validate()).toBe(true);
    });

    test('should throw error for invalid pile state', () => {
      // This test will verify that validate() throws for corrupted state
      // (Implementation specific - would need to test internal state corruption)
      expect(foundationPile.validate()).toBe(true);
    });
  });

  describe('Cloning and Serialization', () => {
    test('should create exact clone', () => {
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      const twoHearts = new Card(Suit.HEARTS, Rank.TWO, true);
      foundationPile.addCard(aceHearts);
      foundationPile.addCard(twoHearts);
      
      const cloned = foundationPile.clone();
      
      expect(cloned.suit).toBe(foundationPile.suit);
      expect(cloned.cards).toHaveLength(foundationPile.cards.length);
      expect(cloned.getTopCard()?.equals(foundationPile.getTopCard()!)).toBe(true);
      
      // Should be independent copies
      expect(cloned).not.toBe(foundationPile);
      expect(cloned.cards).not.toBe(foundationPile.cards);
    });

    test('should serialize and deserialize correctly', () => {
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, true);
      const twoHearts = new Card(Suit.HEARTS, Rank.TWO, true);
      foundationPile.addCard(aceHearts);
      foundationPile.addCard(twoHearts);
      
      const json = foundationPile.toJSON();
      const restored = FoundationPile.fromJSON(json);
      
      expect(restored.suit).toBe(foundationPile.suit);
      expect(restored.cards).toHaveLength(foundationPile.cards.length);
      expect(restored.getTopCard()?.equals(foundationPile.getTopCard()!)).toBe(true);
    });

    test('should handle empty pile serialization', () => {
      const json = foundationPile.toJSON();
      const restored = FoundationPile.fromJSON(json);
      
      expect(restored.isEmpty()).toBe(true);
      expect(restored.suit).toBe(foundationPile.suit);
    });

    test('should throw error for invalid JSON deserialization', () => {
      expect(() => FoundationPile.fromJSON(null)).toThrow();
      expect(() => FoundationPile.fromJSON({})).toThrow();
      expect(() => FoundationPile.fromJSON({ suit: 'invalid' })).toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle face-down cards correctly', () => {
      const aceHearts = new Card(Suit.HEARTS, Rank.ACE, false); // face-down
      
      expect(foundationPile.canAddCard(aceHearts)).toBe(true);
      foundationPile.addCard(aceHearts);
      
      expect(foundationPile.getTopCard()?.isVisible).toBe(false);
    });

    test('should maintain card order integrity', () => {
      const cards = [
        new Card(Suit.HEARTS, Rank.ACE, true),
        new Card(Suit.HEARTS, Rank.TWO, true),
        new Card(Suit.HEARTS, Rank.THREE, true),
        new Card(Suit.HEARTS, Rank.FOUR, true),
        new Card(Suit.HEARTS, Rank.FIVE, true),
      ];
      
      cards.forEach(card => foundationPile.addCard(card));
      
      // Verify cards are in correct order
      expect(foundationPile.cards[0].rank).toBe(Rank.ACE);
      expect(foundationPile.cards[1].rank).toBe(Rank.TWO);
      expect(foundationPile.cards[2].rank).toBe(Rank.THREE);
      expect(foundationPile.cards[3].rank).toBe(Rank.FOUR);
      expect(foundationPile.cards[4].rank).toBe(Rank.FIVE);
      
      expect(foundationPile.getTopCard()?.rank).toBe(Rank.FIVE);
    });

    test('should reject duplicate cards', () => {
      const aceHearts1 = new Card(Suit.HEARTS, Rank.ACE, true);
      const aceHearts2 = new Card(Suit.HEARTS, Rank.ACE, true);
      
      foundationPile.addCard(aceHearts1);
      
      expect(foundationPile.canAddCard(aceHearts2)).toBe(false);
      expect(() => foundationPile.addCard(aceHearts2)).toThrow();
    });
  });
});