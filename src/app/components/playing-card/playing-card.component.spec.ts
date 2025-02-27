import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayingCardComponent } from './playing-card.component';

describe('PlayingCardComponent', () => {
  let component: PlayingCardComponent;
  let fixture: ComponentFixture<PlayingCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayingCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
