import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';

import { MachineASousComponent } from './machine-a-sous.component';
import { NewGameService } from '../../services/new-game.service';

describe('MachineASousComponent', () => {
  let component: MachineASousComponent;
  let fixture: ComponentFixture<MachineASousComponent>;
  let newGameServiceMock: any;
  let httpMock: any;

  beforeEach(async () => {
    newGameServiceMock = {};
    httpMock = { get: jest.fn().mockReturnValue({ subscribe: jest.fn() }) };
    component = new MachineASousComponent(newGameServiceMock, httpMock);

    await TestBed.configureTestingModule({
      imports: [MachineASousComponent],
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
