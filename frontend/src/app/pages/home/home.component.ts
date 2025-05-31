import { Component } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent {
  constructor(private router: Router) {}

  selectGame(gameName: string): void {
    this.router.navigate([`/${gameName}`]); // Navigation vers la page "Machine à sous"
    // Ajoutez d'autres conditions pour d'autres jeux si nécessaire
  }
}
