import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Database } from '@angular/fire/database';
import { MachineASousLogic } from './machine-a-sous.logic';
import { FirebaseSendService } from './export_firebase.logic';
import { NewGameService } from './new-game.service';

@Component({
  selector: 'app-machine-a-sous',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './machine-a-sous.component.html',
  styleUrls: ['./machine-a-sous.component.css'],
})
export class MachineASousComponent implements OnInit {
  private firebaseSendService: FirebaseSendService;
  logic: MachineASousLogic;

  constructor(private newGameService: NewGameService) {
    const db = inject(Database);
    this.logic = new MachineASousLogic(db, newGameService);
    this.firebaseSendService = new FirebaseSendService(db); // Injection manuelle
  }

  ngOnInit(): void {
    this.logic.fetchFirebaseData();
  }

  ngOnDestroy(): void {
    clearInterval(this.logic.intervalId);
  }

  // Getter pour accéder aux propriétés de MachineASousLogic
  get combinations() {
    return this.logic.combinations;
  }

  get highlightCombination() {
    return this.logic.highlightCombination;
  }

  get showTable() {
    return this.logic.showTable;
  }

  // Méthodes pour accéder aux fonctionnalités de MachineASousLogic
  toggleTable(): void {
    this.logic.showTable = !this.logic.showTable;
  }

  getCurrentChiffre(afficheurId: string): number {
    const afficheur = this.logic.afficheurs.find((a) => a.id === afficheurId);
    return afficheur ? afficheur.currentChiffre : 0;
  }
  // Méthode pour envoyer les données à Firebase
  sendPartieToFirebase(): void {
    const playerId = 'player1';
    const solde = 1000; // Valeur hardcodée

    this.firebaseSendService
      .sendPartie(playerId, solde)
      .then(() => {
        console.log('Données envoyées avec succès à Firebase.');
      })
      .catch((error) => {
        console.error("Erreur lors de l'envoi des données à Firebase :", error);
      });
  }
}
