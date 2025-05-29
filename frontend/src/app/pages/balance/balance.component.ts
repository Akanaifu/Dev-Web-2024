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
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUserId().subscribe({
      next: (response) => {
        if (response && typeof response.solde === 'number') {
          this.maxAmount = response.solde;
        }
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
    console.log(`Dépôt de ${this.amount} €`);
    // Add logic for deposit
  }

  handleWithdrawal(): void {
    console.log(`Retrait de ${this.amount} €`);
    // Add logic for withdrawal
  }

  updateAmount(newAmount: string): void {
    this.amount = parseFloat(newAmount) || 0; // Update amount dynamically
  }
}
