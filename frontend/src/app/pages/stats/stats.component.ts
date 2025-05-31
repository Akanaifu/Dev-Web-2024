import { Component, AfterViewInit, ViewChild, ElementRef, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { WinRateService } from '../../services/stats/winrate.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import Chart from 'chart.js/auto';
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

  stats: { stat_id?: number; user_id?: number; game?: string; num_games?: number; num_wins?: number; timestamp: string; gain: number }[] = []; // Initialisé à un tableau vide
  statsData: any[] = []; // Keep statsData for bets
  createdAt: string | null = null; // Add a separate property for created_at

  games: string[] = [];
  selectedGame: string = '';
  selectedPeriod: string = 'jour';
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();
  selectedDate: Date = new Date();
  userId: number | null = null; // Initialisé à null
  totalPartiesJouees: number = 0;
  totalPartiesGagnees: number = 0;
  numberBaccarat: number = 0;
  numberBlackjack: number = 0;
  numberPoker: number = 0;
  numberRoulette: number = 0;
  numberMachinesASous: number = 0;

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
        if (data && data.bets && data.bets.length > 0) {
          this.stats = data.bets.map((item) => ({
            ...item,
            timestamp: item.timestamp || new Date().toISOString(), // Utilise le timestamp de Games_session
          }));
          this.statsData = data.bets; // Store the fetched bets data
          this.createdAt = data.created_at ?? null; // Store created_at separately
        } else {
          console.warn('Aucune donnée de gains disponible pour cet utilisateur.');
          this.stats = []; // Réinitialise les stats si aucune donnée
          this.statsData = []; // Reset the bets data
          this.createdAt = null; // Reset created_at
        }
        this.updateChart(); // Met à jour le graphique avec les nouvelles données
      },
      (error) => {
        console.error('Erreur lors de la récupération des gains :', error);
        this.stats = []; // Réinitialise les stats en cas d'erreur
        this.statsData = []; // Reset the bets data
        this.createdAt = null; // Reset created_at
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
              this.loadNombreParties(); // Ajoute cet appel
              this.loadNombrePartiesParJeu(); // Ajoute cet appel
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
          this.loadNombreParties(); // Ajoute cet appel
          this.loadNombrePartiesParJeu(); // Ajoute cet appel
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
    return this.statsData.reduce((total, stat) => total + (stat.amount || 0), 0); // Sum up the amount values from statsData
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
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison

    // Sort stats by date in ascending order
    const sortedStats = this.stats.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Convert dates to French format once
    const formattedStats = sortedStats.map(s => ({
      ...s,
      formattedDate: new Date(s.timestamp).toLocaleDateString('fr-FR') // Format dd/mm/yyyy
    }));

    // Group stats by date
    const groupedStats = formattedStats.reduce((acc, stat) => {
      const date = stat.formattedDate;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += stat.gain;
      return acc;
    }, {} as { [key: string]: number });

    const groupedArray = Object.entries(groupedStats).map(([label, gain]) => ({ label, gain }));

    if (this.selectedPeriod === 'jour') {
      return formattedStats
        .filter(s => {
          const createdAtDate = new Date(s.timestamp);
          return createdAtDate.toDateString() === today.toDateString(); // Compare uniquement la date
        })
        .map(s => ({
          label: s.formattedDate, // Use preformatted date
          gain: s.gain
        })); // Do not group gains for the day
    } else if (this.selectedPeriod === 'semaine') {
      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday as the start of the week
      startOfWeek.setDate(today.getDate() + diffToMonday); // Set to the start of the current week (Monday)
      startOfWeek.setHours(0, 0, 0, 0); // Reset time for accurate comparison

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to the end of the current week (Sunday)
      endOfWeek.setHours(23, 59, 59, 999); // Include the entire last day of the week

      return formattedStats.filter(s => {
        const createdAtDate = new Date(s.timestamp);
        return createdAtDate >= startOfWeek && createdAtDate <= endOfWeek; // Only include dates within the current week
      }).map(s => ({
        label: s.formattedDate, // Use preformatted date
        gain: s.gain
      }));
    } else if (this.selectedPeriod === 'mois') {
      const year = today.getFullYear();
      const month = this.selectedMonth;

      // Dictionary for the number of days in each month
      const isLeapYear = (yr: number): boolean => (yr % 4 === 0 && (yr % 100 !== 0 || yr % 400 === 0));
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
        11: 31,
      };

      const daysInMonth = daysInMonthDict[month];
      const daysArray: { label: string; gain: number }[] = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dayGain = groupedArray
          .filter(item => {
            const date = new Date(item.label.split('/').reverse().join('-')); // Convert dd/mm/yyyy to Date
            return date.getFullYear() === currentDate.getFullYear() &&
                   date.getMonth() === currentDate.getMonth() &&
                   date.getDate() === currentDate.getDate();
          })
          .reduce((sum, item) => sum + item.gain, 0);
        daysArray.push({ label: currentDate.toLocaleDateString('fr-FR'), gain: dayGain });
      }
      return daysArray;
    } else if (this.selectedPeriod === 'année') {
      const yearToDisplay = this.selectedYear;
      const monthsArray: { label: string; gain: number }[] = [];
      for (let m = 0; m <= 11; m++) {
        const monthGain = groupedArray
          .filter(item => {
            const date = new Date(item.label.split('/').reverse().join('-')); // Convert dd/mm/yyyy to Date
            return date.getFullYear() === yearToDisplay && date.getMonth() === m;
          })
          .reduce((sum, item) => sum + item.gain, 0);
        const label = `${yearToDisplay}-${("0" + (m + 1)).slice(-2)}`; // Format: YYYY-MM
        monthsArray.push({ label, gain: monthGain });
      }
      return monthsArray;
    }
    return groupedArray;
  }

  updateChart(): void {
    const filtered = this.getFilteredStats();
    this.gainChart.data.labels = filtered.map(item => {
      const date = new Date(item.label.split('/').reverse().join('-')); // Ensure consistent parsing of dd/mm/yyyy
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
      const year = date.getFullYear();
      return `${day}/${month}/${year}`; // Format dd/mm/yyyy
    });
    this.gainChart.data.datasets[0].data = filtered.map(item => item.gain); // Met à jour les données dynamiques
    this.gainChart.update(); // Rafraîchit le graphique
  }

  onPeriodChange(): void {
    this.updateChart(); // Ensure the chart is updated with the new period
  }

  onGameChange(): void {
    this.fetchWinRateData();
  }

  onYearChange(): void {
    this.gainChart.data.labels = []; // Reset labels
    this.gainChart.data.datasets[0].data = []; // Reset data
    const filtered = this.getFilteredStats(); // Get filtered stats for the selected year
    this.gainChart.data.labels = filtered.map(item => item.label); // Update labels with filtered data
    this.gainChart.data.datasets[0].data = filtered.map(item => item.gain); // Update data with filtered gains
    this.gainChart.update(); // Refresh the chart with the new year data
  }

  loadNombreParties(): void {
    if (this.userId) {
      this.winRateService.getWinRateByUser(this.userId).subscribe({
        next: (data: any[]) => {
          if (data && data.length > 0) {
            this.totalPartiesJouees = data.reduce((sum, item) => sum + Number(item.total_games || 0), 0);
            this.totalPartiesGagnees = data.reduce((sum, item) => sum + Number(item.total_wins || 0), 0);
          } else {
            this.totalPartiesJouees = 0;
            this.totalPartiesGagnees = 0;
          }
        },
        error: (err) => {
          console.error('Erreur lors de la récupération du nombre de parties :', err);
          this.totalPartiesJouees = 0;
          this.totalPartiesGagnees = 0;
        }
      });
    }
  }


  loadNombrePartiesParJeu(): void {
    if (this.userId) {
      this.winRateService.getWinRateByUser(this.userId).subscribe({
        next: (data: any[]) => {
          // Remet à zéro avant de remplir
          this.numberBaccarat = 0;
          this.numberBlackjack = 0;
          this.numberPoker = 0;
          this.numberRoulette = 0;
          this.numberMachinesASous = 0;

          data.forEach(item => {
            switch (item.game_name) {
              case 'Baccarat':
                this.numberBaccarat = item.total_games || 0;
                break;
              case 'Blackjack':
                this.numberBlackjack = item.total_games || 0;
                break;
              case 'Poker':
                this.numberPoker = item.total_games || 0;
                break;
              case 'Roulette':
                this.numberRoulette = item.total_games || 0;
                break;
              case 'Slot Machine':
                this.numberMachinesASous = item.total_games || 0;
                break;
            }
          });
        },
        error: (err) => {
          console.error('Erreur lors de la récupération du nombre de parties par jeu :', err);
        }
      });
    }
  }

  getAvailableYears(): number[] {
    if (!this.createdAt) return [];
    const createdYear = new Date(this.createdAt).getFullYear();
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = createdYear; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  }
}
