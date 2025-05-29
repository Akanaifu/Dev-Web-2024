import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StatsComponent } from './stats.component';
import { WinRateService } from '../../services/stats/winrate.service';
import { of } from 'rxjs';

// Mock data returned by the API
const mockWinRateData = [
  { game_name: 'Baccarat', total_wins: 2, total_games: 4, win_rate: 50 },
  { game_name: 'Blackjack', total_wins: 0, total_games: 5, win_rate: 0 },
  { game_name: 'Poker', total_wins: 2, total_games: 7, win_rate: 29 },
  { game_name: 'Roulette', total_wins: 1, total_games: 4, win_rate: 25 },
  { game_name: 'Slot Machine', total_wins: 2, total_games: 5, win_rate: 40 }
];

class MockWinRateService {
  getWinRateByUser() {
    return of(mockWinRateData);
  }
}

describe('StatsComponent', () => {
  let component: StatsComponent;
  let fixture: ComponentFixture<StatsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [StatsComponent],
      providers: [
        { provide: WinRateService, useClass: MockWinRateService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsComponent);
    component = fixture.componentInstance;
    component.userId = 1; // Simulate a logged-in user
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display total games and wins correctly', waitForAsync(() => {
    // Wait for async data
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Total de partie joué : 25');
      expect(compiled.textContent).toContain('Total de partie gagnée : 7');
      expect(compiled.textContent).toContain('Baccarat : 4');
      expect(compiled.textContent).toContain('Blackjack : 5');
      expect(compiled.textContent).toContain('Poker : 7');
      expect(compiled.textContent).toContain('Roulette : 4');
      expect(compiled.textContent).toContain('Machine à sous : 5');
    });
  }));
});
