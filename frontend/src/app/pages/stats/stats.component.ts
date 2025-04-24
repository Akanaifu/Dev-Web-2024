import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css'
})
export class StatsComponent implements AfterViewInit {
  @ViewChild('gainChartCanvas') gainChartCanvas!: ElementRef<HTMLCanvasElement>;
  gainChart!: Chart;

  stats = [
    { stat_id: 1, user_id: 3, num_games: 5, num_wins: 2, timestamp: "2025-04-01", gain: 50 },
    { stat_id: 2, user_id: 3, num_games: 7, num_wins: 4, timestamp: "2025-04-02", gain: -30 },
    { stat_id: 3, user_id: 3, num_games: 3, num_wins: 1, timestamp: "2025-04-03", gain: 20 },
    { stat_id: 4, user_id: 3, num_games: 6, num_wins: 3, timestamp: "2025-04-04", gain: -15 },
    { stat_id: 5, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-04-05", gain: 5 },
    { stat_id: 6, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-04-24", gain: 12 },
    { stat_id: 7, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-04-24", gain: 5 },
    { stat_id: 8, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-02-05", gain: 15 },
    { stat_id: 9, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-01-05", gain: -30 },
    { stat_id: 10, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-04-22", gain: -13 },
    { stat_id: 11, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-04-21", gain: 40 },
    { stat_id: 12, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-04-18", gain: 0 },
    { stat_id: 13, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-04-17", gain: 36 }
  ];

  selectedPeriod: string = 'jour';

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
    this.updateChart();
  }

  getFilteredStats(): { label: string; gain: number }[] {
    const today = new Date();
    if(this.selectedPeriod === 'jour') {
      // Filter only records from today without aggregation
      return this.stats
        .filter(s => {
          const d = new Date(s.timestamp);
          return d.getFullYear() === today.getFullYear() &&
                 d.getMonth() === today.getMonth() &&
                 d.getDate() === today.getDate();
        })
        .map(s => ({ label: s.timestamp, gain: s.gain }));
    } else if(this.selectedPeriod === 'semaine') {
      // Nouvelle logique : afficher les données du jour actuel et des 6 jours précédents
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      return this.stats
        .filter(s => {
          const d = new Date(s.timestamp);
          return d >= startDate && d <= today;
        })
        .map(s => ({ label: s.timestamp, gain: s.gain }));
    } else if(this.selectedPeriod === 'mois') { // revoir logique mois 30/31 jours
      // Nouvelle logique : afficher jour par jour du mois en cours du 1ᵉʳ jour jusqu'au jour actuel inclus
      const daysCount = today.getDate(); // jour du mois actuel
      const daysArray: { label: string; gain: number }[] = [];
      for (let day = 1; day <= daysCount; day++) {
        const currentDate = new Date(today.getFullYear(), today.getMonth(), day);
        const dayGain = this.stats
          .filter(s => {
            const d = new Date(s.timestamp);
            return d.getFullYear() === currentDate.getFullYear() &&
                   d.getMonth() === currentDate.getMonth() &&
                   d.getDate() === currentDate.getDate();
          })
          .reduce((sum, s) => sum + s.gain, 0);
        daysArray.push({ label: currentDate.toLocaleDateString('fr-CA'), gain: dayGain });
      }
      return daysArray;
    } else if(this.selectedPeriod === 'année') {
      // Nouvelle logique : afficher pour chaque mois de l'année jusqu'au mois en cours
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth(); // 0-indexed
      const monthsArray: { label: string; gain: number }[] = [];
      for (let m = 0; m <= currentMonth; m++) {
        const monthGain = this.stats
          .filter(s => {
            const d = new Date(s.timestamp);
            return d.getFullYear() === currentYear && d.getMonth() === m;
          })
          .reduce((sum, s) => sum + s.gain, 0);
        const label = `${currentYear}-${("0" + (m + 1)).slice(-2)}`;
        monthsArray.push({ label: label, gain: monthGain });
      }
      return monthsArray;
    }
    return this.stats.map(s => ({ label: s.timestamp, gain: s.gain }));
  }
  
  updateChart(): void {
    const filtered = this.getFilteredStats();
    this.gainChart.data.labels = filtered.map(item => item.label);
    this.gainChart.data.datasets[0].data = filtered.map(item => item.gain);
    this.gainChart.update();
  }

  onPeriodChange(): void {
    this.updateChart();
  }
}
