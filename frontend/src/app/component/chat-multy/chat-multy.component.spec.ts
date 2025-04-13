import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMultyComponent } from './chat-multy.component';

describe('ChatMultyComponent', () => {
  let component: ChatMultyComponent;
  let fixture: ComponentFixture<ChatMultyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMultyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatMultyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
