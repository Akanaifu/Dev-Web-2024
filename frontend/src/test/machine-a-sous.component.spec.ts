import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Database } from '@angular/fire/database';

// Mock le module firebase/database AVANT tout import qui l'utilise
jest.mock('firebase/database', () => ({
  ref: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
  })),
  get: jest.fn(() => Promise.resolve({ exists: () => false, val: () => null })),
  child: jest.fn((ref: any, path: string) => ref),
}));

import * as database from 'firebase/database';
import { MachineASousComponent } from '../app/pages/machine-a-sous/machine-a-sous.component';
import { NewGameService } from '../app/services/machine-a-sous/new-game.service';
import { UserService } from '../app/services/user/user.service';

// Ajoute la définition de databaseMock ici
const databaseMock = {
  ref: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
  })),
};

// Suppress console.log and console.error for cleaner test output
let logSpy: jest.SpyInstance;
let warnSpy: jest.SpyInstance;
let errorSpy: jest.SpyInstance;

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

describe('MachineASousComponent', () => {
  let component: MachineASousComponent;
  let fixture: ComponentFixture<MachineASousComponent>;
  let newGameServiceMock: any;
  let userServiceMock: any;
  let dbMock: any;

  beforeEach(async () => {
    newGameServiceMock = {
      getPlayerInfo: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
    };
    dbMock = {};
    userServiceMock = { balanceChanged: { next: jest.fn() } };
    component = new MachineASousComponent(
      newGameServiceMock,
      dbMock as any,
      userServiceMock as any
    );

    await TestBed.configureTestingModule({
      imports: [MachineASousComponent],
      providers: [
        { provide: Database, useValue: databaseMock },
        { provide: NewGameService, useValue: newGameServiceMock },
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MachineASousComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggleTable should toggle showTable', () => {
    const initial = component.showTable;
    component.toggleTable();
    expect(component.showTable).toBe(!initial);
  });

  it('getCurrentChiffre should return a number', () => {
    const value = component.getCurrentChiffre('afficheur1');
    expect(typeof value).toBe('number');
  });

  it('sendPartieToFirebase should be defined', () => {
    expect(component.sendPartieToFirebase).toBeDefined();
  });

  it('getPlayerInfo should update playerInfo on success', () => {
    const mockData = { user_id: 1, username: 'u', email: 'e', solde: 10 };
    newGameServiceMock.getPlayerInfo = jest.fn().mockReturnValue({
      subscribe: ({ next }: any) => next(mockData),
    });
    component.getPlayerInfo();
    expect(component.playerInfo).toEqual(mockData);
  });

  it('getPlayerInfo should handle error', () => {
    newGameServiceMock.getPlayerInfo = jest.fn().mockReturnValue({
      subscribe: ({ error }: any) => error('err'),
    });
    component.getPlayerInfo();
    // Should not throw
  });

  it('checkIfSendButtonShouldBeDisabled should update sendButtonDisabled', async () => {
    component.logic.showTable = false;
    component.logic.fetchFirebaseData = jest.fn().mockResolvedValue(undefined);
    await component.checkIfSendButtonShouldBeDisabled();
    expect(typeof component.sendButtonDisabled).toBe('boolean');
  });

  it('sendPartieToFirebase should warn if button is disabled', () => {
    component.sendButtonDisabled = true;
    const warnSpy = jest.spyOn(console, 'warn');
    component.sendPartieToFirebase();
    expect(warnSpy).toHaveBeenCalled();
    component.sendButtonDisabled = false;
  });

  it('sendPartieToFirebase should handle error from http', () => {
    component.sendButtonDisabled = false;
    newGameServiceMock.getPlayerInfo = jest.fn().mockReturnValue({
      subscribe: ({ error }: any) => error('err'),
    });
    component.sendPartieToFirebase();
    // Should not throw
  });

  it('sendPartieToFirebase should call firebaseSendService.sendPartie', () => {
    component.sendButtonDisabled = false;
    const mockData = { user_id: 1, username: 'u', email: 'e', solde: 10 };
    newGameServiceMock.getPlayerInfo = jest.fn().mockReturnValue({
      subscribe: ({ next }: any) => next(mockData),
    });
    const sendSpy = jest
      .spyOn(component['firebaseSendService'], 'sendPartie')
      .mockImplementation();
    component.sendPartieToFirebase();
    expect(sendSpy).toHaveBeenCalledWith(1, 10);
  });

  it('should call ngOnInit and subscribe to parties', () => {
    const getPlayerInfoSpy = jest.spyOn(component, 'getPlayerInfo');
    const checkIfSendButtonShouldBeDisabledSpy = jest.spyOn(
      component,
      'checkIfSendButtonShouldBeDisabled'
    );
    const listenToPartiesMock = {
      subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
    };
    component['firebaseSendService'].listenToParties = jest.fn(
      () => listenToPartiesMock as any
    );
    const fetchFirebaseDataSpy = jest
      .spyOn(component.logic, 'fetchFirebaseData')
      .mockResolvedValue(undefined);

    component.ngOnInit();

    expect(getPlayerInfoSpy).toHaveBeenCalled();
    expect(checkIfSendButtonShouldBeDisabledSpy).toHaveBeenCalled();
    expect(component['firebaseSendService'].listenToParties).toHaveBeenCalled();
  });

  it('should handle error in listenToParties subscription', () => {
    const errorHandler = jest.fn();
    const listenToPartiesMock = {
      subscribe: jest.fn().mockImplementation(({ next, error }: any) => {
        error('firebase error');
        return { unsubscribe: jest.fn() };
      }),
    };
    component['firebaseSendService'].listenToParties = jest.fn(
      () => listenToPartiesMock as any
    );
    jest
      .spyOn(component.logic, 'fetchFirebaseData')
      .mockResolvedValue(undefined);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    component.ngOnInit();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('should call ngOnDestroy and clear interval and unsubscribe', () => {
    component.logic.intervalId = 123 as any;
    (component as any).partiesSubscription = { unsubscribe: jest.fn() } as any;
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    component.ngOnDestroy();
    expect(clearIntervalSpy).toHaveBeenCalledWith(123);
    expect(
      (component as any)['partiesSubscription']!.unsubscribe
    ).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('should call ngOnDestroy with no partiesSubscription', () => {
    component.logic.intervalId = 456 as any;
    component.partiesSubscription = undefined;
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    expect(() => component.ngOnDestroy()).not.toThrow();
    clearIntervalSpy.mockRestore();
  });

  it('should get highlightCombination from logic', () => {
    component.logic.highlightCombination = 42 as any;
    expect(component.highlightCombination).toBe(42);
  });

  it('should get showTable from logic', () => {
    component.logic.showTable = true;
    expect(component.showTable).toBe(true);
  });

  it('toggleTable should toggle logic.showTable', () => {
    component.logic.showTable = false;
    component.toggleTable();
    expect(component.logic.showTable).toBe(true);
    component.toggleTable();
    expect(component.logic.showTable).toBe(false);
  });

  it('getCurrentChiffre should return currentChiffre if found', () => {
    component.logic.afficheurs = [{ id: 'aff1', currentChiffre: 7 }];
    expect(component.getCurrentChiffre('aff1')).toBe(7);
  });

  it('getCurrentChiffre should return 0 if not found', () => {
    component.logic.afficheurs = [{ id: 'aff2', currentChiffre: 3 }];
    expect(component.getCurrentChiffre('notfound')).toBe(0);
  });

  it('checkIfSendButtonShouldBeDisabled should set sendButtonDisabled', async () => {
    component.logic.showTable = true;
    jest
      .spyOn(component.logic, 'fetchFirebaseData')
      .mockResolvedValue(undefined);
    await component.checkIfSendButtonShouldBeDisabled();
    expect(component.sendButtonDisabled).toBe(true);
  });

  it('sendPartieToFirebase should not send if button is disabled', () => {
    component.sendButtonDisabled = true;
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    component.sendPartieToFirebase();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('sendPartieToFirebase should send if button is enabled', () => {
    component.sendButtonDisabled = false;
    const mockData = { user_id: 2, username: 'x', email: 'y', solde: 99 };
    newGameServiceMock.getPlayerInfo = jest.fn().mockReturnValue({
      subscribe: ({ next }: any) => next(mockData),
    });
    const sendSpy = jest
      .spyOn(component['firebaseSendService'], 'sendPartie')
      .mockImplementation();
    component.sendPartieToFirebase();
    expect(sendSpy).toHaveBeenCalledWith(2, 99);
    sendSpy.mockRestore();
  });

  it('sendPartieToFirebase should handle error from getPlayerInfo', () => {
    component.sendButtonDisabled = false;
    newGameServiceMock.getPlayerInfo = jest.fn().mockReturnValue({
      subscribe: ({ error }: any) => error('err'),
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    component.sendPartieToFirebase();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('getPlayerInfo should set playerInfo on success', () => {
    const mockData = { user_id: 1, username: 'a', email: 'b', solde: 5 };
    newGameServiceMock.getPlayerInfo = jest.fn().mockReturnValue({
      subscribe: ({ next }: any) => next(mockData),
    });
    component.getPlayerInfo();
    expect(component.playerInfo).toEqual(mockData);
  });

  it('getPlayerInfo should handle error', () => {
    newGameServiceMock.getPlayerInfo = jest.fn().mockReturnValue({
      subscribe: ({ error }: any) => error('err'),
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    component.getPlayerInfo();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
