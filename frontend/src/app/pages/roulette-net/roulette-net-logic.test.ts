/**
 * Tests Jest pour RouletteNetLogic
 * Version ultra-simple pour éviter les conflits
 */

import { RouletteNetLogic } from './roulette-net-logic';

// Mock du module @angular/core pour que inject() fonctionne
jest.mock('@angular/core', () => ({
  Injectable: () => (target: any) => target,
  inject: (token: any) => {
    // Retourne un mock HttpClient complet
    return {
      get: jest.fn().mockReturnValue({
        subscribe: jest.fn().mockImplementation((config: any) => {
          // Appeler le callback next si fourni pour simuler une réponse
          if (config && config.next) {
            config.next({ user_id: 1, username: 'mock', email: 'mock@test.com', solde: 1000 });
          }
          return { unsubscribe: jest.fn() };
        })
      }),
      post: jest.fn().mockReturnValue({
        subscribe: jest.fn()
      })
    };
  }
}));

describe('RouletteNetLogic Jest Tests', () => {
  let service: RouletteNetLogic;

  beforeEach(() => {
    service = new RouletteNetLogic();
    global.fetch = jest.fn();
  });

  test('✅ Service should be created', () => {
    expect(service).toBeDefined();
  });

  test('✅ Should initialize with default values', () => {
    expect(service.wager).toBe(5);
    expect(service.selectedChipIndex).toBe(1);
    expect(service.currentBet).toBe(0);
    expect(service.isSpinning).toBe(false);
  });

  test('✅ Should have correct chip values', () => {
    expect(service.chipValues).toEqual([1, 5, 10, 100, 'clear']);
    expect(service.chipColors).toEqual(['red', 'blue', 'orange', 'gold', 'clearBet']);
  });

  test('✅ Should validate wager (always >= 1)', () => {
    service.wager = 25;
    expect(service.wager).toBe(25);
    
    service.wager = 0;
    expect(service.wager).toBe(1);
    
    service.wager = -10;
    expect(service.wager).toBe(1);
  });

  test('✅ Should validate currentBet (always >= 0)', () => {
    service.currentBet = 100;
    expect(service.currentBet).toBe(100);
    
    service.currentBet = -50;
    expect(service.currentBet).toBe(0);
  });

  test('✅ Should return correct color for numbers', () => {
    expect(service.getNumberColor(0)).toBe('green');
    expect(service.getNumberColor(1)).toBe('red');
    expect(service.getNumberColor(2)).toBe('black');
    expect(service.getNumberColor(32)).toBe('red');
    expect(service.getNumberColor(33)).toBe('black');
  });

  test('✅ Should return wheel numbers (37 total)', () => {
    const wheelNumbers = service.getWheelNumbers();
    expect(wheelNumbers.length).toBe(37);
    expect(wheelNumbers[0]).toBe(0);
    expect(wheelNumbers).toContain(36);
  });

  test('✅ Should not place bet without user', () => {
    const mockCell = {
      label: 'Test',
      numbers: [7],
      type: 'straight' as any,
      odds: 35
    };

    service.currentUser = undefined;
    service.setBet(mockCell);

    expect(service.bet.length).toBe(0);
    expect(service.currentBet).toBe(0);
  });

  test('✅ Should place bet with valid user', () => {
    const mockUser = {
      user_id: 1,
      username: 'test',
      email: 'test@test.com',
      solde: 1000
    };

    const mockCell = {
      label: 'Number 7',
      numbers: [7],
      type: 'straight' as any,
      odds: 35
    };

    service.currentUser = mockUser;
    service.wager = 25;
    
    service.setBet(mockCell);

    expect(mockUser.solde).toBe(975);
    expect(service.currentBet).toBe(25);
    expect(service.bet.length).toBe(1);
  });

  test('✅ Should have correct red numbers for European roulette', () => {
    const expectedRedNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    expect(service.numRed).toEqual(expectedRedNumbers);
  });

  test('✅ Should have correct wheel layout', () => {
    const expectedWheelNumbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    expect(service.wheelnumbersAC).toEqual(expectedWheelNumbers);
  });
}); 