import { Component } from '@angular/core';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css'],
})

export class BalanceComponent {
  amount: number = 0; // Initialize the amount
  incrementValue: number = 10; // Default increment value

  setIncrement(value: number): void {
    this.incrementValue = value; // Update increment value
  }

  increaseAmount(): void {
    this.amount += this.incrementValue; // Increment by selected value
  }

  decreaseAmount(): void {
    if (this.amount >= this.incrementValue) {
      this.amount -= this.incrementValue; // Decrement by selected value
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