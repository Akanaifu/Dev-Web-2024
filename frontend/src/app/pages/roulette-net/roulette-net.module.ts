import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouletteNetComponent } from './roulette-net.component';

/**
 * Module Angular pour organiser et encapsuler le jeu de roulette en ligne.
 * Ce module configure les dépendances et rend le composant roulette disponible pour l'application.
 */
@NgModule({
    declarations: [], // Vide car on utilise des composants standalone
    imports: [
        CommonModule,        // Fournit les directives Angular de base (ngIf, ngFor, etc.)
        RouletteNetComponent // Import du composant standalone de roulette
    ],
    exports: [] // Le composant s'exporte automatiquement étant standalone
})
export class RouletteNetModule {} 