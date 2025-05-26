import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { EditCompteComponent } from './edit-compte.component';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

describe('EditCompteComponent', () => {
  let component: EditCompteComponent;
  let fixture: ComponentFixture<EditCompteComponent>;
  let httpMock: any;
  let routerMock: any;

  beforeEach(async () => {
    httpMock = {
      get: jest.fn(),
      put: jest.fn(),
    };
    routerMock = { navigate: jest.fn() };

    // Mock par défaut pour éviter l'erreur lors de ngOnInit
    httpMock.get.mockReturnValue(
      of({ user_id: 1, username: 'test', email: 'test@mail.com' })
    );

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, EditCompteComponent],
      providers: [
        { provide: HttpClient, useValue: httpMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditCompteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.editForm.value).toEqual({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  });

  it('should not submit if passwords do not match', () => {
    component.editForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password1',
      confirmPassword: 'password2',
    });
    component.playerInfo.user_id = 1;
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    component.onSubmit();
    expect(spy).toHaveBeenCalledWith('Passwords do not match!');
    spy.mockRestore();
  });

  it('should not submit if user_id is missing', () => {
    component.editForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'password',
    });
    component.playerInfo.user_id = 0;
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    component.onSubmit();
    expect(spy).toHaveBeenCalledWith(
      'User ID is not available. Cannot submit the form.'
    );
    spy.mockRestore();
  });

  it('should submit form and reset on success', () => {
    component.editForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'password',
    });
    component.playerInfo = {
      user_id: 1,
      username: 'old',
      email: 'old@mail.com',
    };
    httpMock.put.mockReturnValue(of({ success: true }));
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    component.onSubmit();
    expect(httpMock.put).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('User updated successfully:', {
      success: true,
    });
    spy.mockRestore();
  });

  it('should log error on update failure', () => {
    component.editForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'password',
    });
    component.playerInfo = {
      user_id: 1,
      username: 'old',
      email: 'old@mail.com',
    };
    httpMock.put.mockReturnValue(throwError(() => new Error('fail')));
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    component.onSubmit();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should fetch player info on getPlayerInfo', () => {
    const mockData = { user_id: 2, username: 'bob', email: 'bob@mail.com' };
    httpMock.get.mockReturnValue(of(mockData));
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    component.getPlayerInfo();
    expect(component.playerInfo).toEqual(mockData);
    expect(spy).toHaveBeenCalledWith('Informations du joueur :', mockData);
    spy.mockRestore();
  });

  it('should log error if getPlayerInfo fails', () => {
    httpMock.get.mockReturnValue(throwError(() => new Error('fail')));
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    component.getPlayerInfo();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
