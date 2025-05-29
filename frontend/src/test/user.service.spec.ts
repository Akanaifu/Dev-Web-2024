import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { UserService } from '../app/services/user/user.service';
import { expect, jest } from '@jest/globals';

describe('UserService', () => {
  let service: UserService;
  let http: jest.Mocked<HttpClient>;

  beforeEach(() => {
    http = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      head: jest.fn(),
      options: jest.fn(),
      request: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [UserService, { provide: HttpClient, useValue: http }],
    });

    service = new UserService(http);
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
      http.post.mockReturnValue(of(mockResponse));
      service.updateUserBalance(1, 100, 'add').subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(http.post).toHaveBeenCalled();
        done();
      });
    });

    it('should update balance with subtract', (done) => {
      const mockResponse = { balance: 50 };
      http.post.mockReturnValue(of(mockResponse));
      service.updateUserBalance(1, 50, 'subtract').subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(http.post).toHaveBeenCalled();
        done();
      });
    });

    it('should handle http error', (done) => {
      http.post.mockReturnValue(throwError(() => new Error('fail')));
      service.updateUserBalance(1, 100, 'add').subscribe({
        error: (err) => {
          expect(err).toBeInstanceOf(Error);
          done();
        },
      });
    });

    it('should handle invalid operation', (done) => {
      service.updateUserBalance(1, 100, 'invalid' as any).subscribe({
        error: (err) => {
          expect(err).toBeDefined();
          done();
        },
      });
    });

    it('should handle negative amount', (done) => {
      const mockResponse = { balance: -100 };
      http.post.mockReturnValue(of(mockResponse));
      service.updateUserBalance(1, -100, 'add').subscribe((res) => {
        expect(res).toEqual(mockResponse);
        done();
      });
    });

    it('should handle zero amount', (done) => {
      const mockResponse = { balance: 0 };
      http.post.mockReturnValue(of(mockResponse));
      service.updateUserBalance(1, 0, 'add').subscribe((res) => {
        expect(res).toEqual(mockResponse);
        done();
      });
    });

    it('should call post with correct url and body for add', (done) => {
      const mockResponse = { balance: 123 };
      http.post.mockReturnValue(of(mockResponse));
      service.updateUserBalance(42, 77, 'add').subscribe((res) => {
        expect(http.post).toHaveBeenCalledWith(
          expect.stringMatching(/\/balance\/add/),
          { userId: 42, value: 77 }
        );
        done();
      });
    });

    it('should call post with correct url and body for subtract', (done) => {
      const mockResponse = { balance: 321 };
      http.post.mockReturnValue(of(mockResponse));
      service.updateUserBalance(99, 11, 'subtract').subscribe((res) => {
        expect(http.post).toHaveBeenCalledWith(
          expect.stringMatching(/\/balance\/subtract/),
          { userId: 99, value: 11 }
        );
        done();
      });
    });

    it('should throw error for null userId', (done) => {
      service.updateUserBalance(null as any, 100, 'add').subscribe({
        error: (err) => {
          expect(err).toBeDefined();
          done();
        },
      });
    });

    it('should throw error for undefined userId', (done) => {
      service.updateUserBalance(undefined as any, 100, 'add').subscribe({
        error: (err) => {
          expect(err).toBeDefined();
          done();
        },
      });
    });

    it('should throw error for null amount', (done) => {
      service.updateUserBalance(1, null as any, 'add').subscribe({
        error: (err) => {
          expect(err).toBeDefined();
          done();
        },
      });
    });

    it('should throw error for undefined amount', (done) => {
      service.updateUserBalance(1, undefined as any, 'add').subscribe({
        error: (err) => {
          expect(err).toBeDefined();
          done();
        },
      });
    });

    it('should throw error for null operation', (done) => {
      service.updateUserBalance(1, 100, null as any).subscribe({
        error: (err) => {
          expect(err).toBeDefined();
          done();
        },
      });
    });

    it('should throw error for undefined operation', (done) => {
      service.updateUserBalance(1, 100, undefined as any).subscribe({
        error: (err) => {
          expect(err).toBeDefined();
          done();
        },
      });
    });
  });

  // Ajoute ici d'autres méthodes à tester si besoin
});
