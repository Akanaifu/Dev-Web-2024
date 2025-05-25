import { Component, AfterViewInit, ViewChild, ElementRef, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { WinRateService } from '../../services/stats/winrate.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import Chart from 'chart.js/auto';

// Ajoute l'import de ton service d'authentification si besoin
import { LoginService } from '../../services/login/login.service';
import { StatsService } from '../../services/stats/stats.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [FormsModule, CommonModule],
  providers: [WinRateService, StatsService],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css',
})
export class StatsComponent implements AfterViewInit, OnInit {
  @ViewChild('gainChartCanvas') gainChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('winRateChartCanvas') winRateChartCanvas!: ElementRef<HTMLCanvasElement>;
  gainChart!: Chart;
  winRateChart!: Chart;

  stats: { stat_id?: number; user_id?: number; game?: string; num_games?: number; num_wins?: number; created_at: string; gain: number }[] = []; // Initialisé à un tableau vide

  games: string[] = [];
  selectedGame: string = '';
  selectedPeriod: string = 'jour';
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();
  selectedDate: Date = new Date();
  userId: number | null = null; // Initialisé à null

  constructor(
    private winRateService: WinRateService,
    private statsService: StatsService, // Injection du StatsService
    private loginService: LoginService, // Injection du service d'auth
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  fetchUserGains(): void {
    if (!this.userId) return;

    this.statsService.getUserBets(this.userId).subscribe(
      (data) => {
        console.log('Gains reçus depuis le backend :', data); // Ajout du console.log
        if (data && data.length > 0) {
          this.stats = data.map((item) => ({
            ...item,
            created_at: item.created_at || new Date().toISOString(), // Assurez-vous que chaque item a un created_at
          }));
        } else {
          console.warn('Aucune donnée de gains disponible pour cet utilisateur.');
          this.stats = []; // Réinitialise les stats si aucune donnée
        }
        this.updateChart(); // Met à jour le graphique avec les nouvelles données
      },
      (error) => {
        console.error('Erreur lors de la récupération des gains :', error);
        this.stats = []; // Réinitialise les stats en cas d'erreur
        this.updateChart(); // Met à jour le graphique avec un état vide
      }
    );
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Si le signal user() n'est pas encore défini, on récupère l'utilisateur via l'API
      if (localStorage.getItem('token') && this.loginService.user() === undefined) {
        this.loginService.getUser().subscribe({
          next: (user) => {
            this.userId = user?.userId ?? null;
            console.log('ID de l\'utilisateur connecté (via API) :', this.userId); // Ajout du console.log
            if (this.userId) {
              this.fetchWinRateData();
              this.fetchUserGains(); // Récupère les données dynamiques
            }
          },
          error: (err) => {
            console.error('Erreur lors de la récupération de l\'utilisateur:', err);
          },
        });
      } else {
        const user = this.loginService.user();
        this.userId = user?.userId ?? null;
        console.log('ID de l\'utilisateur connecté (via signal) :', this.userId); // Ajout du console.log
        if (this.userId) {
          this.fetchWinRateData();
          this.fetchUserGains(); // Récupère les données dynamiques
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
    today.setHours(0, 0, 0, 0); // Réinitialise l'heure pour comparer uniquement la date

    // Sort stats by date in ascending order
    const sortedStats = this.stats.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Convert dates to French format once
    const formattedStats = sortedStats.map(s => ({
      ...s,
      formattedDate: new Date(s.created_at).toLocaleDateString('fr-FR') // Format dd/mm/yyyy
    }));

    if (this.selectedPeriod === 'jour') {
      return formattedStats
        .filter(s => {
          const createdAtDate = new Date(s.created_at);
          return createdAtDate.toDateString() === today.toDateString(); // Compare uniquement la date
        })
        .map(s => ({
          label: s.formattedDate, // Use preformatted date
          gain: s.gain
        }));
    } else if (this.selectedPeriod === 'semaine') {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      return formattedStats
        .filter(s => {
          const d = new Date(s.created_at);
          return d >= startDate && d <= today;
        })
        .map(s => ({ label: s.formattedDate, gain: s.gain })); // Use preformatted date
    } else if (this.selectedPeriod === 'mois') {
      const year = today.getFullYear();
      const month = this.selectedMonth;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysArray: { label: string; gain: number }[] = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dayGain = formattedStats
          .filter(s => {
            const d = new Date(s.created_at);
            return d.getFullYear() === currentDate.getFullYear() &&
                   d.getMonth() === currentDate.getMonth() &&
                   d.getDate() === currentDate.getDate();
          })
          .reduce((sum, s) => sum + s.gain, 0);
        daysArray.push({ label: currentDate.toLocaleDateString('fr-FR'), gain: dayGain }); // Format dd/mm/yyyy
      }
      return daysArray;
    } else if (this.selectedPeriod === 'année') {
      const yearToDisplay = this.selectedYear;
      const monthsArray: { label: string; gain: number }[] = [];
      for (let m = 0; m <= 11; m++) {
        const monthGain = formattedStats
          .filter(s => {
            const d = new Date(s.created_at);
            return d.getFullYear() === yearToDisplay && d.getMonth() === m;
          })
          .reduce((sum, s) => sum + s.gain, 0);
        const label = `${yearToDisplay}-${("0" + (m + 1)).slice(-2)}`; // Format: YYYY-MM
        monthsArray.push({ label: label, gain: monthGain });
      }
      return monthsArray;
    }
    return formattedStats.map(s => ({ label: s.formattedDate, gain: s.gain })); // Use preformatted date
  }

  updateChart(): void {
    const filtered = this.getFilteredStats();
    this.gainChart.data.labels = filtered.map(item => {
      const date = new Date(item.label);
      if (isNaN(date.getTime())) {
        return item.label; // Use the label directly if it's already a valid string
      }
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
      const year = date.getFullYear();
      return `${day}-${month}-${year}`; // Format dd-mm-yyyy
    });
    this.gainChart.data.datasets[0].data = filtered.map(item => item.gain); // Met à jour les données dynamiques
    this.gainChart.update(); // Rafraîchit le graphique
  }

  onPeriodChange(): void {
    this.updateChart();
  }
}
