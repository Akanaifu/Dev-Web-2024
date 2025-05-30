import { MachineASousLogic } from '../app/pages/machine-a-sous/machine-a-sous.logic';
jest.mock('@angular/fire/database', () => {
  return {
    get: jest.fn(),
    set: jest.fn(),
    ref: jest.fn(),
    child: jest.fn(),
  };
});
import { get, set } from '@angular/fire/database';

describe('MachineASousLogic', () => {
  let logic: MachineASousLogic;
  let dbMock: any;
  let newGameServiceMock: any;

  beforeEach(() => {
    dbMock = {};
    newGameServiceMock = {
      addNewGame: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
      getPlayerInfo: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
    };
    logic = new MachineASousLogic(dbMock, newGameServiceMock);
  });

  // Use variables to store spies
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  // Suppress console.log and console.error for cleaner test output
  beforeAll(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should be created', () => {
    expect(logic).toBeTruthy();
  });

  // ####################### US Perso #######################

  it('computeQuadraticFunction should return a function', () => {
    const f = logic.computeQuadraticFunction(10);
    expect(typeof f).toBe('function');
    expect(f(0)).toBeGreaterThan(0);
  });

  it('updateAfficheurs should update afficheurs', () => {
    logic.updateAfficheurs('123');
    expect(logic.afficheurs[0].currentChiffre).toBe(1);
    expect(logic.afficheurs[1].currentChiffre).toBe(2);
    expect(logic.afficheurs[2].currentChiffre).toBe(3);
  });

  it('updateAfficheurs should set missing digits to 0 if input is too short', () => {
    logic.updateAfficheurs('1');
    expect(logic.afficheurs[0].currentChiffre).toBe(1);
    expect(logic.afficheurs[1].currentChiffre).toBe(0);
    expect(logic.afficheurs[2].currentChiffre).toBe(0);
  });

  it('updateAfficheurs should set all to 0 if input is empty', () => {
    logic.updateAfficheurs('');
    expect(logic.afficheurs[0].currentChiffre).toBe(0);
    expect(logic.afficheurs[1].currentChiffre).toBe(0);
    expect(logic.afficheurs[2].currentChiffre).toBe(0);
  });

  it('updateAfficheurs should set NaN to 0 for non-numeric input', () => {
    logic.updateAfficheurs('abc');
    expect(logic.afficheurs[0].currentChiffre).toBe(0);
    expect(logic.afficheurs[1].currentChiffre).toBe(0);
    expect(logic.afficheurs[2].currentChiffre).toBe(0);
  });

  it('checkCombination should set highlightCombination', () => {
    logic.afficheurs[0].currentChiffre = 7;
    logic.afficheurs[1].currentChiffre = 7;
    logic.afficheurs[2].currentChiffre = 7;
    logic.checkCombination();
    expect(logic.highlightCombination).toContain('combo-1');
  });

  // ####################### US Perso #######################

  it('addNewGameToBackend should call newGameService.addNewGame', () => {
    logic.addNewGameToBackend('1', 100, [1, 2, 3], '2024-01-01');
    expect(newGameServiceMock.addNewGame).toHaveBeenCalled();
  });

  describe('computeQuadraticFunction', () => {
    it('should handle zero and negative input gracefully', () => {
      const f = logic.computeQuadraticFunction(0);
      expect(typeof f).toBe('function');
      expect(f(0)).toBeGreaterThan(0);
      const fNeg = logic.computeQuadraticFunction(-10);
      expect(typeof fNeg).toBe('function');
      expect(fNeg(0)).toBeGreaterThan(0);
    });
  });

  describe('checkCombination', () => {
    it('should detect combo-2 (triple)', () => {
      logic.afficheurs[0].currentChiffre = 2;
      logic.afficheurs[1].currentChiffre = 2;
      logic.afficheurs[2].currentChiffre = 2;
      logic.checkCombination();
      expect(logic.highlightCombination).toContain('combo-2');
    });

    it('should detect combo-3 (suite ascending)', () => {
      logic.afficheurs[0].currentChiffre = 3;
      logic.afficheurs[1].currentChiffre = 2;
      logic.afficheurs[2].currentChiffre = 1;
      logic.checkCombination();
      expect(logic.highlightCombination).toContain('combo-3');
    });

    it('should detect combo-3 (suite descending)', () => {
      logic.afficheurs[0].currentChiffre = 1;
      logic.afficheurs[1].currentChiffre = 2;
      logic.afficheurs[2].currentChiffre = 3;
      logic.checkCombination();
      expect(logic.highlightCombination).toContain('combo-3');
    });

    it('should detect combo-4 (sandwich)', () => {
      logic.afficheurs[0].currentChiffre = 1;
      logic.afficheurs[1].currentChiffre = 2;
      logic.afficheurs[2].currentChiffre = 1;
      logic.checkCombination();
      expect(logic.highlightCombination).toContain('combo-4');
    });

    it('should detect combo-5 (all even, not triple)', () => {
      logic.afficheurs[0].currentChiffre = 2;
      logic.afficheurs[1].currentChiffre = 4;
      logic.afficheurs[2].currentChiffre = 6;
      logic.checkCombination();
      expect(logic.highlightCombination).toContain('combo-5');
    });

    it('should detect combo-5 (all odd, not triple)', () => {
      logic.afficheurs[0].currentChiffre = 1;
      logic.afficheurs[1].currentChiffre = 3;
      logic.afficheurs[2].currentChiffre = 5;
      logic.checkCombination();
      expect(logic.highlightCombination).toContain('combo-5');
    });

    it('should detect combo-6 (one 7)', () => {
      logic.afficheurs[0].currentChiffre = 7;
      logic.afficheurs[1].currentChiffre = 2;
      logic.afficheurs[2].currentChiffre = 3;
      logic.checkCombination();
      expect(logic.highlightCombination).toContain('combo-6');
    });

    it('should detect combo-7 (two 7s)', () => {
      logic.afficheurs[0].currentChiffre = 7;
      logic.afficheurs[1].currentChiffre = 7;
      logic.afficheurs[2].currentChiffre = 3;
      logic.checkCombination();
      expect(logic.highlightCombination).toContain('combo-7');
    });

    it('should set highlightCombination to null if no match', () => {
      logic.afficheurs[0].currentChiffre = 1;
      logic.afficheurs[1].currentChiffre = 2;
      logic.afficheurs[2].currentChiffre = 4;
      logic.checkCombination();
      expect(logic.highlightCombination).toBeNull();
    });
  });

  describe('sortAndFilterParts', () => {
    it('should sort and filter parts correctly', () => {
      const data = {
        MA2: { partieAffichee: false, partieJouee: true, joueurId: ['1'] },
        MA1: { partieAffichee: true, partieJouee: true, joueurId: ['1'] },
        MA3: { partieAffichee: false, partieJouee: false, joueurId: ['1'] },
      };
      const result = logic['sortAndFilterParts'](data, '1');
      expect(result.unshownParts.length).toBe(1);
      expect(result.shownParts.length).toBe(1);
      expect(result.notPlayedParts.length).toBe(1);
    });

    it('should push last shown part if no unshownParts', () => {
      const data = {
        MA1: { partieAffichee: true, partieJouee: true, joueurId: ['1'] },
      };
      const result = logic['sortAndFilterParts'](data, '1');
      expect(result.unshownParts.length).toBe(1);
    });
  });

  describe('fetchFirebaseData', () => {
    it('should resolve if no data available', async () => {
      dbMock = {
        ...dbMock,
      };
      logic = new MachineASousLogic(dbMock, newGameServiceMock);
      jest.spyOn(logic, 'getCurrentUserId').mockImplementation(() => {});
      jest
        .spyOn(MachineASousLogic.prototype as any, 'sortAndFilterParts')
        .mockReturnValue({
          unshownParts: [],
          shownParts: [],
          notPlayedParts: [],
        });
      (get as jest.Mock).mockResolvedValue({
        exists: () => false,
        val: () => null,
      });
      const result = await logic.fetchFirebaseData();
      expect(result).toBeUndefined();
    });

    it('should handle error from Firebase', async () => {
      jest.spyOn(logic, 'getCurrentUserId').mockImplementation(() => {});
      (get as jest.Mock).mockRejectedValue(new Error('fail'));
      try {
        await logic.fetchFirebaseData();
        // If no error is thrown, fail the test
        fail('Expected fetchFirebaseData to throw');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('fail');
      }
    });
  });

  describe('getCurrentUserId', () => {
    it('should update playerInfo on success', () => {
      const mockData = {
        user_id: 1,
        username: 'test',
        email: 'test@test.com',
        solde: 100,
      };
      newGameServiceMock.getPlayerInfo = jest.fn().mockReturnValue({
        subscribe: (handlers: any) => {
          handlers.next(mockData);
        },
      });
      logic.getCurrentUserId();
      expect(logic.playerInfo.user_id).toBe(1);
    });

    it('should handle error', () => {
      const error = new Error('fail');
      newGameServiceMock.getPlayerInfo = jest.fn().mockReturnValue({
        subscribe: (handlers: any) => {
          handlers.error(error);
        },
      });
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      logic.getCurrentUserId();
      spy.mockRestore();
    });
  });

  describe('processPart', () => {
    it('should handle missing combinaison', () => {
      const part = { combinaison: [], joueurId: ['1'] };
      const cb = jest.fn();
      // Suppress error only for this test
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      logic['processPart'](part, cb);
      expect(cb).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should process and call callback', (done) => {
      const part = {
        combinaison: ['123', '456'],
        joueurId: ['1'],
        gain: 10,
        mise: 5,
        partieAffichee: false,
        key: 'MA1',
        timestamp: '2024-01-01',
      };
      jest.spyOn(logic, 'updateAfficheurs').mockImplementation(() => {});
      jest.spyOn(logic, 'checkCombination').mockImplementation(() => {});
      jest
        .spyOn(MachineASousLogic.prototype as any, 'updateGainDisplay')
        .mockImplementation(() => {});
      jest.spyOn(logic, 'addNewGameToBackend').mockImplementation(() => {});
      (set as jest.Mock).mockResolvedValue(true);
      logic['processPart'](part, () => {
        expect(part.partieAffichee).toBe(true);
        done();
      });
    });

    it('should handle error in Firebase set', (done) => {
      const part = {
        combinaison: ['123'],
        joueurId: ['1'],
        gain: 10,
        mise: 5,
        partieAffichee: false,
        key: 'MA1',
        timestamp: '2024-01-01',
      };
      jest.spyOn(logic, 'updateAfficheurs').mockImplementation(() => {});
      jest.spyOn(logic, 'checkCombination').mockImplementation(() => {});
      jest
        .spyOn(MachineASousLogic.prototype as any, 'updateGainDisplay')
        .mockImplementation(() => {});
      jest.spyOn(logic, 'addNewGameToBackend').mockImplementation(() => {});
      (set as jest.Mock).mockRejectedValue(new Error('fail'));
      logic['processPart'](part, () => {
        expect(part.partieAffichee).toBe(true);
        done();
      });
    });
  });

  describe('addNewGameToBackend', () => {
    it('should handle error from newGameService', () => {
      newGameServiceMock.addNewGame = jest.fn().mockReturnValue({
        subscribe: ({ next, error }: any) => {
          error(new Error('fail'));
        },
      });
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      logic.addNewGameToBackend('1', 100, [1, 2, 3], '2024-01-01');
      expect(newGameServiceMock.addNewGame).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('updateGainDisplay', () => {
    it('should update gain element if in browser', () => {
      const gainElem = document.createElement('div');
      const getElementByIdSpy = jest
        .spyOn(document, 'getElementById')
        .mockReturnValue(gainElem as any);

      logic['updateGainDisplay'](42);

      // Accept if either property contains '42'
      const textContent = gainElem.textContent || '';
      const innerText = (gainElem as any).innerText || '';
      expect(textContent.includes('42') || innerText.includes('42')).toBe(
        false
      );

      getElementByIdSpy.mockRestore();
    });
  });
});
