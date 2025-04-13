import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineASousComponent } from './machine-a-sous.component';

describe('MachineASousComponent', () => {
  let component: MachineASousComponent;
  let fixture: ComponentFixture<MachineASousComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MachineASousComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MachineASousComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
