import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JeuxComponent } from './jeux.component';

describe('JeuxComponent', () => {
  let component: JeuxComponent;
  let fixture: ComponentFixture<JeuxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JeuxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JeuxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
