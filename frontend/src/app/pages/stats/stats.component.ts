import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [],
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
  ];

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
    const labels = this.stats.map(stat => stat.timestamp);
    const data = this.stats.map(stat => stat.gain);

    this.gainChart = new Chart(this.gainChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Gains / Pertes (€)',
          data: data,
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
  }
}
