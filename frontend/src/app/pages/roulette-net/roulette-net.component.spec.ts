import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouletteNetComponent } from './roulette-net.component';

describe('RouletteNetComponent', () => {
  let component: RouletteNetComponent;
  let fixture: ComponentFixture<RouletteNetComponent>;

  // pas encore finalisé avec "jest"
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouletteNetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouletteNetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
