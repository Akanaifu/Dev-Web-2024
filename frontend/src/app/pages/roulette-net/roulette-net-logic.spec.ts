import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouletteNetLogic } from './roulette-net-logic';
import { BettingBoardCell } from './betting-board.model';
import { IUser } from '../../interfaces/User.interface';
import { IRouletteResult } from '../../interfaces/Roulette-Net-Resultat.interface';

"il faut que je regarde pourquoi ça ne fonctionne pas"
describe('RouletteNetLogic', () => {
  let service: RouletteNetLogic;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RouletteNetLogic]
    });
    
    service = TestBed.inject(RouletteNetLogic);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchIUser', () => {
    it('should fetch user data and update currentUser', () => {
      const mockUser: IUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        solde: 2000
      };

      service.fetchIUser();

      const req = httpMock.expectOne('http://localhost:3000/get_id/info');
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);

      expect(service.currentUser).toEqual(mockUser);
      expect(service.bankValue).toBe(2000);
    });

    it('should handle errors when fetching user data', () => {
      service.fetchIUser();

      const req = httpMock.expectOne('http://localhost:3000/get_id/info');
      req.error(new ErrorEvent('Network error'));

      expect(service.currentUser).toBeNull();
    });
  });

  describe('resetGame', () => {
    it('should reset game with default values', () => {
      // Définir des valeurs initiales
      service.bankValue = 500;
      service.currentBet = 50;
      service.wager = 10;
      service.bet = [{ amt: 20, type: 'straight', odds: 35, numbers: '5' }];
      service.numbersBet = [5];
      service.previousNumbers = [12, 15, 7];

      // Réinitialiser le jeu
      service.resetGame();

      // Vérifier les valeurs par défaut quand aucun utilisateur n'est connecté
      expect(service.bankValue).toBe(1000);
      expect(service.currentBet).toBe(0);
      expect(service.wager).toBe(5);
      expect(service.bet).toEqual([]);
      expect(service.numbersBet).toEqual([]);
      expect(service.previousNumbers).toEqual([]);
    });

    it('should reset game with user values', () => {
      // Simuler un utilisateur connecté
      service.currentUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        solde: 3000
      };

      // Définir des valeurs initiales
      service.bankValue = 500;
      service.currentBet = 50;
      service.bet = [{ amt: 20, type: 'straight', odds: 35, numbers: '5' }];

      // Réinitialiser le jeu
      service.resetGame();

      // Vérifier que les valeurs sont réinitialisées avec le solde utilisateur
      expect(service.bankValue).toBe(3000);
      expect(service.currentBet).toBe(0);
      expect(service.bet).toEqual([]);
    });
  });

  describe('clearBet', () => {
    it('should clear all bets', () => {
      // Définir des mises initiales
      service.bet = [
        { amt: 20, type: 'straight', odds: 35, numbers: '5' },
        { amt: 10, type: 'split', odds: 17, numbers: '7, 8' }
      ];
      service.numbersBet = [5, 7, 8];

      // Effacer les mises
      service.clearBet();

      // Vérifier que les mises sont effacées
      expect(service.bet).toEqual([]);
      expect(service.numbersBet).toEqual([]);
    });
  });

  describe('setBet', () => {
    it('should add a new bet correctly', () => {
      // Configurer des valeurs initiales
      service.bankValue = 1000;
      service.currentBet = 0;
      service.wager = 10;
      service.bet = [];
      service.numbersBet = [];

      // Créer une cellule pour miser
      const cell: BettingBoardCell = {
        label: 'Straight Up 5',
        numbers: [5],
        type: 'straight',
        odds: 35
      };

      // Placer la mise
      service.setBet(cell);

      // Vérifier que la mise a été placée correctement
      expect(service.bankValue).toBe(990);
      expect(service.currentBet).toBe(10);
      expect(service.bet).toEqual([{ amt: 10, type: 'straight', odds: 35, numbers: '5' }]);
      expect(service.numbersBet).toEqual([5]);
    });

    it('should add to an existing bet', () => {
      // Configurer des valeurs initiales avec une mise existante
      service.bankValue = 1000;
      service.currentBet = 10;
      service.wager = 5;
      service.bet = [{ amt: 10, type: 'straight', odds: 35, numbers: '5' }];
      service.numbersBet = [5];

      // Créer la même cellule pour miser à nouveau
      const cell: BettingBoardCell = {
        label: 'Straight Up 5',
        numbers: [5],
        type: 'straight',
        odds: 35
      };

      // Placer une autre mise sur la même cellule
      service.setBet(cell);

      // Vérifier que la mise a été mise à jour correctement
      expect(service.bankValue).toBe(995);
      expect(service.currentBet).toBe(15);
      expect(service.bet).toEqual([{ amt: 15, type: 'straight', odds: 35, numbers: '5' }]);
      expect(service.numbersBet).toEqual([5]);
    });

    it('should not place bet if wager is 0', () => {
      // Configurer des valeurs initiales
      service.bankValue = 0;
      service.currentBet = 0;
      service.wager = 5;
      service.bet = [];

      // Créer une cellule pour miser
      const cell: BettingBoardCell = {
        label: 'Straight Up 5',
        numbers: [5],
        type: 'straight',
        odds: 35
      };

      // Essayer de placer une mise
      service.setBet(cell);

      // Vérifier qu'aucune mise n'a été placée
      expect(service.bankValue).toBe(0);
      expect(service.currentBet).toBe(0);
      expect(service.bet).toEqual([]);
    });
  });

  describe('removeBet', () => {
    it('should remove part of a bet', () => {
      // Configurer des valeurs initiales avec une mise existante
      service.bankValue = 990;
      service.currentBet = 10;
      service.wager = 5;
      service.bet = [{ amt: 10, type: 'straight', odds: 35, numbers: '5' }];

      // Créer la cellule pour retirer la mise
      const cell: BettingBoardCell = {
        label: 'Straight Up 5',
        numbers: [5],
        type: 'straight',
        odds: 35
      };

      // Retirer une partie de la mise
      service.removeBet(cell);

      // Vérifier que la mise a été mise à jour correctement
      expect(service.bankValue).toBe(995);
      expect(service.currentBet).toBe(5);
      expect(service.bet).toEqual([{ amt: 5, type: 'straight', odds: 35, numbers: '5' }]);
    });

    it('should remove entire bet if amount equals wager', () => {
      // Configurer des valeurs initiales avec une mise existante
      service.bankValue = 995;
      service.currentBet = 5;
      service.wager = 5;
      service.bet = [{ amt: 5, type: 'straight', odds: 35, numbers: '5' }];

      // Créer la cellule pour retirer la mise
      const cell: BettingBoardCell = {
        label: 'Straight Up 5',
        numbers: [5],
        type: 'straight',
        odds: 35
      };

      // Retirer la mise
      service.removeBet(cell);

      // Vérifier que la mise a été complètement supprimée
      expect(service.bankValue).toBe(1000);
      expect(service.currentBet).toBe(0);
      expect(service.bet).toEqual([]);
    });
  });

  describe('win', () => {
    it('should calculate win amounts correctly', () => {
      // Configurer les mises
      service.bankValue = 980;
      service.bet = [
        { amt: 10, type: 'straight', odds: 35, numbers: '5' },
        { amt: 10, type: 'split', odds: 17, numbers: '7, 8' }
      ];

      // Gain sur le numéro 5
      const result = service.win(5);

      // Vérifier le calcul des gains
      expect(result.winValue).toBe(350); // 10 * 35
      expect(result.betTotal).toBe(10);
      expect(result.payout).toBe(360); // 350 + 10
      expect(service.bankValue).toBe(1340); // 980 + 360
    });

    it('should return zero for no wins', () => {
      // Configurer les mises
      service.bankValue = 980;
      service.bet = [
        { amt: 10, type: 'straight', odds: 35, numbers: '5' },
        { amt: 10, type: 'split', odds: 17, numbers: '7, 8' }
      ];

      // Pas de gain sur le numéro 10
      const result = service.win(10);

      // Vérifier l'absence de gain
      expect(result.winValue).toBe(0);
      expect(result.betTotal).toBe(0);
      expect(result.payout).toBe(0);
      expect(service.bankValue).toBe(980); // Inchangé
    });
  });

  describe('getNumberColor', () => {
    it('should return correct color for number', () => {
      expect(service.getNumberColor(0)).toBe('green');
      expect(service.getNumberColor(1)).toBe('red');
      expect(service.getNumberColor(2)).toBe('black');
      expect(service.getNumberColor(36)).toBe('red');
    });
  });

  describe('getSectionColor', () => {
    it('should return correct color code for section', () => {
      expect(service.getSectionColor(0)).toBe('#016D29'); // vert
      expect(service.getSectionColor(1)).toBe('#E0080B'); // rouge
      expect(service.getSectionColor(2)).toBe('#000'); // noir
    });
  });

  describe('getChipColorClass', () => {
    it('should return correct chip color class', () => {
      expect(service.getChipColorClass(3)).toBe('red');
      expect(service.getChipColorClass(7)).toBe('blue');
      expect(service.getChipColorClass(50)).toBe('orange');
      expect(service.getChipColorClass(500)).toBe('gold');
    });
  });

  describe('getBetForCell', () => {
    it('should find correct bet for cell', () => {
      // Configurer les mises
      service.bet = [
        { amt: 10, type: 'straight', odds: 35, numbers: '5' },
        { amt: 5, type: 'split', odds: 17, numbers: '7, 8' }
      ];

      // Créer les cellules
      const cell1: BettingBoardCell = {
        label: 'Straight Up 5',
        numbers: [5],
        type: 'straight',
        odds: 35
      };

      const cell2: BettingBoardCell = {
        label: 'Split 7-8',
        numbers: [7, 8],
        type: 'split',
        odds: 17
      };

      const cell3: BettingBoardCell = {
        label: 'Straight Up 9',
        numbers: [9],
        type: 'straight',
        odds: 35
      };

      // Vérifier les mises
      expect(service.getBetForCell(cell1)).toEqual({ amt: 10, type: 'straight', odds: 35, numbers: '5' });
      expect(service.getBetForCell(cell2)).toEqual({ amt: 5, type: 'split', odds: 17, numbers: '7, 8' });
      expect(service.getBetForCell(cell3)).toBeNull();
    });
  });

  describe('spin', () => {
    it('should make API request to spin the roulette', async () => {
      // Simuler fetch global
      const mockResponse: IRouletteResult = { number: 17, color: 'black' };
      spyOn(window, 'fetch').and.returnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        } as Response)
      );

      const result = await service.spin();
      
      // Vérifier que fetch a été appelé avec les bons paramètres
      expect(window.fetch).toHaveBeenCalledWith('/api/roulette/spin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: undefined })
      });
      
      expect(result).toEqual(mockResponse);
    });

    it('should include userId when user is logged in', async () => {
      // Définir un utilisateur connecté
      service.currentUser = {
        user_id: 42,
        username: 'testuser',
        email: 'test@example.com',
        solde: 3000
      };

      // Simuler fetch global
      const mockResponse: IRouletteResult = { number: 17, color: 'black' };
      spyOn(window, 'fetch').and.returnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        } as Response)
      );

      await service.spin();
      
      // Vérifier que fetch a inclus l'ID utilisateur
      expect(window.fetch).toHaveBeenCalledWith('/api/roulette/spin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 42 })
      });
    });

    it('should handle API errors', async () => {
      // Simuler fetch avec erreur
      spyOn(window, 'fetch').and.returnValue(
        Promise.resolve({
          ok: false,
          status: 500
        } as Response)
      );

      try {
        await service.spin();
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Failed to spin the roulette');
      }
    });
  });
}); 
// il faut que je repartisse en plusieurs fichiers les tests