import { Component } from '@angular/core';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css'],
})
export class BalanceComponent {
  handleDeposit(): void {
    console.log('Dépôt action triggered');
    // Add logic for deposit
  }

  handleWithdrawal(): void {
    console.log('Retrait action triggered');
    // Add logic for withdrawal
  }
}
