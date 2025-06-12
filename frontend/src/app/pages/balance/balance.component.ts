import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- Ajouté
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css'],
  imports: [CommonModule], // <-- Ajouté
})
export class BalanceComponent implements OnInit {
  amount: number = 0; // Initialize the amount
  incrementValue: number = 10; // Default increment value
  maxAmount: number = 1000; // Maximum amount limit
  userId: number | null = null;
  showOverdraftModal: boolean = false; // Contrôle l'affichage du pop-up
  successMessage: string = ''; // Message de succès à afficher

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUserId().subscribe({
      next: (response) => {
        console.log('ID utilisateur récupéré:', response);
        if (response) {
          this.userId = response.user_id; // Store user ID from response
          this.maxAmount = response.solde;
          console.log(
            '🚀 ~ BalanceComponent ~ this.userService.getUserId ~ this.userId:',
            this.userId
          );
        } // Set max amount from response
      },
      error: (err) => {
        console.error(
          "Erreur lors de la récupération de l'ID utilisateur:",
          err
        );
      },
    });
  }

  setIncrement(value: number): void {
    this.incrementValue = value; // Update increment value
  }

  increaseAmount(): void {
    this.amount += this.incrementValue; // Increment by selected value
    // Suppression du cap sur maxAmount
  }

  decreaseAmount(): void {
    if (this.amount >= this.incrementValue) {
      this.amount -= this.incrementValue; // Decrement by selected value
      if (this.amount < 0) {
        this.amount = 0; // Ensure amount does not go below zero
      }
    } else {
      this.amount = 0; // Si l'incrément dépasse le montant, on met à zéro
    }
  }

  handleDeposit(): void {
    // depot
    if (this.userId == null) {
      console.warn('Aucun utilisateur connecté pour le dépôt.');
      return;
    }
    if (this.amount <= 0) {
      console.warn('Le montant doit être supérieur à zéro pour le dépôt.');
      return;
    }
    this.userService
      .updateUserBalance(this.userId, this.amount, 'add')
      .subscribe({
        next: (res) => {
          console.log('Dépôt effectué:', res);
          if (typeof res.balance === 'number') {
            this.maxAmount = res.balance;
            this.amount = 0;
            this.userService.balanceChanged.next(res.balance); // <-- Ajouté
            this.successMessage = 'Dépôt effectué avec succès !'; // <-- Ajouté
            setTimeout(() => {
              this.successMessage = '';
            }, 3000); // <-- Ajouté
          }
        },
        error: (err) => {
          console.error('Erreur lors du dépôt:', err);
        },
      });
  }

  handleWithdrawal(): void {
    // retrait
    if (this.userId == null) {
      console.warn('Aucun utilisateur connecté pour le retrait.');
      return;
    }
    if (this.amount <= 0) {
      console.warn('Le montant doit être supérieur à zéro pour le retrait.');
      return;
    }
    if (this.amount > this.maxAmount) {
      this.showOverdraftModal = true;
      this.amount = this.maxAmount; // Set amount to maxAmount if it exceeds
      return;
    }
    this.proceedWithdrawal();
  }

  proceedWithdrawal(): void {
    if (this.userId == null) return;
    this.userService
      .updateUserBalance(this.userId, this.amount, 'subtract')
      .subscribe({
        next: (res) => {
          console.log('Retrait effectué:', res);
          if (typeof res.balance === 'number') {
            this.maxAmount = res.balance;
            this.amount = 0;
            this.userService.balanceChanged.next(res.balance); // <-- Ajouté
            this.successMessage = 'Retrait effectué avec succès !'; // <-- Ajouté
            setTimeout(() => {
              this.successMessage = '';
            }, 3000); // <-- Ajouté
          }
        },
        error: (err) => {
          console.error('Erreur lors du retrait:', err);
        },
      });
    this.showOverdraftModal = false;
  }

  cancelOverdraft(): void {
    this.showOverdraftModal = false;
  }

  updateAmount(newAmount: string): void {
    this.amount = parseFloat(newAmount) || 0; // Update amount dynamically
  }
}
