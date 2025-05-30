/**
 * Suite de tests unitaires pour la logique de roulette (RouletteNetLogic).
 * 
 * Tests utilisant Jasmine/Karma avec Angular Testing Utilities
 * - Tests des méthodes du service RouletteNetLogic
 * - Mock des dépendances HTTP avec Jasmine
 * - Validation des comportements métier
 */

import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { RouletteNetLogic } from './roulette-net-logic';
import { IBettingBoardCell } from '../../interfaces/betting-board.interface';
import { IUser } from '../../interfaces/users.interface';
import { IRouletteResult } from '../../interfaces/roulette-net-resultat.interface';

describe('RouletteNetLogic', () => {
  let service: RouletteNetLogic;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('HttpClient', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [
        RouletteNetLogic,
        { provide: HttpClient, useValue: spy }
      ]
    });
    
    service = TestBed.inject(RouletteNetLogic);
    httpClientSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;

    // Mock global fetch
    spyOn(window, 'fetch' as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialisation', () => {
    it('should initialize with correct default values', () => {
      expect(service.wager).toBe(5);
      expect(service.selectedChipIndex).toBe(1);
      expect(service.currentBet).toBe(0);
      expect(service.isSpinning).toBe(false);
      expect(service.currentUser).toBeUndefined();
    });

    it('should have correct chip values', () => {
      expect(service.chipValues).toEqual([1, 5, 10, 100, 'clear']);
      expect(service.chipColors).toEqual(['red', 'blue', 'orange', 'gold', 'clearBet']);
    });

    it('should have correct red numbers for European roulette', () => {
      const expectedRedNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
      expect(service.numRed).toEqual(expectedRedNumbers);
    });
  });

  describe('Validation', () => {
    it('should validate currentBet (always >= 0)', () => {
      service.currentBet = 100;
      expect(service.currentBet).toBe(100);
      
      service.currentBet = -50;
      expect(service.currentBet).toBe(0);
    });

    it('should validate wager (always >= 1)', () => {
      service.wager = 25;
      expect(service.wager).toBe(25);
      
      service.wager = 0;
      expect(service.wager).toBe(1);
      
      service.wager = -10;
      expect(service.wager).toBe(1);
    });
  });

  describe('Utility methods', () => {
    it('should return correct color for numbers', () => {
      expect(service.getNumberColor(0)).toBe('green');
      expect(service.getNumberColor(1)).toBe('red');
      expect(service.getNumberColor(2)).toBe('black');
      expect(service.getNumberColor(32)).toBe('red');
      expect(service.getNumberColor(33)).toBe('black');
    });

    it('should return wheel numbers in correct order', () => {
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

    it('should place a bet correctly', () => {
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

    it('should not place bet with insufficient balance', () => {
      mockUser.solde = 0;
      service.wager = 25;

      service.setBet(mockCell);

      expect(service.bet.length).toBe(0);
      expect(service.currentBet).toBe(0);
    });

    it('should not place bet without logged user', () => {
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

    it('should fetch user data', () => {
      const mockUserData: IUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        solde: 1500
      };

      httpClientSpy.get.and.returnValue(of(mockUserData));

      service.fetchIUser();

      expect(httpClientSpy.get).toHaveBeenCalledWith(
        'http://localhost:3000/get_id/info',
        { withCredentials: true }
      );
    });

    it('should handle fetch user errors', () => {
      const consoleErrorSpy = spyOn(console, 'error');
      httpClientSpy.get.and.returnValue(throwError(() => new Error('Network error')));

      service.fetchIUser();

      setTimeout(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '❌ Erreur récupération utilisateur:',
          jasmine.any(Error)
        );
      }, 0);
    });

    it('should perform spin via API', async () => {
      const mockSpinResult: IRouletteResult = {
        number: 17,
        color: 'black'
      };

      (window.fetch as jasmine.Spy).and.returnValue(Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSpinResult)
      }));

      const result = await service.spin();

      expect(window.fetch).toHaveBeenCalledWith('/api/roulette/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1 })
      });

      expect(result).toEqual(mockSpinResult);
    });

    it('should handle spin errors', async () => {
      (window.fetch as jasmine.Spy).and.returnValue(Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      }));

      try {
        await service.spin();
        fail('Expected method to throw');
      } catch (error) {
        expect(error).toEqual(new Error('Échec du lancement de la roulette: 500 Internal Server Error'));
      }
    });

    it('should calculate winnings via API', async () => {
      const mockWinResponse = {
        winValue: 175,
        payout: 150,
        newsolde: 1150,
        betTotal: 25
      };

      service.bet = [{
        label: 'Number 7',
        numbers: '7',
        type: 'straight',
        odds: 35,
        amt: 25
      }];

      httpClientSpy.post.and.returnValue(of(mockWinResponse));

      const result = await service.win(7);

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/roulette/win',
        {
          winningSpin: 7,
          bets: service.bet,
          solde: (service as any)._originalSolde,
          userId: 1
        }
      );

      expect(result).toEqual(mockWinResponse);
    });

    it('should handle win calculation errors', async () => {
      httpClientSpy.post.and.returnValue(throwError(() => new Error('Server error')));

      try {
        await service.win(7);
        fail('Expected method to throw');
      } catch (error) {
        expect(error).toEqual(new Error('Server error'));
      }
    });
  });
}); 