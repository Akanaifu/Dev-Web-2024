import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { UserService } from '../app/services/user/user.service';
import { expect, jest } from '@jest/globals';

describe('UserService', () => {
  let service: UserService;
  let http: any;

  beforeEach(() => {
    http = {
      get: jest.fn(),
      put: jest.fn(),
    };
    service = new UserService(http as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserId', () => {
    it('should return user data', (done) => {
      const mockResponse = { user_id: 1, solde: 100 };
      http.get.mockReturnValue(of(mockResponse));
      service.getUserId().subscribe((res) => {
        expect(res).toEqual(mockResponse);
        done();
      });
    });

    it('should handle http error', (done) => {
      http.get.mockReturnValue(throwError(() => new Error('fail')));
      service.getUserId().subscribe({
        error: (err) => {
          expect(err).toBeInstanceOf(Error);
          done();
        },
      });
    });

    it('should handle null response', (done) => {
      http.get.mockReturnValue(of(null));
      service.getUserId().subscribe((res) => {
        expect(res).toBeNull();
        done();
      });
    });

    it('should handle undefined response', (done) => {
      http.get.mockReturnValue(of(undefined));
      service.getUserId().subscribe((res) => {
        expect(res).toBeUndefined();
        done();
      });
    });
  });

  describe('updateUserBalance', () => {
    it('should update balance with add', (done) => {
      const mockResponse = { balance: 200 };
      http.put.mockReturnValue(of(mockResponse));
      service.updateUserBalance(1, 100, 'add').subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(http.put).toHaveBeenCalled();
        done();
      });
    });

    it('should update balance with subtract', (done) => {
      const mockResponse = { balance: 50 };
      http.put.mockReturnValue(of(mockResponse));
      service.updateUserBalance(1, 50, 'subtract').subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(http.put).toHaveBeenCalled();
        done();
      });
    });

    it('should handle http error', (done) => {
      http.put.mockReturnValue(throwError(() => new Error('fail')));
      service.updateUserBalance(1, 100, 'add').subscribe({
        error: (err) => {
          expect(err).toBeInstanceOf(Error);
          done();
        },
      });
    });

    it('should handle negative amount', (done) => {
      const mockResponse = { balance: -100 };
      http.put.mockReturnValue(of(mockResponse));
      service.updateUserBalance(1, -100, 'add').subscribe((res) => {
        expect(res).toEqual(mockResponse);
        done();
      });
    });

    it('should handle zero amount', (done) => {
      const mockResponse = { balance: 0 };
      http.put.mockReturnValue(of(mockResponse));
      service.updateUserBalance(1, 0, 'add').subscribe((res) => {
        expect(res).toEqual(mockResponse);
        done();
      });
    });

    it('should call put with correct url and body for add', (done) => {
      const mockResponse = { balance: 123 };
      http.put.mockReturnValue(of(mockResponse));
      service.updateUserBalance(42, 77, 'add').subscribe((res) => {
        expect(http.put).toHaveBeenCalledWith(
          expect.stringMatching(/\/balance\/add/),
          { userId: 42, value: 77 }
        );
        done();
      });
    });

    it('should call put with correct url and body for subtract', (done) => {
      const mockResponse = { balance: 321 };
      http.put.mockReturnValue(of(mockResponse));
      service.updateUserBalance(99, 11, 'subtract').subscribe((res) => {
        expect(http.put).toHaveBeenCalledWith(
          expect.stringMatching(/\/balance\/subtract/),
          { userId: 99, value: 11 }
        );
        done();
      });
    });
  });
});
