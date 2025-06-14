import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Database } from '@angular/fire/database';
import { MachineASousLogic } from './machine-a-sous.logic';
import { FirebaseSendService } from './export_firebase.logic';
import { NewGameService } from '../../services/machine-a-sous/new-game.service';
import { UserService } from '../../services/user/user.service';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-machine-a-sous',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './machine-a-sous.component.html',
  styleUrls: ['./machine-a-sous.component.css'],
})
export class MachineASousComponent implements OnInit {
  private firebaseSendService: FirebaseSendService;
  public partiesSubscription?: Subscription;
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
  sendButtonDisabled: boolean = false;

  constructor(
    private newGameService: NewGameService,
    public db: Database,
    private userService: UserService // Ajout de l'injection
  ) {
    this.logic = new MachineASousLogic(db, newGameService, userService); // Correction ici
    this.firebaseSendService = new FirebaseSendService(db);
  }

  ngOnInit(): void {
    this.getPlayerInfo();
    this.checkIfSendButtonShouldBeDisabled();
    // S'abonner aux changements en temps réel de Firebase
    this.partiesSubscription = this.firebaseSendService
      .listenToParties()
      .subscribe({
        next: (data) => {
          console.log('Mise à jour des parties en temps réel :', data);
          // Met à jour l'affichage à chaque changement
          this.logic.fetchFirebaseData().then(() => {
            this.sendButtonDisabled = this.logic.showTable;
          });
        },
        error: (err) => {
          console.error("Erreur lors de l'écoute des parties Firebase :", err);
        },
      });
  }

  ngOnDestroy(): void {
    clearInterval(this.logic.intervalId);
    // Désabonnement pour éviter les fuites de mémoire
    this.partiesSubscription?.unsubscribe();
  }

  getPlayerInfo(): void {
    this.newGameService.getPlayerInfo().subscribe({
      next: (data) => {
        this.playerInfo = data;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des informations :', err);
      },
    });
  }

  checkIfSendButtonShouldBeDisabled(): void {
    this.logic.fetchFirebaseData().then(() => {
      // Update the button state after fetchFirebaseData completes
      this.sendButtonDisabled = this.logic.showTable; // Use the updated property from logic
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
    if (this.sendButtonDisabled) {
      console.warn("Le bouton d'envoi est désactivé.");
      return;
    }

    // Récupère le solde à jour depuis le backend AVANT d'envoyer à Firebase
    this.newGameService.getPlayerInfo().subscribe({
      next: (data) => {
        this.playerInfo = data;
        const solde = this.playerInfo.solde;
        const playerId = this.playerInfo.user_id;

        // Désactive le bouton après récupération du solde à jour
        this.sendButtonDisabled = true;
        this.firebaseSendService.sendPartie(playerId, solde);
      },
      error: (err) => {
        console.error(
          "Impossible d'envoyer les données : informations du joueur non disponibles.",
          err
        );
      },
    });
  }
}
