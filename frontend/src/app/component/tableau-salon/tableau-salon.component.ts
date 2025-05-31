import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BetService, BetWithUser } from '../../services/bet.service';

@Component({
  selector: 'app-tableau-salon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tableau-salon.component.html',
  styleUrl: './tableau-salon.component.css'
})
export class TableauSalonComponent implements OnInit {
  bets: BetWithUser[] = [];
  loading = true;
  error: string | null = null;

  constructor(private betService: BetService) {}

  ngOnInit(): void {
    this.loadBets();
  }

  loadBets(): void {
    this.loading = true;
    this.error = null;
    
    this.betService.getAllBetsWithUsers().subscribe({
      next: (bets) => {
        this.bets = bets;
        this.loading = false;
        console.log('Mises chargées:', bets);
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des mises';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  /**
   * Formatte le montant pour l'affichage
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  /**
   * Formatte la date pour l'affichage
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR');
  }

  /**
   * Retourne la classe CSS selon le statut de la mise
   */
  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'won':
      case 'gagnant':
        return 'status-won';
      case 'lost':
      case 'perdant':
        return 'status-lost';
      case 'pending':
      case 'en_attente':
        return 'status-pending';
      default:
        return 'status-default';
    }
  }

  /**
   * Rafraîchit les données
   */
  refresh(): void {
    this.loadBets();
  }

  /**
   * Fonction de tracking pour le ngFor (optimisation des performances)
   */
  trackByBetId(index: number, bet: BetWithUser): number {
    return bet.bet_id;
  }

  /**
   * Calcule le montant total de toutes les mises
   */
  getTotalAmount(): number {
    return this.bets.reduce((total, bet) => total + bet.amount, 0);
  }
}
