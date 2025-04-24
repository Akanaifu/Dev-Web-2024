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
    { stat_id: 5, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-04-24", gain: 12 },
    { stat_id: 5, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-04-24", gain: 5 },
    { stat_id: 5, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-02-05", gain: 15 },
    { stat_id: 5, user_id: 3, num_games: 2, num_wins: 2, timestamp: "2025-01-05", gain: -30 }
  ];

  selectedPeriod: string = 'jour';

  get totalGain(): number {
    return this.stats.reduce((total, stat) => total + stat.gain, 0);
  }
  
  get gainSummary(): string {
    const total = this.totalGain;
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
      // Calculate current week number and filter records in the same week without aggregation
      const oneJan = new Date(today.getFullYear(), 0, 1);
      const daysSince = Math.floor((today.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
      const currentWeek = Math.ceil((daysSince + today.getDay() + 1) / 7);
      return this.stats
        .filter(s => {
          const d = new Date(s.timestamp);
          const days = Math.floor((d.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
          const week = Math.ceil((days + d.getDay() + 1) / 7);
          return d.getFullYear() === today.getFullYear() && week === currentWeek;
        })
        .map(s => ({ label: s.timestamp, gain: s.gain }));
    } else if(this.selectedPeriod === 'mois') {
      // Filter stats for the current month without aggregation
      return this.stats
        .filter(s => {
          const d = new Date(s.timestamp);
          return d.getFullYear() === today.getFullYear() &&
                 d.getMonth() === today.getMonth();
        })
        .map(s => ({ label: s.timestamp, gain: s.gain }));
    } else if(this.selectedPeriod === 'année') {
      // Filter for stats in the current year without aggregation
      return this.stats
        .filter(s => {
          const d = new Date(s.timestamp);
          return d.getFullYear() === today.getFullYear();
        })
        .map(s => ({ label: s.timestamp, gain: s.gain }));
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
