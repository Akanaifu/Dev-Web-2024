import { Component } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

/**
 * @title Menu positioning
 */
@Component({
  selector: 'navigation-bar',
  templateUrl: 'navigation-bar.component.html',
  styleUrl: 'navigation-bar.component.css',
  standalone:true,
  imports: [MatButtonModule, MatMenuModule, RouterLink],
})
export class NavigationBarComponent {}

