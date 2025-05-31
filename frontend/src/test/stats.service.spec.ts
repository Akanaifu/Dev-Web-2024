import { StatsService } from '../app/services/stats/stats.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

describe('StatsService', () => {
  let service: StatsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StatsService],
    });

    service = TestBed.inject(StatsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getUserBets', () => {
    it('should fetch user bets', () => {
      const mockResponse = { bets: [{ amount: 100, gain: 50 }], created_at: '2020-01-01' };
      service.getUserBets(1).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/stats/bets/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getWinRateByUser', () => {
    it('should fetch win rate by user', () => {
      const mockResponse = [{ game_name: 'Poker', win_rate: 60 }];
      service.getWinRateByUser(1).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/stats/1/winrate');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
