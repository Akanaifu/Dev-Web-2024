import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-jeux',
  templateUrl: './jeux.component.html',
  styleUrls: ['./jeux.component.css'],
})
export class JeuxComponent {
  constructor(private router: Router) {}

  selectGame(gameName: string): void {
    this.router.navigate([`/${gameName}`]); // Navigation vers la page "Machine à sous"
    // Ajoutez d'autres conditions pour d'autres jeux si nécessaire
  }
}
