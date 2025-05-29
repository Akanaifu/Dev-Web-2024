import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css'],
})
export class BalanceComponent implements OnInit {
  amount: number = 0; // Initialize the amount
  incrementValue: number = 10; // Default increment value
  maxAmount: number = 1000; // Maximum amount limit
  userId: number | null = null;
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
    if (this.amount > this.maxAmount) {
      this.amount = this.maxAmount; // Ensure amount does not exceed max limit
    }
  }

  decreaseAmount(): void {
    if (this.amount >= this.incrementValue) {
      this.amount -= this.incrementValue; // Decrement by selected value
      if (this.amount < 0) {
        this.amount = 0; // Ensure amount does not go below zero
      }
    }
  }

  handleDeposit(): void {
    if (this.userId == null) return;
    this.userService
      .updateUserBalance(this.userId, this.amount, 'add')
      .subscribe({
        next: (res) => {
          console.log('Dépôt effectué:', res);
          if (typeof res.balance === 'number') {
            this.maxAmount = res.balance;
            this.amount = 0;
          }
        },
        error: (err) => {
          console.error('Erreur lors du dépôt:', err);
        },
      });
  }

  handleWithdrawal(): void {
    if (this.userId == null) return;
    this.userService
      .updateUserBalance(this.userId, this.amount, 'subtract')
      .subscribe({
        next: (res) => {
          console.log('Retrait effectué:', res);
          if (typeof res.balance === 'number') {
            this.maxAmount = res.balance;
            this.amount = 0;
          }
        },
        error: (err) => {
          console.error('Erreur lors du retrait:', err);
        },
      });
  }

  updateAmount(newAmount: string): void {
    this.amount = parseFloat(newAmount) || 0; // Update amount dynamically
  }
}
