import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Database } from '@angular/fire/database';

import { MachineASousComponent } from './machine-a-sous.component';
import { NewGameService } from '../../services/new-game.service';

// Mock complet pour Database
const databaseMock = {
  // Ajoute ici les méthodes utilisées dans ton code, par exemple :
  ref: jest.fn(() => ({
    // Simule les méthodes sur le ref retourné si besoin
  })),
  // Ajoute d'autres méthodes si nécessaire
};

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
