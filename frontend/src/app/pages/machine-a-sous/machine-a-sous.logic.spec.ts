import { MachineASousLogic } from './machine-a-sous.logic';

describe('MachineASousLogic', () => {
  let logic: MachineASousLogic;
  let dbMock: any;
  let newGameServiceMock: any;
  let httpMock: any;

  beforeEach(() => {
    dbMock = {};
    newGameServiceMock = {
      addNewGame: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
    };
    httpMock = { get: jest.fn().mockReturnValue({ subscribe: jest.fn() }) };
    logic = new MachineASousLogic(dbMock, newGameServiceMock, httpMock);
  });

  it('should be created', () => {
    expect(logic).toBeTruthy();
  });

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

  it('checkCombination should set highlightCombination', () => {
    logic.afficheurs[0].currentChiffre = 7;
    logic.afficheurs[1].currentChiffre = 7;
    logic.afficheurs[2].currentChiffre = 7;
    logic.checkCombination();
    expect(logic.highlightCombination).toContain('combo-1');
  });

  it('addNewGameToBackend should call newGameService.addNewGame', () => {
    logic.addNewGameToBackend('1', 100, [1, 2, 3], '2024-01-01');
    expect(newGameServiceMock.addNewGame).toHaveBeenCalled();
  });
});
