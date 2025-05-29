import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
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
import { NewGameService } from '../app/services/new-game.service';

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

  beforeEach(async () => {
    newGameServiceMock = {
      getPlayerInfo: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
    };
    const dbMock = {}; // Add a mock for Database
    component = new MachineASousComponent(newGameServiceMock, dbMock as any);

    await TestBed.configureTestingModule({
      imports: [MachineASousComponent, HttpClientTestingModule],
      providers: [
        { provide: Database, useValue: databaseMock }, // Utilise le mock amélioré
        { provide: NewGameService, useValue: newGameServiceMock },
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
});
