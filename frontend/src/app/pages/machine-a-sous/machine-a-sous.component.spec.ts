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
import { MachineASousComponent } from './machine-a-sous.component';
import { NewGameService } from '../../services/new-game.service';

// Ajoute la définition de databaseMock ici
const databaseMock = {
  ref: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
  })),
};

// Mock console et méthodes Firebase une seule fois, sans spyOn redondant
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('MachineASousComponent', () => {
  let component: MachineASousComponent;
  let fixture: ComponentFixture<MachineASousComponent>;
  let newGameServiceMock: any;
  let httpMock: any;

  beforeEach(async () => {
    newGameServiceMock = {};
    httpMock = { get: jest.fn().mockReturnValue({ subscribe: jest.fn() }) };
    const dbMock = {}; // Add a mock for Database
    component = new MachineASousComponent(
      newGameServiceMock,
      httpMock,
      dbMock as any
    );

    await TestBed.configureTestingModule({
      imports: [MachineASousComponent, HttpClientTestingModule],
      providers: [
        { provide: Database, useValue: databaseMock }, // Utilise le mock amélioré
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
});
