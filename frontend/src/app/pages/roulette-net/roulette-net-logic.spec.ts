/**
 * Tests Jest pour RouletteNetLogic - Jest pur uniquement
 * Conversion complète de Jasmine vers Jest
 */

import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { RouletteNetLogic } from './roulette-net-logic';
import { environment } from '../../../environments/environments.prod';


// Types pour TypeScript
interface IUser {
  user_id: number;
  username: string;
  email: string;
  solde: number;
}

interface IBettingBoardCell {
  label: string;
  numbers: number[];
  type: 'straight' | 'split' | 'street' | 'corner' | 'line' | 'dozen' | 'column' | 'red' | 'black' | 'odd' | 'even' | 'high' | 'low';
  odds: number;
}

interface IRouletteResult {
  number: number;
  color: string;
}


describe('🎰 RouletteNetLogic - Jest pur', () => {
  let service: RouletteNetLogic;
  let httpClientMock: jest.Mocked<HttpClient>;
  const BASE_URL = environment.production ? '/api' : 'http://localhost:3000/api';

  beforeEach(() => {
    // Créer un mock HttpClient avec Jest
    httpClientMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        RouletteNetLogic,
        { provide: HttpClient, useValue: httpClientMock }
      ]
    });
    
    service = TestBed.inject(RouletteNetLogic);

    // Mock global fetch avec Jest
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialisation', () => {
    test('should initialize with correct default values', () => {
      expect(service.wager).toBe(5);
      expect(service.selectedChipIndex).toBe(1);
      expect(service.currentBet).toBe(0);
      expect(service.isSpinning).toBe(false);
      expect(service.currentUser).toBeUndefined();
    });

    test('should have correct chip values', () => {
      expect(service.chipValues).toEqual([1, 5, 10, 100, 'clear']);
      expect(service.chipColors).toEqual(['red', 'blue', 'orange', 'gold', 'clearBet']);
    });

    test('should have correct red numbers for European roulette', () => {
      const expectedRedNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
      expect(service.numRed).toEqual(expectedRedNumbers);
    });
  });

  describe('Validation', () => {
    test('should validate currentBet (always >= 0)', () => {
      service.currentBet = 100;
      expect(service.currentBet).toBe(100);
      
      service.currentBet = -50;
      expect(service.currentBet).toBe(0);
    });

    test('should validate wager (always >= 1)', () => {
      service.wager = 25;
      expect(service.wager).toBe(25);
      
      service.wager = 0;
      expect(service.wager).toBe(1);
      
      service.wager = -10;
      expect(service.wager).toBe(1);
    });
  });

  describe('Utility methods', () => {
    test('should return correct color for numbers', () => {
      expect(service.getNumberColor(0)).toBe('green');
      expect(service.getNumberColor(1)).toBe('red');
      expect(service.getNumberColor(2)).toBe('black');
      expect(service.getNumberColor(32)).toBe('red');
      expect(service.getNumberColor(33)).toBe('black');
    });

    test('should return wheel numbers in correct order', () => {
      const wheelNumbers = service.getWheelNumbers();
      expect(wheelNumbers.length).toBe(37);
      expect(wheelNumbers[0]).toBe(0);
      expect(wheelNumbers).toContain(36);
    });
  });

  describe('Betting', () => {
    let mockUser: IUser;
    let mockCell: IBettingBoardCell;

    beforeEach(() => {
      mockUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        solde: 1000
      };
      
      mockCell = {
        label: 'Number 7',
        numbers: [7],
        type: 'straight',
        odds: 35
      };

      service.currentUser = mockUser;
      service.wager = 25;
    });

    test('should place a bet correctly', () => {
      const initialBalance = mockUser.solde;
      const wagerAmount = service.wager;

      service.setBet(mockCell);

      expect(mockUser.solde).toBe(initialBalance - wagerAmount);
      expect(service.currentBet).toBe(wagerAmount);
      expect(service.bet.length).toBe(1);
      expect(service.bet[0]).toEqual({
        label: 'Number 7',
        numbers: '7',
        type: 'straight',
        odds: 35,
        amt: wagerAmount
      });
    });

    test('should not place bet with insufficient balance', () => {
      mockUser.solde = 0;
      service.wager = 25;

      service.setBet(mockCell);

      expect(service.bet.length).toBe(0);
      expect(service.currentBet).toBe(0);
    });

    test('should not place bet without logged user', () => {
      service.currentUser = undefined;

      service.setBet(mockCell);

      expect(service.bet.length).toBe(0);
      expect(service.currentBet).toBe(0);
    });
  });

  describe('HTTP Methods', () => {
    let mockUser: IUser;

    beforeEach(() => {
      mockUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        solde: 1000
      };
      service.currentUser = mockUser;
    });

    test('should fetch user data', () => {
      const mockUserData: IUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        solde: 1500
      };

      httpClientMock.get.mockReturnValue(of(mockUserData));

      service.fetchIUser();

      expect(httpClientMock.get).toHaveBeenCalledWith(
        `${BASE_URL}/get_id/info`,
        { withCredentials: true }
      );
    });

    test('should handle fetch user errors', (done) => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      httpClientMock.get.mockReturnValue(throwError(() => new Error('Network error')));

      service.fetchIUser();

      setTimeout(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '❌ Erreur récupération utilisateur:',
          expect.any(Error)
        );
        consoleErrorSpy.mockRestore();
        done();
      }, 0);
    });

    test('should perform spin via API', async () => {
      const mockSpinResult: IRouletteResult = {
        number: 17,
        color: 'black'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSpinResult)
      });

      const result = await service.spin();

      expect(result).toEqual(mockSpinResult);
      expect(global.fetch).toHaveBeenCalledWith(`${BASE_URL}/api/roulette/spin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
    });

    test('should handle spin errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await service.spin();

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Erreur lors du spin:',
        expect.any(Error)
      );
      
      consoleErrorSpy.mockRestore();
    });

    test('should calculate winnings via API', async () => {
      const mockWinResult = {
        totalWin: 350,
        winningBets: [{ label: 'Number 7', amt: 10, win: 350 }]
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockWinResult)
      });

      const result = await service.calculateWin(7);

      expect(result).toEqual(mockWinResult);
      expect(global.fetch).toHaveBeenCalledWith('/api/roulette/calculate-win', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          winningNumber: 7,
          bets: service.bet
        })
      });
    });

    test('should handle win calculation errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await service.calculateWin(7);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Erreur calcul gains:',
        expect.any(Error)
      );
      
      consoleErrorSpy.mockRestore();
    });
  });
}); 