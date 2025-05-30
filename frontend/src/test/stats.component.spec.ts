import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatsComponent } from '../app/pages/stats/stats.component';
import { StatsService } from '../app/services/stats/stats.service';
import { LoginService } from '../app/services/login/login.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

describe('StatsComponent', () => {
  let component: StatsComponent;
  let fixture: ComponentFixture<StatsComponent>;
  let statsService: jest.Mocked<StatsService>;
  let loginService: jest.Mocked<LoginService>;

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(async () => {
    statsService = {
      getUserBets: jest.fn(),
      getWinRateByUser: jest.fn(),
    } as any;

    loginService = {
      user: jest.fn(),
      getUser: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [StatsComponent, FormsModule, CommonModule], // Ensure all required modules are imported
      providers: [
        { provide: StatsService, useValue: statsService },
        { provide: LoginService, useValue: loginService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('ngOnInit', () => {
    it('should fetch user data and stats', () => {
      loginService.user.mockReturnValue({ userId: 1 });
      statsService.getUserBets.mockReturnValue(of({ bets: [], created_at: '2020-01-01' }));
      component.ngOnInit();
      expect(loginService.user).toHaveBeenCalled();
      expect(statsService.getUserBets).toHaveBeenCalledWith(1);
    });

    it('should handle error during stats fetch', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      statsService.getUserBets.mockReturnValue(throwError(() => 'err'));
      component.ngOnInit();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('fetchUserGains', () => {
    it('should update stats and statsData', () => {
      statsService.getUserBets.mockReturnValue(of({ bets: [{ amount: 100, gain: 50 }], created_at: '2020-01-01' }));
      component.fetchUserGains();
      expect(component.stats).toEqual([{ amount: 100, gain: 50, timestamp: expect.any(String) }]);
      expect(component.statsData).toEqual([{ amount: 100, gain: 50 }]);
    });

    it('should handle empty bets', () => {
      statsService.getUserBets.mockReturnValue(of({ bets: [], created_at: '2020-01-01' }));
      component.fetchUserGains();
      expect(component.stats).toEqual([]);
      expect(component.statsData).toEqual([]);
    });
  });

  describe('getAvailableYears', () => {
    it('should calculate available years from created_at', () => {
      component.createdAt = '2020-01-01';
      const years = component.getAvailableYears();
      expect(years).toEqual([2020, 2021, 2022, 2023, 2024]);
    });

    it('should return empty array if created_at is null', () => {
      component.createdAt = null;
      const years = component.getAvailableYears();
      expect(years).toEqual([]);
    });
  });

  describe('onYearChange', () => {
    it('should update chart data for selected year', () => {
      const updateChartSpy = jest.spyOn(component, 'updateChart');
      component.onYearChange();
      expect(updateChartSpy).toHaveBeenCalled();
    });
  });
});
