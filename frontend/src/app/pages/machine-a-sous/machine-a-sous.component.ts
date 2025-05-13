import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Database } from '@angular/fire/database';
import { MachineASousLogic } from './machine-a-sous.logic';
import { FirebaseSendService } from './export_firebase.logic';
import { NewGameService } from '../../services/new-game.service';
import { HttpClient } from '@angular/common/http';

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
  playerInfo: {
    user_id: number;
    username: string;
    email: string;
    solde: number;
  } = {
    user_id: 0,
    username: '',
    email: '',
    solde: 0,
  };

  constructor(
    private newGameService: NewGameService,
    private http: HttpClient
  ) {
    const db = inject(Database);
    this.logic = new MachineASousLogic(db, newGameService, this.http);
    this.firebaseSendService = new FirebaseSendService(db); // Injection manuelle
  }

  ngOnInit(): void {
    this.getPlayerInfo();
  }

  ngOnDestroy(): void {
    clearInterval(this.logic.intervalId);
  }

  getPlayerInfo(): void {
    this.http
      .get<{ user_id: number; username: string; email: string; solde: number }>(
        'http://localhost:3000/get_id/info'
      )
      .subscribe({
        next: (data) => {
          this.playerInfo = data;
          console.log('Informations du joueur :', this.playerInfo);
        },
        error: (err) => {
          console.error(
            'Erreur lors de la récupération des informations :',
            err
          );
        },
      });
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
    if (!this.playerInfo || this.playerInfo.solde === undefined) {
      console.error(
        "Impossible d'envoyer les données : informations du joueur non disponibles."
      );
      return;
    }

    const solde = this.playerInfo.solde; // Utilisation du solde récupéré via getPlayerInfo
    const playerId = this.playerInfo.user_id; // Utilisation du solde comme playerId
    console.log(
      '🚀 ~ MachineASousComponent ~ sendPartieToFirebase ~ this.playerInfo:',
      this.playerInfo
    );

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
