import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableauSalonComponent } from './tableau-salon.component';

describe('TableauSalonComponent', () => {
  let component: TableauSalonComponent;
  let fixture: ComponentFixture<TableauSalonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableauSalonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableauSalonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
