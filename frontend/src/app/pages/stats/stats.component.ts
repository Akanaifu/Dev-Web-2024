import { Component } from '@angular/core';
import {MatSliderModule} from '@angular/material/slider';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-stats',
  imports: [MatSliderModule, MatTooltipModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css',
})
export class StatsComponent {
}