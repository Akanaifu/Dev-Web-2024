import { Component, AfterViewInit, ViewChild, ElementRef, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { WinRateService } from '../../services/stats/winrate.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import Chart from 'chart.js/auto';

// Ajoute l'import de ton service d'authentification si besoin
import { LoginService } from '../../services/login/login.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [FormsModule, CommonModule],
  providers: [WinRateService],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css',
})
export class StatsComponent implements AfterViewInit, OnInit {
  @ViewChild('gainChartCanvas') gainChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('winRateChartCanvas') winRateChartCanvas!: ElementRef<HTMLCanvasElement>;
  gainChart!: Chart;
  winRateChart!: Chart;

  stats = [
    { stat_id: 1, user_id: 3, game: 'Poker', num_games: 5, num_wins: 2, timestamp: "2025-04-01", gain: 50 },
    { stat_id: 2, user_id: 3, game: 'Blackjack', num_games: 7, num_wins: 4, timestamp: "2025-04-02", gain: -30 },
    { stat_id: 3, user_id: 3, game: 'Roulette', num_games: 3, num_wins: 1, timestamp: "2025-04-03", gain: 20 },
    { stat_id: 4, user_id: 3, game: 'Poker', num_games: 6, num_wins: 3, timestamp: "2025-04-04", gain: -15 },
    { stat_id: 5, user_id: 3, game: 'Blackjack', num_games: 2, num_wins: 2, timestamp: "2025-04-05", gain: 5 },
    { stat_id: 6, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-04-24", gain: 12 },
    { stat_id: 7, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-04-24", gain: 5 },
    { stat_id: 8, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-02-05", gain: 15 },
    { stat_id: 9, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-01-05", gain: -30 },
    { stat_id: 10, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-04-22", gain: -13 },
    { stat_id: 11, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-04-21", gain: 40 },
    { stat_id: 12, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-04-18", gain: 0 },
    { stat_id: 13, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-04-17", gain: 36 }
  ];

  games: string[] = [];
  selectedGame: string = '';
  selectedPeriod: string = 'jour';
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = 2025;
  userId: number | null = null; // Initialisé à null

  constructor(
    private winRateService: WinRateService,
    private loginService: LoginService, // Injection du service d'auth
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Si le signal user() n'est pas encore défini, on récupère l'utilisateur via l'API
      if (localStorage.getItem('token') && this.loginService.user() === undefined) {
        this.loginService.getUser().subscribe({
          next: (user) => {
            this.userId = user?.userId ?? null; // <-- ici
            if (this.userId) {
              this.fetchWinRateData();
            }
          },
          error: (err) => {
            console.error('Erreur lors de la récupération de l\'utilisateur:', err);
          },
        });
      } else {
        // Sinon, on utilise directement la valeur du signal
        const user = this.loginService.user();
        this.userId = user?.userId ?? null; // <-- ici aussi
        if (this.userId) {
          this.fetchWinRateData();
        }
      }
    }
  }

  get totalGain(): number {
    return this.stats.reduce((total, stat) => total + stat.gain, 0);
  }

  get gainSummary(): string {
    const filtered = this.getFilteredStats();
    const total = filtered.reduce((sum, stat) => sum + stat.gain, 0);
    if (total > 0) return `🟢 Gain total : +${total.toFixed(2)}€`;
    if (total < 0) return `🔴 Perte totale : ${total.toFixed(2)}€`;
    return `⚪ Équilibre : 0€`;
  }

  get totalMise(): number {
    return this.stats.reduce((total, stat) => total + Math.abs(stat.gain), 0);
  }

  ngAfterViewInit(): void {
    this.gainChart = new Chart(this.gainChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Gains / Pertes (€)',
          data: [],
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.3)',
          pointRadius: 4,
          pointBackgroundColor: '#2196f3'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    this.initializeWinRateChart();
    // fetchWinRateData déplacé dans ngOnInit pour éviter double appel
    this.updateChart();
  }

  initializeWinRateChart(): void {
    this.winRateChart = new Chart(this.winRateChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Win Rate (%)',
          data: [],
          backgroundColor: 'rgba(76, 175, 80, 0.6)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  fetchWinRateData(): void {
    this.winRateService.getWinRateByUser(this.userId!).subscribe(
      (data) => {
        if (data && data.length > 0) {
          const labels = data.map(item => item.game_name);
          const winRates = data.map(item => item.win_rate);
          this.updateWinRateChart(labels, winRates);
        } else {
          this.updateWinRateChart([], []);
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des winrates :', error);
        this.updateWinRateChart([], []);
      }
    );
  }

  updateWinRateChart(labels: string[], winRates: number[]): void {
    if (!this.winRateChart) return;
    this.winRateChart.data.labels = labels;
    this.winRateChart.data.datasets[0].data = winRates;
    this.winRateChart.update();
  }

  // --- NE PAS MODIFIER LA PARTIE SUIVANTE (graph gain/perte) ---
  getFilteredStats(): { label: string; gain: number }[] {
    const today = new Date();
    if(this.selectedPeriod === 'jour') {
      return this.stats
        .filter(s => {
          const d = new Date(s.timestamp);
          return d.getFullYear() === today.getFullYear() &&
                 d.getMonth() === today.getMonth() &&
                 d.getDate() === today.getDate();
        })
        .map(s => ({ label: s.timestamp, gain: s.gain }));
    } else if(this.selectedPeriod === 'semaine') {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      return this.stats
        .filter(s => {
          const d = new Date(s.timestamp);
          return d >= startDate && d <= today;
        })
        .map(s => ({ label: s.timestamp, gain: s.gain }));
    } else if(this.selectedPeriod === 'mois') { 
      const year = today.getFullYear();
      const month = this.selectedMonth;
      const currentMonth = today.getMonth();
      const isLeapYear = (yr: number): boolean => {
        return (yr % 4 === 0 && (yr % 100 !== 0 || yr % 400 === 0));
      };
      const daysInMonthDict: { [key: number]: number } = {
        0: 31,
        1: isLeapYear(year) ? 29 : 28,
        2: 31,
        3: 30,
        4: 31,
        5: 30,
        6: 31,
        7: 31,
        8: 30,
        9: 31,
        10: 30,
        11: 31
      };
      const daysCount = (month === today.getMonth())
                          ? today.getDate()
                          : daysInMonthDict[month];
      const daysArray: { label: string; gain: number }[] = [];
      for (let day = 1; day <= daysCount; day++) {
        const currentDate = new Date(Date.UTC(year, month, day));
        const dayGain = this.stats
          .filter(s => {
            const d = new Date(s.timestamp);
            d.setHours(0,0,0,0);
            return d.getUTCFullYear() === currentDate.getUTCFullYear() &&
                   d.getUTCMonth() === currentDate.getUTCMonth() &&
                   d.getUTCDate() === currentDate.getUTCDate();
          })
          .reduce((sum, s) => sum + s.gain, 0);
        const label = currentDate.toISOString().split('T')[0];
        daysArray.push({ label: label, gain: dayGain });
      }
      return daysArray;
    } else if(this.selectedPeriod === 'année') {
      // Updated logic: display for each month of the selected year.
      const currentYear = today.getFullYear();
      const yearToDisplay = this.selectedYear;
      const monthsArray: { label: string; gain: number }[] = [];
      for (let m = 0; m <= 11; m++) {
        const monthGain = this.stats
          .filter(s => {
            const d = new Date(s.timestamp);
            return d.getFullYear() === yearToDisplay && d.getMonth() === m;
          })
          .reduce((sum, s) => sum + s.gain, 0);
        const label = `${yearToDisplay}-${("0" + (m + 1)).slice(-2)}`; // Format: YYYY-MM
        monthsArray.push({ label: label, gain: monthGain });
      }
      return monthsArray;
    }
    return this.stats.map(s => ({ label: s.timestamp, gain: s.gain }));
  }

  updateChart(): void {
    const filtered = this.getFilteredStats();
    this.gainChart.data.labels = []; // Clear existing labels
    this.gainChart.data.datasets[0].data = []; // Clear existing data

    this.gainChart.data.labels = filtered.map(item => item.label); // Add new labels
    this.gainChart.data.datasets[0].data = filtered.map(item => item.gain); // Add new data
    this.gainChart.update(); // Update the chart
  }

  onPeriodChange(): void {
    this.updateChart();
  }
}
