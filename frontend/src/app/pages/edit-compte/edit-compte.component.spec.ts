import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCompteComponent } from './edit-compte.component';

describe('EditCompteComponent', () => {
  let component: EditCompteComponent;
  let fixture: ComponentFixture<EditCompteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCompteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCompteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
