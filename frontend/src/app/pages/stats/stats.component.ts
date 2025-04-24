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

  ngAfterViewInit(): void {
    const labels = this.stats.map(stat => stat.timestamp);
    const data = this.stats.map(stat => stat.gain);
    const backgroundColors = this.stats.map(stat => stat.gain >= 0 ? '#4caf50' : '#f44336');

    this.gainChart = new Chart(this.gainChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Gains / Pertes (€)',
          data: data,
          backgroundColor: backgroundColors
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
