import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ComponentFixture } from '@angular/core/testing';
import { LoginService } from './services/login/login.service';
import { ChatComponent } from './component/chat-multy/chat-multy.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'frontend' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('frontend');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Hello, frontend'
    );
  });
});
describe('AppComponent extra', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let loginServiceMock: any;

  beforeEach(async () => {
    loginServiceMock = { isLoggedIn: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: LoginService, useValue: loginServiceMock }],
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should have a title property', () => {
    expect(component.title).toBe('frontend');
  });

  it('should call chatComponent.toggle when toggleChat is called', () => {
    component.chatComponent = { toggle: jest.fn() } as any as ChatComponent;
    component.toggleChat();
    expect(component.chatComponent.toggle).toHaveBeenCalled();
  });

  it('should inject LoginService', () => {
    expect(component.loginService).toBeDefined();
  });
});
